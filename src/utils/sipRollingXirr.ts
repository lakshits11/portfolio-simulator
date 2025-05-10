import xirr from 'xirr';
import { NavEntry } from '../types/navData';
import { areDatesContinuous, getNthPreviousMonthDate } from './dateUtils';
import { fillMissingNavDates } from './fillMissingNavDates';

export interface SipRollingXirrEntry {
  date: Date;
  xirr: number;
  transactions: { nav: number; when: Date }[];
}

export function calculateSipRollingXirr(navData: NavEntry[], years: number = 1): SipRollingXirrEntry[] {
  if (navData.length < 2) return [];
  let data = navData;
  if (!areDatesContinuous(data)) {
    data = fillMissingNavDates(data);
  }
  const sorted = [...data].sort((a, b) => a.date.getTime() - b.date.getTime());
  const result: SipRollingXirrEntry[] = [];
  const firstDate = sorted[0].date;
  const months = 12 * years;

  for (let i = 0; i < sorted.length; i++) {
    const current = sorted[i];
    const { buys, totalUnits, valid } = getSipBuyTransactions(sorted, current, firstDate, months);
    if (!valid) continue;
    const sell = getSipSellTransaction(current, totalUnits);
    const xirrTransactions = getSipXirrTransactions(buys, sell);
    const transactions = [...buys, { nav: sell.nav, when: sell.when }];
    const rate = xirr(xirrTransactions);
    result.push({ date: current.date, xirr: rate, transactions });
  }
  return result;
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