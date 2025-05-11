import React from 'react';
import { MultiFundCharts } from './MultiFundCharts';
import { mfapiMutualFund } from '../types/mfapiMutualFund';
import { LoadingSpinner } from './LoadingSpinner';

interface ChartAreaProps {
  xirrError: string | null;
  hasPlotted: boolean;
  navDatas: Record<number, any[]>;
  lumpSumXirrDatas: Record<string, any[]>;
  sipXirrDatas: Record<string, any[]>;
  funds: mfapiMutualFund[];
  COLORS: string[];
  loadingNav?: boolean;
  loadingXirr?: boolean;
  portfolioSchemes: (number | null)[][];
  portfolios: { selectedSchemes: (number | null)[] }[];
}

export const ChartArea: React.FC<ChartAreaProps> = ({
  xirrError,
  hasPlotted,
  navDatas,
  lumpSumXirrDatas,
  sipXirrDatas,
  funds,
  COLORS,
  loadingNav = false,
  loadingXirr = false,
  portfolioSchemes,
  portfolios,
}) => (
  <>
    {xirrError && <div style={{ color: 'red', marginTop: 16 }}>{xirrError}</div>}
    <div style={{ minHeight: 350, position: 'relative', width: '100%' }}>
      {(loadingNav || loadingXirr) ? (
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 2,
          background: 'rgba(255,255,255,0.0)',
        }}>
          {loadingNav && <LoadingSpinner text="Fetching NAV data..." />}
          {loadingXirr && <LoadingSpinner text="Calculating XIRR..." />}
        </div>
      ) : (
        hasPlotted && Object.keys(navDatas).length > 0 && (
          <MultiFundCharts
            navDatas={navDatas}
            lumpSumXirrDatas={lumpSumXirrDatas}
            sipXirrDatas={sipXirrDatas}
            funds={funds}
            COLORS={COLORS}
            portfolioSchemes={portfolioSchemes}
            portfolios={portfolios}
          />
        )
      )}
    </div>
  </>
); 