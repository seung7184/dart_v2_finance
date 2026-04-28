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

type MerchantInsightRow = {
  amountCents: number;
  merchantName: string | null;
  normalizedMerchantName: string | null;
  occurredAt: Date;
};

function merchantKey(row: Pick<MerchantInsightRow, 'merchantName' | 'normalizedMerchantName'>): string | null {
  return row.normalizedMerchantName ?? row.merchantName;
}

export function summarizeMerchantInsightRows(input: {
  merchantRows: MerchantInsightRow[];
  rollingRows: Array<Pick<MerchantInsightRow, 'merchantName' | 'normalizedMerchantName' | 'occurredAt'>>;
}): MerchantInsights {
  const totalSpendCents = input.merchantRows.reduce((sum, row) => sum + row.amountCents, 0);
  const merchantGroups = new Map<
    string,
    { amountCents: number; displayName: string; transactionCount: number }
  >();

  for (const row of input.merchantRows) {
    const key = merchantKey(row);
    if (!key) continue;

    const existing = merchantGroups.get(key);
    if (existing) {
      existing.amountCents += row.amountCents;
      existing.transactionCount += 1;
      if (!existing.displayName && row.merchantName) {
        existing.displayName = row.merchantName;
      }
      continue;
    }

    merchantGroups.set(key, {
      amountCents: row.amountCents,
      displayName: row.merchantName ?? key,
      transactionCount: 1,
    });
  }

  const topMerchants: TopMerchant[] = Array.from(merchantGroups.values())
    .sort((a, b) => b.amountCents - a.amountCents)
    .slice(0, 10)
    .map((merchant) => ({
      merchantName: merchant.displayName,
      amountCents: merchant.amountCents,
      transactionCount: merchant.transactionCount,
      concentrationPct:
        totalSpendCents > 0 ? Math.round((merchant.amountCents / totalSpendCents) * 100) : 0,
    }));

  const merchantMonthSets = new Map<string, Set<string>>();
  const merchantDisplayNames = new Map<string, string>();
  for (const row of input.rollingRows) {
    const key = merchantKey(row);
    if (!key) continue;

    if (!merchantDisplayNames.has(key)) {
      merchantDisplayNames.set(key, row.merchantName ?? key);
    }

    const monthKey = `${row.occurredAt.getUTCFullYear()}-${row.occurredAt.getUTCMonth() + 1}`;
    if (!merchantMonthSets.has(key)) {
      merchantMonthSets.set(key, new Set());
    }
    merchantMonthSets.get(key)!.add(monthKey);
  }

  const recurringMerchants = Array.from(merchantMonthSets.entries())
    .filter(([, months]) => months.size >= 2)
    .map(([key]) => merchantDisplayNames.get(key) ?? key)
    .sort();

  return {
    topMerchants,
    recurringMerchants,
    totalSpendCents,
  };
}

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
      normalizedMerchantName: transactions.normalizedMerchantName,
      amountCents: sql<number>`ABS(${transactions.amount})`.mapWith(Number),
      occurredAt: transactions.occurredAt,
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
    );

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
      normalizedMerchantName: transactions.normalizedMerchantName,
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

  return summarizeMerchantInsightRows({ merchantRows, rollingRows });
}
