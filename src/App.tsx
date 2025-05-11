import React from 'react';
import { MutualFundDropdown } from './components/MutualFundDropdown';
import { Container } from './components/Container';
import { useMutualFunds } from './hooks/useMutualFunds';
import { useNavData } from './hooks/useNavData';
import { FundControls } from './components/FundControls';
import { LoadingOverlay } from './components/LoadingOverlay';
import { SpinnerArea } from './components/SpinnerArea';
import { ChartArea } from './components/ChartArea';
import { usePlotState } from './hooks/usePlotState';
import { LoadingSpinner } from './components/LoadingSpinner';

const App: React.FC = () => {
  const { funds, loading, error } = useMutualFunds();
  const { loadNavData } = useNavData();
  const plotState = usePlotState(loadNavData, funds);

  React.useEffect(() => {
    if (
      !loading &&
      !error &&
      funds.length > 0 &&
      plotState.selectedSchemes.filter(Boolean).length > 0 &&
      !plotState.hasPlotted
    ) {
      plotState.handlePlot();
    }
  }, [loading, error, funds, plotState.selectedSchemes, plotState.years]);

  return (
    <Container>
      <div style={{ position: 'relative' }}>
        <LoadingOverlay active={plotState.loadingNav || plotState.loadingXirr} />
        <h2 style={{ marginBottom: '20px' }}>Mutual Funds</h2>
        {loading && <LoadingSpinner text="Loading list of mutual funds..." />}
        {error && <div style={{ color: 'red' }}>{error}</div>}
        {!loading && !error && funds.length > 0 && (
          <>
            <FundControls
              years={plotState.years}
              onYearsChange={plotState.handleYearsChange}
              selectedSchemes={plotState.selectedSchemes}
              funds={funds}
              onFundSelect={plotState.handleFundSelect}
              onAddFund={plotState.handleAddFund}
              onRemoveFund={plotState.handleRemoveFund}
              onPlot={plotState.handlePlot}
              disableControls={plotState.loadingNav || plotState.loadingXirr}
            />
            <ChartArea
              xirrError={plotState.xirrError}
              hasPlotted={plotState.hasPlotted}
              navDatas={plotState.navDatas}
              lumpSumXirrDatas={plotState.lumpSumXirrDatas}
              sipXirrDatas={plotState.sipXirrDatas}
              funds={funds}
              COLORS={plotState.COLORS}
              loadingNav={plotState.loadingNav}
              loadingXirr={plotState.loadingXirr}
            />
          </>
        )}
      </div>
    </Container>
  );
};

export default App;