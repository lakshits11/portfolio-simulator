import React from 'react';
import { InstrumentType, Instrument } from '../types/instrument';
import { MutualFundSelector } from './MutualFundSelector';
import { IndexSelector } from './IndexSelector';

interface InstrumentDropdownProps {
  instrumentType: InstrumentType;
  funds: { schemeCode: number; schemeName: string }[];
  onSelect: (instrument: Instrument) => void;
  value?: Instrument;
  defaultSchemeCode?: number;
}

export const InstrumentDropdown: React.FC<InstrumentDropdownProps> = ({ 
  instrumentType, 
  funds, 
  onSelect, 
  value,
  defaultSchemeCode
}) => {
  if (instrumentType === 'mutual_fund') {
    return (
      <MutualFundSelector
        funds={funds}
        onSelect={onSelect}
        value={value}
        defaultSchemeCode={defaultSchemeCode}
      />
    );
  }

  if (instrumentType === 'index_fund') {
    return (
      <IndexSelector
        onSelect={onSelect}
        value={value}
      />
    );
  }

  // Future: Add more instrument types here
  // if (instrumentType === 'fixed_deposit') {
  //   return <FixedDepositSelector ... />
  // }

  return null;
};