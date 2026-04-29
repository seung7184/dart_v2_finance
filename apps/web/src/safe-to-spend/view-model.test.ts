import { describe, expect, it } from 'vitest';
import { buildSafeToSpendViewModel } from './view-model';

const USER_ID = 'user-1';
const TODAY = new Date('2026-04-22T12:00:00.000Z');

describe('buildSafeToSpendViewModel', () => {
  it('computes one shared safe-to-spend breakdown from authenticated user data', () => {
    const viewModel = buildSafeToSpendViewModel({
      accounts: [
        {
          accountType: 'checking',
          id: 'checking-1',
          isAccessibleSavings: false,
          lastImportAt: new Date('2026-04-22T09:00:00.000Z'),
          name: 'ING Checking',
        },
        {
          accountType: 'savings',
          id: 'savings-1',
          isAccessibleSavings: false,
          lastImportAt: null,
          name: 'ING Savings',
        },
      ],
      budgetPeriod: {
        investingProtected: true,
        plannedInvesting: 800_00,
      },
      importBatches: [{ importCompletedAt: new Date('2026-04-22T09:00:00.000Z') }],
      recurringSeries: [
        {
          amount: -850_00,
          intent: 'recurring_bill',
          isActive: true,
          name: 'Rent',
          nextExpectedAt: new Date('2026-04-25T00:00:00.000Z'),
        },
      ],
      sinkingFunds: [
        {
          isActive: true,
          monthlyAllocation: 100_00,
          name: 'Annual insurance',
        },
      ],
      today: TODAY,
      transactions: [
        {
          accountId: 'checking-1',
          amount: 3_000_00,
          intent: 'income_salary',
          occurredAt: new Date('2026-04-20T00:00:00.000Z'),
          reviewStatus: 'reviewed',
        },
        {
          accountId: 'checking-1',
          amount: -200_00,
          intent: 'living_expense',
          occurredAt: new Date('2026-04-21T00:00:00.000Z'),
          reviewStatus: 'reviewed',
        },
        {
          accountId: 'checking-1',
          amount: -50_00,
          intent: 'unclassified',
          occurredAt: new Date('2026-04-21T00:00:00.000Z'),
          reviewStatus: 'pending',
        },
        {
          accountId: 'savings-1',
          amount: 1_000_00,
          intent: 'income_other',
          occurredAt: new Date('2026-04-19T00:00:00.000Z'),
          reviewStatus: 'reviewed',
        },
      ],
      user: {
        id: USER_ID,
        minimumCashBuffer: 100_00,
        paydayDay: 30,
        plannedInvestingProtected: true,
      },
    });

    expect(viewModel.status).toBe('ready');
    if (viewModel.status !== 'ready') {
      throw new Error('Expected ready view model');
    }

    expect(viewModel.result.available_cash_cents).toBe(2_750_00);
    expect(viewModel.result.protected_obligations.total_cents).toBe(1_900_00);
    expect(viewModel.result.spendable_pool_cents).toBe(850_00);
    expect(viewModel.result.days_until_payday).toBe(8);
    expect(viewModel.result.value_cents).toBe(106_25);
    expect(viewModel.availableAccounts).toEqual([
      {
        balanceCents: 2_750_00,
        id: 'checking-1',
        included: true,
        label: 'checking',
        name: 'ING Checking',
      },
      {
        balanceCents: 1_000_00,
        id: 'savings-1',
        included: false,
        label: 'savings',
        name: 'ING Savings',
      },
    ]);
    expect(viewModel.upcomingBills).toEqual([
      {
        amountCents: 850_00,
        dateLabel: 'Apr 25',
        id: 'Rent-2026-04-25T00:00:00.000Z',
        name: 'Rent',
      },
    ]);
    expect(viewModel.pendingReviewCount).toBe(1);
  });

  it('returns an onboarding empty state when payday is missing', () => {
    const viewModel = buildSafeToSpendViewModel({
      accounts: [],
      budgetPeriod: null,
      importBatches: [],
      recurringSeries: [],
      sinkingFunds: [],
      today: TODAY,
      transactions: [],
      user: {
        id: USER_ID,
        minimumCashBuffer: 0,
        paydayDay: null,
        plannedInvestingProtected: true,
      },
    });

    expect(viewModel).toMatchObject({
      actionHref: '/onboarding/payday',
      actionLabel: 'Set payday',
      status: 'missing_payday',
    });
  });

  it('returns an import empty state when no import data exists', () => {
    const viewModel = buildSafeToSpendViewModel({
      accounts: [
        {
          accountType: 'checking',
          id: 'checking-1',
          isAccessibleSavings: false,
          lastImportAt: null,
          name: 'ING Checking',
        },
      ],
      budgetPeriod: null,
      importBatches: [],
      recurringSeries: [],
      sinkingFunds: [],
      today: TODAY,
      transactions: [
        {
          accountId: 'checking-1',
          amount: 1_000_00,
          intent: 'income_salary',
          occurredAt: new Date('2026-04-20T00:00:00.000Z'),
          reviewStatus: 'reviewed',
        },
      ],
      user: {
        id: USER_ID,
        minimumCashBuffer: 0,
        paydayDay: 30,
        plannedInvestingProtected: true,
      },
    });

    expect(viewModel).toMatchObject({
      actionHref: '/import',
      actionLabel: 'Import CSV',
      status: 'missing_import',
    });
  });

  it('lets manual expenses reduce cash but excludes manual income from available cash', () => {
    const viewModel = buildSafeToSpendViewModel({
      accounts: [
        {
          accountType: 'checking',
          id: 'checking-1',
          isAccessibleSavings: false,
          lastImportAt: new Date('2026-04-22T09:00:00.000Z'),
          name: 'ING Checking',
        },
      ],
      budgetPeriod: null,
      importBatches: [{ importCompletedAt: new Date('2026-04-22T09:00:00.000Z') }],
      recurringSeries: [],
      sinkingFunds: [],
      today: TODAY,
      transactions: [
        {
          accountId: 'checking-1',
          amount: 1_000_00,
          intent: 'income_salary',
          occurredAt: new Date('2026-04-20T00:00:00.000Z'),
          reviewStatus: 'reviewed',
          source: 'ing_csv',
        },
        {
          accountId: 'checking-1',
          amount: -25_00,
          intent: 'living_expense',
          occurredAt: new Date('2026-04-21T00:00:00.000Z'),
          reviewStatus: 'reviewed',
          source: 'manual',
        },
        {
          accountId: 'checking-1',
          amount: 200_00,
          intent: 'income_other',
          occurredAt: new Date('2026-04-21T00:00:00.000Z'),
          reviewStatus: 'reviewed',
          source: 'manual',
        },
      ],
      user: {
        id: USER_ID,
        minimumCashBuffer: 0,
        paydayDay: 30,
        plannedInvestingProtected: true,
      },
    });

    expect(viewModel.status).toBe('ready');
    if (viewModel.status !== 'ready') {
      throw new Error('Expected ready view model');
    }

    expect(viewModel.result.available_cash_cents).toBe(975_00);
    expect(viewModel.availableAccounts[0]?.balanceCents).toBe(975_00);
  });
});
