export type MatchAccountType =
  | 'checking'
  | 'savings'
  | 'credit_card'
  | 'brokerage'
  | 'pension'
  | 'cash'
  | 'manual_external';

export type MatchSource = 'ing_csv' | 't212_csv' | 'manual';

export type ManualMatchCandidate = {
  accountId: string;
  accountType: MatchAccountType;
  amountCents: number;
  id: string;
  merchantName: string | null;
  occurredAt: Date;
  rawDescription: string;
  source: MatchSource;
  userId: string;
};

export type ImportedMatchInput = {
  accountId: string;
  amountCents: number;
  importedRowKey?: string;
  importedTransactionId?: string;
  merchantName: string | null;
  occurredAt: Date;
  rawDescription: string;
  userId: string;
};

export type MatchSuggestion = {
  confidence: number;
  importedRowKey?: string;
  importedTransactionId?: string;
  manualTransactionId: string;
  reason: string;
};

export type SuggestCsvManualMatchesInput = {
  importedTransactions: ImportedMatchInput[];
  manualCandidates: ManualMatchCandidate[];
};

const DAY_MS = 24 * 60 * 60 * 1_000;
const MINIMUM_CONFIDENCE = 70;

const STOP_TOKENS = new Set([
  'a',
  'and',
  'at',
  'card',
  'de',
  'het',
  'in',
  'payment',
  'the',
  'to',
  'transaction',
]);

function utcDay(value: Date): number {
  return Math.floor(Date.UTC(
    value.getUTCFullYear(),
    value.getUTCMonth(),
    value.getUTCDate(),
  ) / DAY_MS);
}

function daysBetween(left: Date, right: Date): number {
  return Math.abs(utcDay(left) - utcDay(right));
}

function normalizeTokens(...values: Array<string | null>): Set<string> {
  const normalized = values
    .filter((value): value is string => typeof value === 'string')
    .join(' ')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

  if (normalized.length === 0) {
    return new Set();
  }

  return new Set(
    normalized
      .split(/\s+/)
      .filter((token) => token.length >= 2 && !STOP_TOKENS.has(token)),
  );
}

function countOverlap(left: Set<string>, right: Set<string>): number {
  let overlap = 0;
  for (const token of left) {
    if (right.has(token)) {
      overlap += 1;
    }
  }
  return overlap;
}

function getConfidence(dateDistanceDays: number, overlap: number): number {
  if (overlap === 0) {
    return 0;
  }

  if (dateDistanceDays === 0 && overlap >= 2) {
    return 95;
  }

  if (dateDistanceDays <= 3 && overlap >= 1) {
    return 85;
  }

  return 0;
}

function getReason(dateDistanceDays: number, overlap: number): string {
  const dateReason = dateDistanceDays === 0 ? 'exact date' : 'within 3 day date window';
  const similarityReason = overlap >= 2 ? 'similar description' : 'merchant token overlap';
  return `exact amount, ${dateReason}, and ${similarityReason}`;
}

function canCompare(imported: ImportedMatchInput, manual: ManualMatchCandidate): boolean {
  if (imported.userId !== manual.userId) {
    return false;
  }

  if (manual.source !== 'manual') {
    return false;
  }

  if (imported.amountCents !== manual.amountCents) {
    return false;
  }

  if (daysBetween(imported.occurredAt, manual.occurredAt) > 3) {
    return false;
  }

  return imported.accountId === manual.accountId || manual.accountType === 'manual_external';
}

export function suggestCsvManualMatches(
  input: SuggestCsvManualMatchesInput,
): MatchSuggestion[] {
  const suggestions: MatchSuggestion[] = [];

  for (const imported of input.importedTransactions) {
    const importedTokens = normalizeTokens(imported.rawDescription, imported.merchantName);

    for (const manual of input.manualCandidates) {
      if (!canCompare(imported, manual)) {
        continue;
      }

      const manualTokens = normalizeTokens(manual.rawDescription, manual.merchantName);
      const overlap = countOverlap(importedTokens, manualTokens);
      const dateDistanceDays = daysBetween(imported.occurredAt, manual.occurredAt);
      const confidence = getConfidence(dateDistanceDays, overlap);

      if (confidence < MINIMUM_CONFIDENCE) {
        continue;
      }

      const suggestion: MatchSuggestion = {
        confidence,
        manualTransactionId: manual.id,
        reason: getReason(dateDistanceDays, overlap),
      };

      if (imported.importedTransactionId) {
        suggestion.importedTransactionId = imported.importedTransactionId;
      }

      if (imported.importedRowKey) {
        suggestion.importedRowKey = imported.importedRowKey;
      }

      suggestions.push(suggestion);
    }
  }

  return suggestions.sort((left, right) => right.confidence - left.confidence);
}
