import xirr from 'xirr';
import { NavEntry } from '../types/navData';
import { areDatesContinuous, getNthPreviousMonthDate } from './dateUtils';
import { fillMissingNavDates } from './fillMissingNavDates';

export interface SipRollingXirrEntry {
  date: Date;
  xirr: number;
  transactions: { fundIdx: number; when: Date; nav: number; units: number; amount: number; type: 'buy' | 'sell' }[];
}

export function calculateSipRollingXirr(navDataList: NavEntry[][], years: number = 1, allocations?: number[]): SipRollingXirrEntry[] {
  return calculateSipRollingXirrMultipleFunds(navDataList, years, allocations);
}

function getSipBuyTransactions(sorted: NavEntry[], current: NavEntry, firstDate: Date, months: number = 12, fundIdx: number, amountPerFund: number) {
  const buys: { fundIdx: number; nav: number; when: Date; units: number; amount: number; type: 'buy' }[] = [];
  let totalUnits = 0;
  for (let m = months; m >= 1; m--) {
    const sipDate = getNthPreviousMonthDate(current.date, m);
    if (sipDate < firstDate) return { buys: [], totalUnits: 0, valid: false };
    const sipIdx = sorted.findIndex(entry =>
      entry.date.getFullYear() === sipDate.getFullYear() &&
      entry.date.getMonth() === sipDate.getMonth() &&
      entry.date.getDate() === sipDate.getDate()
    );
    if (sipIdx === -1) return { buys: [], totalUnits: 0, valid: false };
    const nav = sorted[sipIdx].nav;
    const units = amountPerFund / nav;
    buys.push({ fundIdx, nav, when: sorted[sipIdx].date, units, amount: amountPerFund, type: 'buy' });
    totalUnits += units;
  }
  return { buys, totalUnits, valid: true };
}

function getSipSellTransaction(current: NavEntry, totalUnits: number, fundIdx: number): { fundIdx: number; nav: number; when: Date; units: number; amount: number; type: 'sell' } {
  return { fundIdx, nav: current.nav, when: current.date, units: totalUnits, amount: totalUnits * current.nav, type: 'sell' as const };
}

function getSipXirrTransactions(buys: { fundIdx: number; when: Date; nav: number; units: number; amount: number; type: 'buy' }[], sells: { fundIdx: number; nav: number; when: Date; units: number; amount: number; type: 'sell' }[]) {
  const xirrTxs = buys.map(buy => ({ amount: -buy.amount, when: buy.when }));
  sells.forEach(sell => xirrTxs.push({ amount: sell.amount, when: sell.when }));
  return xirrTxs;
}

export function calculateSipRollingXirrMultipleFunds(
  navDataList: NavEntry[][],
  years: number = 1,
  allocations?: number[]
): SipRollingXirrEntry[] {
  if (navDataList.length === 0 || navDataList.some(fund => fund.length < 2)) {
    return [];
  }
  const numFunds = navDataList.length;
  console.log('XIRR allocations:', allocations, 'numFunds:', numFunds);
  const totalInvestment = 100;
  const filledNavs = navDataList.map(fund => {
    let data = fund;
    if (!areDatesContinuous(data)) {
      data = fillMissingNavDates(data);
    }
    return data;
  });
  const sorted = [...filledNavs[0]].sort((a, b) => a.date.getTime() - b.date.getTime());
  const firstDate = sorted[0].date;
  const months = 12 * years;
  const result: SipRollingXirrEntry[] = [];
  for (let i = 0; i < sorted.length; i++) {
    const current = sorted[i];
    let allBuys: { fundIdx: number; nav: number; when: Date; units: number; amount: number; type: 'buy' }[] = [];
    let totalUnits = 0;
    let valid = true;
    // For each fund, calculate SIP buys and units
    for (let f = 0; f < numFunds; f++) {
      const fundNav = filledNavs[f];
      const alloc = allocations && allocations[f] != null ? allocations[f] : 100 / numFunds;
      const amountPerFund = totalInvestment * (alloc / 100);
      const { buys, totalUnits: fundUnits, valid: fundValid } = getSipBuyTransactions(fundNav, current, firstDate, months, f, amountPerFund);
      if (!fundValid) {
        valid = false;
        break;
      }
      allBuys.push(...buys);
      totalUnits += fundUnits;
    }
    if (!valid) continue;
    // Calculate sell transaction for the portfolio
    let allSells: { fundIdx: number; nav: number; when: Date; units: number; amount: number; type: 'sell' }[] = [];
    for (let f = 0; f < numFunds; f++) {
      const fundNav = filledNavs[f];
      const endEntry = fundNav.find(entry =>
        entry.date.getFullYear() === current.date.getFullYear() &&
        entry.date.getMonth() === current.date.getMonth() &&
        entry.date.getDate() === current.date.getDate()
      );
      if (!endEntry) {
        valid = false;
        break;
      }
      // For each fund, sell all units at current NAV
      const fundUnits = allBuys.filter(buy => buy.fundIdx === f).reduce((sum, b) => sum + b.units, 0);
      allSells.push(getSipSellTransaction(endEntry, fundUnits, f));
    }
    if (!valid) continue;
    // For XIRR calculation, sum all buys and all sells
    const xirrTransactions = [
      ...allBuys.map(buy => ({ amount: -buy.amount, when: buy.when })),
      ...allSells.map(sell => ({ amount: sell.amount, when: sell.when })),
    ];
    const transactions = [...allBuys, ...allSells];
    const rate = xirr(xirrTransactions);
    result.push({ date: current.date, xirr: rate, transactions });
  }
  return result;
} 