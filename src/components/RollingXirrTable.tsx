import React from 'react';
import { calculateLumpSumRollingXirr, RollingXirrEntry } from '../utils/lumpSumRollingXirr';

interface RollingXirrTableProps {
  data: RollingXirrEntry[];
}

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export const RollingXirrTable: React.FC<RollingXirrTableProps> = ({ data }) => {
  if (!data.length) return null;
  const displayData = [...data].sort((a, b) => b.date.getTime() - a.date.getTime());
  return (
    <div style={{ maxWidth: '100%', marginTop: 24 }}>
      <style>{`
        .xirr-row:hover .xirr-tooltip {
          display: block;
        }
        .xirr-tooltip {
          display: none;
          position: absolute;
          left: 0;
          top: 100%;
          background: #fff;
          border: 1px solid #333;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
          padding: 10px 16px;
          z-index: 1000;
          min-width: 220px;
          font-size: 0.95em;
          border-radius: 6px;
          white-space: nowrap;
        }
      `}</style>
      <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
        <thead>
          <tr>
            <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left', padding: 8, background: '#fafafa', position: 'sticky', top: 0, zIndex: 1 }}>Date</th>
            <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left', padding: 8, background: '#fafafa', position: 'sticky', top: 0, zIndex: 1 }}>Lump Sum Rolling 1Y XIRR</th>
          </tr>
        </thead>
      </table>
      <div style={{ maxHeight: 350, overflowY: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
          <tbody>
            {displayData.map((entry, idx) => (
              <tr key={idx} style={{ position: 'relative' }} className="xirr-row">
                <td style={{ padding: 8 }}>{formatDate(entry.date)}</td>
                <td style={{ padding: 8, position: 'relative' }}>
                  {(entry.xirr * 100).toFixed(2)}%
                  <div className="xirr-tooltip">
                    <div><strong>Buy:</strong> {formatDate(entry.transactions[0].when)} @ {(-entry.transactions[0].amount).toFixed(5)}</div>
                    <div><strong>Sell:</strong> {formatDate(entry.transactions[1].when)} @ {entry.transactions[1].amount.toFixed(5)}</div>
                    <div><strong>XIRR:</strong> {entry.xirr.toFixed(5)}</div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}; 