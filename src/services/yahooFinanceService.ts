import { ProcessedIndexData } from '../types/index';

interface YahooFinanceResponse {
  chart: {
    result: Array<{
      meta: {
        symbol: string;
        longName: string;
        currency: string;
      };
      timestamp: number[];
      indicators: {
        adjclose: Array<{
          adjclose: number[];
        }>;
      };
    }>;
    error: any;
  };
}

interface ProxyResponse {
  contents: string;
  status?: {
    url: string;
    content_type: string;
    http_code: number;
    response_time: number;
    content_length: number;
  };
}

class YahooFinanceService {
  private stockDataCache: Record<string, ProcessedIndexData[]> = {};

  async fetchStockData(symbol: string): Promise<ProcessedIndexData[]> {
    if (this.stockDataCache[symbol]) {
      return this.stockDataCache[symbol];
    }

    try {
      const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=100y`;
      const proxyUrl = `https://cors-proxy-lake-omega.vercel.app/api/proxy?url=${encodeURIComponent(yahooUrl)}`;
      
      const response = await fetch(proxyUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch stock data for ${symbol}`);
      }

      const proxyData = await response.json();
      
      // The new CORS proxy returns Yahoo Finance data directly
      const yahooData: YahooFinanceResponse = proxyData;
      
      if (yahooData.chart.error) {
        throw new Error(`Yahoo Finance API error: ${yahooData.chart.error}`);
      }

      if (!yahooData.chart.result || yahooData.chart.result.length === 0) {
        throw new Error(`No data available for symbol ${symbol}`);
      }

      const chartResult = yahooData.chart.result[0];
      const timestamps = chartResult.timestamp;
      const adjClosePrices = chartResult.indicators.adjclose[0].adjclose;

      if (!timestamps || !adjClosePrices || timestamps.length !== adjClosePrices.length) {
        throw new Error(`Invalid data structure for symbol ${symbol}`);
      }

      const processedData = timestamps.map((timestamp, index) => {
        const adjClose = adjClosePrices[index];
        if (adjClose === null || adjClose === undefined) {
          return null; // Skip null values
        }
        
        return {
          date: new Date(timestamp * 1000), // Convert Unix timestamp to Date
          nav: adjClose
        };
      }).filter(item => item !== null) as ProcessedIndexData[];

      const finalData = this._cleanAndValidateData(processedData, symbol);

      this.stockDataCache[symbol] = finalData;
      return finalData;
    } catch (error) {
      console.error(`Error fetching stock data for ${symbol}:`, error);
      throw error;
    }
  }

  private _cleanAndValidateData(
    data: ProcessedIndexData[],
    symbol: string
  ): ProcessedIndexData[] {
    // First, filter out any non-positive NAVs which are invalid.
    const positiveNavData = data.filter(item => item.nav > 0);

    // Sort by date to ensure chronological order before outlier detection.
    positiveNavData.sort((a, b) => a.date.getTime() - b.date.getTime());

    // --- Outlier Detection ---
    // Financial data APIs can sometimes return erroneous data points, such as a price
    // suddenly dropping to a very low value for a day and then recovering. This logic
    // identifies and removes such outliers to prevent them from corrupting calculations
    // like XIRR.
    //
    // A real-world case was observed with the ticker 'GOLDBEES.NS' around
    // '2019-12-19', where the price erroneously dropped from ~33 to 0.34 for a day.
    //
    // It works by calculating the relative (percentage) change from the last valid
    // data point. If the change is unrealistically large (e.g., > 90%), the data point
    // is discarded.
    //
    const outlierFreeData = [];
    if (positiveNavData.length > 0) {
      outlierFreeData.push(positiveNavData[0]); // Start with the first valid data point.

      for (let i = 1; i < positiveNavData.length; i++) {
        const previousNav = outlierFreeData[outlierFreeData.length - 1].nav;
        const currentNav = positiveNavData[i].nav;

        // A daily change > 90% is highly likely to be a data error.
        const relativeChange = Math.abs(currentNav - previousNav) / previousNav;

        if (relativeChange < 0.9) {
          outlierFreeData.push(positiveNavData[i]);
        } else {
          console.warn(
            `Outlier detected for symbol ${symbol} on ${positiveNavData[
              i
            ].date.toDateString()}: NAV changed from ${previousNav} to ${currentNav}. Skipping.`
          );
        }
      }
    }

    if (outlierFreeData.length < 2) {
      throw new Error(
        `Insufficient valid data points for symbol ${symbol} after cleaning`
      );
    }

    // Remove any duplicate dates (keep the first occurrence)
    const uniqueData = outlierFreeData.filter((item, index, array) => {
      if (index === 0) return true;
      return item.date.getTime() !== array[index - 1].date.getTime();
    });

    return uniqueData;
  }

  clearCache(): void {
    this.stockDataCache = {};
  }
}

export const yahooFinanceService = new YahooFinanceService(); 