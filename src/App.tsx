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
import { Block } from 'baseui/block';
import { Button } from 'baseui/button';
import { Input } from 'baseui/input';
import { FormControl } from 'baseui/form-control';
import { HeadingLarge } from 'baseui/typography';
import { LabelLarge, LabelMedium, LabelSmall } from 'baseui/typography';

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

  // Helper to invalidate chart
  const invalidateChart = () => {
    plotState.setHasPlotted(false);
    plotState.setNavDatas({});
    plotState.setLumpSumXirrDatas({});
    plotState.setSipXirrDatas({});
    plotState.setXirrError(null);
  };

  // Wrapped handlers to invalidate chart on change
  const handleAddPortfolioInvalidate = () => {
    invalidateChart();
    handleAddPortfolio();
  };
  const handleFundSelectInvalidate = (pIdx: number, idx: number, code: number) => {
    invalidateChart();
    handleFundSelect(pIdx, idx, code);
  };
  const handleAddFundInvalidate = (pIdx: number) => {
    invalidateChart();
    handleAddFund(pIdx);
  };
  const handleRemoveFundInvalidate = (pIdx: number, idx: number) => {
    invalidateChart();
    handleRemoveFund(pIdx, idx);
  };
  const handleAllocationChangeInvalidate = (pIdx: number, idx: number, value: number) => {
    invalidateChart();
    handleAllocationChange(pIdx, idx, value);
  };
  const handleToggleRebalancingInvalidate = (pIdx: number) => {
    invalidateChart();
    handleToggleRebalancing(pIdx);
  };
  const handleRebalancingThresholdChangeInvalidate = (pIdx: number, value: number) => {
    invalidateChart();
    handleRebalancingThresholdChange(pIdx, value);
  };

  return (
    <Container>
      <Block position="relative">
        <LoadingOverlay active={plotState.loadingNav || plotState.loadingXirr} />
        <Block marginBottom="scale800" display="flex" justifyContent="center">
          <HeadingLarge 
            overrides={{
              Block: {
                style: ({ $theme }) => ({
                  color: $theme.colors.contentPrimary,
                  fontWeight: 'bold',
                  margin: 0
                })
              }
            }}
          >
            Portfolio Simulator
          </HeadingLarge>
        </Block>
        {loading && <LoadingSpinner text="Loading list of mutual funds..." />}
        {error && (
          <Block 
            marginBottom="1rem"
            display="flex"
            justifyContent="center"
          >
            <LabelMedium
              overrides={{
                Block: {
                  style: {
                    color: '#dc2626'
                  }
                }
              }}
            >
              {error}
            </LabelMedium>
          </Block>
        )}
        {!loading && !error && funds.length > 0 && (
          <>
            {/* Portfolios Section */}
            <Block marginBottom="scale800">
              {portfolios.map((portfolio, pIdx) => {
                const allocationSum = (portfolio.allocations || []).reduce((a, b) => a + (Number(b) || 0), 0);
                return (
                  <Block
                    key={pIdx}
                    position="relative"
                    padding="scale700"
                    marginBottom="scale600"
                    backgroundColor={pIdx % 2 === 0 ? "backgroundPrimary" : "backgroundSecondary"}
                    overrides={{
                      Block: {
                        style: ({ $theme }) => ({
                          borderLeft: `4px solid ${$theme.colors.accent}`,
                          borderRadius: $theme.borders.radius200,
                          transition: $theme.animation.timing200,
                          ':hover': {
                            borderLeftColor: $theme.colors.primary,
                            backgroundColor: $theme.colors.backgroundTertiary
                          }
                        })
                      }
                    }}
                  >
                    {portfolios.length > 1 && (
                      <Button
                        onClick={() => setPortfolios(prev => prev.filter((_, i) => i !== pIdx))}
                        kind="tertiary"
                        size="compact"
                        overrides={{
                          BaseButton: {
                            style: ({ $theme }) => ({
                              position: 'absolute',
                              top: $theme.sizing.scale300,
                              right: $theme.sizing.scale300,
                              fontSize: '24px',
                              color: $theme.colors.contentSecondary,
                              background: 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              padding: '0',
                              lineHeight: '1',
                              ':hover': {
                                color: $theme.colors.negative,
                              },
                            }),
                          },
                        }}
                        title={`Remove Portfolio ${pIdx + 1}`}
                      >
                        &times;
                      </Button>
                    )}
                    
                    <Block marginBottom="scale500">
                      <LabelLarge
                        overrides={{
                          Block: {
                            style: ({ $theme }) => ({
                              color: $theme.colors.primary,
                              fontWeight: '600',
                              margin: 0
                            })
                          }
                        }}
                      >
                        Portfolio {pIdx + 1}
                      </LabelLarge>
                    </Block>
                    
                    <FundControls
                      selectedSchemes={portfolio.selectedSchemes}
                      allocations={portfolio.allocations}
                      funds={funds}
                      onFundSelect={(idx, code) => handleFundSelectInvalidate(pIdx, idx, code)}
                      onAddFund={() => handleAddFundInvalidate(pIdx)}
                      onRemoveFund={idx => handleRemoveFundInvalidate(pIdx, idx)}
                      onAllocationChange={(idx, value) => handleAllocationChangeInvalidate(pIdx, idx, value)}
                      disableControls={plotState.loadingNav || plotState.loadingXirr}
                      rebalancingEnabled={portfolio.rebalancingEnabled}
                      onToggleRebalancing={() => handleToggleRebalancingInvalidate(pIdx)}
                      rebalancingThreshold={portfolio.rebalancingThreshold}
                      onRebalancingThresholdChange={value => handleRebalancingThresholdChangeInvalidate(pIdx, value)}
                    />
                    
                    {allocationSum !== 100 && (
                      <Block 
                        position="absolute"
                        bottom="scale300"
                        right="scale400"
                      >
                        <LabelSmall
                          overrides={{
                            Block: {
                              style: ({ $theme }) => ({
                                color: $theme.colors.negative,
                                fontWeight: '500',
                                margin: 0
                              })
                            }
                          }}
                        >
                          Allocation should add up to 100%
                        </LabelSmall>
                      </Block>
                    )}
                  </Block>
                );
              })}
              
              {/* Add Portfolio Button */}
              <Block display="flex" justifyContent="center" marginTop="scale600">
                <Button
                  kind="secondary"
                  onClick={handleAddPortfolioInvalidate}
                  startEnhancer={() => <span style={{ fontSize: '16px', marginRight: '4px' }}>+</span>}
                >
                  Add Portfolio
                </Button>
              </Block>
            </Block>

            {/* Controls Section */}
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
                      plotState.setHasPlotted(false);
                      plotState.setNavDatas({});
                      plotState.setLumpSumXirrDatas({});
                      plotState.setSipXirrDatas({});
                      plotState.setXirrError(null);
                    }}
                    disabled={plotState.loadingNav || plotState.loadingXirr}
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
                  onClick={handlePlotAllPortfolios}
                  disabled={plotState.loadingNav || plotState.loadingXirr || anyInvalidAlloc}
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
      </Block>
    </Container>
  );
};

export default App;