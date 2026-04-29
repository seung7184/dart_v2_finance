import { describe, expect, it } from 'vitest';
import { suggestCsvManualMatches, type ImportedMatchInput, type ManualMatchCandidate } from './matching';

const baseManual: ManualMatchCandidate = {
  accountId: 'account-checking',
  accountType: 'checking',
  amountCents: -1299,
  id: 'manual-1',
  merchantName: null,
  occurredAt: new Date('2026-04-10T12:00:00.000Z'),
  rawDescription: 'Albert Heijn groceries',
  source: 'manual',
  userId: 'user-1',
};

const baseImported: ImportedMatchInput = {
  accountId: 'account-checking',
  amountCents: -1299,
  importedTransactionId: 'imported-1',
  merchantName: null,
  occurredAt: new Date('2026-04-10T08:00:00.000Z'),
  rawDescription: 'ALBERT HEIJN AMSTERDAM',
  userId: 'user-1',
};

function manual(overrides: Partial<ManualMatchCandidate> = {}): ManualMatchCandidate {
  return { ...baseManual, ...overrides };
}

function imported(overrides: Partial<ImportedMatchInput> = {}): ImportedMatchInput {
  return { ...baseImported, ...overrides };
}

describe('suggestCsvManualMatches', () => {
  it('suggests high confidence for same date, amount, and similar description', () => {
    const [suggestion] = suggestCsvManualMatches({
      importedTransactions: [imported()],
      manualCandidates: [manual()],
    });

    expect(suggestion).toMatchObject({
      confidence: 95,
      importedTransactionId: 'imported-1',
      manualTransactionId: 'manual-1',
    });
    expect(suggestion?.reason).toContain('exact date');
  });

  it('suggests high confidence for amount, date within three days, and merchant token overlap', () => {
    const [suggestion] = suggestCsvManualMatches({
      importedTransactions: [
        imported({
          merchantName: 'Albert Heijn',
          occurredAt: new Date('2026-04-13T08:00:00.000Z'),
          rawDescription: 'Card payment Albert Heijn',
        }),
      ],
      manualCandidates: [
        manual({
          merchantName: 'AH Supermarkt',
          rawDescription: 'Albert groceries',
        }),
      ],
    });

    expect(suggestion).toMatchObject({
      confidence: 85,
      manualTransactionId: 'manual-1',
    });
    expect(suggestion?.reason).toContain('3 day');
  });

  it('does not match when amounts differ', () => {
    const suggestions = suggestCsvManualMatches({
      importedTransactions: [imported({ amountCents: -1300 })],
      manualCandidates: [manual()],
    });

    expect(suggestions).toEqual([]);
  });

  it('does not match outside the three day date window', () => {
    const suggestions = suggestCsvManualMatches({
      importedTransactions: [imported({ occurredAt: new Date('2026-04-14T08:00:00.000Z') })],
      manualCandidates: [manual()],
    });

    expect(suggestions).toEqual([]);
  });

  it('filters unrelated descriptions out', () => {
    const suggestions = suggestCsvManualMatches({
      importedTransactions: [imported({ rawDescription: 'NS TRAIN TICKET' })],
      manualCandidates: [manual({ rawDescription: 'Albert Heijn groceries' })],
    });

    expect(suggestions).toEqual([]);
  });

  it('allows manual_external manual accounts to match imported accounts', () => {
    const [suggestion] = suggestCsvManualMatches({
      importedTransactions: [imported({ accountId: 'account-checking' })],
      manualCandidates: [
        manual({
          accountId: 'manual-wallet',
          accountType: 'manual_external',
        }),
      ],
    });

    expect(suggestion?.manualTransactionId).toBe('manual-1');
  });

  it('never matches a different user', () => {
    const suggestions = suggestCsvManualMatches({
      importedTransactions: [imported({ userId: 'user-2' })],
      manualCandidates: [manual()],
    });

    expect(suggestions).toEqual([]);
  });

  it('never matches candidates whose source is not manual', () => {
    const suggestions = suggestCsvManualMatches({
      importedTransactions: [imported()],
      manualCandidates: [manual({ source: 'ing_csv' })],
    });

    expect(suggestions).toEqual([]);
  });

  it('only returns suggested match data and never creates an auto-confirmed status', () => {
    const [suggestion] = suggestCsvManualMatches({
      importedTransactions: [imported({ importedRowKey: 'row-1', importedTransactionId: undefined })],
      manualCandidates: [manual()],
    });

    expect(suggestion).toEqual({
      confidence: 95,
      importedRowKey: 'row-1',
      manualTransactionId: 'manual-1',
      reason: 'exact amount, exact date, and similar description',
    });
    expect('status' in (suggestion ?? {})).toBe(false);
  });
});
