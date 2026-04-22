import { T212_ACTION_INTENT_MAP } from './types';

/**
 * Convert T212 Total string to signed cents.
 * T212 uses dot as decimal separator. Withdrawals are negative.
 */
export function t212AmountToCents(total: string, action: string): number {
  const abs = Math.round(parseFloat(total) * 100);
  const isOutflow = action === 'Withdrawal';
  return isOutflow ? -Math.abs(abs) : Math.abs(abs);
}

/**
 * Map T212 Action to a Dart intent hint.
 */
export function t212ActionToIntentHint(action: string): string | null {
  return T212_ACTION_INTENT_MAP[action] ?? null;
}
