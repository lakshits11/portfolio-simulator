export type InstrumentType = 'mutual_fund' | 'index_fund';

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

export type Instrument = MutualFund | IndexFund;

export interface InstrumentNavData {
  date: Date;
  nav: number;
}