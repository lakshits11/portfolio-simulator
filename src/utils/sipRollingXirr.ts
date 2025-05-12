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
    computeXirrForDate(date, fundDateMaps, months, firstDate, allocations)
  );
}

// ────────────────────────────────
// Small, Ordered Helper Functions
// ────────────────────────────────

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
  return [...fund].sort((a, b) => a.date.getTime() - b.date.getTime()).map(e => e.date);
}

function computeXirrForDate(
  currentDate: Date,
  fundDateMaps: Map<string, NavEntry>[],
  months: number,
  firstDate: Date,
  allocations?: number[]
): SipRollingXirrEntry[] {
  const numFunds = fundDateMaps.length;
  const totalInvestment = 100;
  const transactions: Transaction[] = [];

  for (let fundIdx = 0; fundIdx < numFunds; fundIdx++) {
    const navMap = fundDateMaps[fundIdx];
    const alloc = allocations?.[fundIdx] ?? (100 / numFunds);
    const amount = totalInvestment * (alloc / 100);

    const buys = getBuyTransactions(navMap, currentDate, months, firstDate, amount, fundIdx);
    if (!buys) return [];

    const totalUnits = buys.reduce((sum, tx) => sum + tx.units, 0);
    const sell = getSellTransaction(navMap, currentDate, totalUnits, fundIdx);
    if (!sell) return [];

    transactions.push(...buys, sell);
  }

  const cashflows = transactions.map(tx => ({
    amount: tx.type === 'buy' ? -tx.amount : tx.amount,
    when: tx.when
  }));

  return [{
    date: currentDate,
    xirr: xirr(cashflows),
    transactions
  }];
}

function getBuyTransactions(
  navMap: Map<string, NavEntry>,
  current: Date,
  months: number,
  firstDate: Date,
  amount: number,
  fundIdx: number
): Transaction[] | null {
  const buys: Transaction[] = [];

  for (let m = months; m >= 1; m--) {
    const sipDate = getNthPreviousMonthDate(current, m);
    if (sipDate < firstDate) return null;

    const entry = navMap.get(toDateKey(sipDate));
    if (!entry) return null;

    const units = amount / entry.nav;
    buys.push({ fundIdx, nav: entry.nav, when: entry.date, units, amount, type: 'buy' });
  }

  return buys;
}

function getSellTransaction(
  navMap: Map<string, NavEntry>,
  date: Date,
  totalUnits: number,
  fundIdx: number
): Transaction | null {
  const entry = navMap.get(toDateKey(date));
  if (!entry) return null;

  const amount = totalUnits * entry.nav;
  return { fundIdx, nav: entry.nav, when: entry.date, units: totalUnits, amount, type: 'sell' };
}

function toDateKey(date: Date): string {
  return date.toISOString().split('T')[0];
}
