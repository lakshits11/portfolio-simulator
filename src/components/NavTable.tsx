import React from 'react';
import { NavEntry } from '../types/navData';
import { fillMissingNavDates } from '../utils/fillMissingNavDates';

interface NavTableProps {
  navData: NavEntry[];
}

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export const NavTable: React.FC<NavTableProps> = ({ navData }) => {
  const filledData = fillMissingNavDates(navData);
  const displayData = [...filledData].reverse();
  if (!displayData.length) return null;
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 24 }}>
      <thead>
        <tr>
          <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left', padding: 8 }}>Date</th>
          <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left', padding: 8 }}>NAV</th>
        </tr>
      </thead>
      <tbody>
        {displayData.map((entry, idx) => (
          <tr key={idx}>
            <td style={{ padding: 8 }}>{formatDate(entry.date)}</td>
            <td style={{ padding: 8 }}>{entry.nav.toFixed(5)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}; 