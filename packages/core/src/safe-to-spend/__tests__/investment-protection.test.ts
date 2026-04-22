import { describe, it, expect } from 'vitest';
import { computeSafeToSpend } from '../engine';
import { buildTestContext } from './test-utils';

describe('B. Investment Protection Policy', () => {

  it('B-01: 보호 ON이고 투자 계획 €800이면 pool에서 차감된다', () => {
    const ctx = buildTestContext({
      availableCash: 3_000_00,
      plannedInvesting: 800_00,
      investingProtected: true,
      daysUntilPayday: 8,
      otherObligations: 0,
    });
    const result = computeSafeToSpend(ctx);
    const expectedPool = 3_000_00 - 800_00;
    expect(result.spendable_pool_cents).toBe(expectedPool);
  });

  it('B-02: 보호 OFF이면 투자 계획이 pool에서 차감되지 않는다', () => {
    const ctx = buildTestContext({
      availableCash: 3_000_00,
      plannedInvesting: 800_00,
      investingProtected: false,
      daysUntilPayday: 8,
      otherObligations: 0,
    });
    const result = computeSafeToSpend(ctx);
    expect(result.spendable_pool_cents).toBe(3_000_00);
  });

  it('B-03: 보호 OFF이면 warnings에 INVESTING_PROTECTION_DISABLED가 포함된다', () => {
    const ctx = buildTestContext({ investingProtected: false, plannedInvesting: 800_00 });
    const result = computeSafeToSpend(ctx);
    expect(result.warnings.some(w => w.code === 'INVESTING_PROTECTION_DISABLED')).toBe(true);
  });

  it('B-04: 이미 이달에 투자 이체가 실행됐으면 planned_investing을 이중 차감하지 않는다', () => {
    const ctx = buildTestContext({
      availableCash: 2_200_00,
      plannedInvesting: 800_00,
      investingProtected: true,
      investingAlreadyExecuted: true,
      daysUntilPayday: 8,
    });
    const result = computeSafeToSpend(ctx);
    expect(result.spendable_pool_cents).toBe(2_200_00);
  });

  it('B-05: 투자 계획 > available_cash이면 pool은 0이고 경고를 반환한다', () => {
    const ctx = buildTestContext({
      availableCash: 500_00,
      plannedInvesting: 800_00,
      investingProtected: true,
      daysUntilPayday: 8,
      otherObligations: 0,
    });
    const result = computeSafeToSpend(ctx);
    expect(result.spendable_pool_cents).toBe(0);
    expect(result.value_cents).toBe(0);
    expect(result.warnings.some(w => w.code === 'INVESTING_EXCEEDS_CASH')).toBe(true);
  });

  it('B-06: assumption_trail에 투자 보호 상태가 항상 기록된다', () => {
    const ctx = buildTestContext({ investingProtected: true, plannedInvesting: 800_00 });
    const result = computeSafeToSpend(ctx);
    const investTrail = result.assumption_trail.find(a => a.key === 'planned_investing_protected');
    expect(investTrail).toBeDefined();
    expect(investTrail?.value).toBe(true);
  });

  it('B-07: 투자 계획이 없으면 protection 설정과 무관하게 차감 없음', () => {
    const ctx = buildTestContext({
      availableCash: 1_000_00,
      plannedInvesting: 0,
      investingProtected: true,
      daysUntilPayday: 5,
    });
    const result = computeSafeToSpend(ctx);
    expect(result.investing_cents).toBe(0);
  });

  it('B-08: 보호 OFF로 전환되면 그 시점부터 즉시 반영된다 (캐시 무효화)', () => {
    const ctxOn = buildTestContext({ investingProtected: true, plannedInvesting: 800_00, availableCash: 2_000_00 });
    const ctxOff = buildTestContext({ investingProtected: false, plannedInvesting: 800_00, availableCash: 2_000_00 });
    const resultOn = computeSafeToSpend(ctxOn);
    const resultOff = computeSafeToSpend(ctxOff);
    expect(resultOff.spendable_pool_cents).toBeGreaterThan(resultOn.spendable_pool_cents);
  });

});
