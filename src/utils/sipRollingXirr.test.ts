import { calculateSipRollingXirr, Transaction } from './sipRollingXirr';
import { NavEntry } from '../types/navData';

// Hardcoded NAV data for two funds, 13 months
const nav1: NavEntry[] = [
  { date: new Date('2023-01-01'), nav: 100 },
  { date: new Date('2023-02-01'), nav: 105 },
  { date: new Date('2023-03-01'), nav: 110 },
  { date: new Date('2023-04-01'), nav: 115 },
  { date: new Date('2023-05-01'), nav: 120 },
  { date: new Date('2023-06-01'), nav: 125 },
  { date: new Date('2023-07-01'), nav: 130 },
  { date: new Date('2023-08-01'), nav: 135 },
  { date: new Date('2023-09-01'), nav: 140 },
  { date: new Date('2023-10-01'), nav: 145 },
  { date: new Date('2023-11-01'), nav: 150 },
  { date: new Date('2023-12-01'), nav: 155 },
  { date: new Date('2024-01-01'), nav: 160 },
];
const nav2: NavEntry[] = [
  { date: new Date('2023-01-01'), nav: 200 },
  { date: new Date('2023-02-01'), nav: 205 },
  { date: new Date('2023-03-01'), nav: 210 },
  { date: new Date('2023-04-01'), nav: 215 },
  { date: new Date('2023-05-01'), nav: 220 },
  { date: new Date('2023-06-01'), nav: 225 },
  { date: new Date('2023-07-01'), nav: 230 },
  { date: new Date('2023-08-01'), nav: 235 },
  { date: new Date('2023-09-01'), nav: 240 },
  { date: new Date('2023-10-01'), nav: 245 },
  { date: new Date('2023-11-01'), nav: 250 },
  { date: new Date('2023-12-01'), nav: 255 },
  { date: new Date('2024-01-01'), nav: 260 },
];

describe('calculateSipRollingXirr', () => {
  describe('multi-fund scenarios', () => {
    it('uses custom fund allocations correctly and produces expected transactions', () => {
      const allocations = [70, 30];
      const result = calculateSipRollingXirr([nav1, nav2], 1, allocations);
      const last = result[result.length - 1];

      // Log all transactions for inspection
      console.log('All transactions:', last.transactions);

      // Hardcoded expected transactions
      const expectedTransactions: Transaction[] = [
        // Fund 0 buys
        { fundIdx: 0, nav: 100, when: new Date('2023-01-01'), units: 0.700, amount: 70.000, type: 'buy' },
        { fundIdx: 0, nav: 105, when: new Date('2023-02-01'), units: 0.667, amount: 70.000, type: 'buy' },
        { fundIdx: 0, nav: 110, when: new Date('2023-03-01'), units: 0.636, amount: 70.000, type: 'buy' },
        { fundIdx: 0, nav: 115, when: new Date('2023-04-01'), units: 0.609, amount: 70.000, type: 'buy' },
        { fundIdx: 0, nav: 120, when: new Date('2023-05-01'), units: 0.583, amount: 70.000, type: 'buy' },
        { fundIdx: 0, nav: 125, when: new Date('2023-06-01'), units: 0.560, amount: 70.000, type: 'buy' },
        { fundIdx: 0, nav: 130, when: new Date('2023-07-01'), units: 0.538, amount: 70.000, type: 'buy' },
        { fundIdx: 0, nav: 135, when: new Date('2023-08-01'), units: 0.519, amount: 70.000, type: 'buy' },
        { fundIdx: 0, nav: 140, when: new Date('2023-09-01'), units: 0.500, amount: 70.000, type: 'buy' },
        { fundIdx: 0, nav: 145, when: new Date('2023-10-01'), units: 0.483, amount: 70.000, type: 'buy' },
        { fundIdx: 0, nav: 150, when: new Date('2023-11-01'), units: 0.467, amount: 70.000, type: 'buy' },
        { fundIdx: 0, nav: 155, when: new Date('2023-12-01'), units: 0.452, amount: 70.000, type: 'buy' },
        // Fund 0 sell
        { fundIdx: 0, nav: 160, when: new Date('2024-01-01'), units: 6.713, amount: 1074.092, type: 'sell' },
        // Fund 1 buys
        { fundIdx: 1, nav: 200, when: new Date('2023-01-01'), units: 0.150, amount: 30.000, type: 'buy' },
        { fundIdx: 1, nav: 205, when: new Date('2023-02-01'), units: 0.146, amount: 30.000, type: 'buy' },
        { fundIdx: 1, nav: 210, when: new Date('2023-03-01'), units: 0.143, amount: 30.000, type: 'buy' },
        { fundIdx: 1, nav: 215, when: new Date('2023-04-01'), units: 0.140, amount: 30.000, type: 'buy' },
        { fundIdx: 1, nav: 220, when: new Date('2023-05-01'), units: 0.136, amount: 30.000, type: 'buy' },
        { fundIdx: 1, nav: 225, when: new Date('2023-06-01'), units: 0.133, amount: 30.000, type: 'buy' },
        { fundIdx: 1, nav: 230, when: new Date('2023-07-01'), units: 0.130, amount: 30.000, type: 'buy' },
        { fundIdx: 1, nav: 235, when: new Date('2023-08-01'), units: 0.128, amount: 30.000, type: 'buy' },
        { fundIdx: 1, nav: 240, when: new Date('2023-09-01'), units: 0.125, amount: 30.000, type: 'buy' },
        { fundIdx: 1, nav: 245, when: new Date('2023-10-01'), units: 0.122, amount: 30.000, type: 'buy' },
        { fundIdx: 1, nav: 250, when: new Date('2023-11-01'), units: 0.120, amount: 30.000, type: 'buy' },
        { fundIdx: 1, nav: 255, when: new Date('2023-12-01'), units: 0.118, amount: 30.000, type: 'buy' },
        // Fund 1 sell
        { fundIdx: 1, nav: 260, when: new Date('2024-01-01'), units: 1.592, amount: 413.821, type: 'sell' },
      ];

      // Assert all transactions match expected (by value, not reference)
      expect(last.transactions.length).toBe(expectedTransactions.length);
      last.transactions.forEach((tx, i) => {
        expect(tx).toMatchObject({
          fundIdx: expectedTransactions[i].fundIdx,
          nav: expectedTransactions[i].nav,
          type: expectedTransactions[i].type,
        });
        // Compare units and amount with two digits precision
        expect(tx.units).toBeCloseTo(expectedTransactions[i].units, 2);
        expect(tx.amount).toBeCloseTo(expectedTransactions[i].amount, 2);
        // Compare dates by value
        expect(tx.when.getTime()).toBe(expectedTransactions[i].when.getTime());
      });

      // Log the XIRR value before asserting
      console.log('Produced XIRR (multi-fund, custom allocation):', last.xirr);
      expect(last.xirr).toBeCloseTo(0.46847172, 8);
    });
  });
});
