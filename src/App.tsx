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
import { getQueryParams, setQueryParams } from './utils/queryParams';

const DEFAULT_SCHEME_CODE = 120716;

const App: React.FC = () => {
  const { funds, loading, error } = useMutualFunds();
  const { loadNavData } = useNavData();
  const plotState = usePlotState(loadNavData, funds);

  // Initialize portfolios and years from query params
  const initialParams = React.useMemo(() => getQueryParams(), []);
  const [portfolios, setPortfolios] = React.useState<{ selectedSchemes: (number | null)[] }[]>(
    initialParams.portfolios && initialParams.portfolios.length > 0
      ? initialParams.portfolios.map(schemes => ({ selectedSchemes: schemes.length > 0 ? schemes : [DEFAULT_SCHEME_CODE] }))
      : [{ selectedSchemes: [DEFAULT_SCHEME_CODE] }]
  );
  const [years, setYears] = React.useState<number>(initialParams.years || 1);

  // Handler to add a new portfolio
  const handleAddPortfolio = () => {
    setPortfolios(prev => [
      ...prev,
      { selectedSchemes: [DEFAULT_SCHEME_CODE] }
    ]);
  };

  // Handlers for fund controls per portfolio
  const handleFundSelect = (portfolioIdx: number, idx: number, schemeCode: number) => {
    setPortfolios(prev => prev.map((p, i) =>
      i === portfolioIdx
        ? { ...p, selectedSchemes: p.selectedSchemes.map((s, j) => j === idx ? schemeCode : s) }
        : p
    ));
  };
  const handleAddFund = (portfolioIdx: number) => {
    setPortfolios(prev => prev.map((p, i) =>
      i === portfolioIdx
        ? { ...p, selectedSchemes: [...p.selectedSchemes, null] }
        : p
    ));
  };
  const handleRemoveFund = (portfolioIdx: number, idx: number) => {
    setPortfolios(prev => prev.map((p, i) =>
      i === portfolioIdx
        ? { ...p, selectedSchemes: p.selectedSchemes.filter((_, j) => j !== idx) }
        : p
    ));
  };

  // Sync portfolios and years to query params
  React.useEffect(() => {
    setQueryParams(portfolios.map(p => p.selectedSchemes), years);
  }, [portfolios, years]);

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
                }}
              >
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
                onClick={plotState.handlePlot}
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
            />
          </>
        )}
      </div>
    </Container>
  );
};

export default App;