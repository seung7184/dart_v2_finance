import { T212_ACTION_INTENT_MAP } from './types';
import { decimalStringToCents } from '../shared/money';

/**
 * Convert T212 Total string to signed cents.
 * T212 uses dot as decimal separator. Withdrawals are negative.
 */
export function t212AmountToCents(total: string, action: string): number {
  const parsed = decimalStringToCents(total, {
    decimalSeparator: '.',
    thousandsSeparator: ',',
    errorPrefix: 'Invalid T212 total',
  });

  if (total.trim().startsWith('-') || total.trim().startsWith('+')) {
    return parsed;
  }

  return action === 'Withdrawal' ? -Math.abs(parsed) : Math.abs(parsed);
}

/**
 * Map T212 Action to a Dart intent hint.
 */
export function t212ActionToIntentHint(action: string): string | null {
  return T212_ACTION_INTENT_MAP[action] ?? null;
}
