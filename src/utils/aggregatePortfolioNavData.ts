import { NavEntry } from '../types/navData';
import { fillMissingNavDates } from './fillMissingNavDates';

/**
 * Aggregates multiple funds' NAV data into a single portfolio NAV series.
 * For each date, the investment amount is split equally across all funds.
 *
 * @param navDataList Array of arrays of NavEntry, one per fund
 * @returns Array of NavEntry representing the portfolio NAV for each date
 */
export function aggregatePortfolioNavData(navDataList: NavEntry[][]): NavEntry[] {
  if (!navDataList.length) return [];
  // Fill missing dates for each fund
  const filledNavs = navDataList.map(fillMissingNavDates);
  // Get the set of all dates across all funds
  const allDatesSet = new Set<string>();
  filledNavs.forEach(fundNavs => {
    fundNavs.forEach(entry => {
      allDatesSet.add(entry.date.toISOString().slice(0, 10));
    });
  });
  const allDates = Array.from(allDatesSet)
    .map(d => new Date(d))
    .sort((a, b) => a.getTime() - b.getTime());

  // For each date, sum the NAVs (assuming equal investment in each fund)
  const portfolioNavs: NavEntry[] = allDates.map(date => {
    let totalValue = 0;
    let count = 0;
    filledNavs.forEach(fundNavs => {
      const entry = fundNavs.find(e => e.date.getTime() === date.getTime());
      if (entry) {
        totalValue += entry.nav;
        count++;
      }
    });
    // If not all funds have NAV for this date, skip (or could forward fill, but for now skip)
    if (count !== filledNavs.length) return null;
    return { date, nav: totalValue };
  });
  // Remove any nulls (dates where not all funds had NAV)
  return portfolioNavs.filter((entry): entry is NavEntry => !!entry);
} 