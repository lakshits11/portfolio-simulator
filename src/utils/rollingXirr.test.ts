import { calculateRollingXirr } from './rollingXirr';
import { NavEntry } from '../types/navData';

describe('calculateRollingXirr', () => {
  it('calculates rolling 1-year XIRR for simple NAV data', () => {
    const navData: NavEntry[] = [
      { date: new Date('2023-01-01'), nav: 100 },
      { date: new Date('2024-01-01'), nav: 120 },
      { date: new Date('2025-01-01'), nav: 140 },
    ];
    const result = calculateRollingXirr(navData);
    // For 2024-01-01: buy at 100 (2023-01-01), sell at 120 (2024-01-01) => XIRR ~0.2
    // For 2025-01-01: buy at 120 (2024-01-01), sell at 140 (2025-01-01) => XIRR ~0.1662
    expect(result.length).toBe(2);
    expect(result[0].date).toEqual(new Date('2024-01-01'));
    expect(result[0].xirr).toBeCloseTo(0.2, 3);
    expect(result[1].date).toEqual(new Date('2025-01-01'));
    expect(result[1].xirr).toBeCloseTo(0.1662, 3);
  });
}); 