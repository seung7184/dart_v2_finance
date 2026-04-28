import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { db, users } from '@dart/db';
import { getAuthenticatedUserIdFromRequestCookies } from '@/auth/session';
import { getTransactionsRuntimeState, withDatabaseRuntimeTimeout } from '@/transactions/runtime';

export async function GET() {
  const userId = await getAuthenticatedUserIdFromRequestCookies();

  if (!userId) {
    return NextResponse.json({ onboardingCompleted: false });
  }

  const runtimeState = getTransactionsRuntimeState(process.env);
  if (!runtimeState.databaseConfigured) {
    return NextResponse.json({ onboardingCompleted: false });
  }

  let rows: Array<{ onboardingCompleted: boolean | null }> = [];

  try {
    rows = await withDatabaseRuntimeTimeout(
      db
        .select({ onboardingCompleted: users.onboardingCompleted })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1),
    );
  } catch {
    return NextResponse.json({ onboardingCompleted: false });
  }

  const onboardingCompleted = rows[0]?.onboardingCompleted === true;

  return NextResponse.json({ onboardingCompleted });
}
