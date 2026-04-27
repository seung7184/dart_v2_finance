import { NextResponse } from 'next/server';
import { getAuthenticatedUserIdFromCookieHeader } from '@/auth/session';
import { createTransactionReviewRepository } from '@/transactions/repository';
import { confirmTransactionReview } from '@/transactions/review';
import { captureServerException } from '@/observability/server';

function redirectToTransactions(request: Request, status: 'confirmed' | 'error') {
  const url = new URL('/transactions', request.url);
  url.searchParams.set('review', status);
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

    if (typeof transactionId !== 'string' || transactionId.trim().length === 0) {
      return NextResponse.json({ error: 'TRANSACTION_ID_REQUIRED' }, { status: 400 });
    }

    await confirmTransactionReview(
      {
        authenticatedUserId,
        reviewedAt: new Date(),
        transactionId: transactionId.trim(),
      },
      createTransactionReviewRepository(),
    );

    return redirectToTransactions(request, 'confirmed');
  } catch (error) {
    captureServerException(error, {
      context: 'api_transactions_confirm',
    });
    const message = error instanceof Error ? error.message : 'Unknown transaction review error';
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
