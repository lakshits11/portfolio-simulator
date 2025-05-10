import React from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

interface Column<T> {
  label: string;
  render: (row: T) => React.ReactNode;
}

interface TableWithChartProps<T> {
  columns: Column<T>[];
  data: T[];
  chartTitle: string;
  chartSeriesName: string;
  chartColor: string;
  yAxisTitle: string;
  getChartX: (row: T) => string;
  getChartY: (row: T) => number;
}

export function TableWithChart<T>({
  columns,
  data,
  chartTitle,
  chartSeriesName,
  chartColor,
  yAxisTitle,
  getChartX,
  getChartY,
}: TableWithChartProps<T>) {
  if (!data.length) return null;
  // For the chart, always sort by x (low to high)
  const chartData = [...data].sort((a, b) => getChartX(a).localeCompare(getChartX(b)));
  // For the table, show high-to-low (most recent first)
  const tableData = [...data].sort((a, b) => getChartX(b).localeCompare(getChartX(a)));

  return (
    <div style={{ maxWidth: '100%', marginTop: 24 }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
        <thead>
          <tr>
            {columns.map((col, idx) => (
              <th key={idx} style={{ borderBottom: '1px solid #ccc', textAlign: 'left', padding: 8, background: '#fafafa', position: 'sticky', top: 0, zIndex: 1 }}>{col.label}</th>
            ))}
          </tr>
        </thead>
      </table>
      <div style={{ maxHeight: 350, overflowY: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
          <tbody>
            {tableData.map((row, idx) => (
              <tr key={idx}>
                {columns.map((col, cidx) => (
                  <td key={cidx} style={{ padding: 8 }}>{col.render(row)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: 24 }}>
        <HighchartsReact
          highcharts={Highcharts}
          options={{
            title: { text: chartTitle },
            xAxis: {
              categories: chartData.map(getChartX),
              title: { text: columns[0]?.label || 'X' },
              labels: { rotation: -45 }
            },
            yAxis: {
              title: { text: yAxisTitle }
            },
            series: [
              {
                name: chartSeriesName,
                data: chartData.map(getChartY),
                type: 'line',
                color: chartColor,
                marker: { enabled: false }
              }
            ],
            chart: { height: 350 },
            credits: { enabled: false },
            legend: { enabled: false },
          }}
        />
      </div>
    </div>
  );
} 