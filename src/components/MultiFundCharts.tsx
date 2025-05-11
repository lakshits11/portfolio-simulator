import React, { useState, useRef, useEffect } from 'react';
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

interface TransactionModalProps {
  visible: boolean;
  onClose: () => void;
  transactions: { nav: number; when: Date }[];
  date: string;
  xirr: number;
  portfolioName: string;
}

const TransactionModal: React.FC<TransactionModalProps & { funds: any[] }> = ({ visible, onClose, transactions, date, xirr, portfolioName, funds }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!visible) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    const handleClick = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClick);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClick);
    };
  }, [visible, onClose]);

  // Sort transactions by date, then by fund name
  const sortedTxs = [...transactions].sort((a, b) => {
    const dateA = a.when.getTime();
    const dateB = b.when.getTime();
    if (dateA !== dateB) return dateA - dateB;
    const fundA = funds[a.fundIdx]?.schemeName || `Fund ${a.fundIdx + 1}`;
    const fundB = funds[b.fundIdx]?.schemeName || `Fund ${b.fundIdx + 1}`;
    return fundA.localeCompare(fundB);
  });

  if (!visible) return null;
  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.3)',
      zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div
        ref={modalRef}
        style={{
          background: '#fff',
          borderRadius: 8,
          padding: 24,
          minWidth: 540,
          maxWidth: '98vw',
          maxHeight: '80vh',
          overflowY: 'auto',
          boxShadow: '0 2px 16px rgba(0,0,0,0.2)',
          position: 'relative',
        }}
      >
        <button onClick={onClose} style={{ position: 'absolute', top: 8, right: 12, background: 'none', border: 'none', fontSize: 22, color: '#888', cursor: 'pointer' }}>&times;</button>
        <h3 style={{ marginTop: 0 }}>{portfolioName} - {date}</h3>
        <div style={{ marginBottom: 8 }}>XIRR: <b>{(xirr * 100).toFixed(2)}%</b></div>
        <div style={{ fontWeight: 'bold', marginBottom: 4 }}>Transactions:</div>
        <div style={{ width: '100%', overflowX: 'auto' }}>
        <table style={{ minWidth: 900, borderCollapse: 'collapse', border: '1px solid #ccc', marginTop: 8 }}>
          <thead>
            <tr style={{ background: '#f5f5f5' }}>
              <th style={{ textAlign: 'left', padding: '6px 8px', border: '1px solid #ccc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Fund</th>
              <th style={{ textAlign: 'left', padding: '6px 8px', border: '1px solid #ccc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Type</th>
              <th style={{ textAlign: 'left', padding: '6px 8px', border: '1px solid #ccc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Date</th>
              <th style={{ textAlign: 'left', padding: '6px 8px', border: '1px solid #ccc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>NAV</th>
              <th style={{ textAlign: 'left', padding: '6px 8px', border: '1px solid #ccc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Units</th>
              <th style={{ textAlign: 'left', padding: '6px 8px', border: '1px solid #ccc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {sortedTxs.map((tx, idx) => {
              const fundName = funds[tx.fundIdx]?.schemeName || `Fund ${tx.fundIdx + 1}`;
              return (
                <tr key={idx} style={{ background: idx % 2 === 0 ? '#fff' : '#f9f9f9' }}>
                  <td style={{ padding: '6px 8px', border: '1px solid #ccc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{fundName}</td>
                  <td style={{ padding: '6px 8px', border: '1px solid #ccc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{tx.type === 'buy' ? 'Buy' : 'Sell'}</td>
                  <td style={{ padding: '6px 8px', border: '1px solid #ccc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{formatDate(tx.when)}</td>
                  <td style={{ padding: '6px 8px', border: '1px solid #ccc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{tx.nav.toFixed(2)}</td>
                  <td style={{ padding: '6px 8px', border: '1px solid #ccc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{tx.units.toFixed(4)}</td>
                  <td style={{ padding: '6px 8px', border: '1px solid #ccc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{tx.amount.toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
};

export const MultiFundCharts: React.FC<MultiFundChartsProps> = ({
  navDatas,
  lumpSumXirrDatas,
  sipXirrDatas,
  funds,
  COLORS,
}) => {
  const [modal, setModal] = useState<{
    visible: boolean;
    transactions: { nav: number; when: Date }[];
    date: string;
    xirr: number;
    portfolioName: string;
  }>({ visible: false, transactions: [], date: '', xirr: 0, portfolioName: '' });

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

  // const getLumpSumSeries = () => [
  //   {
  //     name: 'Portfolio Lump Sum XIRR',
  //     data: (lumpSumXirrDatas['portfolio'] || []).sort((a, b) => a.date.getTime() - b.date.getTime()).map(row => row.xirr * 100),
  //     type: 'line',
  //     color: COLORS[0],
  //     marker: { enabled: false },
  //   }
  // ];
  // const getLumpSumCategories = () => {
  //   const arr = lumpSumXirrDatas['portfolio'] || [];
  //   return arr.map(row => formatDate(row.date));
  // };

  // Get all unique dates across all portfolios
  const getAllDates = () => {
    const allDates = Object.values(sipXirrDatas).flatMap(arr =>
      Array.isArray(arr) ? arr.map(row => formatDate(row.date)) : []
    );
    return Array.from(new Set(allDates)).sort();
  };

  // Build a series for each portfolio
  const getSipSeries = () => {
    const allDates = getAllDates();
    return Object.entries(sipXirrDatas).map(([portfolioName, data], idx) => {
      // Map date to xirr for this portfolio
      const dateToXirr: Record<string, number> = {};
      (data || []).forEach((row: any) => {
        dateToXirr[formatDate(row.date)] = row.xirr * 100;
      });
      return {
        name: portfolioName,
        data: allDates.map(date => dateToXirr[date] ?? null),
        type: 'line',
        color: COLORS[idx % COLORS.length],
        marker: { enabled: false },
      };
    });
  };
  const getSipCategories = () => getAllDates();

  return (
    <div style={{ marginTop: 32 }}>
      <TransactionModal {...modal} onClose={() => setModal(m => ({ ...m, visible: false }))} funds={funds} />
      {/*
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
      */}
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
            chart: { height: 350, events: {
              click: () => setModal(m => ({ ...m, visible: false })),
            } },
            credits: { enabled: false },
            legend: { enabled: true },
            tooltip: { valueDecimals: 2 },
            plotOptions: {
              series: {
                cursor: 'pointer',
                point: {
                  events: {
                    click: function (event: any) {
                      // Find the portfolio and date for this point
                      const series = this.series;
                      const portfolioName = series.name;
                      const pointDate = this.category;
                      // Find the XIRR entry for this portfolio and date
                      const xirrEntry = (sipXirrDatas[portfolioName] || []).find((row: any) => formatDate(row.date) === pointDate);
                      if (xirrEntry) {
                        setModal({
                          visible: true,
                          transactions: xirrEntry.transactions || [],
                          date: pointDate,
                          xirr: xirrEntry.xirr,
                          portfolioName,
                        });
                      }
                    }
                  }
                }
              }
            },
          }}
        />
      </div>
    </div>
  );
}; 