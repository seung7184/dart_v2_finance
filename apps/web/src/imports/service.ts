import { createHash } from 'node:crypto';
import {
  parseINGCsv,
  parseT212Csv,
  type ParseResult,
  type ParsedRow,
} from '@dart/csv-parsers';

export type SupportedBank = 'ING' | 'T212';

export type ImportPreviewRow = {
  date: string;
  description: string;
  amountCents: number;
  externalId: string;
  intentHint: string | null;
  reviewStatus: 'pending' | 'needs_attention';
};

export type ImportSkippedRow = {
  reason: string;
  rowIndex: number;
  status: 'duplicate' | 'error';
};

export type ImportPreview = {
  duplicateCount: number;
  errorCount: number;
  previewRows: ImportPreviewRow[];
  rowCount: number;
  skippedRows: ImportSkippedRow[];
};

export type ImportExecutionResult = {
  alreadyImported: boolean;
  batchId: string;
  duplicateCount: number;
  errorCount: number;
  importedCount: number;
  rowCount: number;
  skippedRows: ImportSkippedRow[];
};

export type ImportAccount = {
  id: string;
  userId: string;
};

export type ImportBatchRecord = {
  id: string;
  duplicateCount: number | null;
  importedCount: number | null;
  rowCount: number | null;
};

export type ImportRepository = {
  completeImportBatch(input: {
    batchId: string;
    duplicateCount: number;
    importedCount: number;
    importCompletedAt: Date;
    reviewStatus: 'completed';
    rowCount: number;
  }): Promise<void>;
  createImportBatch(input: {
    accountId: string;
    fileHash: string;
    importStartedAt: Date;
    originalFilename: string;
    reviewStatus: 'pending';
    rowCount: number;
    source: 'ing_csv' | 't212_csv';
    userId: string;
  }): Promise<{ id: string }>;
  createImportRow(input: {
    importBatchId: string;
    parseError: string | null;
    parseStatus: 'duplicate' | 'error' | 'success';
    rawData: Record<string, string>;
    rowIndex: number;
    transactionId: string | null;
    userId: string;
  }): Promise<void>;
  createTransaction(input: {
    accountId: string;
    amount: number;
    currency: string;
    externalId: string | null;
    importBatchId: string;
    intent: string;
    occurredAt: Date;
    rawDescription: string;
    reviewStatus: 'pending' | 'needs_attention';
    source: 'ing_csv' | 't212_csv';
    userId: string;
  }): Promise<{ id: string }>;
  findAccount(accountId: string): Promise<ImportAccount | null>;
  findExistingBatchByFileHash(userId: string, fileHash: string): Promise<ImportBatchRecord | null>;
  findTransactionByExternalId(accountId: string, externalId: string): Promise<{ id: string } | null>;
  findTransactionByFallback(input: {
    accountId: string;
    amount: number;
    occurredAt: Date;
    rawDescription: string;
  }): Promise<{ id: string } | null>;
  touchAccountLastImport(accountId: string, importedAt: Date): Promise<void>;
};

const VALID_INTENTS = new Set([
  'living_expense',
  'recurring_bill',
  'income_salary',
  'income_dividend',
  'income_refund',
  'income_other',
  'transfer',
  'reimbursement_out',
  'reimbursement_in',
  'investment_contribution',
  'investment_buy',
  'investment_sell',
  'fee',
  'tax',
  'adjustment',
  'unclassified',
]);

export function isSupportedBank(value: string): value is SupportedBank {
  return value === 'ING' || value === 'T212';
}

function parseImport(bank: SupportedBank, csvContent: string, accountId: string): ParseResult {
  return bank === 'ING' ? parseINGCsv(csvContent, accountId) : parseT212Csv(csvContent, accountId);
}

function getSource(bank: SupportedBank): 'ing_csv' | 't212_csv' {
  return bank === 'ING' ? 'ing_csv' : 't212_csv';
}

function normalizeIntent(intentHint: string | null): string {
  if (intentHint && VALID_INTENTS.has(intentHint)) {
    return intentHint;
  }

  return 'unclassified';
}

function getInitialReviewStatus(intent: string): 'pending' | 'needs_attention' {
  return intent === 'unclassified' ? 'needs_attention' : 'pending';
}

function hashFileContent(csvContent: string): string {
  return createHash('sha256').update(csvContent).digest('hex');
}

function totalRowCount(parseResult: ParseResult): number {
  return parseResult.rows.length + parseResult.duplicates.length + parseResult.errors.length;
}

function toPreviewRow(row: ParsedRow): ImportPreviewRow {
  const intent = normalizeIntent(row.intent_hint);
  return {
    date: row.occurred_at.toISOString(),
    description: row.raw_description,
    amountCents: row.amount_cents,
    externalId: row.external_id ?? '',
    intentHint: row.intent_hint,
    reviewStatus: getInitialReviewStatus(intent),
  };
}

function skippedRowsFromParseResult(parseResult: ParseResult): ImportSkippedRow[] {
  return [
    ...parseResult.duplicates.map((duplicate) => ({
      reason: duplicate.reason,
      rowIndex: duplicate.row_index,
      status: 'duplicate' as const,
    })),
    ...parseResult.errors.map((error) => ({
      reason: error.error,
      rowIndex: error.row_index,
      status: 'error' as const,
    })),
  ];
}

export function getImportPreview(input: {
  accountId: string;
  bank: SupportedBank;
  csvContent: string;
}): ImportPreview {
  const parseResult = parseImport(input.bank, input.csvContent, input.accountId);

  return {
    duplicateCount: parseResult.duplicate_count,
    errorCount: parseResult.errors.length,
    previewRows: parseResult.rows.slice(0, 5).map(toPreviewRow),
    rowCount: totalRowCount(parseResult),
    skippedRows: skippedRowsFromParseResult(parseResult),
  };
}

async function assertAccountAccess(input: {
  accountId: string;
  authenticatedUserId: string;
}, repository: ImportRepository): Promise<ImportAccount> {
  const account = await repository.findAccount(input.accountId);
  if (!account) {
    throw new Error('ACCOUNT_NOT_FOUND');
  }

  if (account.userId !== input.authenticatedUserId) {
    throw new Error('ACCOUNT_ACCESS_DENIED');
  }

  return account;
}

export async function getImportPreviewForUser(
  input: {
    accountId: string;
    authenticatedUserId: string;
    bank: SupportedBank;
    csvContent: string;
  },
  repository: ImportRepository,
): Promise<ImportPreview> {
  await assertAccountAccess(
    {
      accountId: input.accountId,
      authenticatedUserId: input.authenticatedUserId,
    },
    repository,
  );

  return getImportPreview(input);
}

export async function executeImport(
  input: {
    accountId: string;
    authenticatedUserId: string;
    bank: SupportedBank;
    csvContent: string;
    originalFilename: string;
  },
  repository: ImportRepository,
): Promise<ImportExecutionResult> {
  const account = await assertAccountAccess(
    {
      accountId: input.accountId,
      authenticatedUserId: input.authenticatedUserId,
    },
    repository,
  );

  const parseResult = parseImport(input.bank, input.csvContent, input.accountId);
  const rowCount = totalRowCount(parseResult);
  const fileHash = hashFileContent(input.csvContent);
  const existingBatch = await repository.findExistingBatchByFileHash(account.userId, fileHash);

  if (existingBatch) {
    return {
      alreadyImported: true,
      batchId: existingBatch.id,
      duplicateCount: existingBatch.duplicateCount ?? 0,
      errorCount: 0,
      importedCount: existingBatch.importedCount ?? 0,
      rowCount: existingBatch.rowCount ?? rowCount,
      skippedRows: [],
    };
  }

  const startedAt = new Date();
  const createdBatch = await repository.createImportBatch({
    accountId: input.accountId,
    fileHash,
    importStartedAt: startedAt,
    originalFilename: input.originalFilename,
    reviewStatus: 'pending',
    rowCount,
    source: getSource(input.bank),
    userId: account.userId,
  });

  let importedCount = 0;
  let duplicateCount = parseResult.duplicate_count;
  const skippedRows = skippedRowsFromParseResult(parseResult);

  for (const duplicate of parseResult.duplicates) {
    await repository.createImportRow({
      importBatchId: createdBatch.id,
      parseError: duplicate.reason,
      parseStatus: 'duplicate',
      rawData: duplicate.raw_data,
      rowIndex: duplicate.row_index,
      transactionId: null,
      userId: account.userId,
    });
  }

  for (const error of parseResult.errors) {
    await repository.createImportRow({
      importBatchId: createdBatch.id,
      parseError: error.error,
      parseStatus: 'error',
      rawData: error.raw_data ?? {},
      rowIndex: error.row_index,
      transactionId: null,
      userId: account.userId,
    });
  }

  for (const row of parseResult.rows) {
    const existingTransaction = row.external_id
      ? await repository.findTransactionByExternalId(input.accountId, row.external_id)
      : await repository.findTransactionByFallback({
          accountId: input.accountId,
          amount: row.amount_cents,
          occurredAt: row.occurred_at,
          rawDescription: row.raw_description,
        });

    if (existingTransaction) {
      duplicateCount += 1;
      await repository.createImportRow({
        importBatchId: createdBatch.id,
        parseError: 'duplicate_in_database',
        parseStatus: 'duplicate',
        rawData: row.raw_data,
        rowIndex: row.row_index,
        transactionId: existingTransaction.id,
        userId: account.userId,
      });
      skippedRows.push({
        reason: 'duplicate_in_database',
        rowIndex: row.row_index,
        status: 'duplicate',
      });
      continue;
    }

    const intent = normalizeIntent(row.intent_hint);
    const createdTransaction = await repository.createTransaction({
      accountId: input.accountId,
      amount: row.amount_cents,
      currency: row.currency,
      externalId: row.external_id,
      importBatchId: createdBatch.id,
      intent,
      occurredAt: row.occurred_at,
      rawDescription: row.raw_description,
      reviewStatus: getInitialReviewStatus(intent),
      source: row.source,
      userId: account.userId,
    });

    importedCount += 1;
    await repository.createImportRow({
      importBatchId: createdBatch.id,
      parseError: null,
      parseStatus: 'success',
      rawData: row.raw_data,
      rowIndex: row.row_index,
      transactionId: createdTransaction.id,
      userId: account.userId,
    });
  }

  const completedAt = new Date();
  await repository.completeImportBatch({
    batchId: createdBatch.id,
    duplicateCount,
    importedCount,
    importCompletedAt: completedAt,
    reviewStatus: 'completed',
    rowCount,
  });

  await repository.touchAccountLastImport(input.accountId, completedAt);

  return {
    alreadyImported: false,
    batchId: createdBatch.id,
    duplicateCount,
    errorCount: parseResult.errors.length,
    importedCount,
    rowCount,
    skippedRows,
  };
}
