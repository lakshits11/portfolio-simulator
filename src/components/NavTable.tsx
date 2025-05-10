import React from 'react';
import { NavEntry } from '../types/navData';
import { fillMissingNavDates } from '../utils/fillMissingNavDates';
import { TableWithChart } from './TableWithChart';

interface NavTableProps {
  navData: NavEntry[];
}

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export const NavTable: React.FC<NavTableProps> = ({ navData }) => {
  if (!navData.length) return null;
  return (
    <TableWithChart
      columns={[
        { label: 'Date', render: (row) => formatDate(row.date) },
        { label: 'NAV', render: (row) => row.nav.toFixed(5) },
      ]}
      data={fillMissingNavDates(navData)}
      chartTitle="NAV Over Time"
      chartSeriesName="NAV"
      chartColor="#007bff"
      yAxisTitle="NAV"
      getChartX={row => formatDate(row.date)}
      getChartY={row => row.nav}
    />
  );
}; 