import { NextResponse } from 'next/server';
import { getAuthenticatedUserIdFromCookieHeader } from '@/auth/session';
import { createTransactionReviewRepository } from '@/transactions/repository';
import { captureServerException } from '@/observability/server';
import { isValidIntent, updateTransactionIntent, type ValidIntent } from '@/transactions/review';

function redirectToTransactions(request: Request, status: 'updated' | 'error') {
  const url = new URL('/transactions', request.url);
  url.searchParams.set('edit', status);
  return NextResponse.redirect(url, { status: 303 });
}

export async function POST(request: Request) {
  try {
    const authenticatedUserId = await getAuthenticatedUserIdFromCookieHeader(
      request.headers.get('cookie'),
    );

    if (!authenticatedUserId) {
      return NextResponse.json({ error: 'AUTH_REQUIRED' }, { status: 401 });
    }

    const formData = await request.formData();
    const transactionId = formData.get('transactionId');
    const intent = formData.get('intent');

    if (typeof transactionId !== 'string' || transactionId.trim().length === 0) {
      return NextResponse.json({ error: 'TRANSACTION_ID_REQUIRED' }, { status: 400 });
    }

    if (typeof intent !== 'string' || !isValidIntent(intent.trim())) {
      return NextResponse.json({ error: 'INVALID_INTENT' }, { status: 400 });
    }

    const validatedIntent = intent.trim();
    // isValidIntent checked above — safe cast
    await updateTransactionIntent(
      {
        authenticatedUserId,
        transactionId: transactionId.trim(),
        intent: validatedIntent as ValidIntent,
        updatedAt: new Date(),
      },
      createTransactionReviewRepository(),
    );

    return redirectToTransactions(request, 'updated');
  } catch (error) {
    captureServerException(error, {
      context: 'api_transactions_update_intent',
    });
    const message = error instanceof Error ? error.message : 'Unknown transaction update error';
    const status =
      message === 'TRANSACTION_NOT_FOUND'
        ? 404
        : message === 'TRANSACTION_ACCESS_DENIED'
        ? 403
        : 500;

    if (request.headers.get('accept')?.includes('application/json')) {
      return NextResponse.json({ error: message }, { status });
    }

    return redirectToTransactions(request, 'error');
  }
}
