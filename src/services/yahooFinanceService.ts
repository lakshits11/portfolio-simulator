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

      this.stockDataCache[symbol] = processedData;
      return processedData;
    } catch (error) {
      console.error(`Error fetching stock data for ${symbol}:`, error);
      throw error;
    }
  }

  clearCache(): void {
    this.stockDataCache = {};
  }
}

export const yahooFinanceService = new YahooFinanceService(); 