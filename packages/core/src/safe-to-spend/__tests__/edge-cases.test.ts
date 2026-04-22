import { describe, it, expect } from 'vitest';
import { computeSafeToSpend } from '../engine';
import { buildTestContext } from './test-utils';

describe('E. Negative & Edge Cases', () => {

  it('E-01: protected_obligations > available_cash이면 pool = 0 (음수 아님)', () => {
    const ctx = buildTestContext({
      availableCash: 500_00,
      upcomingBills: 1_200_00,
      daysUntilPayday: 5,
    });
    const result = computeSafeToSpend(ctx);
    expect(result.spendable_pool_cents).toBe(0);
    expect(result.value_cents).toBe(0);
  });

  it('E-02: 부족 상황에서 warnings에 OBLIGATIONS_EXCEED_CASH가 포함된다', () => {
    const ctx = buildTestContext({
      availableCash: 500_00,
      upcomingBills: 1_200_00,
      daysUntilPayday: 5,
    });
    const result = computeSafeToSpend(ctx);
    expect(result.warnings.some(w => w.code === 'OBLIGATIONS_EXCEED_CASH')).toBe(true);
  });

  it('E-03: available_cash = 0이면 €0을 반환한다 (에러 없이)', () => {
    const ctx = buildTestContext({ availableCash: 0, daysUntilPayday: 5 });
    expect(() => computeSafeToSpend(ctx)).not.toThrow();
    const result = computeSafeToSpend(ctx);
    expect(result.value_cents).toBe(0);
  });

  it('E-04: sinking fund 첫 등록 달에는 monthly_allocation 전액을 차감한다 (소급 없음)', () => {
    const ctx = buildTestContext({
      availableCash: 1_000_00,
      sinkingFunds: [{ monthly_allocation: 100_00, months_active: 1 }],
      daysUntilPayday: 5,
    });
    const result = computeSafeToSpend(ctx);
    expect(result.sinking_fund_cents).toBe(100_00);
  });

  it('E-05: minimum_cash_buffer가 설정되면 항상 차감된다', () => {
    const ctx = buildTestContext({
      availableCash: 2_000_00,
      minimumCashBuffer: 500_00,
      daysUntilPayday: 5,
      otherObligations: 0,
    });
    const result = computeSafeToSpend(ctx);
    expect(result.spendable_pool_cents).toBe(2_000_00 - 500_00);
  });

  it('E-06: minimum_cash_buffer 기본값은 0이다', () => {
    const ctx = buildTestContext({
      availableCash: 1_000_00,
      daysUntilPayday: 5,
      otherObligations: 0,
    });
    const result = computeSafeToSpend(ctx);
    expect(result.min_buffer_cents).toBe(0);
  });

  it('E-07: 모든 컴포넌트가 0이면 value = 0 (에러 없이)', () => {
    const ctx = buildTestContext({
      availableCash: 0,
      plannedInvesting: 0,
      upcomingBills: 0,
      minimumCashBuffer: 0,
      sinkingFunds: [],
      anomalyReserve: 0,
      daysUntilPayday: 5,
    });
    expect(() => computeSafeToSpend(ctx)).not.toThrow();
    const result = computeSafeToSpend(ctx);
    expect(result.value_cents).toBe(0);
  });

  it('E-08: assumption_trail이 빈 배열이면 안 된다 — 항상 최소 1개 항목', () => {
    const ctx = buildTestContext({ availableCash: 100_00, daysUntilPayday: 3 });
    const result = computeSafeToSpend(ctx);
    expect(result.assumption_trail.length).toBeGreaterThan(0);
  });

});
