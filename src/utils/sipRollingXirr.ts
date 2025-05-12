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
  const { buys, unitsPerFund } = collectBuysForDate(
    currentDate,
    fundDateMaps,
    months,
    firstDate,
    allocations
  );
  if (!buys) return [];

  const sells = collectSellsForDate(currentDate, fundDateMaps, unitsPerFund);
  if (!sells) return [];

  const transactions = [...buys, ...sells];
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

function collectBuysForDate(
  currentDate: Date,
  fundDateMaps: Map<string, NavEntry>[],
  months: number,
  firstDate: Date,
  allocations?: number[]
): { buys: Transaction[] | null; unitsPerFund: number[] } {
  const totalInvestment = 100;
  const numFunds = fundDateMaps.length;
  const buys: Transaction[] = [];
  const unitsPerFund = new Array(numFunds).fill(0);

  for (let m = months; m >= 1; m--) {
    const sipDate = getNthPreviousMonthDate(currentDate, m);
    if (sipDate < firstDate) return { buys: null, unitsPerFund };

    const dateKey = toDateKey(sipDate);

    for (let fundIdx = 0; fundIdx < numFunds; fundIdx++) {
      const navMap = fundDateMaps[fundIdx];
      const entry = navMap.get(dateKey);
      if (!entry) return { buys: null, unitsPerFund };

      const alloc = allocations?.[fundIdx] ?? (100 / numFunds);
      const amount = totalInvestment * (alloc / 100);
      const units = amount / entry.nav;

      unitsPerFund[fundIdx] += units;
      buys.push({
        fundIdx,
        nav: entry.nav,
        when: entry.date,
        units,
        amount,
        type: 'buy'
      });
    }
  }

  return { buys, unitsPerFund };
}

function collectSellsForDate(
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
      type: 'sell'
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