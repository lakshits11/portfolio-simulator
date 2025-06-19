import React, { useRef, useEffect } from 'react';

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

interface TransactionModalProps {
  visible: boolean;
  onClose: () => void;
  transactions: { fundIdx: number; nav: number; when: Date; units: number; amount: number; type: 'buy' | 'sell'; allocationPercentage?: number }[];
  date: string;
  xirr: number;
  portfolioName: string;
  funds: Array<{ schemeName: string; type: 'mutual_fund' | 'index_fund' }>;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({ visible, onClose, transactions, date, xirr, portfolioName, funds }) => {
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

  // Sort transactions by date, then by type (buy, rebalance, sell), then by fund name
  const typeOrder = { buy: 0, rebalance: 1, sell: 2 };
  const transactionTypeDisplay = {
    buy: 'Buy',
    sell: 'Sell',
    rebalance: 'Rebalance'
  };
  const sortedTxs = [...transactions].sort((a, b) => {
    const dateA = a.when.getTime();
    const dateB = b.when.getTime();
    if (dateA !== dateB) return dateA - dateB;

    const typeAOrder = typeOrder[a.type];
    const typeBOrder = typeOrder[b.type];
    if (typeAOrder !== typeBOrder) return typeAOrder - typeBOrder;

    const fundA = funds[a.fundIdx]?.schemeName || `Fund ${a.fundIdx + 1}`;
    const fundB = funds[b.fundIdx]?.schemeName || `Fund ${b.fundIdx + 1}`;
    return fundA.localeCompare(fundB);
  });

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(0,0,0,0.3)',
      zIndex: 1000
    }}>
      <div
        ref={modalRef}
        style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '8px',
          minWidth: '540px',
          maxWidth: '98vw',
          maxHeight: '80vh',
          overflowY: 'auto',
          boxShadow: '0 2px 16px rgba(0,0,0,0.2)',
          position: 'relative'
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '8px',
            right: '12px',
            background: 'none',
            border: 'none',
            fontSize: '22px',
            color: '#888',
            cursor: 'pointer',
            padding: '0',
            lineHeight: '1'
          }}
        >
          &times;
        </button>
        
        <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>
          {portfolioName} - {date}
        </h3>
        
        <div style={{ marginBottom: '0.5rem' }}>
          XIRR: <strong>{(xirr * 100).toFixed(2)}%</strong>
        </div>
        
        <div style={{ marginBottom: '1rem' }}>
          <strong>Transactions:</strong>
        </div>
        
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Fund</th>
                <th>Type</th>
                <th>Date</th>
                <th>NAV</th>
                <th>Units</th>
                <th>Amount</th>
                <th>Allocation %</th>
              </tr>
            </thead>
            <tbody>
              {sortedTxs.map((tx, idx) => {
                const fundName = funds[tx.fundIdx]?.schemeName || `Fund ${tx.fundIdx + 1}`;
                return (
                  <tr key={idx}>
                    <td>{fundName}</td>
                    <td>{transactionTypeDisplay[tx.type] || ''}</td>
                    <td>{formatDate(tx.when)}</td>
                    <td>{tx.nav.toFixed(2)}</td>
                    <td>{tx.units.toFixed(4)}</td>
                    <td>{tx.amount.toFixed(2)}</td>
                    <td>
                      {((tx.type as string) === 'buy' || (tx.type as string) === 'rebalance') && tx.allocationPercentage !== undefined ? `${tx.allocationPercentage.toFixed(2)}%` : ''}
                    </td>
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