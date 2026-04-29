import { NextResponse } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { db, transactionMatches } from '@dart/db';
import { getAuthenticatedUserIdFromCookieHeader } from '@/auth/session';
import { captureServerException } from '@/observability/server';
import { withDatabaseRuntimeTimeout } from '@/transactions/runtime';

function getMatchId(body: unknown): string {
  if (typeof body !== 'object' || body === null) {
    return '';
  }

  const matchId = (body as Record<string, unknown>).matchId;
  return typeof matchId === 'string' ? matchId.trim() : '';
}

export async function POST(request: Request) {
  try {
    const authenticatedUserId = await getAuthenticatedUserIdFromCookieHeader(
      request.headers.get('cookie'),
    );

    if (!authenticatedUserId) {
      return NextResponse.json({ error: 'AUTH_REQUIRED' }, { status: 401 });
    }

    const matchId = getMatchId(await request.json());
    if (matchId.length === 0) {
      return NextResponse.json({ error: 'MATCH_ID_REQUIRED' }, { status: 400 });
    }

    const [updated] = await withDatabaseRuntimeTimeout(
      db
        .update(transactionMatches)
        .set({
          matchStatus: 'rejected',
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(transactionMatches.id, matchId),
            eq(transactionMatches.userId, authenticatedUserId),
          ),
        )
        .returning({ id: transactionMatches.id, matchStatus: transactionMatches.matchStatus }),
    );

    if (!updated) {
      return NextResponse.json({ error: 'MATCH_NOT_FOUND' }, { status: 404 });
    }

    return NextResponse.json({ matchId: updated.id, status: updated.matchStatus });
  } catch (error) {
    captureServerException(error, { context: 'api_transactions_matches_reject' });
    const message = error instanceof Error ? error.message : 'Unknown match reject error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
