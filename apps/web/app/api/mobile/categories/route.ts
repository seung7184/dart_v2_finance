import { NextResponse } from 'next/server';
import { and, eq, isNull, or } from 'drizzle-orm';
import { categories, db } from '@dart/db';
import { getAuthenticatedUserIdFromBearerToken } from '@/auth/bearer-token';
import { captureServerException } from '@/observability/server';
import { getTransactionsRuntimeState } from '@/transactions/runtime';

export type MobileCategoryOption = {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
  isSystem: boolean;
};

function errorResponse(error: string, status: number): NextResponse {
  return NextResponse.json({ error }, { status });
}

export async function GET(request: Request) {
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

    const rows = await db
      .select({
        id: categories.id,
        name: categories.name,
        icon: categories.icon,
        color: categories.color,
        isSystem: categories.isSystem,
      })
      .from(categories)
      .where(
        or(
          isNull(categories.userId),
          eq(categories.userId, authenticatedUserId),
        ),
      );

    const options: MobileCategoryOption[] = rows.map((row) => ({
      id: row.id,
      name: row.name,
      icon: row.icon ?? null,
      color: row.color ?? null,
      isSystem: row.isSystem ?? false,
    }));

    return NextResponse.json({ categories: options });
  } catch (error) {
    captureServerException(error, { context: 'api_mobile_categories' });
    return errorResponse('INTERNAL_ERROR', 500);
  }
}
