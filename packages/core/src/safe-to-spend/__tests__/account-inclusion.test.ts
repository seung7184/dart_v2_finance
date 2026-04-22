import { describe, it, expect } from 'vitest';
import { computeSafeToSpend } from '../engine';
import { buildTestContext } from './test-utils';

describe('G. Account Inclusion Rules', () => {

  it('G-01: checking 계좌는 항상 available_cash에 포함된다', () => {
    const ctx = buildTestContext({
      accounts: [{ type: 'checking', balance: 1_000_00 }],
      daysUntilPayday: 5,
    });
    const result = computeSafeToSpend(ctx);
    expect(result.available_cash_cents).toBe(1_000_00);
  });

  it('G-02: savings 계좌는 is_accessible_savings = false이면 포함되지 않는다', () => {
    const ctx = buildTestContext({
      accounts: [
        { type: 'checking', balance: 1_000_00 },
        { type: 'savings', balance: 5_000_00, is_accessible_savings: false },
      ],
      daysUntilPayday: 5,
    });
    const result = computeSafeToSpend(ctx);
    expect(result.available_cash_cents).toBe(1_000_00);
  });

  it('G-03: savings 계좌가 accessible로 설정되면 포함된다', () => {
    const ctx = buildTestContext({
      accounts: [
        { type: 'checking', balance: 1_000_00 },
        { type: 'savings', balance: 2_000_00, is_accessible_savings: true },
      ],
      daysUntilPayday: 5,
    });
    const result = computeSafeToSpend(ctx);
    expect(result.available_cash_cents).toBe(3_000_00);
  });

  it('G-04: brokerage 계좌는 is_accessible_savings와 무관하게 절대 포함되지 않는다', () => {
    const ctx = buildTestContext({
      accounts: [
        { type: 'checking', balance: 1_000_00 },
        { type: 'brokerage', balance: 50_000_00, is_accessible_savings: true },
      ],
      daysUntilPayday: 5,
    });
    const result = computeSafeToSpend(ctx);
    expect(result.available_cash_cents).toBe(1_000_00);
  });

  it('G-05: 복수 checking 계좌는 모두 합산된다', () => {
    const ctx = buildTestContext({
      accounts: [
        { type: 'checking', balance: 800_00 },
        { type: 'checking', balance: 1_200_00 },
      ],
      daysUntilPayday: 5,
    });
    const result = computeSafeToSpend(ctx);
    expect(result.available_cash_cents).toBe(2_000_00);
  });

});
