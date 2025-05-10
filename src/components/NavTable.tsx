import React from 'react';
import { NavEntry } from '../types/navData';

interface NavTableProps {
  navData: NavEntry[];
}

export const NavTable: React.FC<NavTableProps> = ({ navData }) => {
  if (!navData.length) return null;
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 24 }}>
      <thead>
        <tr>
          <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left', padding: 8 }}>Date</th>
          <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left', padding: 8 }}>NAV</th>
        </tr>
      </thead>
      <tbody>
        {navData.map((entry, idx) => (
          <tr key={idx}>
            <td style={{ padding: 8 }}>{entry.date}</td>
            <td style={{ padding: 8 }}>{entry.nav}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}; 