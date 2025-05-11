import React from 'react';
import { MutualFundDropdown } from './MutualFundDropdown';
import { mfapiMutualFund } from '../types/mfapiMutualFund';

interface FundControlsProps {
  selectedSchemes: (number | null)[];
  funds: mfapiMutualFund[];
  onFundSelect: (idx: number, schemeCode: number) => void;
  onAddFund: () => void;
  onRemoveFund: (idx: number) => void;
  disableControls: boolean;
}

export const FundControls: React.FC<FundControlsProps> = ({
  selectedSchemes,
  funds,
  onFundSelect,
  onAddFund,
  onRemoveFund,
  disableControls,
}) => (
  <>
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