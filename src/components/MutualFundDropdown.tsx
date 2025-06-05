import React from 'react';
import { Select } from 'baseui/select';

interface MutualFundDropdownProps {
  funds: { schemeCode: number; schemeName: string }[];
  onSelect: (code: number) => void;
  value?: number;
}

export const MutualFundDropdown: React.FC<MutualFundDropdownProps> = ({ funds, onSelect, value }) => {
  // Base Web Select expects options as {label, id}
  const options = funds.map(fund => ({
    label: fund.schemeName,
    id: fund.schemeCode,
  }));

  const selected = value != null ? options.find(opt => opt.id === value) : null;

  return (
    <Select
      options={options}
      value={selected ? [selected] : []}
      placeholder="Select a mutual fund"
      onChange={params => {
        const selectedOption = params.value[0];
        if (selectedOption && typeof selectedOption.id === 'number') {
          onSelect(selectedOption.id);
        }
        // If no option, do nothing
      }}
      clearable={false}
      searchable={true}
      overrides={{
        ControlContainer: { style: { width: '500px' } },
      }}
    />
  );
}; 