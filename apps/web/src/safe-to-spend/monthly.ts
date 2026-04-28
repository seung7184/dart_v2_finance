import { and, eq, gte, lt } from 'drizzle-orm';
import { accounts, db, transactions, type Database } from '@dart/db';

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
