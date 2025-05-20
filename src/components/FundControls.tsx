import React from 'react';
import { MutualFundDropdown } from './MutualFundDropdown';
import { mfapiMutualFund } from '../types/mfapiMutualFund';

interface FundControlsProps {
  selectedSchemes: (number | null)[];
  allocations: number[];
  funds: mfapiMutualFund[];
  onFundSelect: (idx: number, schemeCode: number) => void;
  onAddFund: () => void;
  onRemoveFund: (idx: number) => void;
  onAllocationChange: (idx: number, value: number) => void;
  disableControls: boolean;
  rebalancingEnabled: boolean;
  onToggleRebalancing: () => void;
}

export const FundControls: React.FC<FundControlsProps> = ({
  selectedSchemes,
  allocations,
  funds,
  onFundSelect,
  onAddFund,
  onRemoveFund,
  onAllocationChange,
  disableControls,
  rebalancingEnabled,
  onToggleRebalancing,
}) => (
  <>
    {selectedSchemes.map((scheme, idx) => (
      <div key={idx} style={{ display: 'flex', alignItems: 'center', marginBottom: 8, gap: 8 }}>
        <MutualFundDropdown
          funds={funds.filter(f => !selectedSchemes.includes(f.schemeCode) || f.schemeCode === scheme)}
          onSelect={code => onFundSelect(idx, code)}
          value={scheme ?? undefined}
        />
        <input
          type="number"
          min={0}
          max={100}
          value={allocations[idx] ?? 0}
          onChange={e => onAllocationChange(idx, Number(e.target.value))}
          style={{ width: 60, marginLeft: 8 }}
          disabled={disableControls}
        />
        <span style={{ marginLeft: 2 }}>%</span>
        {selectedSchemes.length > 1 && (
          <button style={{ marginLeft: 8 }} onClick={() => onRemoveFund(idx)} disabled={disableControls}>-</button>
        )}
      </div>
    ))}
    <div style={{ display: 'flex', alignItems: 'center', marginTop: 8, gap: 16 }}>
      <button onClick={onAddFund} disabled={disableControls}>Add new fund</button>
      <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
        <input
          type="checkbox"
          checked={rebalancingEnabled}
          onChange={onToggleRebalancing}
          disabled={disableControls}
          style={{ marginRight: 6 }}
        />
        Enable Rebalancing
      </label>
    </div>
  </>
); 