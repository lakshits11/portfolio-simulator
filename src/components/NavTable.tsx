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
    <div style={{ maxWidth: '100%', marginTop: 24 }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
        <thead>
          <tr>
            <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left', padding: 8, background: '#fafafa', position: 'sticky', top: 0, zIndex: 1 }}>Date</th>
            <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left', padding: 8, background: '#fafafa', position: 'sticky', top: 0, zIndex: 1 }}>NAV</th>
          </tr>
        </thead>
      </table>
      <div style={{ maxHeight: 350, overflowY: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
          <tbody>
            {displayData.map((entry, idx) => (
              <tr key={idx}>
                <td style={{ padding: 8 }}>{formatDate(entry.date)}</td>
                <td style={{ padding: 8 }}>{entry.nav.toFixed(5)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}; 