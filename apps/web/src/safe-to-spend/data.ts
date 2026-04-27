import { and, desc, eq } from 'drizzle-orm';
import {
  accounts,
  budgetPeriods,
  db,
  importBatches,
  recurringSeries,
  sinkingFunds,
  transactions,
  users,
  type Database,
} from '@dart/db';
import type { SafeToSpendSourceData } from './view-model';

type QueryableDatabase = Database;

export async function loadSafeToSpendSourceData(
  userId: string,
  today: Date = new Date(),
  database: QueryableDatabase = db,
): Promise<SafeToSpendSourceData> {
  const currentYear = today.getUTCFullYear();
  const currentMonth = today.getUTCMonth() + 1;

  const [
    userRows,
    accountRows,
    transactionRows,
    recurringRows,
    sinkingFundRows,
    budgetRows,
    importBatchRows,
  ] = await Promise.all([
    database
      .select({
        id: users.id,
        minimumCashBuffer: users.minimumCashBuffer,
        paydayDay: users.paydayDay,
        plannedInvestingProtected: users.plannedInvestingProtected,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1),
    database
      .select({
        accountType: accounts.accountType,
        id: accounts.id,
        isAccessibleSavings: accounts.isAccessibleSavings,
        lastImportAt: accounts.lastImportAt,
        name: accounts.name,
      })
      .from(accounts)
      .where(and(eq(accounts.userId, userId), eq(accounts.isActive, true)))
      .orderBy(accounts.displayOrder, accounts.createdAt),
    database
      .select({
        accountId: transactions.accountId,
        amount: transactions.amount,
        intent: transactions.intent,
        occurredAt: transactions.occurredAt,
        reviewStatus: transactions.reviewStatus,
      })
      .from(transactions)
      .where(eq(transactions.userId, userId)),
    database
      .select({
        amount: recurringSeries.amount,
        intent: recurringSeries.intent,
        isActive: recurringSeries.isActive,
        name: recurringSeries.name,
        nextExpectedAt: recurringSeries.nextExpectedAt,
      })
      .from(recurringSeries)
      .where(and(eq(recurringSeries.userId, userId), eq(recurringSeries.isActive, true))),
    database
      .select({
        isActive: sinkingFunds.isActive,
        monthlyAllocation: sinkingFunds.monthlyAllocation,
        name: sinkingFunds.name,
      })
      .from(sinkingFunds)
      .where(and(eq(sinkingFunds.userId, userId), eq(sinkingFunds.isActive, true))),
    database
      .select({
        investingProtected: budgetPeriods.investingProtected,
        plannedInvesting: budgetPeriods.plannedInvesting,
      })
      .from(budgetPeriods)
      .where(
        and(
          eq(budgetPeriods.userId, userId),
          eq(budgetPeriods.year, currentYear),
          eq(budgetPeriods.month, currentMonth),
        ),
      )
      .limit(1),
    database
      .select({
        importCompletedAt: importBatches.importCompletedAt,
      })
      .from(importBatches)
      .where(eq(importBatches.userId, userId))
      .orderBy(desc(importBatches.importCompletedAt))
      .limit(5),
  ]);

  return {
    accounts: accountRows,
    budgetPeriod: budgetRows[0] ?? null,
    importBatches: importBatchRows,
    recurringSeries: recurringRows,
    sinkingFunds: sinkingFundRows,
    today,
    transactions: transactionRows,
    user: userRows[0] ?? null,
  };
}
