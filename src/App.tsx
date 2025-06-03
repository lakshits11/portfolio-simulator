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
    handleAllocationChange,
    handleToggleRebalancing,
    handleRebalancingThresholdChange,
  } = usePortfolios(DEFAULT_SCHEME_CODE);

  const { handlePlotAllPortfolios } = usePortfolioPlot({
    portfolios,
    years,
    loadNavData,
    plotState,
  });

  const anyInvalidAlloc = portfolios.some(
    p => (p.allocations || []).reduce((a, b) => a + (Number(b) || 0), 0) !== 100
  );

  return (
    <Container>
      <div className="relative">
        <LoadingOverlay active={plotState.loadingNav || plotState.loadingXirr} />
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-700">Portfolio Simulator</h2>
        {loading && <LoadingSpinner text="Loading list of mutual funds..." />}
        {error && <div className="text-red-600 text-center mb-4">{error}</div>}
        {!loading && !error && funds.length > 0 && (
          <>
            <div className="relative border-2 border-gray-200 rounded-lg p-4 mb-8 bg-white shadow-sm w-full">
              {portfolios.map((portfolio, pIdx) => {
                const allocationSum = (portfolio.allocations || []).reduce((a, b) => a + (Number(b) || 0), 0);
                return (
                  <div
                    key={pIdx}
                    className="relative border border-gray-200 rounded-lg p-4 mb-5 bg-white shadow w-full"
                  >
                    {portfolios.length > 1 && (
                      <button
                        onClick={() => setPortfolios(prev => prev.filter((_, i) => i !== pIdx))}
                        className="absolute top-2 right-2 text-2xl text-gray-300 hover:text-red-500 bg-transparent border-none cursor-pointer p-0 leading-none"
                        title={`Remove Portfolio ${pIdx + 1}`}
                      >
                        &times;
                      </button>
                    )}
                    <div className="font-semibold mb-4 text-lg text-blue-700 flex items-center gap-2">
                      Portfolio {pIdx + 1}
                    </div>
                    {/* Only fund controls inside each portfolio */}
                    <FundControls
                      selectedSchemes={portfolio.selectedSchemes}
                      allocations={portfolio.allocations}
                      funds={funds}
                      onFundSelect={(idx, code) => handleFundSelect(pIdx, idx, code)}
                      onAddFund={() => handleAddFund(pIdx)}
                      onRemoveFund={idx => handleRemoveFund(pIdx, idx)}
                      onAllocationChange={(idx, value) => handleAllocationChange(pIdx, idx, value)}
                      disableControls={plotState.loadingNav || plotState.loadingXirr}
                      rebalancingEnabled={portfolio.rebalancingEnabled}
                      onToggleRebalancing={() => handleToggleRebalancing(pIdx)}
                      rebalancingThreshold={portfolio.rebalancingThreshold}
                      onRebalancingThresholdChange={value => handleRebalancingThresholdChange(pIdx, value)}
                    />
                    {allocationSum !== 100 && (
                      <div className="absolute bottom-2 right-4 text-red-600 text-xs font-medium">
                        Allocation should add up to 100%
                      </div>
                    )}
                  </div>
                );
              })}
              <button
                className="block mx-auto mb-6 px-5 py-2 text-base rounded-md border border-gray-300 bg-gray-50 text-gray-800 hover:bg-blue-100 transition-colors shadow-sm"
                onClick={handleAddPortfolio}
              >
                + Portfolio
              </button>
            </div>
            {/* Rolling period and Plot button below Add Portfolio */}
            <div className="relative border-2 border-gray-200 rounded-lg p-4 mb-8 bg-white shadow-sm w-full">
              <div className="flex items-center justify-start gap-3">
                <label htmlFor="years-input" className="text-base text-gray-700 font-medium">
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
                  className="w-20 px-3 py-2 text-base rounded-md border border-gray-300 bg-gray-50 text-gray-800 outline-none text-center focus:ring-2 focus:ring-blue-200"
                  disabled={plotState.loadingNav || plotState.loadingXirr}
                />
                <button
                  className="px-5 py-2 text-base rounded-md border border-gray-300 bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors shadow-sm disabled:bg-gray-200 disabled:text-gray-400 disabled:border-gray-200"
                  onClick={handlePlotAllPortfolios}
                  disabled={plotState.loadingNav || plotState.loadingXirr || anyInvalidAlloc}
                >
                  Plot
                </button>
              </div>
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
              years={years}
            />
          </>
        )}
      </div>
    </Container>
  );
};

export default App;