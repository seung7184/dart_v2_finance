import type { ComputeContext } from '../engine';
import type { PolicyConfig } from '../../types/engine';

export interface TestContextOverrides {
  // Payday
  paydayConfigured?: boolean;
  paydayDate?: Date;
  today?: Date;
  daysUntilPayday?: number;

  // Cash
  availableCash?: number;
  checkingBalance?: number;
  accountBalance_checking?: number;

  // Investing
  plannedInvesting?: number;
  investingProtected?: boolean;
  investingAlreadyExecuted?: boolean;

  // Obligations
  otherObligations?: number;
  upcomingBills?: number;
  minimumCashBuffer?: number;
  sinkingFunds?: Array<{ monthly_allocation: number; months_active?: number }>;

  // Reimbursements
  unreimbursedOut?: number;
  cancelledReimbursementOut?: number;
  multipleUnreimbursedOut?: number[];
  reimbursementLinked?: { out: number; in: number };

  // Transfers
  transferOut?: number;

  // Transactions (explicit)
  transactions?: Array<{
    amount: number;
    intent: string;
    review_status?: string;
    account_type?: string;
    daysAgo?: number;
  }>;
  brokerageTransactions?: Array<{
    amount: number;
    intent: string;
    account_type: string;
  }>;
  misclassifiedTransfer?: {
    amount: number;
    intent: string;
    review_status: string;
  };
  recentPendingTransactions?: Array<{
    amount: number;
    daysAgo: number;
    review_status: string;
  }>;

  // Accounts
  accounts?: Array<{
    type: string;
    balance: number;
    is_accessible_savings?: boolean;
  }>;

  // Import
  lastImportDaysAgo?: number;
  hasImport?: boolean;

  // Salary
  salaryLandedThisMonth?: boolean;

  // Anomaly reserve (direct override)
  anomalyReserve?: number;
}

const DEFAULT_TODAY = new Date('2026-04-22');
const DEFAULT_PAYDAY = new Date('2026-04-30');

export function buildTestContext(overrides: TestContextOverrides = {}): ComputeContext {
  const today = overrides.today ?? DEFAULT_TODAY;

  // Determine payday
  let paydayDate: Date | null;
  if (overrides.paydayConfigured === false) {
    paydayDate = null;
  } else if (overrides.paydayDate !== undefined) {
    paydayDate = overrides.paydayDate;
  } else if (overrides.daysUntilPayday !== undefined) {
    const d = new Date(today);
    d.setDate(d.getDate() + overrides.daysUntilPayday);
    paydayDate = d;
  } else {
    paydayDate = DEFAULT_PAYDAY;
  }

  const plannedInvestingCents = overrides.plannedInvesting ?? 0;
  const investingProtected = overrides.investingProtected ?? true;
  const minimumCashBuffer = overrides.minimumCashBuffer ?? 0;

  const policy: PolicyConfig = {
    payday_date: paydayDate,
    planned_investing_protected: investingProtected,
    accessible_savings_account_ids: [],
    minimum_cash_buffer_cents: minimumCashBuffer,
    planned_investing_cents: plannedInvestingCents,
  };

  // Build accounts
  let accounts: ComputeContext['accounts'];
  if (overrides.accounts) {
    accounts = overrides.accounts.map((a, i) => ({
      id: `acc-${i}`,
      type: a.type,
      balance_cents: a.balance,
      is_accessible_savings: a.is_accessible_savings ?? false,
    }));
    // Update accessible savings IDs
    for (let i = 0; i < overrides.accounts.length; i++) {
      const a = overrides.accounts[i];
      if (a && a.type === 'savings' && a.is_accessible_savings) {
        policy.accessible_savings_account_ids.push(`acc-${i}`);
      }
    }
  } else {
    const balance =
      overrides.availableCash ??
      overrides.checkingBalance ??
      overrides.accountBalance_checking ??
      100_000;
    accounts = [{ id: 'acc-0', type: 'checking', balance_cents: balance, is_accessible_savings: false }];
  }

  // Build transactions
  let transactions: ComputeContext['transactions'] = [];

  if (overrides.transactions) {
    transactions = overrides.transactions.map((t) => ({
      amount: t.amount,
      intent: t.intent,
      review_status: t.review_status ?? 'reviewed',
      occurred_at: new Date(today.getTime() - (t.daysAgo ?? 0) * 86400000),
      account_type: t.account_type ?? 'checking',
    }));
  }

  if (overrides.brokerageTransactions) {
    transactions = [
      ...transactions,
      ...overrides.brokerageTransactions.map((t) => ({
        amount: t.amount,
        intent: t.intent,
        review_status: 'reviewed',
        occurred_at: today,
        account_type: t.account_type,
      })),
    ];
  }

  if (overrides.misclassifiedTransfer) {
    const t = overrides.misclassifiedTransfer;
    transactions = [
      ...transactions,
      {
        amount: t.amount,
        intent: t.intent,
        review_status: t.review_status,
        occurred_at: today,
        account_type: 'checking',
      },
    ];
  }

  if (overrides.recentPendingTransactions) {
    transactions = [
      ...transactions,
      ...overrides.recentPendingTransactions.map((t) => ({
        amount: t.amount,
        intent: 'unclassified',
        review_status: t.review_status,
        occurred_at: new Date(today.getTime() - t.daysAgo * 86400000),
        account_type: 'checking',
      })),
    ];
  }

  // Handle reimbursement scenarios
  if (overrides.unreimbursedOut !== undefined) {
    transactions = [
      ...transactions,
      {
        amount: -overrides.unreimbursedOut,
        intent: 'reimbursement_out',
        review_status: 'reviewed',
        occurred_at: today,
        account_type: 'checking',
      },
    ];
  }
  if (overrides.multipleUnreimbursedOut) {
    for (const amt of overrides.multipleUnreimbursedOut) {
      transactions = [
        ...transactions,
        {
          amount: -amt,
          intent: 'reimbursement_out',
          review_status: 'reviewed',
          occurred_at: today,
          account_type: 'checking',
        },
      ];
    }
  }
  if (overrides.reimbursementLinked) {
    // Both sides are matched — use a linked pair (in context, engine treats as neutral)
    transactions = [
      ...transactions,
      {
        amount: -overrides.reimbursementLinked.out,
        intent: 'reimbursement_out',
        review_status: 'reviewed',
        occurred_at: today,
        account_type: 'checking',
      },
      {
        amount: overrides.reimbursementLinked.in,
        intent: 'reimbursement_in',
        review_status: 'reviewed',
        occurred_at: today,
        account_type: 'checking',
      },
    ];
  }
  if (overrides.cancelledReimbursementOut !== undefined) {
    // Cancelled — not in transactions (already removed)
  }

  if (overrides.transferOut !== undefined) {
    transactions = [
      ...transactions,
      {
        amount: -overrides.transferOut,
        intent: 'transfer',
        review_status: 'reviewed',
        occurred_at: today,
        account_type: 'checking',
      },
    ];
  }

  if (overrides.investingAlreadyExecuted) {
    transactions = [
      ...transactions,
      {
        amount: -(overrides.plannedInvesting ?? 0),
        intent: 'investment_contribution',
        review_status: 'reviewed',
        occurred_at: today,
        account_type: 'checking',
      },
    ];
  }

  // Build recurring series from upcomingBills shorthand
  const recurring_series: ComputeContext['recurring_series'] = [];
  if (overrides.upcomingBills && overrides.upcomingBills > 0 && paydayDate) {
    const billDate = new Date(paydayDate);
    billDate.setDate(billDate.getDate() - 1);
    recurring_series.push({
      amount: -overrides.upcomingBills,
      next_expected_at: billDate,
      intent: 'recurring_bill',
    });
  }

  // Build sinking funds
  const sinking_funds: ComputeContext['sinking_funds'] = (overrides.sinkingFunds ?? []).map((sf) => ({
    monthly_allocation_cents: sf.monthly_allocation,
    is_active: true,
  }));

  // Last import
  let last_import_at: Date | null;
  if (overrides.hasImport === false) {
    last_import_at = null;
  } else if (overrides.lastImportDaysAgo !== undefined) {
    last_import_at = new Date(today.getTime() - overrides.lastImportDaysAgo * 86400000);
  } else {
    last_import_at = today;
  }

  // Salary detection — add warning context via transactions
  if (overrides.salaryLandedThisMonth === false) {
    // No salary transaction — keep transactions as-is, engine should detect and warn
  }

  return {
    policy,
    accounts,
    transactions,
    recurring_series,
    sinking_funds,
    last_import_at,
    today,
  };
}

export const mockDb = {};
