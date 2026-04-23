import { describe, expect, it } from 'vitest';
import {
  executeImport,
  getImportPreviewForUser,
  type ImportBatchRecord,
  type ImportRepository,
} from './service';

class FakeImportRepository implements ImportRepository {
  public readonly batches: Array<Record<string, unknown>> = [];
  public readonly importRows: Array<Record<string, unknown>> = [];
  public readonly transactions: Array<Record<string, unknown>> = [];
  private readonly accounts = new Map<string, { id: string; userId: string }>();
  private readonly existingBatches = new Map<string, ImportBatchRecord>();

  addAccount(id: string, userId: string) {
    this.accounts.set(id, { id, userId });
  }

  addExistingBatch(userId: string, fileHash: string, batch: ImportBatchRecord) {
    this.existingBatches.set(`${userId}:${fileHash}`, batch);
  }

  addExistingFallbackTransaction(input: {
    accountId: string;
    amount: number;
    occurredAt: Date;
    rawDescription: string;
  }) {
    this.transactions.push({
      id: `existing-fallback-${this.transactions.length + 1}`,
      ...input,
    });
  }

  addExistingExternalTransaction(accountId: string, externalId: string) {
    this.transactions.push({
      accountId,
      externalId,
      id: `existing-external-${this.transactions.length + 1}`,
    });
  }

  async completeImportBatch(input: {
    batchId: string;
    duplicateCount: number;
    importedCount: number;
    importCompletedAt: Date;
    reviewStatus: 'completed';
    rowCount: number;
  }) {
    const batch = this.batches.find((entry) => entry.id === input.batchId);
    Object.assign(batch ?? {}, input);
  }

  async createImportBatch(input: {
    accountId: string;
    fileHash: string;
    importStartedAt: Date;
    originalFilename: string;
    reviewStatus: 'pending';
    rowCount: number;
    source: 'ing_csv' | 't212_csv';
    userId: string;
  }) {
    const batch = {
      ...input,
      id: `batch-${this.batches.length + 1}`,
    };
    this.batches.push(batch);
    return { id: batch.id };
  }

  async createImportRow(input: {
    importBatchId: string;
    parseError: string | null;
    parseStatus: 'duplicate' | 'error' | 'success';
    rawData: Record<string, string>;
    rowIndex: number;
    transactionId: string | null;
    userId: string;
  }) {
    this.importRows.push(input);
  }

  async createTransaction(input: {
    accountId: string;
    amount: number;
    currency: string;
    externalId: string | null;
    importBatchId: string;
    intent: string;
    occurredAt: Date;
    rawDescription: string;
    reviewStatus: 'pending';
    source: 'ing_csv' | 't212_csv';
    userId: string;
  }) {
    const transaction = {
      id: `transaction-${this.transactions.length + 1}`,
      ...input,
    };
    this.transactions.push(transaction);
    return { id: transaction.id };
  }

  async findAccount(accountId: string) {
    return this.accounts.get(accountId) ?? null;
  }

  async findExistingBatchByFileHash(userId: string, fileHash: string) {
    return this.existingBatches.get(`${userId}:${fileHash}`) ?? null;
  }

  async findTransactionByExternalId(accountId: string, externalId: string) {
    return (
      this.transactions.find(
        (transaction) =>
          transaction.accountId === accountId && transaction.externalId === externalId,
      ) ?? null
    );
  }

  async findTransactionByFallback(input: {
    accountId: string;
    amount: number;
    occurredAt: Date;
    rawDescription: string;
  }) {
    return (
      this.transactions.find(
        (transaction) =>
          transaction.accountId === input.accountId &&
          transaction.amount === input.amount &&
          transaction.rawDescription === input.rawDescription &&
          transaction.occurredAt instanceof Date &&
          transaction.occurredAt.toISOString() === input.occurredAt.toISOString(),
      ) ?? null
    );
  }

  async touchAccountLastImport() {
    return;
  }
}

describe('executeImport', () => {
  it('persists import batches, import rows, and fallback dedup for ING imports', async () => {
    const repository = new FakeImportRepository();
    repository.addAccount('account-ing', 'user-1');
    repository.addExistingFallbackTransaction({
      accountId: 'account-ing',
      amount: -1234,
      occurredAt: new Date('2026-04-01T00:00:00.000Z'),
      rawDescription: 'Albert Heijn',
    });

    const csvContent = [
      'Datum;Naam / Omschrijving;Rekening;Tegenrekening;Code;Af Bij;Bedrag (EUR);Mutatiesoort;Mededelingen',
      '01-04-2026;Albert Heijn;;;;Af;12,34;;',
      '02-04-2026;Coffee Company;;;;Af;3,50;;',
      '02-04-2026;Coffee Company;;;;Af;3,50;;',
      'bad-date;Broken Row;;;;Af;5,00;;',
    ].join('\n');

    const result = await executeImport(
      {
        accountId: 'account-ing',
        authenticatedUserId: 'user-1',
        bank: 'ING',
        csvContent,
        originalFilename: 'ing.csv',
      },
      repository,
    );

    expect(result.alreadyImported).toBe(false);
    expect(result.importedCount).toBe(1);
    expect(result.duplicateCount).toBe(2);
    expect(result.errorCount).toBe(1);
    expect(result.rowCount).toBe(4);
    expect(repository.batches).toHaveLength(1);
    expect(repository.importRows.map((row) => row.parseStatus)).toEqual([
      'duplicate',
      'error',
      'duplicate',
      'success',
    ]);
    expect(repository.transactions.at(-1)).toMatchObject({
      accountId: 'account-ing',
      amount: -350,
      currency: 'EUR',
      intent: 'unclassified',
      rawDescription: 'Coffee Company',
      source: 'ing_csv',
    });
  });

  it('deduplicates Trading 212 imports by external ID and preserves cents', async () => {
    const repository = new FakeImportRepository();
    repository.addAccount('account-t212', 'user-2');
    repository.addExistingExternalTransaction('account-t212', 'existing-id');

    const csvContent = [
      'Action,Time,Total,Currency,ID,Name,Ticker',
      'Deposit,2026-04-03T12:00:00Z,125.67,EUR,existing-id,Trading 212,',
      'Deposit,2026-04-04T12:00:00Z,125.67,EUR,new-id,Trading 212,',
    ].join('\n');

    const result = await executeImport(
      {
        accountId: 'account-t212',
        authenticatedUserId: 'user-2',
        bank: 'T212',
        csvContent,
        originalFilename: 't212.csv',
      },
      repository,
    );

    expect(result.importedCount).toBe(1);
    expect(result.duplicateCount).toBe(1);
    expect(repository.transactions.at(-1)).toMatchObject({
      accountId: 'account-t212',
      amount: 12567,
      externalId: 'new-id',
      intent: 'investment_contribution',
      source: 't212_csv',
    });
  });

  it('accepts Trading 212 exports that label currency as Currency (Total)', async () => {
    const repository = new FakeImportRepository();
    repository.addAccount('account-t212', 'user-2');

    const csvContent = [
      'Action,Time,Notes,ID,Total,Currency (Total),Merchant name,Merchant category',
      'Card debit,2026-04-03 12:00:00,,new-id,-17.04,EUR,DIRK VDBROEK FIL4103,RETAIL_STORES',
    ].join('\n');

    const preview = await getImportPreviewForUser(
      {
        accountId: 'account-t212',
        authenticatedUserId: 'user-2',
        bank: 'T212',
        csvContent,
      },
      repository,
    );

    expect(preview.rowCount).toBe(1);
    expect(preview.errorCount).toBe(0);
    expect(preview.previewRows[0]).toMatchObject({
      amountCents: -1704,
      description: 'Card debit',
      externalId: 'new-id',
    });
  });

  it('rejects imports when the authenticated user does not own the account', async () => {
    const repository = new FakeImportRepository();
    repository.addAccount('account-ing', 'user-1');

    const csvContent = [
      'Datum;Naam / Omschrijving;Rekening;Tegenrekening;Code;Af Bij;Bedrag (EUR);Mutatiesoort;Mededelingen',
      '02-04-2026;Coffee Company;;;;Af;3,50;;',
    ].join('\n');

    await expect(
      executeImport(
        {
          accountId: 'account-ing',
          authenticatedUserId: 'user-2',
          bank: 'ING',
          csvContent,
          originalFilename: 'ing.csv',
        },
        repository,
      ),
    ).rejects.toThrow('ACCOUNT_ACCESS_DENIED');
  });

  it('rejects previews when the authenticated user does not own the account', async () => {
    const repository = new FakeImportRepository();
    repository.addAccount('account-ing', 'user-1');

    const csvContent = [
      'Datum;Naam / Omschrijving;Rekening;Tegenrekening;Code;Af Bij;Bedrag (EUR);Mutatiesoort;Mededelingen',
      '02-04-2026;Coffee Company;;;;Af;3,50;;',
    ].join('\n');

    await expect(
      getImportPreviewForUser(
        {
          accountId: 'account-ing',
          authenticatedUserId: 'user-2',
          bank: 'ING',
          csvContent,
        },
        repository,
      ),
    ).rejects.toThrow('ACCOUNT_ACCESS_DENIED');
  });
});
