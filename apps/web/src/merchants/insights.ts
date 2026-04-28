import { and, eq, gte, inArray, lt, sql } from 'drizzle-orm';
import { accounts, db, transactions, type Database } from '@dart/db';

// Only living-expense intents qualify — excludes transfers, investments, income
const LIVING_EXPENSE_INTENTS = [
  'living_expense',
  'recurring_bill',
] as const;

function startOfMonth(year: number, month: number): Date {
  return new Date(Date.UTC(year, month - 1, 1));
}

function endOfMonth(year: number, month: number): Date {
  return new Date(Date.UTC(year, month, 1));
}

export type TopMerchant = {
  merchantName: string;
  amountCents: number;
  transactionCount: number;
  /** Share of total reviewed living spending for the month (0–100) */
  concentrationPct: number;
};

export type MerchantInsights = {
  /** Top 10 merchants by spend this month */
  topMerchants: TopMerchant[];
  /** Merchants that appear in at least 2 of the 3 rolling months ending at the selected month */
  recurringMerchants: string[];
  /** Total reviewed living spending used as the denominator for concentration */
  totalSpendCents: number;
};

/**
 * Loads merchant insights for a given month.
 * Only considers reviewed living-expense transactions.
 * Excludes transfers and investment intents per acceptance criteria E.
 */
export async function loadMerchantInsights(
  userId: string,
  year: number,
  month: number,
  database: Database = db,
): Promise<MerchantInsights> {
  const monthStart = startOfMonth(year, month);
  const monthEnd = endOfMonth(year, month);

  // ── Top merchants for the selected month ──────────────────────────────────
  const merchantRows = await database
    .select({
      merchantName: transactions.merchantName,
      amountCents: sql<number>`SUM(ABS(${transactions.amount}))`.mapWith(Number),
      transactionCount: sql<number>`COUNT(*)`.mapWith(Number),
    })
    .from(transactions)
    .innerJoin(accounts, eq(transactions.accountId, accounts.id))
    .where(
      and(
        eq(transactions.userId, userId),
        gte(transactions.occurredAt, monthStart),
        lt(transactions.occurredAt, monthEnd),
        eq(transactions.reviewStatus, 'reviewed'),
        inArray(transactions.intent, [...LIVING_EXPENSE_INTENTS]),
      ),
    )
    .groupBy(transactions.merchantName)
    .orderBy(sql`SUM(ABS(${transactions.amount})) DESC`);

  const totalSpendCents = merchantRows.reduce((sum, r) => sum + r.amountCents, 0);

  // Split into named merchants and unnamed (null merchantName) to compute concentration
  const namedRows = merchantRows.filter((r) => r.merchantName !== null);
  const topMerchants: TopMerchant[] = namedRows.slice(0, 10).map((r) => ({
    merchantName: r.merchantName as string,
    amountCents: r.amountCents,
    transactionCount: r.transactionCount,
    concentrationPct:
      totalSpendCents > 0 ? Math.round((r.amountCents / totalSpendCents) * 100) : 0,
  }));

  // ── Recurring merchants: appear in ≥2 of the 3 rolling months ─────────────
  // Build the 3-month window ending at the selected month
  const monthWindows = [-2, -1, 0].map((offset) => {
    let m = month + offset;
    let y = year;
    if (m <= 0) {
      m += 12;
      y -= 1;
    }
    return { y, m };
  });

  const windowStart = startOfMonth(monthWindows[0]!.y, monthWindows[0]!.m);
  const windowEnd = endOfMonth(year, month);

  const rollingRows = await database
    .select({
      merchantName: transactions.merchantName,
      occurredAt: transactions.occurredAt,
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        gte(transactions.occurredAt, windowStart),
        lt(transactions.occurredAt, windowEnd),
        eq(transactions.reviewStatus, 'reviewed'),
        inArray(transactions.intent, [...LIVING_EXPENSE_INTENTS]),
      ),
    );

  // Count distinct months each merchant appears in
  const merchantMonthSets = new Map<string, Set<string>>();
  for (const row of rollingRows) {
    if (!row.merchantName) continue;
    const key = `${row.occurredAt.getUTCFullYear()}-${row.occurredAt.getUTCMonth() + 1}`;
    if (!merchantMonthSets.has(row.merchantName)) {
      merchantMonthSets.set(row.merchantName, new Set());
    }
    merchantMonthSets.get(row.merchantName)!.add(key);
  }

  const recurringMerchants = Array.from(merchantMonthSets.entries())
    .filter(([, months]) => months.size >= 2)
    .map(([name]) => name)
    .sort();

  return {
    topMerchants,
    recurringMerchants,
    totalSpendCents,
  };
}
