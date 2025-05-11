import React from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { mfapiMutualFund } from '../types/mfapiMutualFund';

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

interface MultiFundChartsProps {
  navDatas: Record<number, any[]>;
  lumpSumXirrDatas: Record<number, any[]>;
  sipXirrDatas: Record<number, any[]>;
  funds: mfapiMutualFund[];
  COLORS: string[];
}

export const MultiFundCharts: React.FC<MultiFundChartsProps> = ({
  navDatas,
  lumpSumXirrDatas,
  sipXirrDatas,
  funds,
  COLORS,
}) => {
  const getFundName = (schemeCode: number) => {
    const fund = funds.find(f => f.schemeCode === schemeCode);
    return fund ? fund.schemeName : String(schemeCode);
  };

  const getNavSeries = () =>
    Object.entries(navDatas).map(([scheme, data], idx) => ({
      name: getFundName(Number(scheme)),
      data: [...data].sort((a, b) => a.date.getTime() - b.date.getTime()).map(row => row.nav),
      type: 'line',
      color: COLORS[idx % COLORS.length],
      marker: { enabled: false },
    }));
  const getNavCategories = () => {
    const allDates = Object.values(navDatas).flatMap(arr => Array.isArray(arr) ? arr.map(row => formatDate(row.date)) : []);
    return Array.from(new Set(allDates)).sort();
  };

  const getLumpSumSeries = () => [
    {
      name: 'Portfolio Lump Sum XIRR',
      data: (lumpSumXirrDatas['portfolio'] || []).sort((a, b) => a.date.getTime() - b.date.getTime()).map(row => row.xirr * 100),
      type: 'line',
      color: COLORS[0],
      marker: { enabled: false },
    }
  ];
  const getLumpSumCategories = () => {
    const arr = lumpSumXirrDatas['portfolio'] || [];
    return arr.map(row => formatDate(row.date));
  };

  const getSipSeries = () => [
    {
      name: 'Portfolio SIP XIRR',
      data: (sipXirrDatas['portfolio'] || []).sort((a, b) => a.date.getTime() - b.date.getTime()).map(row => row.xirr * 100),
      type: 'line',
      color: COLORS[0],
      marker: { enabled: false },
    }
  ];
  const getSipCategories = () => {
    const arr = sipXirrDatas['portfolio'] || [];
    return arr.map(row => formatDate(row.date));
  };

  return (
    <div style={{ marginTop: 32 }}>
      <div style={{ marginTop: 24 }}>
        <HighchartsReact
          highcharts={Highcharts}
          options={{
            title: { text: 'Lump Sum Rolling 1Y XIRR Over Time' },
            xAxis: {
              categories: getLumpSumCategories(),
              title: { text: 'Date' },
              labels: { rotation: -45 }
            },
            yAxis: {
              title: { text: 'XIRR (%)' }
            },
            series: getLumpSumSeries(),
            chart: { height: 350 },
            credits: { enabled: false },
            legend: { enabled: true },
            tooltip: { valueDecimals: 2 },
          }}
        />
      </div>
      <div style={{ marginTop: 24 }}>
        <HighchartsReact
          highcharts={Highcharts}
          options={{
            title: { text: 'SIP Rolling 1Y XIRR Over Time' },
            xAxis: {
              categories: getSipCategories(),
              title: { text: 'Date' },
              labels: { rotation: -45 }
            },
            yAxis: {
              title: { text: 'XIRR (%)' }
            },
            series: getSipSeries(),
            chart: { height: 350 },
            credits: { enabled: false },
            legend: { enabled: true },
            tooltip: { valueDecimals: 2 },
          }}
        />
      </div>
    </div>
  );
}; 