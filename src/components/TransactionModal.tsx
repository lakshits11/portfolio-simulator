import React, { useRef, useEffect } from 'react';
import { Block } from 'baseui/block';
import { Button } from 'baseui/button';
import { HeadingMedium, LabelLarge, LabelMedium, LabelSmall } from 'baseui/typography';

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

interface TransactionModalProps {
  visible: boolean;
  onClose: () => void;
  transactions: { fundIdx: number; nav: number; when: Date; units: number; amount: number; type: 'buy' | 'sell'; allocationPercentage?: number }[];
  date: string;
  xirr: number;
  portfolioName: string;
  funds: Array<{ schemeName: string; type: 'mutual_fund' | 'index_fund' }>;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({ visible, onClose, transactions, date, xirr, portfolioName, funds }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!visible) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    const handleClick = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClick);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClick);
    };
  }, [visible, onClose]);

  // Sort transactions by date, then by type (buy, rebalance, sell), then by fund name
  const typeOrder = { buy: 0, rebalance: 1, sell: 2 };
  const transactionTypeDisplay = {
    buy: 'Buy',
    sell: 'Sell',
    rebalance: 'Rebalance'
  };
  const sortedTxs = [...transactions].sort((a, b) => {
    const dateA = a.when.getTime();
    const dateB = b.when.getTime();
    if (dateA !== dateB) return dateA - dateB;

    const typeAOrder = typeOrder[a.type];
    const typeBOrder = typeOrder[b.type];
    if (typeAOrder !== typeBOrder) return typeAOrder - typeBOrder;

    const fundA = funds[a.fundIdx]?.schemeName || `Fund ${a.fundIdx + 1}`;
    const fundB = funds[b.fundIdx]?.schemeName || `Fund ${b.fundIdx + 1}`;
    return fundA.localeCompare(fundB);
  });

  if (!visible) return null;
  return (
    <Block
      position="fixed"
      top="0"
      left="0"
      right="0"
      bottom="0"
      display="flex"
      alignItems="center"
      justifyContent="center"
      overrides={{
        Block: {
          style: {
            background: 'rgba(0,0,0,0.3)',
            zIndex: 1000
          }
        }
      }}
    >
      <Block
        ref={modalRef}
        backgroundColor="white"
        padding="1.5rem"
        position="relative"
        overrides={{
          Block: {
            style: {
              borderRadius: '8px',
              minWidth: '540px',
              maxWidth: '98vw',
              maxHeight: '80vh',
              overflowY: 'auto',
              boxShadow: '0 2px 16px rgba(0,0,0,0.2)'
            }
          }
        }}
      >
        <Button
          onClick={onClose}
          kind="tertiary"
          size="compact"
          overrides={{
            BaseButton: {
              style: {
                position: 'absolute',
                top: '8px',
                right: '12px',
                background: 'none',
                border: 'none',
                fontSize: '22px',
                color: '#888',
                cursor: 'pointer',
                padding: '0',
                lineHeight: '1',
                ':hover': {
                  color: '#ef4444'
                }
              }
            }
          }}
        >
          &times;
        </Button>
        
        <HeadingMedium
          overrides={{
            Block: {
              style: {
                marginTop: 0,
                marginBottom: '1rem'
              }
            }
          }}
        >
          {portfolioName} - {date}
        </HeadingMedium>
        
        <Block marginBottom="0.5rem">
          <LabelMedium>
            XIRR: <strong>{(xirr * 100).toFixed(2)}%</strong>
          </LabelMedium>
        </Block>
        
        <Block marginBottom="1rem">
          <LabelLarge
            overrides={{
              Block: {
                style: {
                  fontWeight: 'bold',
                  margin: 0
                }
              }
            }}
          >
            Transactions:
          </LabelLarge>
        </Block>
        
        <Block 
          width="100%" 
          overrides={{
            Block: {
              style: {
                overflowX: 'auto'
              }
            }
          }}
        >
          <Block minWidth="900px">
            {/* Table Header */}
            <Block 
              display="flex" 
              padding="0.375rem 0.5rem"
              overrides={{
                Block: {
                  style: {
                    background: '#f5f5f5',
                    border: '1px solid #ccc',
                    borderBottom: 'none'
                  }
                }
              }}
            >
              <Block width="25%" padding="0 0.25rem">
                <LabelSmall
                  overrides={{
                    Block: {
                      style: {
                        fontWeight: 'bold',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        margin: 0
                      }
                    }
                  }}
                >
                  Fund
                </LabelSmall>
              </Block>
              <Block width="10%" padding="0 0.25rem">
                <LabelSmall
                  overrides={{
                    Block: {
                      style: {
                        fontWeight: 'bold',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        margin: 0
                      }
                    }
                  }}
                >
                  Type
                </LabelSmall>
              </Block>
              <Block width="12%" padding="0 0.25rem">
                <LabelSmall
                  overrides={{
                    Block: {
                      style: {
                        fontWeight: 'bold',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        margin: 0
                      }
                    }
                  }}
                >
                  Date
                </LabelSmall>
              </Block>
              <Block width="10%" padding="0 0.25rem">
                <LabelSmall
                  overrides={{
                    Block: {
                      style: {
                        fontWeight: 'bold',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        margin: 0
                      }
                    }
                  }}
                >
                  NAV
                </LabelSmall>
              </Block>
              <Block width="12%" padding="0 0.25rem">
                <LabelSmall
                  overrides={{
                    Block: {
                      style: {
                        fontWeight: 'bold',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        margin: 0
                      }
                    }
                  }}
                >
                  Units
                </LabelSmall>
              </Block>
              <Block width="12%" padding="0 0.25rem">
                <LabelSmall
                  overrides={{
                    Block: {
                      style: {
                        fontWeight: 'bold',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        margin: 0
                      }
                    }
                  }}
                >
                  Amount
                </LabelSmall>
              </Block>
              <Block width="19%" padding="0 0.25rem">
                <LabelSmall
                  overrides={{
                    Block: {
                      style: {
                        fontWeight: 'bold',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        margin: 0
                      }
                    }
                  }}
                >
                  Allocation %
                </LabelSmall>
              </Block>
            </Block>

            {/* Table Rows */}
            {sortedTxs.map((tx, idx) => {
              const fundName = funds[tx.fundIdx]?.schemeName || `Fund ${tx.fundIdx + 1}`;
              return (
                <Block 
                  key={idx}
                  display="flex" 
                  padding="0.375rem 0.5rem"
                  overrides={{
                    Block: {
                      style: {
                        background: idx % 2 === 0 ? '#fff' : '#f9f9f9',
                        border: '1px solid #ccc',
                        borderTop: 'none'
                      }
                    }
                  }}
                >
                  <Block width="25%" padding="0 0.25rem">
                    <LabelSmall
                      overrides={{
                        Block: {
                          style: {
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            margin: 0
                          }
                        }
                      }}
                    >
                      {fundName}
                    </LabelSmall>
                  </Block>
                  <Block width="10%" padding="0 0.25rem">
                    <LabelSmall
                      overrides={{
                        Block: {
                          style: {
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            margin: 0
                          }
                        }
                      }}
                    >
                      {transactionTypeDisplay[tx.type] || ''}
                    </LabelSmall>
                  </Block>
                  <Block width="12%" padding="0 0.25rem">
                    <LabelSmall
                      overrides={{
                        Block: {
                          style: {
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            margin: 0
                          }
                        }
                      }}
                    >
                      {formatDate(tx.when)}
                    </LabelSmall>
                  </Block>
                  <Block width="10%" padding="0 0.25rem">
                    <LabelSmall
                      overrides={{
                        Block: {
                          style: {
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            margin: 0
                          }
                        }
                      }}
                    >
                      {tx.nav.toFixed(2)}
                    </LabelSmall>
                  </Block>
                  <Block width="12%" padding="0 0.25rem">
                    <LabelSmall
                      overrides={{
                        Block: {
                          style: {
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            margin: 0
                          }
                        }
                      }}
                    >
                      {tx.units.toFixed(4)}
                    </LabelSmall>
                  </Block>
                  <Block width="12%" padding="0 0.25rem">
                    <LabelSmall
                      overrides={{
                        Block: {
                          style: {
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            margin: 0
                          }
                        }
                      }}
                    >
                      {tx.amount.toFixed(2)}
                    </LabelSmall>
                  </Block>
                  <Block width="19%" padding="0 0.25rem">
                    <LabelSmall
                      overrides={{
                        Block: {
                          style: {
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            margin: 0
                          }
                        }
                      }}
                    >
                      {((tx.type as string) === 'buy' || (tx.type as string) === 'rebalance') && tx.allocationPercentage !== undefined ? `${tx.allocationPercentage.toFixed(2)}%` : ''}
                    </LabelSmall>
                  </Block>
                </Block>
              );
            })}
          </Block>
        </Block>
      </Block>
    </Block>
  );
}; 