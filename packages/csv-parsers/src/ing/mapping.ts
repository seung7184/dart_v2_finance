import type { INGRawRow } from './types';
import { decimalStringToCents } from '../shared/money';

/**
 * Convert ING Bedrag (EUR) string to signed cents.
 * ING uses comma as decimal separator. 'Af' = outflow (negative), 'Bij' = inflow (positive).
 */
export function ingAmountToCents(row: INGRawRow): number {
  const abs = Math.abs(
    decimalStringToCents(row['Bedrag (EUR)'], {
      decimalSeparator: ',',
      thousandsSeparator: '.',
      errorPrefix: 'Invalid ING amount',
    }),
  );
  return row['Af Bij'] === 'Af' ? -abs : abs;
}

/**
 * Parse ING Datum 'DD-MM-YYYY' to a Date object.
 */
export function ingDateToDate(datum: string): Date {
  const [day, month, year] = datum.split('-');
  return new Date(`${year}-${month}-${day}T00:00:00Z`);
}
