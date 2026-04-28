import { computeDedupHash } from '../shared/dedup';
import type { ParseResult } from '../shared/types';
import { validateRequiredColumns } from '../shared/validators';
import { parseDelimitedCsv, splitDelimitedLine } from '../shared/csv';
import { ingAmountToCents, ingDateToDate } from './mapping';
import { ING_REQUIRED_COLUMNS } from './types';

export function parseINGCsv(
  csvContent: string,
  accountId: string,
): ParseResult {
  const [headerLine = ''] = csvContent
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  const headers = splitDelimitedLine(headerLine, ';');

  validateRequiredColumns(headers, ING_REQUIRED_COLUMNS, 'ING');

  const rawRows = parseDelimitedCsv(csvContent, ';');
  const rows: ParseResult['rows'] = [];
  const duplicates: ParseResult['duplicates'] = [];
  const errors: ParseResult['errors'] = [];
  const seenDedupHashes = new Set<string>();
  let duplicateCount = 0;

  rawRows.forEach((rawRow, index) => {
    try {
      const occurredAt = ingDateToDate(rawRow['Datum'] ?? '');
      const amountCents = ingAmountToCents({
        Datum: rawRow['Datum'] ?? '',
        'Naam / Omschrijving': rawRow['Naam / Omschrijving'] ?? '',
        Rekening: rawRow['Rekening'] ?? '',
        Tegenrekening: rawRow['Tegenrekening'] ?? '',
        Code: rawRow['Code'] ?? '',
        'Af Bij': (rawRow['Af Bij'] ?? 'Bij') as 'Af' | 'Bij',
        'Bedrag (EUR)': rawRow['Bedrag (EUR)'] ?? '',
        Mutatiesoort: rawRow['Mutatiesoort'] ?? '',
        Mededelingen: rawRow['Mededelingen'] ?? '',
      });
      const rawDescription = rawRow['Naam / Omschrijving'] ?? '';
      const dedupHash = computeDedupHash({
        account_id: accountId,
        occurred_at: occurredAt,
        amount_cents: amountCents,
        raw_description: rawDescription,
      });

      if (seenDedupHashes.has(dedupHash)) {
        duplicateCount += 1;
        duplicates.push({
          row_index: index + 2,
          raw_data: rawRow,
          reason: 'duplicate_in_file',
        });
        return;
      }

      seenDedupHashes.add(dedupHash);
      rows.push({
        row_index: index + 2,
        raw_data: rawRow,
        external_id: null,
        occurred_at: occurredAt,
        amount_cents: amountCents,
        currency: 'EUR',
        raw_description: rawDescription,
        source: 'ing_csv',
        intent_hint: null,
        dedup_hash: dedupHash,
        merchant_name: null,
        merchant_category: null,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown ING parse error';
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
