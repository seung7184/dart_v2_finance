export interface ParsedRow {
  external_id: string | null;
  occurred_at: Date;
  amount_cents: number;
  currency: string;
  raw_description: string;
  source: 'ing_csv' | 't212_csv';
  intent_hint: string | null;
  dedup_hash: string;
}

export interface ParseResult {
  rows: ParsedRow[];
  errors: Array<{ row_index: number; error: string }>;
  duplicate_count: number;
}
