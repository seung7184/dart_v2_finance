/**
 * Safe-to-Spend Engine
 *
 * STATUS: PLACEHOLDER — DO NOT IMPLEMENT YET
 *
 * Implementation checklist:
 * [ ] Read docs/23_Safe_To_Spend_Engine_Spec.md fully
 * [ ] Confirm test files exist in __tests__/
 * [ ] Run tests (expect failures — TDD)
 * [ ] Implement to make tests pass one group at a time
 * [ ] Final: pnpm test passes all 50 cases
 */

import type { SafeToSpendResult, PolicyConfig } from '../types/engine';

export interface ComputeContext {
  policy: PolicyConfig;
  accounts: Array<{
    id: string;
    type: string;
    balance_cents: number;
    is_accessible_savings: boolean;
  }>;
  transactions: Array<{
    amount: number;
    intent: string;
    review_status: string;
    occurred_at: Date;
    account_type: string;
  }>;
  recurring_series: Array<{
    amount: number;
    next_expected_at: Date;
    intent: string;
  }>;
  sinking_funds: Array<{
    monthly_allocation_cents: number;
    is_active: boolean;
  }>;
  last_import_at: Date | null;
  today: Date;
}

const DAY_IN_MS = 24 * 60 * 60 * 1000;

function diffInDays(from: Date, to: Date): number {
  return Math.floor((to.getTime() - from.getTime()) / DAY_IN_MS);
}

function buildWarning(
  code: string,
  severity: 'info' | 'warning' | 'error',
  message: string,
) {
  return { code, severity, message };
}

function isWithinCurrentMonth(date: Date, today: Date): boolean {
  return (
    date.getUTCFullYear() === today.getUTCFullYear() &&
    date.getUTCMonth() === today.getUTCMonth()
  );
}

function sumIncludedAccounts(
  accounts: ComputeContext['accounts'],
  accessibleSavingsAccountIds: string[],
): number {
  const accessibleSavings = new Set(accessibleSavingsAccountIds);

  return accounts.reduce((sum, account) => {
    if (account.type === 'checking' || account.type === 'cash') {
      return sum + account.balance_cents;
    }

    if (
      account.type === 'savings' &&
      account.is_accessible_savings &&
      accessibleSavings.has(account.id)
    ) {
      return sum + account.balance_cents;
    }

    return sum;
  }, 0);
}

function sumUpcomingBills(
  recurringSeries: ComputeContext['recurring_series'],
  paydayDate: Date,
): number {
  return recurringSeries.reduce((sum, series) => {
    if (series.intent !== 'recurring_bill') {
      return sum;
    }

    if (series.next_expected_at.getTime() > paydayDate.getTime()) {
      return sum;
    }

    return sum + Math.abs(series.amount);
  }, 0);
}

function sumSinkingFunds(funds: ComputeContext['sinking_funds']): number {
  return funds.reduce((sum, fund) => {
    if (!fund.is_active) {
      return sum;
    }

    return sum + fund.monthly_allocation_cents;
  }, 0);
}

function sumPendingReimbursements(transactions: ComputeContext['transactions']): number {
  let reimbursementOut = 0;
  let reimbursementIn = 0;

  for (const transaction of transactions) {
    if (transaction.intent === 'reimbursement_out') {
      reimbursementOut += Math.abs(transaction.amount);
    }

    if (transaction.intent === 'reimbursement_in') {
      reimbursementIn += Math.abs(transaction.amount);
    }
  }

  return Math.max(0, reimbursementOut - reimbursementIn);
}

function sumAnomalyReserve(
  transactions: ComputeContext['transactions'],
  today: Date,
): number {
  return transactions.reduce((sum, transaction) => {
    const isPending =
      transaction.review_status === 'pending' ||
      transaction.review_status === 'needs_attention';
    const ageInDays = diffInDays(transaction.occurred_at, today);

    if (!isPending || ageInDays < 0 || ageInDays > 14) {
      return sum;
    }

    return sum + Math.abs(transaction.amount);
  }, 0);
}

function hasInvestmentContributionThisMonth(
  transactions: ComputeContext['transactions'],
  today: Date,
): boolean {
  return transactions.some(
    (transaction) =>
      transaction.intent === 'investment_contribution' &&
      isWithinCurrentMonth(transaction.occurred_at, today),
  );
}

function hasSalaryThisMonth(
  transactions: ComputeContext['transactions'],
  today: Date,
): boolean {
  return transactions.some(
    (transaction) =>
      transaction.intent === 'income_salary' &&
      isWithinCurrentMonth(transaction.occurred_at, today),
  );
}

export function computeSafeToSpend(ctx: ComputeContext): SafeToSpendResult {
  if (ctx.policy.payday_date === null) {
    throw new Error('PAYDAY_NOT_CONFIGURED');
  }

  if (ctx.last_import_at === null) {
    throw new Error('NO_IMPORT_DATA');
  }

  const paydayDate = ctx.policy.payday_date;
  const daysUntilPayday = diffInDays(ctx.today, paydayDate);
  const warnings: SafeToSpendResult['warnings'] = [];

  if (daysUntilPayday <= 0) {
    warnings.push(
      buildWarning(
        'PAYDAY_TODAY_OR_OVERDUE',
        'warning',
        'Payday today or overdue — update your payday date.',
      ),
    );
  }

  if (daysUntilPayday > 30) {
    warnings.push(
      buildWarning(
        'PAYDAY_FAR_FUTURE',
        'warning',
        'Next payday is unusually far in the future.',
      ),
    );
  }

  if (!hasSalaryThisMonth(ctx.transactions, ctx.today)) {
    warnings.push(
      buildWarning(
        'SALARY_NOT_DETECTED',
        'warning',
        'Expected salary not detected this month.',
      ),
    );
  }

  const staleImportDays = diffInDays(ctx.last_import_at, ctx.today);
  if (staleImportDays >= 5) {
    warnings.push(
      buildWarning(
        'STALE_IMPORT_DATA',
        'warning',
        'Import data is stale and may not reflect recent transactions.',
      ),
    );
  }

  const reimbursementPendingCents = sumPendingReimbursements(ctx.transactions);
  const availableCashBase = sumIncludedAccounts(
    ctx.accounts,
    ctx.policy.accessible_savings_account_ids,
  );
  const availableCashCents = Math.max(0, availableCashBase - reimbursementPendingCents);
  const upcomingBillsCents = sumUpcomingBills(ctx.recurring_series, paydayDate);
  const sinkingFundCents = sumSinkingFunds(ctx.sinking_funds);
  const minBufferCents = ctx.policy.minimum_cash_buffer_cents;
  const anomalyReserveCents = sumAnomalyReserve(ctx.transactions, ctx.today);
  const investmentExecuted = hasInvestmentContributionThisMonth(
    ctx.transactions,
    ctx.today,
  );
  const investingProtectionOn = ctx.policy.planned_investing_protected;
  const plannedInvestingCents = ctx.policy.planned_investing_cents;
  const investingCents =
    investingProtectionOn && !investmentExecuted ? plannedInvestingCents : 0;

  if (!investingProtectionOn && plannedInvestingCents > 0) {
    warnings.push(
      buildWarning(
        'INVESTING_PROTECTION_DISABLED',
        'warning',
        'Planned investing is not protected.',
      ),
    );
  }

  if (investingProtectionOn && plannedInvestingCents > availableCashCents) {
    warnings.push(
      buildWarning(
        'INVESTING_EXCEEDS_CASH',
        'warning',
        'Planned investing exceeds available cash.',
      ),
    );
  }

  const protectedObligationsTotal =
    upcomingBillsCents +
    sinkingFundCents +
    minBufferCents +
    investingCents +
    anomalyReserveCents;

  if (protectedObligationsTotal > availableCashCents) {
    warnings.push(
      buildWarning(
        'OBLIGATIONS_EXCEED_CASH',
        'warning',
        'Upcoming obligations exceed available cash.',
      ),
    );
  }

  const spendablePoolCents = Math.max(
    0,
    availableCashCents - protectedObligationsTotal,
  );
  const valueCents =
    daysUntilPayday <= 0 ? 0 : Math.floor(spendablePoolCents / daysUntilPayday);

  const assumptionTrail: SafeToSpendResult['assumption_trail'] = [
    {
      key: 'payday_date',
      label: 'Payday date',
      value: paydayDate.toISOString().slice(0, 10),
    },
    {
      key: 'days_until_payday',
      label: 'Days until payday',
      value: daysUntilPayday,
      unit: 'days',
    },
    {
      key: 'planned_investing_protected',
      label: 'Planned investing protected',
      value: investingProtectionOn,
      unit: 'boolean',
    },
    {
      key: 'reimbursement_pending',
      label: 'Pending reimbursement',
      value: reimbursementPendingCents,
      unit: 'cents',
    },
    {
      key: 'unreviewed_anomalies_reserve',
      label: 'Unreviewed anomalies reserve',
      value: anomalyReserveCents,
      unit: 'cents',
    },
  ];

  return {
    value_cents: valueCents,
    computed_at: ctx.today,
    days_until_payday: daysUntilPayday,
    available_cash_cents: availableCashCents,
    protected_obligations: {
      upcoming_bills_cents: upcomingBillsCents,
      sinking_fund_cents: sinkingFundCents,
      min_buffer_cents: minBufferCents,
      investing_cents: investingCents,
      anomaly_reserve_cents: anomalyReserveCents,
      total_cents: protectedObligationsTotal,
    },
    spendable_pool_cents: spendablePoolCents,
    investing_cents: investingCents,
    sinking_fund_cents: sinkingFundCents,
    min_buffer_cents: minBufferCents,
    anomaly_reserve_cents: anomalyReserveCents,
    investing_protected: investingProtectionOn,
    assumption_trail: assumptionTrail,
    warnings,
  };
}
