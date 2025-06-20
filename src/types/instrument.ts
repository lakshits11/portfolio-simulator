export type InstrumentType = 'mutual_fund' | 'index_fund' | 'yahoo_finance';

export interface BaseInstrument {
  id: string | number;
  name: string;
  type: InstrumentType;
}

export interface MutualFund extends BaseInstrument {
  type: 'mutual_fund';
  id: number;
  schemeCode: number;
  schemeName: string;
}

export interface IndexFund extends BaseInstrument {
  type: 'index_fund';
  id: string;
  indexName: string;
  displayName: string;
}

export interface YahooFinanceInstrument extends BaseInstrument {
  type: 'yahoo_finance';
  id: string;
  symbol: string;
  displayName: string;
}

export type Instrument = MutualFund | IndexFund | YahooFinanceInstrument;

export interface InstrumentNavData {
  date: Date;
  nav: number;
}