import React, { useState, useEffect } from 'react';
import { Input } from 'baseui/input';
import { Block } from 'baseui/block';
import { Instrument } from '../types/instrument';

interface YahooFinanceSelectorProps {
  onSelect: (instrument: Instrument) => void;
  value?: Instrument;
}

export const YahooFinanceSelector: React.FC<YahooFinanceSelectorProps> = ({ 
  onSelect, 
  value 
}) => {
  const [symbol, setSymbol] = useState('');

  // Set initial value
  useEffect(() => {
    if (value && value.type === 'yahoo_finance') {
      setSymbol(value.symbol);
    } else {
      setSymbol('');
    }
  }, [value]);

  const handleSymbolChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newSymbol = e.target.value.toUpperCase();
    setSymbol(newSymbol);
    
    if (newSymbol.trim()) {
      const instrument: Instrument = {
        type: 'yahoo_finance',
        id: newSymbol.trim(),
        name: newSymbol.trim(),
        symbol: newSymbol.trim(),
        displayName: newSymbol.trim()
      };
      onSelect(instrument);
    } else {
      onSelect(null);
    }
  };

  return (
    <Block
      overrides={{
        Block: {
          style: {
            minWidth: '400px',
            flexGrow: 1,
            flexShrink: 1
          }
        }
      }}
    >
      <Input
        value={symbol}
        onChange={handleSymbolChange}
        placeholder="Enter stock symbol (e.g., TCS.NS, AAPL, RELIANCE.NS)"
        size="compact"
        overrides={{
          Root: {
            style: {
              width: '100%'
            }
          }
        }}
      />
    </Block>
  );
}; 