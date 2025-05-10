import xirr from 'xirr';
import { NavEntry } from '../types/navData';

export interface RollingXirrEntry {
  date: Date;
  xirr: number;
}

/**
 * Calculates rolling 1-year XIRR for a series of NAV entries.
 * For each date, finds the closest available NAV at least one year before,
 * and calculates XIRR for that period. Skips dates where no such NAV exists.
 */
export function calculateRollingXirr(navData: NavEntry[]): RollingXirrEntry[] {
  if (navData.length < 2) return [];
  // Sort ascending by date
  const sorted = [...navData].sort((a, b) => a.date.getTime() - b.date.getTime());
  const result: RollingXirrEntry[] = [];

  for (let i = 0; i < sorted.length; i++) {
    const current = sorted[i];
    const oneYearAgo = new Date(current.date);
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    // Find the closest date that is <= oneYearAgo
    let startIdx = -1;
    for (let j = i - 1; j >= 0; j--) {
      if (sorted[j].date <= oneYearAgo) {
        startIdx = j;
        break;
      }
    }
    if (startIdx === -1) continue; // No suitable start date
    const start = sorted[startIdx];
    const transactions = [
      { amount: -start.nav, when: start.date },
      { amount: current.nav, when: current.date },
    ];
    try {
      const rate = xirr(transactions);
      result.push({ date: current.date, xirr: rate });
    } catch {
      // If xirr fails to converge, skip
      continue;
    }
  }
  return result;
} 