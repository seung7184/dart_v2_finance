import type { ParseResult } from '../shared/types';

/**
 * Parse Trading 212 CSV file content into ParsedRow[].
 *
 * STATUS: STUB — not yet implemented.
 * Implementation: read docs/21_Data_Model.md section 5 before implementing.
 */
export function parseT212Csv(
  _csvContent: string,
  _accountId: string,
): ParseResult {
  throw new Error('Not implemented: T212 CSV parser');
}
