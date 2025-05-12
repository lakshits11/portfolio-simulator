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
    const navData = buildMonthlyNavData('2023-01-01', 100, 13);
    console.log('hello navData', navData);
    const result = calculateSipRollingXirr([navData]);

    const last = result[result.length - 1];
    expect(last).toBeDefined();
    expect(last.transactions.length).toBe(13); // 12 buys + 1 sell
    expect(last.transactions[0].when.toISOString()).toBe('2023-01-01T00:00:00.000Z');
    expect(last.transactions[0].nav).toBe(100);
    expect(typeof last.xirr).toBe('number');
    // Log the XIRR value before asserting
    console.log('Produced XIRR (single fund, regular monthly NAV):', last.xirr);
    expect(last.xirr).toBeCloseTo(0.54881971, 8);
  });

  it('returns empty array if any fund has insufficient data', () => {
    expect(calculateSipRollingXirr([[]])).toEqual([]);
    expect(calculateSipRollingXirr([[{ date: new Date('2023-01-01'), nav: 100 }]])).toEqual([]);
  });

  describe('multi-fund scenarios', () => {
    it('splits investment equally when no allocations are provided', () => {
      const nav1 = buildMonthlyNavData('2023-01-01', 100, 13);
      const nav2 = buildMonthlyNavData('2023-01-01', 200, 13);
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
      expect(last.xirr).toBeCloseTo(0.41558205, 8);
    });

    it('uses custom fund allocations correctly', () => {
      const nav1 = buildMonthlyNavData('2023-01-01', 100, 13);
      const nav2 = buildMonthlyNavData('2023-01-01', 200, 13);
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
      expect(last.xirr).toBeCloseTo(0.46847172, 8);
    });
  });
});
