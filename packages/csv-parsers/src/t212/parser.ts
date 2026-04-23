import { parseDelimitedCsv, splitDelimitedLine } from '../shared/csv';
import type { ParseResult } from '../shared/types';
import { validateRequiredColumns } from '../shared/validators';
import { t212ActionToIntentHint, t212AmountToCents } from './mapping';
import { T212_REQUIRED_COLUMNS } from './types';

function getCurrency(rawRow: Record<string, string>) {
  return rawRow['Currency (Total)'] ?? rawRow['Currency'] ?? 'EUR';
}

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
  const duplicates: ParseResult['duplicates'] = [];
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
        duplicates.push({
          row_index: index + 2,
          raw_data: rawRow,
          reason: 'duplicate_in_file',
        });
        return;
      }

      seenExternalIds.add(externalId);
      rows.push({
        row_index: index + 2,
        raw_data: rawRow,
        external_id: externalId,
        occurred_at: occurredAt,
        amount_cents: t212AmountToCents(rawRow['Total'] ?? '', rawRow['Action'] ?? ''),
        currency: getCurrency(rawRow),
        raw_description:
          rawRow['Name'] || rawRow['Ticker'] || rawRow['Action'] || 'Trading 212 transaction',
        source: 't212_csv',
        intent_hint: t212ActionToIntentHint(rawRow['Action'] ?? ''),
        dedup_hash: `${accountId}:${externalId}`,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown T212 parse error';
      errors.push({ row_index: index + 2, error: message, raw_data: rawRow });
    }
  });

  return {
    rows,
    duplicates,
    errors,
    duplicate_count: duplicateCount,
  };
}
