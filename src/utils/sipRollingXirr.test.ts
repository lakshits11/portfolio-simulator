import { calculateSipRollingXirr, SipRollingXirrEntry } from './sipRollingXirr';

describe('calculateSipRollingXirr', () => {
  it('calculates SIP rolling 1-year XIRR for simple NAV data', () => {
    const navData = [
      { date: new Date('2023-01-31'), nav: 100 },
      { date: new Date('2023-02-28'), nav: 105 },
      { date: new Date('2023-03-31'), nav: 110 },
      { date: new Date('2023-04-30'), nav: 115 },
      { date: new Date('2023-05-31'), nav: 120 },
      { date: new Date('2023-06-30'), nav: 125 },
      { date: new Date('2023-07-31'), nav: 130 },
      { date: new Date('2023-08-31'), nav: 135 },
      { date: new Date('2023-09-30'), nav: 140 },
      { date: new Date('2023-10-31'), nav: 145 },
      { date: new Date('2023-11-30'), nav: 150 },
      { date: new Date('2023-12-31'), nav: 155 },
      { date: new Date('2024-01-31'), nav: 160 },
    ];
    const result = calculateSipRollingXirr(navData);
    // Should have at least one result for the last date
    const last = result[result.length - 1];
    expect(last).toBeDefined();
    expect(last.transactions.length).toBe(13); // 12 SIPs + 1 sell
    expect(last.transactions[0].nav).toBe(100);
    expect(last.transactions[12].nav).toBe(160); // sell
    expect(typeof last.xirr).toBe('number');
  });
}); 