import xirr from 'xirr';
import { NavEntry } from '../types/navData';
import { areDatesContinuous, getNthPreviousMonthDate } from './dateUtils';
import { fillMissingNavDates } from './fillMissingNavDates';

export interface SipRollingXirrEntry {
  date: Date;
  xirr: number;
  transactions: Transaction[];
}

export interface Transaction {
  fundIdx: number;
  when: Date;
  nav: number;
  units: number;
  amount: number;
  type: 'buy' | 'sell';
  cumulativeUnits: number;
  currentValue: number;
  allocationPercentage?: number;
}

export function calculateSipRollingXirr(
  navDataList: NavEntry[][],
  years: number = 1,
  allocations?: number[]
): SipRollingXirrEntry[] {
  if (!isValidInput(navDataList)) return [];

  const months = years * 12;
  const filledNavs = navDataList.map(ensureContinuousDates);
  const fundDateMaps = filledNavs.map(buildDateMap);
  const baseDates = getSortedDates(filledNavs[0]);
  const firstDate = baseDates[0];

  return baseDates.flatMap(date =>
    computeSipXirrForDate(date, fundDateMaps, months, firstDate, allocations)
  );
}

function computeSipXirrForDate(
  currentDate: Date,
  fundDateMaps: Map<string, NavEntry>[],
  months: number,
  firstDate: Date,
  allocations?: number[]
): SipRollingXirrEntry[] {
  const { transactions, unitsPerFund } = calculateTransactionsForDate(
    currentDate,
    fundDateMaps,
    months,
    firstDate,
    allocations
  );
  if (!transactions) return [];

  const sells = finalSellingOfAllFunds(currentDate, fundDateMaps, unitsPerFund);
  if (!sells) return [];

  const allTransactions = [...transactions, ...sells];
  const cashflows = allTransactions.map(tx => ({
    amount: tx.type === 'buy' ? -tx.amount : tx.amount,
    when: tx.when
  }));

  return [{
    date: currentDate,
    xirr: xirr(cashflows),
    transactions: allTransactions
  }];
}

function calculateTransactionsForDate(
  currentDate: Date,
  fundDateMaps: Map<string, NavEntry>[],
  months: number,
  firstDate: Date,
  allocations?: number[]
): { transactions: Transaction[] | null; unitsPerFund: number[] } {
  const totalInvestment = 100;
  const numFunds = fundDateMaps.length;
  const transactions: Transaction[] = [];
  const unitsPerFund = new Array(numFunds).fill(0);
  const cumulativeUnits = new Array(numFunds).fill(0);

  for (let m = months; m >= 1; m--) {
    const sipDate = getNthPreviousMonthDate(currentDate, m);
    if (sipDate < firstDate) return { transactions: null, unitsPerFund };

    const dateKey = toDateKey(sipDate);
    const transactionsForCurrentSipDate: Transaction[] = [];
    let totalPortfolioValueForSipDate = 0;

    for (let fundIdx = 0; fundIdx < numFunds; fundIdx++) {
      const navMap = fundDateMaps[fundIdx];
      const entry = navMap.get(dateKey);
      if (!entry) return { transactions: null, unitsPerFund };

      const alloc = allocations?.[fundIdx] ?? (100 / numFunds);
      const amount = totalInvestment * (alloc / 100);
      const units = amount / entry.nav;

      cumulativeUnits[fundIdx] += units;
      unitsPerFund[fundIdx] += units;
      const currentFundValue = cumulativeUnits[fundIdx] * entry.nav;
      
      const transaction: Transaction = {
        fundIdx,
        nav: entry.nav,
        when: entry.date,
        units,
        amount,
        type: 'buy',
        cumulativeUnits: cumulativeUnits[fundIdx],
        currentValue: currentFundValue,
      };
      transactionsForCurrentSipDate.push(transaction);
      totalPortfolioValueForSipDate += currentFundValue;
    }

    // Calculate allocation percentage for transactions on this SIP date
    for (const tx of transactionsForCurrentSipDate) {
      if (totalPortfolioValueForSipDate > 0) {
        tx.allocationPercentage = (tx.currentValue / totalPortfolioValueForSipDate) * 100;
      } else {
        tx.allocationPercentage = 0; // Avoid division by zero if total value is 0
      }
      transactions.push(tx); // Add to the main transactions list
    }
  }

  return { transactions, unitsPerFund };
}

function finalSellingOfAllFunds(
  currentDate: Date,
  fundDateMaps: Map<string, NavEntry>[],
  unitsPerFund: number[]
): Transaction[] | null {
  const numFunds = fundDateMaps.length;
  const dateKey = toDateKey(currentDate);
  const sells: Transaction[] = [];

  for (let fundIdx = 0; fundIdx < numFunds; fundIdx++) {
    const navMap = fundDateMaps[fundIdx];
    const entry = navMap.get(dateKey);
    if (!entry) return null;

    const units = unitsPerFund[fundIdx];
    const amount = units * entry.nav;

    sells.push({
      fundIdx,
      nav: entry.nav,
      when: entry.date,
      units,
      amount,
      type: 'sell',
      cumulativeUnits: units, // All units are sold
      currentValue: units * entry.nav,
    });
  }

  return sells;
}

// ────────────── Internal Helpers ────────────── //

function isValidInput(navDataList: NavEntry[][]): boolean {
  return navDataList.length > 0 && !navDataList.some(f => f.length < 2);
}

function ensureContinuousDates(fund: NavEntry[]): NavEntry[] {
  return areDatesContinuous(fund) ? fund : fillMissingNavDates(fund);
}

function buildDateMap(fund: NavEntry[]): Map<string, NavEntry> {
  return new Map(fund.map(entry => [toDateKey(entry.date), entry]));
}

function getSortedDates(fund: NavEntry[]): Date[] {
  return [...fund]
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .map(entry => entry.date);
}

function toDateKey(date: Date): string {
  return date.toISOString().split('T')[0];
}