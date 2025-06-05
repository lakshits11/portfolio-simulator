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
        <Block 
          marginBottom="1.5rem" 
          overrides={{
            Block: {
              style: {
                textAlign: 'center',
                color: '#1d4ed8',
                fontWeight: 'bold',
                fontSize: '24px',
                lineHeight: '32px'
              }
            }
          }}
        >
          Portfolio Simulator
        </Block>
        {loading && <LoadingSpinner text="Loading list of mutual funds..." />}
        {error && (
          <Block 
            color="#dc2626" 
            marginBottom="1rem"
            overrides={{
              Block: {
                style: {
                  textAlign: 'center'
                }
              }
            }}
          >
            {error}
          </Block>
        )}
        {!loading && !error && funds.length > 0 && (
          <>
            <Block
              position="relative"
              padding="1rem"
              marginBottom="2rem"
              backgroundColor="white"
              width="100%"
              overrides={{
                Block: {
                  style: {
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
                  }
                }
              }}
            >
              {portfolios.map((portfolio, pIdx) => {
                const allocationSum = (portfolio.allocations || []).reduce((a, b) => a + (Number(b) || 0), 0);
                return (
                  <Block
                    key={pIdx}
                    position="relative"
                    padding="1rem"
                    marginBottom="1.25rem"
                    backgroundColor="white"
                    width="100%"
                    overrides={{
                      Block: {
                        style: {
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
                        }
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
                            style: {
                              position: 'absolute',
                              top: '8px',
                              right: '8px',
                              fontSize: '24px',
                              color: '#d1d5db',
                              background: 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              padding: '0',
                              lineHeight: '1',
                              ':hover': {
                                color: '#ef4444',
                              },
                            },
                          },
                        }}
                        title={`Remove Portfolio ${pIdx + 1}`}
                      >
                        &times;
                      </Button>
                    )}
                    <Block 
                      marginBottom="1rem" 
                      color="#1d4ed8"
                      display="flex"
                      alignItems="center"
                      gridGap="8px"
                      overrides={{
                        Block: {
                          style: {
                            fontWeight: '600',
                            fontSize: '18px'
                          }
                        }
                      }}
                    >
                      Portfolio {pIdx + 1}
                    </Block>
                    {/* Only fund controls inside each portfolio */}
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
                        bottom="8px"
                        right="16px"
                        color="#dc2626"
                        overrides={{
                          Block: {
                            style: {
                              fontSize: '12px',
                              fontWeight: '500'
                            }
                          }
                        }}
                      >
                        Allocation should add up to 100%
                      </Block>
                    )}
                  </Block>
                );
              })}
              <Block display="flex" justifyContent="center" marginBottom="1.5rem">
                <Button
                  kind="secondary"
                  onClick={handleAddPortfolioInvalidate}
                  overrides={{
                    BaseButton: {
                      style: {
                        border: '1px solid #d1d5db',
                        backgroundColor: '#f9fafb',
                        color: '#374151',
                        ':hover': {
                          backgroundColor: '#dbeafe',
                        },
                        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                      },
                    },
                  }}
                >
                  + Portfolio
                </Button>
              </Block>
            </Block>
            {/* Rolling period and Plot button below Add Portfolio */}
            <Block
              position="relative"
              padding="1rem"
              marginBottom="2rem"
              backgroundColor="white"
              width="100%"
              overrides={{
                Block: {
                  style: {
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
                  }
                }
              }}
            >
              <Block display="flex" alignItems="center" justifyContent="flex-start" gridGap="12px">
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
                  overrides={{
                    BaseButton: {
                      style: {
                        backgroundColor: '#2563eb',
                        fontWeight: '600',
                        ':hover': {
                          backgroundColor: '#1d4ed8',
                        },
                        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                      },
                    },
                  }}
                >
                  Plot
                </Button>
                <Block 
                  color="#6b7280"
                  marginLeft="8px"
                  overrides={{
                    Block: {
                      style: {
                        fontSize: '12px'
                      }
                    }
                  }}
                >
                  Tip: Click on a point in the graph to see more details for that specific date.
                </Block>
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