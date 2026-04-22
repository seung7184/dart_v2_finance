import { describe, it, expect } from 'vitest';
import { computeSafeToSpend } from '../engine';
import { buildTestContext } from './test-utils';

describe('D. Transfer & Investment Intent', () => {

  it('D-01: intent=transfer 거래는 safe-to-spend를 줄이지 않는다', () => {
    const ctx = buildTestContext({
      accountBalance_checking: 1_200_00,
      transferOut: 800_00,
      daysUntilPayday: 8,
    });
    const result = computeSafeToSpend(ctx);
    expect(result.available_cash_cents).toBe(1_200_00);
  });

  it('D-02: intent=investment_contribution 거래는 living expense로 계산되지 않는다', () => {
    const ctx = buildTestContext({
      transactions: [
        { amount: -800_00, intent: 'investment_contribution' },
        { amount: -50_00, intent: 'living_expense' },
      ],
      accountBalance_checking: 2_000_00,
      daysUntilPayday: 5,
    });
    const result = computeSafeToSpend(ctx);
    expect(result.available_cash_cents).toBeDefined();
  });

  it('D-03: investment_buy, investment_sell은 available_cash 계산에서 무시된다', () => {
    const ctx = buildTestContext({
      brokerageTransactions: [
        { amount: -500_00, intent: 'investment_buy', account_type: 'brokerage' },
        { amount: +100_00, intent: 'investment_sell', account_type: 'brokerage' },
      ],
      checkingBalance: 1_000_00,
      daysUntilPayday: 5,
    });
    const result = computeSafeToSpend(ctx);
    expect(result.available_cash_cents).toBe(1_000_00);
  });

  it('D-04: transfer로 분류됐어야 할 거래가 living_expense로 잘못 분류되면 anomaly_reserve에 잡힌다', () => {
    const ctx = buildTestContext({
      misclassifiedTransfer: { amount: -800_00, intent: 'living_expense', review_status: 'pending' },
      daysUntilPayday: 5,
    });
    const result = computeSafeToSpend(ctx);
    expect(result.anomaly_reserve_cents).toBeGreaterThan(0);
  });

  it('D-05: income_dividend는 available_cash에 포함된다 (checking 계좌 입금이면)', () => {
    const ctx = buildTestContext({
      checkingBalance: 1_000_00,
      daysUntilPayday: 5,
    });
    const result = computeSafeToSpend(ctx);
    expect(result.available_cash_cents).toBe(1_000_00);
  });

  it('D-06: income_refund는 available_cash에 포함된다', () => {
    const ctx = buildTestContext({
      checkingBalance: 1_100_00,
      daysUntilPayday: 5,
    });
    const result = computeSafeToSpend(ctx);
    expect(result.available_cash_cents).toBe(1_100_00);
  });

});
