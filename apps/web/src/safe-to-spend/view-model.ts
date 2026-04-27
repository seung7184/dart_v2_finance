import { computeSafeToSpend, type ComputeContext, type SafeToSpendResult } from '@dart/core';

type AccountType = ComputeContext['accounts'][number]['type'];
type TransactionIntent = ComputeContext['transactions'][number]['intent'];
type ReviewStatus = ComputeContext['transactions'][number]['review_status'];

export type SafeToSpendAccountRow = {
  id: string;
  name: string;
  accountType: AccountType;
  isAccessibleSavings: boolean | null;
  lastImportAt: Date | null;
};

export type SafeToSpendTransactionRow = {
  accountId: string;
  amount: number;
  intent: TransactionIntent;
  reviewStatus: ReviewStatus;
  occurredAt: Date;
};

export type SafeToSpendRecurringRow = {
  amount: number;
  intent: string;
  isActive: boolean | null;
  name: string;
  nextExpectedAt: Date | null;
};

export type SafeToSpendSinkingFundRow = {
  isActive: boolean | null;
  monthlyAllocation: number;
  name: string;
};

export type SafeToSpendBudgetPeriodRow = {
  investingProtected: boolean | null;
  plannedInvesting: number | null;
};

export type SafeToSpendImportBatchRow = {
  importCompletedAt: Date | null;
};

export type SafeToSpendUserRow = {
  id: string;
  minimumCashBuffer: number | null;
  paydayDay: number | null;
  plannedInvestingProtected: boolean | null;
};

export type SafeToSpendSourceData = {
  accounts: SafeToSpendAccountRow[];
  budgetPeriod: SafeToSpendBudgetPeriodRow | null;
  importBatches: SafeToSpendImportBatchRow[];
  recurringSeries: SafeToSpendRecurringRow[];
  sinkingFunds: SafeToSpendSinkingFundRow[];
  today: Date;
  transactions: SafeToSpendTransactionRow[];
  user: SafeToSpendUserRow | null;
};

export type AvailableAccountBreakdown = {
  balanceCents: number;
  id: string;
  included: boolean;
  label: string;
  name: string;
};

export type UpcomingBillBreakdown = {
  amountCents: number;
  dateLabel: string;
  id: string;
  name: string;
};

export type SinkingFundBreakdown = {
  amountCents: number;
  id: string;
  name: string;
};

export type SafeToSpendReadyViewModel = {
  availableAccounts: AvailableAccountBreakdown[];
  computedAtLabel: string;
  currentPaydayDate: Date;
  paydayLabel: string;
  pendingReviewCount: number;
  result: SafeToSpendResult;
  sinkingFunds: SinkingFundBreakdown[];
  status: 'ready';
  upcomingBills: UpcomingBillBreakdown[];
  warnings: SafeToSpendResult['warnings'];
};

export type SafeToSpendEmptyViewModel = {
  actionHref: string;
  actionLabel: string;
  message: string;
  status:
    | 'database_unavailable'
    | 'missing_accounts'
    | 'missing_import'
    | 'missing_payday'
    | 'missing_user';
  title: string;
};

export type SafeToSpendViewModel = SafeToSpendReadyViewModel | SafeToSpendEmptyViewModel;

function formatMonthDay(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    day: '2-digit',
    month: 'short',
    timeZone: 'UTC',
  }).format(date);
}

function clampPaydayDay(year: number, month: number, paydayDay: number): number {
  return Math.min(paydayDay, new Date(Date.UTC(year, month + 1, 0)).getUTCDate());
}

export function getNextPaydayDate(today: Date, paydayDay: number): Date {
  const year = today.getUTCFullYear();
  const month = today.getUTCMonth();
  const currentMonthDay = clampPaydayDay(year, month, paydayDay);
  const currentMonthPayday = new Date(Date.UTC(year, month, currentMonthDay));

  if (currentMonthPayday.getTime() >= startOfUtcDay(today).getTime()) {
    return currentMonthPayday;
  }

  const nextMonth = month + 1;
  const nextYear = year + Math.floor(nextMonth / 12);
  const normalizedNextMonth = nextMonth % 12;
  const nextMonthDay = clampPaydayDay(nextYear, normalizedNextMonth, paydayDay);
  return new Date(Date.UTC(nextYear, normalizedNextMonth, nextMonthDay));
}

function startOfUtcDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function latestDate(dates: Date[]): Date | null {
  return dates.reduce<Date | null>((latest, date) => {
    if (!latest || date.getTime() > latest.getTime()) {
      return date;
    }

    return latest;
  }, null);
}

function sumAccountBalance(
  accountId: string,
  transactions: SafeToSpendTransactionRow[],
): number {
  return transactions.reduce((sum, transaction) => {
    if (transaction.accountId !== accountId) {
      return sum;
    }

    if (transaction.intent === 'reimbursement_out') {
      return sum;
    }

    return sum + transaction.amount;
  }, 0);
}

function isAccountIncluded(account: SafeToSpendAccountRow): boolean {
  if (account.accountType === 'checking' || account.accountType === 'cash') {
    return true;
  }

  return account.accountType === 'savings' && account.isAccessibleSavings === true;
}

function buildAvailableAccounts(
  accounts: SafeToSpendAccountRow[],
  transactions: SafeToSpendTransactionRow[],
): AvailableAccountBreakdown[] {
  return accounts.map((account) => ({
    balanceCents: sumAccountBalance(account.id, transactions),
    id: account.id,
    included: isAccountIncluded(account),
    label: account.accountType,
    name: account.name,
  }));
}

function buildUpcomingBills(
  recurringSeries: SafeToSpendRecurringRow[],
  paydayDate: Date,
): UpcomingBillBreakdown[] {
  return recurringSeries
    .filter(
      (series) =>
        series.isActive !== false &&
        series.intent === 'recurring_bill' &&
        series.nextExpectedAt !== null &&
        series.nextExpectedAt.getTime() <= paydayDate.getTime(),
    )
    .map((series) => {
      const date = series.nextExpectedAt as Date;
      return {
        amountCents: Math.abs(series.amount),
        dateLabel: formatMonthDay(date),
        id: `${series.name}-${date.toISOString()}`,
        name: series.name,
      };
    });
}

function buildSinkingFunds(
  sinkingFunds: SafeToSpendSinkingFundRow[],
): SinkingFundBreakdown[] {
  return sinkingFunds
    .filter((fund) => fund.isActive !== false)
    .map((fund) => ({
      amountCents: fund.monthlyAllocation,
      id: fund.name,
      name: fund.name,
    }));
}

function toComputeContext(
  source: SafeToSpendSourceData,
  paydayDate: Date,
  lastImportAt: Date,
): ComputeContext {
  const accessibleSavingsAccountIds = source.accounts
    .filter((account) => account.accountType === 'savings' && account.isAccessibleSavings === true)
    .map((account) => account.id);
  const plannedInvestingCents = source.budgetPeriod?.plannedInvesting ?? 0;
  const investingProtected =
    source.budgetPeriod?.investingProtected ?? source.user?.plannedInvestingProtected ?? true;

  return {
    accounts: source.accounts.map((account) => ({
      balance_cents: sumAccountBalance(account.id, source.transactions),
      id: account.id,
      is_accessible_savings: account.isAccessibleSavings === true,
      type: account.accountType,
    })),
    last_import_at: lastImportAt,
    policy: {
      accessible_savings_account_ids: accessibleSavingsAccountIds,
      minimum_cash_buffer_cents: source.user?.minimumCashBuffer ?? 0,
      payday_date: paydayDate,
      planned_investing_cents: plannedInvestingCents,
      planned_investing_protected: investingProtected,
    },
    recurring_series: source.recurringSeries.map((series) => ({
      amount: series.amount,
      intent: series.intent,
      next_expected_at: series.nextExpectedAt ?? paydayDate,
    })),
    sinking_funds: source.sinkingFunds.map((fund) => ({
      is_active: fund.isActive !== false,
      monthly_allocation_cents: fund.monthlyAllocation,
    })),
    today: startOfUtcDay(source.today),
    transactions: source.transactions.map((transaction) => {
      const account = source.accounts.find((item) => item.id === transaction.accountId);
      return {
        account_type: account?.accountType ?? 'manual_external',
        amount: transaction.amount,
        intent: transaction.intent,
        occurred_at: transaction.occurredAt,
        review_status: transaction.reviewStatus,
      };
    }),
  };
}

export function buildSafeToSpendViewModel(source: SafeToSpendSourceData): SafeToSpendViewModel {
  if (!source.user) {
    return {
      actionHref: '/sign-in',
      actionLabel: 'Sign in',
      message: 'No app profile exists for this session yet.',
      status: 'missing_user',
      title: 'Profile setup is required',
    };
  }

  if (source.user.paydayDay === null) {
    return {
      actionHref: '/onboarding/payday',
      actionLabel: 'Set payday',
      message: 'Safe-to-spend needs your payday before it can calculate a trusted number.',
      status: 'missing_payday',
      title: 'Set your payday first',
    };
  }

  if (source.accounts.length === 0) {
    return {
      actionHref: '/onboarding/accounts',
      actionLabel: 'Add accounts',
      message: 'Add at least one ING cash account before showing a safe-to-spend number.',
      status: 'missing_accounts',
      title: 'Connect the cash picture',
    };
  }

  const lastImportAt = latestDate([
    ...source.accounts.flatMap((account) => (account.lastImportAt ? [account.lastImportAt] : [])),
    ...source.importBatches.flatMap((batch) =>
      batch.importCompletedAt ? [batch.importCompletedAt] : [],
    ),
  ]);

  if (!lastImportAt) {
    return {
      actionHref: '/import',
      actionLabel: 'Import CSV',
      message: 'Import an ING or Trading 212 CSV before showing a live safe-to-spend number.',
      status: 'missing_import',
      title: 'Import data is required',
    };
  }

  const paydayDate = getNextPaydayDate(source.today, source.user.paydayDay);
  const result = computeSafeToSpend(toComputeContext(source, paydayDate, lastImportAt));

  return {
    availableAccounts: buildAvailableAccounts(source.accounts, source.transactions),
    computedAtLabel: formatMonthDay(source.today),
    currentPaydayDate: paydayDate,
    paydayLabel: formatMonthDay(paydayDate),
    pendingReviewCount: source.transactions.filter(
      (transaction) =>
        transaction.reviewStatus === 'pending' || transaction.reviewStatus === 'needs_attention',
    ).length,
    result,
    sinkingFunds: buildSinkingFunds(source.sinkingFunds),
    status: 'ready',
    upcomingBills: buildUpcomingBills(source.recurringSeries, paydayDate),
    warnings: result.warnings,
  };
}
