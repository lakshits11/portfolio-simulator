import { calculateSipRollingXirr, calculateSipRollingXirrMultipleFunds, SipRollingXirrEntry } from './sipRollingXirr';
import { fillMissingNavDates } from './fillMissingNavDates';
import { NavEntry } from '../types/navData';

describe('calculateSipRollingXirr', () => {
  it('calculates SIP rolling 1-year XIRR for simple monthly NAV data', () => {
    const navData: NavEntry[] = [
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
    const result = calculateSipRollingXirr([navData]);
    const last = result[result.length - 1];
    expect(last).toBeDefined();
    expect(last.transactions.length).toBe(13); // 12 SIPs + 1 sell
    expect(last.transactions[0].nav).toBe(100);
    expect(typeof last.transactions[12].nav).toBe('number');
    expect(typeof last.xirr).toBe('number');
  });

  it('returns empty array if not enough data', () => {
    expect(calculateSipRollingXirr([[]])).toEqual([]);
    expect(calculateSipRollingXirr([[{ date: new Date('2023-01-01'), nav: 100 }]])).toEqual([]);
  });

  it('handles missing dates by filling them', () => {
    const navData: NavEntry[] = [
      { date: new Date('2023-01-31'), nav: 100 },
      { date: new Date('2023-03-31'), nav: 110 }, // missing Feb
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
    const result = calculateSipRollingXirr([navData]);
    expect(result.length).toBeGreaterThan(0);
    // Should still produce a result for the last date
    const last = result[result.length - 1];
    expect(last).toBeDefined();
    expect(typeof last.xirr).toBe('number');
  });

  it('skips dates where not enough SIPs can be made', () => {
    const navData: NavEntry[] = [
      { date: new Date('2023-01-31'), nav: 100 },
      { date: new Date('2023-02-28'), nav: 105 },
      { date: new Date('2023-03-31'), nav: 110 },
    ];
    // Not enough for 12 SIPs
    const result = calculateSipRollingXirr([navData]);
    expect(result).toEqual([]);
  });

  it('handles month-end edge cases for SIP dates', () => {
    const navData: NavEntry[] = [
      { date: new Date('2023-01-31'), nav: 100 },
      { date: new Date('2023-02-28'), nav: 105 }, // Feb end
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
    const result = calculateSipRollingXirr([navData]);
    expect(result.length).toBeGreaterThan(0);
    const last = result[result.length - 1];
    expect(last).toBeDefined();
    expect(typeof last.xirr).toBe('number');
  });
});

describe('calculateSipRollingXirrMultipleFunds', () => {
  it('calculates SIP rolling 1-year XIRR for two funds with equal allocation', () => {
    const navData1: NavEntry[] = [
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
    const navData2: NavEntry[] = [
      { date: new Date('2023-01-31'), nav: 200 },
      { date: new Date('2023-02-28'), nav: 210 },
      { date: new Date('2023-03-31'), nav: 220 },
      { date: new Date('2023-04-30'), nav: 230 },
      { date: new Date('2023-05-31'), nav: 240 },
      { date: new Date('2023-06-30'), nav: 250 },
      { date: new Date('2023-07-31'), nav: 260 },
      { date: new Date('2023-08-31'), nav: 270 },
      { date: new Date('2023-09-30'), nav: 280 },
      { date: new Date('2023-10-31'), nav: 290 },
      { date: new Date('2023-11-30'), nav: 300 },
      { date: new Date('2023-12-31'), nav: 310 },
      { date: new Date('2024-01-31'), nav: 320 },
    ];
    const result = calculateSipRollingXirrMultipleFunds([navData1, navData2]);
    const last = result[result.length - 1];
    expect(last).toBeDefined();
    expect(last.transactions.length).toBe(26); // (12 SIPs + 1 sell) per fund * 2
    expect(typeof last.xirr).toBe('number');
    // Each buy should be 50 (100/2 funds)
    last.transactions.forEach(tx => {
      if (tx.type === 'buy') {
        expect(tx.amount).toBeCloseTo(50, 5);
      }
    });
  });

  it('handles custom allocations for multiple funds', () => {
    const navData1: NavEntry[] = [
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
    const navData2: NavEntry[] = [
      { date: new Date('2023-01-31'), nav: 200 },
      { date: new Date('2023-02-28'), nav: 210 },
      { date: new Date('2023-03-31'), nav: 220 },
      { date: new Date('2023-04-30'), nav: 230 },
      { date: new Date('2023-05-31'), nav: 240 },
      { date: new Date('2023-06-30'), nav: 250 },
      { date: new Date('2023-07-31'), nav: 260 },
      { date: new Date('2023-08-31'), nav: 270 },
      { date: new Date('2023-09-30'), nav: 280 },
      { date: new Date('2023-10-31'), nav: 290 },
      { date: new Date('2023-11-30'), nav: 300 },
      { date: new Date('2023-12-31'), nav: 310 },
      { date: new Date('2024-01-31'), nav: 320 },
    ];
    // 70% to fund 1, 30% to fund 2
    const allocations = [70, 30];
    const result = calculateSipRollingXirrMultipleFunds([navData1, navData2], 1, allocations);
    const last = result[result.length - 1];
    expect(last).toBeDefined();
    // Each buy for fund 1 should be 70, fund 2 should be 30
    last.transactions.forEach(tx => {
      if (tx.type === 'buy') {
        if (tx.fundIdx === 0) expect(tx.amount).toBeCloseTo(70, 5);
        if (tx.fundIdx === 1) expect(tx.amount).toBeCloseTo(30, 5);
      }
    });
  });

  it('returns empty array if any fund has insufficient data', () => {
    const navData1: NavEntry[] = [
      { date: new Date('2023-01-31'), nav: 100 },
      { date: new Date('2023-02-28'), nav: 105 },
    ];
    const navData2: NavEntry[] = [
      { date: new Date('2023-01-31'), nav: 200 },
      { date: new Date('2023-02-28'), nav: 210 },
    ];
    expect(calculateSipRollingXirrMultipleFunds([navData1, navData2])).toEqual([]);
  });

  it('handles missing dates in one or more funds', () => {
    const navData1: NavEntry[] = [
      { date: new Date('2023-01-31'), nav: 100 },
      { date: new Date('2023-03-31'), nav: 110 }, // missing Feb
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
    const navData2: NavEntry[] = [
      { date: new Date('2023-01-31'), nav: 200 },
      { date: new Date('2023-02-28'), nav: 210 },
      { date: new Date('2023-03-31'), nav: 220 },
      { date: new Date('2023-04-30'), nav: 230 },
      { date: new Date('2023-05-31'), nav: 240 },
      { date: new Date('2023-06-30'), nav: 250 },
      { date: new Date('2023-07-31'), nav: 260 },
      { date: new Date('2023-08-31'), nav: 270 },
      { date: new Date('2023-09-30'), nav: 280 },
      { date: new Date('2023-10-31'), nav: 290 },
      { date: new Date('2023-11-30'), nav: 300 },
      { date: new Date('2023-12-31'), nav: 310 },
      { date: new Date('2024-01-31'), nav: 320 },
    ];
    const result = calculateSipRollingXirrMultipleFunds([navData1, navData2]);
    expect(result.length).toBeGreaterThan(0);
    const last = result[result.length - 1];
    expect(last).toBeDefined();
    expect(typeof last.xirr).toBe('number');
  });
}); 