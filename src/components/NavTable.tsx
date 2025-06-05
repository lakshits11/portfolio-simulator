import React from 'react';
import { NavEntry } from '../types/navData';
import { fillMissingNavDates } from '../utils/fillMissingNavDates';
import { Block } from 'baseui/block';
import { LabelMedium, LabelSmall } from 'baseui/typography';

interface NavTableProps {
  navData: NavEntry[];
}

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export const NavTable: React.FC<NavTableProps> = ({ navData }) => {
  if (!navData.length) return null;
  const filledData = fillMissingNavDates(navData);
  
  return (
    <Block>
      {/* Header */}
      <Block 
        display="flex" 
        padding="0.5rem"
        overrides={{
          Block: {
            style: {
              borderBottom: '2px solid #e5e7eb',
              fontWeight: 'bold'
            }
          }
        }}
      >
        <Block width="50%">
          <LabelMedium>Date</LabelMedium>
        </Block>
        <Block width="50%">
          <LabelMedium>NAV</LabelMedium>
        </Block>
      </Block>
      
      {/* Data rows */}
      {filledData.map((row, idx) => (
        <Block 
          key={idx}
          display="flex" 
          padding="0.25rem 0.5rem"
          overrides={{
            Block: {
              style: {
                borderBottom: '1px solid #f3f4f6',
                ':hover': {
                  backgroundColor: '#f9fafb'
                }
              }
            }
          }}
        >
          <Block width="50%">
            <LabelSmall>{formatDate(row.date)}</LabelSmall>
          </Block>
          <Block width="50%">
            <LabelSmall>{row.nav.toFixed(5)}</LabelSmall>
          </Block>
        </Block>
      ))}
    </Block>
  );
}; 