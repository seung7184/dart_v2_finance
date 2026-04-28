import { NextResponse } from 'next/server';
import { getAuthenticatedUserIdFromCookieHeader } from '@/auth/session';
import { createTransactionReviewRepository } from '@/transactions/repository';
import { bulkUpdateTransactions, isValidIntent, type ValidIntent } from '@/transactions/review';
import { captureServerException } from '@/observability/server';

export async function POST(request: Request) {
  try {
    const authenticatedUserId = await getAuthenticatedUserIdFromCookieHeader(
      request.headers.get('cookie'),
    );

    if (!authenticatedUserId) {
      return NextResponse.json({ error: 'AUTH_REQUIRED' }, { status: 401 });
    }

    const body: unknown = await request.json();

    if (typeof body !== 'object' || body === null) {
      return NextResponse.json({ error: 'INVALID_BODY' }, { status: 400 });
    }

    const {
      transactionIds,
      intent,
      categoryId,
      reviewStatus,
    } = body as Record<string, unknown>;

    if (!Array.isArray(transactionIds) || transactionIds.length === 0) {
      return NextResponse.json({ error: 'TRANSACTION_IDS_REQUIRED' }, { status: 400 });
    }

    const ids = transactionIds.filter((id): id is string => typeof id === 'string' && id.trim().length > 0);

    if (ids.length === 0) {
      return NextResponse.json({ error: 'TRANSACTION_IDS_REQUIRED' }, { status: 400 });
    }

    // Validate optional intent
    let validatedIntent: ValidIntent | undefined;
    if (intent !== undefined) {
      if (typeof intent !== 'string' || !isValidIntent(intent.trim())) {
        return NextResponse.json({ error: 'INVALID_INTENT' }, { status: 400 });
      }
      validatedIntent = intent.trim() as ValidIntent;
    }

    // Validate optional categoryId (must be string UUID or null)
    let validatedCategoryId: string | null | undefined;
    if ('categoryId' in (body as object)) {
      if (categoryId === null || categoryId === undefined) {
        validatedCategoryId = null;
      } else if (typeof categoryId === 'string' && categoryId.trim().length > 0) {
        validatedCategoryId = categoryId.trim();
      } else {
        return NextResponse.json({ error: 'INVALID_CATEGORY_ID' }, { status: 400 });
      }
    }

    // Validate optional reviewStatus
    let validatedReviewStatus: 'reviewed' | undefined;
    if (reviewStatus !== undefined) {
      if (reviewStatus !== 'reviewed') {
        return NextResponse.json({ error: 'INVALID_REVIEW_STATUS' }, { status: 400 });
      }
      validatedReviewStatus = 'reviewed';
    }

    // Build the input object without undefined optional fields (exactOptionalPropertyTypes)
    const updateInput: Parameters<typeof bulkUpdateTransactions>[0] = {
      authenticatedUserId,
      transactionIds: ids,
      updatedAt: new Date(),
    };
    if (validatedIntent !== undefined) updateInput.intent = validatedIntent;
    if (validatedCategoryId !== undefined) updateInput.categoryId = validatedCategoryId;
    if (validatedReviewStatus !== undefined) updateInput.reviewStatus = validatedReviewStatus;

    const result = await bulkUpdateTransactions(updateInput, createTransactionReviewRepository());

    return NextResponse.json(result);
  } catch (error) {
    captureServerException(error, { context: 'api_transactions_bulk_update' });
    const message = error instanceof Error ? error.message : 'Unknown bulk update error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
