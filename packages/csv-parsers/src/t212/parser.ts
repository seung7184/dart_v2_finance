import { parseDelimitedCsv, splitDelimitedLine } from '../shared/csv';
import type { ParseResult } from '../shared/types';
import { validateRequiredColumns } from '../shared/validators';
import { t212ActionToIntentHint, t212AmountToCents } from './mapping';
import { T212_REQUIRED_COLUMNS } from './types';

export function parseT212Csv(
  csvContent: string,
  accountId: string,
): ParseResult {
  const [headerLine = ''] = csvContent
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  const headers = splitDelimitedLine(headerLine, ',');

  validateRequiredColumns(headers, T212_REQUIRED_COLUMNS, 'Trading 212');

  const rawRows = parseDelimitedCsv(csvContent, ',');
  const rows: ParseResult['rows'] = [];
  const errors: ParseResult['errors'] = [];
  const seenExternalIds = new Set<string>();
  let duplicateCount = 0;

  rawRows.forEach((rawRow, index) => {
    try {
      const occurredAt = new Date(rawRow['Time'] ?? '');
      if (Number.isNaN(occurredAt.getTime())) {
        throw new Error(`Invalid T212 time: ${rawRow['Time'] ?? ''}`);
      }

      const externalId = (rawRow['ID'] ?? '').trim();
      if (externalId.length === 0) {
        throw new Error('Missing T212 external ID');
      }

      if (seenExternalIds.has(externalId)) {
        duplicateCount += 1;
        return;
      }

      seenExternalIds.add(externalId);
      rows.push({
        external_id: externalId,
        occurred_at: occurredAt,
        amount_cents: t212AmountToCents(rawRow['Total'] ?? '', rawRow['Action'] ?? ''),
        currency: rawRow['Currency'] ?? 'EUR',
        raw_description:
          rawRow['Name'] || rawRow['Ticker'] || rawRow['Action'] || 'Trading 212 transaction',
        source: 't212_csv',
        intent_hint: t212ActionToIntentHint(rawRow['Action'] ?? ''),
        dedup_hash: `${accountId}:${externalId}`,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown T212 parse error';
      errors.push({ row_index: index + 2, error: message });
    }
  });

  return {
    rows,
    errors,
    duplicate_count: duplicateCount,
  };
}
