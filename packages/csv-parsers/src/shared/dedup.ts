import { createHash } from 'crypto';

/**
 * Compute a deduplication hash for a transaction row.
 * Used as fallback when no external_id is present (e.g. ING CSV).
 */
export function computeDedupHash(params: {
  account_id: string;
  occurred_at: Date;
  amount_cents: number;
  raw_description: string;
}): string {
  const input = [
    params.account_id,
    params.occurred_at.toISOString(),
    params.amount_cents.toString(),
    params.raw_description,
  ].join('|');
  return createHash('sha256').update(input).digest('hex');
}
