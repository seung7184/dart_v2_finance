import { and, eq, gte, inArray, lt, sql } from 'drizzle-orm';
import { accounts, categories, db, transactions, type Database } from '@dart/db';

export type MonthlyStats = {
  year: number;
  month: number;
  /** Total reviewed living spending (living_expense + recurring_bill) in cents (absolute) */
  reviewedSpendingCents: number;
  /** Total reviewed inflows (income intents) in cents (absolute) */
  reviewedInflowCents: number;
  /** Number of reviewed spending transactions */
  reviewedSpendingCount: number;
  /** Days elapsed in month (full month for past months, elapsed days for current) */
  daysElapsed: number;
  /** Total calendar days in month */
  daysInMonth: number;
  /** Actual average spend per day = reviewedSpendingCents / daysElapsed */
  actualSpendPerDayCents: number;
};

export type ManualTrackingStats = {
  confirmedMatchedManualCount: number;
  manualTransactionCount: number;
  suggestedMatchCount: number;
  unmatchedManualCount: number;
};

type MatchStatus = 'suggested' | 'confirmed' | 'rejected' | null;

export type MonthlyAnalyticsMatchRow = {
  matchStatus: MatchStatus;
  source: string;
};

export type MonthlyCumulativeSpendingPoint = {
  day: number;
  amountCents: number;
};

export type MonthlyCumulativeSpendingRow = MonthlyAnalyticsMatchRow & {
  amount: number;
  occurredAt: Date;
  intent: string | null;
};

const SPENDING_INTENTS = new Set([
  'living_expense',
  'recurring_bill',
  'fee',
  'tax',
]);

const INFLOW_INTENTS = new Set([
  'income_salary',
  'income_dividend',
  'income_refund',
  'income_other',
  'reimbursement_in',
]);

export function shouldExcludeFromMonthlyAnalytics(row: MonthlyAnalyticsMatchRow): boolean {
  return row.source === 'manual' && row.matchStatus === 'confirmed';
}

export function summarizeManualTracking(rows: MonthlyAnalyticsMatchRow[]): ManualTrackingStats {
  return rows.reduce<ManualTrackingStats>(
    (summary, row) => {
      if (row.source !== 'manual') {
        return summary;
      }

      summary.manualTransactionCount += 1;
      if (row.matchStatus === 'confirmed') {
        summary.confirmedMatchedManualCount += 1;
      } else if (row.matchStatus === 'suggested') {
        summary.suggestedMatchCount += 1;
      } else {
        summary.unmatchedManualCount += 1;
      }

      return summary;
    },
    {
      confirmedMatchedManualCount: 0,
      manualTransactionCount: 0,
      suggestedMatchCount: 0,
      unmatchedManualCount: 0,
    },
  );
}

function daysInMonthCount(year: number, month: number): number {
  // month is 1-indexed
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function startOfMonth(year: number, month: number): Date {
  return new Date(Date.UTC(year, month - 1, 1));
}

function endOfMonth(year: number, month: number): Date {
  return new Date(Date.UTC(year, month, 1));
}

export function summarizeMonthlyCumulativeSpendingRows({
  year,
  month,
  rows,
}: {
  year: number;
  month: number;
  rows: MonthlyCumulativeSpendingRow[];
}): MonthlyCumulativeSpendingPoint[] {
  const daysInMonth = daysInMonthCount(year, month);
  const dailySpendingCents = Array.from({ length: daysInMonth }, () => 0);

  for (const row of rows) {
    if (shouldExcludeFromMonthlyAnalytics(row)) {
      continue;
    }

    const intent = row.intent ?? 'unclassified';
    if (!SPENDING_INTENTS.has(intent)) {
      continue;
    }

    const day = row.occurredAt.getUTCDate();
    if (day < 1 || day > daysInMonth) {
      continue;
    }

    const dayIndex = day - 1;
    dailySpendingCents[dayIndex] = (dailySpendingCents[dayIndex] ?? 0) + Math.trunc(Math.abs(row.amount));
  }

  let cumulativeCents = 0;
  return dailySpendingCents.map((amountCents, index) => {
    cumulativeCents += amountCents;
    return {
      day: index + 1,
      amountCents: cumulativeCents,
    };
  });
}

export async function loadMonthlyStats(
  userId: string,
  year: number,
  month: number,
  today: Date = new Date(),
  database: Database = db,
): Promise<MonthlyStats> {
  const monthStart = startOfMonth(year, month);
  const monthEnd = endOfMonth(year, month);

  // Fetch reviewed transactions for this month
  const txRows = await database
    .select({
      amount: transactions.amount,
      intent: transactions.intent,
      accountType: accounts.accountType,
      matchStatus: sql<MatchStatus>`
        (
          select tm.match_status
          from transaction_matches tm
          where tm.manual_transaction_id = ${transactions.id}
            and tm.user_id = ${transactions.userId}
          order by case tm.match_status
            when 'confirmed' then 1
            when 'suggested' then 2
            when 'rejected' then 3
            else 4
          end
          limit 1
        )
      `,
      source: transactions.source,
    })
    .from(transactions)
    .innerJoin(accounts, eq(transactions.accountId, accounts.id))
    .where(
      and(
        eq(transactions.userId, userId),
        gte(transactions.occurredAt, monthStart),
        lt(transactions.occurredAt, monthEnd),
        eq(transactions.reviewStatus, 'reviewed'),
      ),
    );

  let reviewedSpendingCents = 0;
  let reviewedInflowCents = 0;
  let reviewedSpendingCount = 0;

  for (const row of txRows) {
    if (shouldExcludeFromMonthlyAnalytics(row)) {
      continue;
    }

    const intent = row.intent ?? 'unclassified';
    if (SPENDING_INTENTS.has(intent)) {
      reviewedSpendingCents += Math.abs(row.amount);
      reviewedSpendingCount += 1;
    } else if (INFLOW_INTENTS.has(intent)) {
      reviewedInflowCents += Math.abs(row.amount);
    }
  }

  const totalDays = daysInMonthCount(year, month);

  // For current month: elapsed days (at least 1)
  // For past months: full month
  const currentYear = today.getUTCFullYear();
  const currentMonth = today.getUTCMonth() + 1;
  const isPastMonth = year < currentYear || (year === currentYear && month < currentMonth);

  const daysElapsed = isPastMonth
    ? totalDays
    : Math.max(1, today.getUTCDate());

  const actualSpendPerDayCents =
    daysElapsed > 0 ? Math.floor(reviewedSpendingCents / daysElapsed) : 0;

  return {
    year,
    month,
    reviewedSpendingCents,
    reviewedInflowCents,
    reviewedSpendingCount,
    daysElapsed,
    daysInMonth: totalDays,
    actualSpendPerDayCents,
  };
}

export async function loadMonthlyCumulativeSpending(
  userId: string,
  year: number,
  month: number,
  database: Database = db,
): Promise<MonthlyCumulativeSpendingPoint[]> {
  const monthStart = startOfMonth(year, month);
  const monthEnd = endOfMonth(year, month);

  const rows = await database
    .select({
      amount: transactions.amount,
      occurredAt: transactions.occurredAt,
      intent: transactions.intent,
      matchStatus: sql<MatchStatus>`
        (
          select tm.match_status
          from transaction_matches tm
          where tm.manual_transaction_id = ${transactions.id}
            and tm.user_id = ${transactions.userId}
          order by case tm.match_status
            when 'confirmed' then 1
            when 'suggested' then 2
            when 'rejected' then 3
            else 4
          end
          limit 1
        )
      `,
      source: transactions.source,
    })
    .from(transactions)
    .innerJoin(accounts, eq(transactions.accountId, accounts.id))
    .where(
      and(
        eq(transactions.userId, userId),
        gte(transactions.occurredAt, monthStart),
        lt(transactions.occurredAt, monthEnd),
        eq(transactions.reviewStatus, 'reviewed'),
        inArray(transactions.intent, [...CATEGORY_SPENDING_INTENTS]),
      ),
    );

  return summarizeMonthlyCumulativeSpendingRows({ year, month, rows });
}

export type CategoryBreakdownRow = {
  categoryId: string | null;
  categoryName: string;
  amountCents: number;
  transactionCount: number;
};

// Intents counted as spending for category analysis (same as engine, minus fee/tax for clarity)
const CATEGORY_SPENDING_INTENTS = [
  'living_expense',
  'recurring_bill',
  'fee',
  'tax',
] as const;

/**
 * Monthly spending breakdown by category for reviewed transactions.
 * Only counts living-expense-like intents. Excludes transfers, investments, income.
 * Rows with no category are grouped as "Uncategorized".
 */
export async function loadMonthlyCategoryBreakdown(
  userId: string,
  year: number,
  month: number,
  database: Database = db,
): Promise<CategoryBreakdownRow[]> {
  const monthStart = startOfMonth(year, month);
  const monthEnd = endOfMonth(year, month);

  const rows = await database
    .select({
      categoryId: transactions.categoryId,
      categoryName: categories.name,
      amount: transactions.amount,
      matchStatus: sql<MatchStatus>`
        (
          select tm.match_status
          from transaction_matches tm
          where tm.manual_transaction_id = ${transactions.id}
            and tm.user_id = ${transactions.userId}
          order by case tm.match_status
            when 'confirmed' then 1
            when 'suggested' then 2
            when 'rejected' then 3
            else 4
          end
          limit 1
        )
      `,
      source: transactions.source,
    })
    .from(transactions)
    .leftJoin(categories, eq(transactions.categoryId, categories.id))
    .where(
      and(
        eq(transactions.userId, userId),
        gte(transactions.occurredAt, monthStart),
        lt(transactions.occurredAt, monthEnd),
        eq(transactions.reviewStatus, 'reviewed'),
        inArray(transactions.intent, [...CATEGORY_SPENDING_INTENTS]),
      ),
    );

  const grouped = new Map<string, CategoryBreakdownRow>();

  for (const row of rows) {
    if (shouldExcludeFromMonthlyAnalytics(row)) {
      continue;
    }

    const key = row.categoryId ?? '__uncategorized__';
    const current = grouped.get(key) ?? {
      categoryId: row.categoryId ?? null,
      categoryName: row.categoryName ?? 'Uncategorized',
      amountCents: 0,
      transactionCount: 0,
    };
    current.amountCents += Math.abs(row.amount);
    current.transactionCount += 1;
    grouped.set(key, current);
  }

  return Array.from(grouped.values()).sort((left, right) => right.amountCents - left.amountCents);
}

export async function loadManualTrackingStats(
  userId: string,
  year: number,
  month: number,
  database: Database = db,
): Promise<ManualTrackingStats> {
  const monthStart = startOfMonth(year, month);
  const monthEnd = endOfMonth(year, month);

  const rows = await database
    .select({
      matchStatus: sql<MatchStatus>`
        (
          select tm.match_status
          from transaction_matches tm
          where tm.manual_transaction_id = ${transactions.id}
            and tm.user_id = ${transactions.userId}
          order by case tm.match_status
            when 'confirmed' then 1
            when 'suggested' then 2
            when 'rejected' then 3
            else 4
          end
          limit 1
        )
      `,
      source: transactions.source,
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        eq(transactions.source, 'manual'),
        gte(transactions.occurredAt, monthStart),
        lt(transactions.occurredAt, monthEnd),
      ),
    );

  return summarizeManualTracking(rows);
}

/**
 * Get the list of year/month combinations that have any transactions for a user.
 * Used to populate the month selector dropdown.
 */
export async function loadAvailableMonths(
  userId: string,
  today: Date = new Date(),
  database: Database = db,
): Promise<Array<{ year: number; month: number; label: string }>> {
  const txRows = await database
    .select({ occurredAt: transactions.occurredAt })
    .from(transactions)
    .where(eq(transactions.userId, userId));

  const seen = new Set<string>();
  for (const row of txRows) {
    const y = row.occurredAt.getUTCFullYear();
    const m = row.occurredAt.getUTCMonth() + 1;
    seen.add(`${y}-${m}`);
  }

  // Always include current month
  const currentYear = today.getUTCFullYear();
  const currentMonth = today.getUTCMonth() + 1;
  seen.add(`${currentYear}-${currentMonth}`);

  return Array.from(seen)
    .map((key) => {
      const [y, m] = key.split('-').map(Number) as [number, number];
      return {
        year: y,
        month: m,
        label: new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(
          new Date(Date.UTC(y, m - 1, 1)),
        ),
      };
    })
    .sort((a, b) => b.year - a.year || b.month - a.month);
}
