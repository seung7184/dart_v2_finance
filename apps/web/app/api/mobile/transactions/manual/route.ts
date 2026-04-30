import { NextResponse } from 'next/server';
import { and, eq, isNull, or } from 'drizzle-orm';
import { accounts, categories, db, transactions } from '@dart/db';
import { getAuthenticatedUserIdFromBearerToken } from '@/auth/bearer-token';
import { captureServerException } from '@/observability/server';
import { bodyContainsUserId, parseMobileIntegerCents } from '@/transactions/mobile-manual';
import { getTransactionsRuntimeState, withDatabaseRuntimeTimeout } from '@/transactions/runtime';

type MobileManualBody = Record<string, unknown>;
type TransactionInsert = typeof transactions.$inferInsert;

function getString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function parseCategoryId(body: MobileManualBody): string | null | undefined {
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
    const authenticatedUserId = await getAuthenticatedUserIdFromBearerToken(
      request.headers.get('authorization'),
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

    const payload = body as MobileManualBody;

    // user_id must never come from the request body
    if (bodyContainsUserId(payload)) {
      return errorResponse('USER_ID_NOT_ACCEPTED', 400);
    }

    const amountCents = parseMobileIntegerCents(payload.amountCents);
    if (amountCents === null) {
      return errorResponse('INVALID_AMOUNT', 400);
    }

    const notes = getString(payload.notes);
    const categoryId = parseCategoryId(payload);

    const now = new Date();
    const occurredAt = now;

    const createdTransaction = await withDatabaseRuntimeTimeout((async () => {
      // Auto-select first active account owned by this user.
      // Quick Add does not expose account selection in the mobile UX.
      const [account] = await db
        .select({ id: accounts.id })
        .from(accounts)
        .where(
          and(
            eq(accounts.userId, authenticatedUserId),
            eq(accounts.isActive, true),
          ),
        )
        .orderBy(accounts.displayOrder, accounts.createdAt)
        .limit(1);

      if (!account) {
        throw new Error('NO_ACCOUNT_CONFIGURED');
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
        accountId: account.id,
        // Quick Add is always an expense; store as negative cents per repo convention
        amount: -amountCents,
        categoryId: categoryId ?? null,
        currency: 'EUR',
        externalId: null,
        // source and importBatchId are enforced server-side — never from client
        importBatchId: null,
        intent: 'living_expense',
        notes: notes.length > 0 ? notes : null,
        occurredAt,
        rawDescription: notes.length > 0 ? notes : 'Quick Add',
        reviewStatus: 'reviewed',
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
          importBatchId: transactions.importBatchId,
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

    return NextResponse.json(
      {
        transaction: {
          accountId: createdTransaction.accountId,
          amountCents: createdTransaction.amount,
          categoryId: createdTransaction.categoryId,
          currency: createdTransaction.currency,
          id: createdTransaction.id,
          importBatchId: createdTransaction.importBatchId,
          intent: createdTransaction.intent,
          occurredAt: createdTransaction.occurredAt.toISOString(),
          rawDescription: createdTransaction.rawDescription,
          reviewStatus: createdTransaction.reviewStatus,
          source: createdTransaction.source,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    captureServerException(error, { context: 'api_mobile_transactions_manual' });
    const message = error instanceof Error ? error.message : 'Unknown error';
    const status =
      message === 'NO_ACCOUNT_CONFIGURED' ? 422
        : message === 'CATEGORY_NOT_FOUND' ? 404
          : message === 'DATABASE_RUNTIME_TIMEOUT' ? 503
            : 500;

    return NextResponse.json({ error: message }, { status });
  }
}
