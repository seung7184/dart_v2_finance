export interface ParsedRow {
  row_index: number;
  raw_data: Record<string, string>;
  external_id: string | null;
  occurred_at: Date;
  amount_cents: number;
  currency: string;
  raw_description: string;
  source: 'ing_csv' | 't212_csv';
  intent_hint: string | null;
  dedup_hash: string;
  merchant_name: string | null;
  merchant_category: string | null;
}

export interface DuplicateRow {
  row_index: number;
  raw_data: Record<string, string>;
  reason: 'duplicate_in_file';
}

export interface ParseError {
  row_index: number;
  error: string;
  raw_data: Record<string, string> | null;
}

export interface ParseResult {
  rows: ParsedRow[];
  duplicates: DuplicateRow[];
  errors: ParseError[];
  duplicate_count: number;
}
