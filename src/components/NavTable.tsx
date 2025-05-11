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
  if (!navData.length) return null;
  const filledData = fillMissingNavDates(navData);
  return (
    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th>NAV</th>
        </tr>
      </thead>
      <tbody>
        {filledData.map((row, idx) => (
          <tr key={idx}>
            <td>{formatDate(row.date)}</td>
            <td>{row.nav.toFixed(5)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}; 