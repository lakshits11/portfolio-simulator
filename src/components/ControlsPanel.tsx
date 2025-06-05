import React from 'react';
import { Block } from 'baseui/block';
import { Button } from 'baseui/button';
import { Input } from 'baseui/input';
import { FormControl } from 'baseui/form-control';
import { LabelSmall } from 'baseui/typography';

interface ControlsPanelProps {
  years: number;
  setYears: (years: number) => void;
  onPlot: () => void;
  disabled: boolean;
  anyInvalidAlloc: boolean;
  onYearsChange: () => void;
}

export const ControlsPanel: React.FC<ControlsPanelProps> = ({
  years,
  setYears,
  onPlot,
  disabled,
  anyInvalidAlloc,
  onYearsChange
}) => {
  return (
    <Block
      padding="scale600"
      marginBottom="scale800"
      backgroundColor="backgroundTertiary"
      overrides={{
        Block: {
          style: ({ $theme }) => ({
            borderRadius: $theme.borders.radius300,
            border: `${$theme.borders.border200.borderWidth} ${$theme.borders.border200.borderStyle} ${$theme.colors.borderOpaque}`
          })
        }
      }}
    >
      <Block display="flex" alignItems="center" justifyContent="flex-start" gridGap="scale400">
        <FormControl label="Rolling Period (years):" caption={null}>
          <Input
            type="number"
            min={1}
            max={30}
            value={years}
            onChange={e => {
              setYears(Math.max(1, Math.floor(Number((e.target as HTMLInputElement).value))));
              onYearsChange();
            }}
            disabled={disabled}
            overrides={{
              Root: { 
                style: { 
                  width: '80px'
                } 
              },
              Input: {
                style: {
                  textAlign: 'center'
                }
              }
            }}
            id="years-input"
          />
        </FormControl>
        <Button
          kind="primary"
          onClick={onPlot}
          disabled={disabled || anyInvalidAlloc}
        >
          Plot
        </Button>
        <LabelSmall
          overrides={{
            Block: {
              style: ({ $theme }) => ({
                color: $theme.colors.contentSecondary,
                marginLeft: $theme.sizing.scale200,
                margin: 0
              })
            }
          }}
        >
          Tip: Click on a point in the graph to see more details for that specific date.
        </LabelSmall>
      </Block>
    </Block>
  );
}; 