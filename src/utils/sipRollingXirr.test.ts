import { calculateSipRollingXirr, SipRollingXirrEntry, Transaction } from './sipRollingXirr';
import { NavEntry } from '../types/navData';

function buildMonthlyNavData(startDate: string, navStart: number, months: number, step: number = 5): NavEntry[] {
  const entries: NavEntry[] = [];
  let date = new Date(startDate);
  let nav = navStart;

  for (let i = 0; i < months; i++) {
    entries.push({ date: new Date(date), nav });
    date.setMonth(date.getMonth() + 1);
    nav += step;
  }

  return entries;
}

describe('calculateSipRollingXirr', () => {
  it('calculates SIP rolling XIRR for a single fund with regular monthly NAV data', () => {
    const navData = buildMonthlyNavData('2023-01-31', 100, 13);
    const result = calculateSipRollingXirr([navData]);

    const last = result[result.length - 1];
    expect(last).toBeDefined();
    expect(last.transactions.length).toBe(13); // 12 buys + 1 sell
    expect(last.transactions[0].when.toISOString().startsWith('2023-02')).toBe(true);
    expect(last.transactions[0].nav).toBe(105);
    expect(typeof last.xirr).toBe('number');
    // Log the XIRR value before asserting
    console.log('Produced XIRR (single fund, regular monthly NAV):', last.xirr);
    expect(last.xirr).toBeCloseTo(0.53367382, 8);
  });

  it('returns empty array if any fund has insufficient data', () => {
    expect(calculateSipRollingXirr([[]])).toEqual([]);
    expect(calculateSipRollingXirr([[{ date: new Date('2023-01-01'), nav: 100 }]])).toEqual([]);
  });

  it('handles missing months by filling them implicitly', () => {
    const navData = buildMonthlyNavData('2023-01-31', 100, 13).filter((entry, i) => i !== 1); // remove Feb
    const result = calculateSipRollingXirr([navData]);

    expect(result.length).toBeGreaterThan(0);
    const last = result[result.length - 1];
    expect(typeof last.xirr).toBe('number');
    // Log the XIRR value before asserting
    console.log('Produced XIRR (missing months):', last.xirr);
    expect(last.xirr).toBeCloseTo(0.50976966, 8);
  });

  it('skips early dates without enough SIP history', () => {
    const navData = buildMonthlyNavData('2023-01-31', 100, 3); // Only 3 months
    const result = calculateSipRollingXirr([navData]);

    expect(result).toEqual([]);
  });

  it('handles month-end boundary dates correctly', () => {
    const navData = buildMonthlyNavData('2023-01-31', 100, 13); // Includes Feb 28
    const result = calculateSipRollingXirr([navData]);

    const last = result[result.length - 1];
    expect(typeof last.xirr).toBe('number');
    expect(last.transactions[0].when.getDate()).toBeLessThanOrEqual(31); // SIP buy date
    // Log the XIRR value before asserting
    console.log('Produced XIRR (month-end boundary):', last.xirr);
    expect(last.xirr).toBeCloseTo(0.53367382, 8);
  });

  describe('multi-fund scenarios', () => {
    it('splits investment equally when no allocations are provided', () => {
      const nav1 = buildMonthlyNavData('2023-01-31', 100, 13);
      const nav2 = buildMonthlyNavData('2023-01-31', 200, 13);
      const result = calculateSipRollingXirr([nav1, nav2]);

      const last = result[result.length - 1];
      expect(last.transactions.length).toBe(26); // 2 funds × (12 buys + 1 sell)

      last.transactions.forEach((tx: Transaction) => {
        if (tx.type === 'buy') {
          expect(tx.amount).toBeCloseTo(50, 5); // 100 split equally
        }
      });
      // Log the XIRR value before asserting
      console.log('Produced XIRR (multi-fund, equal split):', last.xirr);
      expect(last.xirr).toBeCloseTo(0.40504702, 8);
    });

    it('uses custom fund allocations correctly', () => {
      const nav1 = buildMonthlyNavData('2023-01-31', 100, 13);
      const nav2 = buildMonthlyNavData('2023-01-31', 200, 13);
      const allocations = [70, 30];
      const result = calculateSipRollingXirr([nav1, nav2], 1, allocations);

      const last = result[result.length - 1];
      last.transactions.forEach((tx: Transaction) => {
        if (tx.type === 'buy') {
          if (tx.fundIdx === 0) expect(tx.amount).toBeCloseTo(70, 5);
          if (tx.fundIdx === 1) expect(tx.amount).toBeCloseTo(30, 5);
        }
      });
      // Log the XIRR value before asserting
      console.log('Produced XIRR (multi-fund, custom allocation):', last.xirr);
      expect(last.xirr).toBeCloseTo(0.45611864, 8);
    });

    it('returns empty result if either fund lacks enough data', () => {
      const nav1 = buildMonthlyNavData('2023-01-31', 100, 2); // Too short
      const nav2 = buildMonthlyNavData('2023-01-31', 200, 13);

      const result = calculateSipRollingXirr([nav1, nav2]);
      expect(result).toEqual([]);
    });

    it('handles one fund with missing months', () => {
      const nav1 = buildMonthlyNavData('2023-01-31', 100, 13).filter((_, i) => i !== 1); // remove Feb
      const nav2 = buildMonthlyNavData('2023-01-31', 200, 13);

      const result = calculateSipRollingXirr([nav1, nav2]);
      const last = result[result.length - 1];
      expect(last).toBeDefined();
      expect(typeof last.xirr).toBe('number');
      // Log the XIRR value before asserting
      console.log('Produced XIRR (multi-fund, one fund missing months):', last.xirr);
      expect(last.xirr).toBeCloseTo(0.39337281, 8);
    });
  });
});
