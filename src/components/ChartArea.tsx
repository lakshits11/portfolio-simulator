import React from 'react';
import { MultiFundCharts } from './MultiFundCharts';
import { mfapiMutualFund } from '../types/mfapiMutualFund';

interface ChartAreaProps {
  xirrError: string | null;
  hasPlotted: boolean;
  navDatas: Record<number, any[]>;
  lumpSumXirrDatas: Record<string, any[]>;
  sipXirrDatas: Record<string, any[]>;
  funds: mfapiMutualFund[];
  COLORS: string[];
}

export const ChartArea: React.FC<ChartAreaProps> = ({
  xirrError,
  hasPlotted,
  navDatas,
  lumpSumXirrDatas,
  sipXirrDatas,
  funds,
  COLORS,
}) => (
  <>
    {xirrError && <div style={{ color: 'red', marginTop: 16 }}>{xirrError}</div>}
    {hasPlotted && Object.keys(navDatas).length > 0 && (
      <MultiFundCharts
        navDatas={navDatas}
        lumpSumXirrDatas={lumpSumXirrDatas}
        sipXirrDatas={sipXirrDatas}
        funds={funds}
        COLORS={COLORS}
      />
    )}
  </>
); 