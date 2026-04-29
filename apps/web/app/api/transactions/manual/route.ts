import { NextResponse } from 'next/server';
import { and, eq, isNull, or } from 'drizzle-orm';
import { accounts, categories, db, transactions } from '@dart/db';
import { getAuthenticatedUserIdFromCookieHeader } from '@/auth/session';
import { captureServerException } from '@/observability/server';
import { getTransactionsRuntimeState, withDatabaseRuntimeTimeout } from '@/transactions/runtime';
import { isValidIntent, type ValidIntent } from '@/transactions/review';

type Direction = 'expense' | 'income';
type ManualTransactionBody = Record<string, unknown>;
type TransactionInsert = typeof transactions.$inferInsert;

function getString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function isDirection(value: string): value is Direction {
  return value === 'expense' || value === 'income';
}

function defaultIntentForDirection(direction: Direction): ValidIntent {
  return direction === 'expense' ? 'living_expense' : 'income_other';
}

function parseAmountToPositiveCents(value: unknown): number | null {
  const raw = typeof value === 'number' && Number.isFinite(value)
    ? value.toString()
    : getString(value);
  const normalized = raw.replace(',', '.');

  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) {
    return null;
  }

  const [euros = '', cents = ''] = normalized.split('.');
  const amountCents = Number.parseInt(euros, 10) * 100
    + Number.parseInt(cents.padEnd(2, '0') || '0', 10);

  return amountCents > 0 ? amountCents : null;
}

function parseOccurredAt(value: unknown): Date | null {
  const raw = getString(value);
  if (raw.length === 0) {
    return null;
  }

  const occurredAt = new Date(raw);
  return Number.isNaN(occurredAt.getTime()) ? null : occurredAt;
}

function parseCategoryId(body: ManualTransactionBody): string | null | undefined {
  if (!('categoryId' in body) || body.categoryId === undefined) {
    return undefined;
  }

  if (body.categoryId === null) {
    return null;
  }

  const categoryId = getString(body.categoryId);
  return categoryId.length > 0 ? categoryId : null;
}

function errorResponse(error: string, status: number): NextResponse {
  return NextResponse.json({ error }, { status });
}

export async function POST(request: Request) {
  try {
    const authenticatedUserId = await getAuthenticatedUserIdFromCookieHeader(
      request.headers.get('cookie'),
    );

    if (!authenticatedUserId) {
      return errorResponse('AUTH_REQUIRED', 401);
    }

    const runtimeState = getTransactionsRuntimeState(process.env);
    if (!runtimeState.databaseConfigured) {
      return NextResponse.json(
        { error: 'DATABASE_NOT_CONFIGURED', message: runtimeState.message },
        { status: 503 },
      );
    }

    const body: unknown = await request.json();
    if (typeof body !== 'object' || body === null) {
      return errorResponse('INVALID_BODY', 400);
    }

    const payload = body as ManualTransactionBody;
    const accountId = getString(payload.accountId);
    if (accountId.length === 0) {
      return errorResponse('ACCOUNT_ID_REQUIRED', 400);
    }

    const directionValue = getString(payload.direction);
    if (!isDirection(directionValue)) {
      return errorResponse('INVALID_DIRECTION', 400);
    }

    const amountCents = parseAmountToPositiveCents(payload.amount);
    if (amountCents === null) {
      return errorResponse('INVALID_AMOUNT', 400);
    }

    const occurredAt = parseOccurredAt(payload.occurredAt ?? payload.date);
    if (!occurredAt) {
      return errorResponse('INVALID_DATE', 400);
    }

    const rawDescription = getString(payload.rawDescription);
    if (rawDescription.length === 0) {
      return errorResponse('RAW_DESCRIPTION_REQUIRED', 400);
    }

    const notes = getString(payload.notes);
    const requestedIntent = getString(payload.intent);
    if (requestedIntent.length > 0 && !isValidIntent(requestedIntent)) {
      return errorResponse('INVALID_INTENT', 400);
    }
    const intent = requestedIntent.length > 0
      ? requestedIntent
      : defaultIntentForDirection(directionValue);

    const categoryId = parseCategoryId(payload);

    const signedAmountCents = directionValue === 'expense' ? -amountCents : amountCents;
    const now = new Date();

    const createdTransaction = await withDatabaseRuntimeTimeout((async () => {
      const [account] = await db
        .select({ id: accounts.id, userId: accounts.userId })
        .from(accounts)
        .where(eq(accounts.id, accountId))
        .limit(1);

      if (!account) {
        throw new Error('ACCOUNT_NOT_FOUND');
      }

      if (account.userId !== authenticatedUserId) {
        throw new Error('ACCOUNT_ACCESS_DENIED');
      }

      if (categoryId !== undefined && categoryId !== null) {
        const [category] = await db
          .select({ id: categories.id })
          .from(categories)
          .where(
            and(
              eq(categories.id, categoryId),
              or(isNull(categories.userId), eq(categories.userId, authenticatedUserId)),
            ),
          )
          .limit(1);

        if (!category) {
          throw new Error('CATEGORY_NOT_FOUND');
        }
      }

      const values: TransactionInsert = {
        accountId,
        amount: signedAmountCents,
        categoryId: categoryId ?? null,
        currency: 'EUR',
        externalId: null,
        importBatchId: null,
        intent: intent as NonNullable<TransactionInsert['intent']>,
        notes: notes.length > 0 ? notes : null,
        occurredAt,
        rawDescription,
        reviewStatus: 'reviewed' as NonNullable<TransactionInsert['reviewStatus']>,
        source: 'manual',
        updatedAt: now,
        userId: authenticatedUserId,
      };

      const [created] = await db
        .insert(transactions)
        .values(values)
        .returning({
          accountId: transactions.accountId,
          amount: transactions.amount,
          categoryId: transactions.categoryId,
          currency: transactions.currency,
          id: transactions.id,
          intent: transactions.intent,
          occurredAt: transactions.occurredAt,
          rawDescription: transactions.rawDescription,
          reviewStatus: transactions.reviewStatus,
          source: transactions.source,
        });

      if (!created) {
        throw new Error('FAILED_TO_CREATE_TRANSACTION');
      }

      return created;
    })());

    return NextResponse.json({
      transaction: {
        accountId: createdTransaction.accountId,
        amountCents: createdTransaction.amount,
        categoryId: createdTransaction.categoryId,
        currency: createdTransaction.currency,
        id: createdTransaction.id,
        intent: createdTransaction.intent,
        occurredAt: createdTransaction.occurredAt.toISOString(),
        rawDescription: createdTransaction.rawDescription,
        reviewStatus: createdTransaction.reviewStatus,
        source: createdTransaction.source,
      },
    }, { status: 201 });
  } catch (error) {
    captureServerException(error, { context: 'api_transactions_manual' });
    const message = error instanceof Error ? error.message : 'Unknown manual transaction error';
    const status =
      message === 'ACCOUNT_NOT_FOUND' || message === 'CATEGORY_NOT_FOUND' ? 404
        : message === 'ACCOUNT_ACCESS_DENIED' ? 403
          : message === 'DATABASE_RUNTIME_TIMEOUT' ? 503
            : 500;

    return NextResponse.json({ error: message }, { status });
  }
}
