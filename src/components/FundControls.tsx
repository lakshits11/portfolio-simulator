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
  rebalancingThreshold: number;
  onRebalancingThresholdChange: (value: number) => void;
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
  rebalancingThreshold,
  onRebalancingThresholdChange,
}) => (
  <>
    {selectedSchemes.map((scheme, idx) => (
      <div key={idx} className="flex items-center mb-2 gap-2">
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
          className="w-16 ml-2 px-2 py-1 rounded border border-gray-300 text-base"
          disabled={disableControls}
        />
        <span className="ml-1">%</span>
        {selectedSchemes.length > 1 && (
          <button
            className="ml-2 px-2 py-1 rounded bg-red-500 text-white font-bold hover:bg-red-600 transition-colors disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
            onClick={() => onRemoveFund(idx)}
            disabled={disableControls}
            title="Remove fund"
          >
            -
          </button>
        )}
      </div>
    ))}
    <div className="flex items-center mt-2 gap-4">
      <button
        onClick={onAddFund}
        disabled={disableControls}
        className="px-3 py-1 rounded bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
      >
        + Fund
      </button>
      {selectedSchemes.length > 1 && (
        <>
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={rebalancingEnabled}
              onChange={onToggleRebalancing}
              disabled={disableControls}
              className="mr-1.5 accent-blue-500"
            />
            Enable Rebalancing
          </label>
          {rebalancingEnabled && (
            <div className="flex items-center gap-1.5">
              <label htmlFor="rebal-threshold-input" className="text-sm">Threshold (%):</label>
              <input
                id="rebal-threshold-input"
                type="number"
                min={0}
                max={100}
                value={rebalancingThreshold}
                onChange={e => onRebalancingThresholdChange(Number(e.target.value))}
                disabled={disableControls}
                className="w-14 px-1 py-0.5 rounded border border-gray-300 text-sm"
              />
            </div>
          )}
        </>
      )}
    </div>
  </>
); 