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
  'Merchant name'?: string; // present on Card debit/credit rows
  'Merchant category'?: string; // present on Card debit/credit rows (e.g. 'RETAIL_STORES')
}

export const T212_REQUIRED_COLUMNS: string[] = [
  'Action',
  'Time',
  'Total',
  'ID',
];

/**
 * Map T212 Action to Dart intent hint.
 *
 * Policy decisions (Phase 1.5):
 * - Deposit: ING → T212 transfers default to 'transfer', not 'investment_contribution'.
 *   User can edit to 'investment_contribution' if they want.
 * - Card debit/Card transaction: real-world spending defaults to 'living_expense'.
 * - Market buy/sell: always investment intents.
 * - Dividend/Interest: income intents.
 */
export const T212_ACTION_INTENT_MAP: Record<string, string> = {
  Deposit: 'transfer',
  Withdrawal: 'transfer',
  'Market buy': 'investment_buy',
  'Market sell': 'investment_sell',
  Dividend: 'income_dividend',
  'Dividend (Ordinary)': 'income_dividend',
  'Dividend (Ordinary)(Reverse)': 'income_dividend',
  'Interest on cash': 'income_other',
  'Card debit': 'living_expense',
  'Card transaction': 'living_expense',
  'Card credit': 'income_refund',
};
