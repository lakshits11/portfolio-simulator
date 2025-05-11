import React from 'react';
import { Container } from './components/Container';
import { useMutualFunds } from './hooks/useMutualFunds';
import { useNavData } from './hooks/useNavData';
import { FundControls } from './components/FundControls';
import { LoadingOverlay } from './components/LoadingOverlay';
import { ChartArea } from './components/ChartArea';
import { usePlotState } from './hooks/usePlotState';
import { LoadingSpinner } from './components/LoadingSpinner';
import { usePortfolios } from './hooks/usePortfolios';
import { usePortfolioPlot } from './hooks/usePortfolioPlot';

const DEFAULT_SCHEME_CODE = 120716;

const App: React.FC = () => {
  const { funds, loading, error } = useMutualFunds();
  const { loadNavData } = useNavData();
  const plotState = usePlotState(loadNavData, funds);
  const {
    portfolios,
    setPortfolios,
    years,
    setYears,
    handleAddPortfolio,
    handleFundSelect,
    handleAddFund,
    handleRemoveFund,
  } = usePortfolios(DEFAULT_SCHEME_CODE);

  const { handlePlotAllPortfolios } = usePortfolioPlot({
    portfolios,
    years,
    loadNavData,
    plotState,
  });

  return (
    <Container>
      <div style={{ position: 'relative' }}>
        <LoadingOverlay active={plotState.loadingNav || plotState.loadingXirr} />
        <h2 style={{ marginBottom: '20px' }}>Mutual Funds</h2>
        {loading && <LoadingSpinner text="Loading list of mutual funds..." />}
        {error && <div style={{ color: 'red' }}>{error}</div>}
        {!loading && !error && funds.length > 0 && (
          <>
            {portfolios.map((portfolio, pIdx) => (
              <div
                key={pIdx}
                style={{
                  border: '2px solid #007bff',
                  borderRadius: 8,
                  padding: 16,
                  marginBottom: 20,
                  background: '#f9f9ff',
                  position: 'relative',
                }}
              >
                {portfolios.length > 1 && (
                  <button
                    onClick={() => setPortfolios(prev => prev.filter((_, i) => i !== pIdx))}
                    style={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      background: 'transparent',
                      border: 'none',
                      fontSize: 22,
                      color: '#888',
                      cursor: 'pointer',
                      lineHeight: 1,
                      padding: 0,
                    }}
                    title={`Remove Portfolio ${pIdx + 1}`}
                  >
                    &times;
                  </button>
                )}
                <div style={{ fontWeight: 'bold', marginBottom: 8 }}>Portfolio {pIdx + 1}</div>
                {/* Only fund controls inside each portfolio */}
                <FundControls
                  selectedSchemes={portfolio.selectedSchemes}
                  funds={funds}
                  onFundSelect={(idx, code) => handleFundSelect(pIdx, idx, code)}
                  onAddFund={() => handleAddFund(pIdx)}
                  onRemoveFund={idx => handleRemoveFund(pIdx, idx)}
                  disableControls={plotState.loadingNav || plotState.loadingXirr}
                />
              </div>
            ))}
            <button
              style={{
                display: 'block',
                margin: '0 auto 24px auto',
                padding: '8px 20px',
                fontSize: 16,
                borderRadius: 6,
                border: '1px solid #ccc',
                background: '#fafafa',
                color: '#333',
                cursor: 'pointer',
              }}
              onClick={handleAddPortfolio}
            >
              Add Portfolio
            </button>
            {/* Rolling period and Plot button below Add Portfolio */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              marginBottom: 32,
            }}>
              <label htmlFor="years-input" style={{ fontSize: 16, color: '#333' }}>
                Rolling Period (years):
              </label>
              <input
                id="years-input"
                type="number"
                min={1}
                max={30}
                value={years}
                onChange={e => {
                  setYears(Math.max(1, Math.floor(Number(e.target.value))));
                  plotState.setHasPlotted(false);
                  plotState.setNavDatas({});
                  plotState.setLumpSumXirrDatas({});
                  plotState.setSipXirrDatas({});
                  plotState.setXirrError(null);
                }}
                style={{
                  width: 70,
                  padding: '8px 12px',
                  fontSize: 16,
                  borderRadius: 6,
                  border: '1px solid #ccc',
                  background: '#fafafa',
                  color: '#333',
                  outline: 'none',
                  textAlign: 'center',
                }}
                disabled={plotState.loadingNav || plotState.loadingXirr}
              />
              <button
                style={{
                  padding: '8px 20px',
                  fontSize: 16,
                  borderRadius: 6,
                  border: '1px solid #ccc',
                  background: '#fafafa',
                  color: '#333',
                  cursor: 'pointer',
                }}
                onClick={handlePlotAllPortfolios}
                disabled={plotState.loadingNav || plotState.loadingXirr}
              >
                Plot
              </button>
            </div>
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
              portfolioSchemes={portfolios.map(p => p.selectedSchemes)}
              portfolios={portfolios}
            />
          </>
        )}
      </div>
    </Container>
  );
};

export default App;