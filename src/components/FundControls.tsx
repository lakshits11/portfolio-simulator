import React from 'react';
import { MutualFundDropdown } from './MutualFundDropdown';
import { mfapiMutualFund } from '../types/mfapiMutualFund';

interface FundControlsProps {
  years: number;
  onYearsChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  selectedSchemes: (number | null)[];
  funds: mfapiMutualFund[];
  onFundSelect: (idx: number, schemeCode: number) => void;
  onAddFund: () => void;
  onRemoveFund: (idx: number) => void;
  onPlot: () => void;
  disableControls: boolean;
}

export const FundControls: React.FC<FundControlsProps> = ({
  years,
  onYearsChange,
  selectedSchemes,
  funds,
  onFundSelect,
  onAddFund,
  onRemoveFund,
  onPlot,
  disableControls,
}) => (
  <>
    <div style={{ marginBottom: 16 }}>
      <label htmlFor="years-input">Rolling Period (years): </label>
      <input
        id="years-input"
        type="number"
        min={1}
        max={30}
        value={years}
        onChange={onYearsChange}
        style={{ width: 60, marginLeft: 8 }}
        disabled={disableControls}
      />
      <button
        style={{ marginLeft: 16, padding: '4px 16px', fontSize: 16 }}
        onClick={onPlot}
        disabled={disableControls}
      >
        Plot
      </button>
    </div>
    {selectedSchemes.map((scheme, idx) => (
      <div key={idx} style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
        <MutualFundDropdown
          funds={funds.filter(f => !selectedSchemes.includes(f.schemeCode) || f.schemeCode === scheme)}
          onSelect={code => onFundSelect(idx, code)}
          value={scheme ?? undefined}
        />
        {selectedSchemes.length > 1 && (
          <button style={{ marginLeft: 8 }} onClick={() => onRemoveFund(idx)} disabled={disableControls}>-</button>
        )}
      </div>
    ))}
    <button style={{ marginTop: 8 }} onClick={onAddFund} disabled={disableControls}>Add new fund</button>
  </>
); 