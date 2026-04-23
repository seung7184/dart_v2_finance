/** Raw Trading 212 CSV row */
export interface T212RawRow {
  Action: string;           // 'Deposit', 'Market buy', 'Market sell', 'Dividend', etc.
  Time: string;             // ISO datetime
  Ticker: string;
  Name: string;
  'No. of shares': string;
  'Price / share': string;
  Currency: string;
  'Currency (Total)': string;
  'Exchange rate': string;
  Total: string;
  ID: string;               // external_id
}

export const T212_REQUIRED_COLUMNS: string[] = [
  'Action',
  'Time',
  'Total',
  'ID',
];

/** Map T212 Action to Dart intent hint */
export const T212_ACTION_INTENT_MAP: Record<string, string> = {
  Deposit: 'investment_contribution',
  Withdrawal: 'transfer',
  'Market buy': 'investment_buy',
  'Market sell': 'investment_sell',
  Dividend: 'income_dividend',
  'Dividend (Ordinary)': 'income_dividend',
  'Interest on cash': 'income_other',
};
