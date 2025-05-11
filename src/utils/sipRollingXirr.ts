import xirr from 'xirr';
import { NavEntry } from '../types/navData';
import { areDatesContinuous, getNthPreviousMonthDate } from './dateUtils';
import { fillMissingNavDates } from './fillMissingNavDates';

export interface SipRollingXirrEntry {
  date: Date;
  xirr: number;
  transactions: { nav: number; when: Date }[];
}

export function calculateSipRollingXirr(navDataList: NavEntry[][], years: number = 1): SipRollingXirrEntry[] {
  return calculateSipRollingXirrMultipleFunds(navDataList, years);
}

function getSipBuyTransactions(sorted: NavEntry[], current: NavEntry, firstDate: Date, months: number = 12) {
  const buys: { nav: number; when: Date }[] = [];
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
    buys.push({ nav: sorted[sipIdx].nav, when: sorted[sipIdx].date });
    totalUnits += 100 / sorted[sipIdx].nav;
  }
  return { buys, totalUnits, valid: true };
}

function getSipSellTransaction(current: NavEntry, totalUnits: number) {
  return { nav: current.nav, when: current.date, sellAmount: totalUnits * current.nav };
}

function getSipXirrTransactions(buys: { when: Date }[], sell: { when: Date; sellAmount: number }) {
  const xirrTxs = buys.map(buy => ({ amount: -100, when: buy.when }));
  xirrTxs.push({ amount: sell.sellAmount, when: sell.when });
  return xirrTxs;
}

export function calculateSipRollingXirrMultipleFunds(
  navDataList: NavEntry[][],
  years: number = 1
): SipRollingXirrEntry[] {
  if (navDataList.length === 0 || navDataList.some(fund => fund.length < 2)) {
    return [];
  }
  const numFunds = navDataList.length;
  // Fill missing dates for each fund
  const filledNavs = navDataList.map(fund => {
    let data = fund;
    if (!areDatesContinuous(data)) {
      data = fillMissingNavDates(data);
    }
    return data;
  });
  // Use the first fund's dates as the reference
  const sorted = [...filledNavs[0]].sort((a, b) => a.date.getTime() - b.date.getTime());
  const firstDate = sorted[0].date;
  const months = 12 * years;
  const result: SipRollingXirrEntry[] = [];
  for (let i = 0; i < sorted.length; i++) {
    const current = sorted[i];
    let allBuys: { nav: number; when: Date }[] = [];
    let totalUnits = 0;
    let valid = true;
    // For each fund, calculate SIP buys and units
    for (let f = 0; f < numFunds; f++) {
      const fundNav = filledNavs[f];
      const { buys, totalUnits: fundUnits, valid: fundValid } = getSipBuyTransactions(fundNav, current, firstDate, months);
      if (!fundValid) {
        valid = false;
        break;
      }
      // Each SIP is split equally across funds
      buys.forEach((buy, idx) => {
        allBuys.push({ nav: buy.nav / numFunds, when: buy.when });
      });
      totalUnits += fundUnits;
    }
    if (!valid) continue;
    // Calculate sell transaction for the portfolio
    let totalNav = 0;
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
      totalNav += endEntry.nav * (totalUnits / numFunds);
    }
    if (!valid) continue;
    const sell = { nav: totalNav, when: current.date, sellAmount: totalNav };
    const xirrTransactions = getSipXirrTransactions(allBuys, sell);
    const transactions = [...allBuys, { nav: sell.nav, when: sell.when }];
    const rate = xirr(xirrTransactions);
    result.push({ date: current.date, xirr: rate, transactions });
  }
  return result;
} 