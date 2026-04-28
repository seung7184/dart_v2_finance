import { NextResponse } from 'next/server';
import { getAuthenticatedUserIdFromCookieHeader } from '@/auth/session';
import { createTransactionReviewRepository } from '@/transactions/repository';
import { confirmAllPendingReviews } from '@/transactions/review';
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

    await confirmAllPendingReviews(
      {
        authenticatedUserId,
        reviewedAt: new Date(),
      },
      createTransactionReviewRepository(),
    );

    return redirectToTransactions(request, 'confirmed');
  } catch (error) {
    captureServerException(error, { context: 'api_transactions_confirm_all' });
    return redirectToTransactions(request, 'error');
  }
}
