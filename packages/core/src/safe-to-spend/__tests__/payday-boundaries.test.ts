import { describe, it, expect } from 'vitest';
import { computeSafeToSpend } from '../engine';
import { buildTestContext } from './test-utils';

describe('A. Payday Boundaries', () => {

  it('A-01: 다음 월급일이 8일 후일 때 pool을 8로 나눈다', () => {
    const ctx = buildTestContext({
      daysUntilPayday: 8,
      availableCash: 297_10,
      otherObligations: 0,
    });
    const result = computeSafeToSpend(ctx);
    expect(result.value_cents).toBe(Math.floor(297_10 / 8));
    expect(result.days_until_payday).toBe(8);
  });

  it('A-02: 다음 월급일이 1일 후이면 pool 전체가 오늘 사용 가능하다', () => {
    const ctx = buildTestContext({
      daysUntilPayday: 1,
      availableCash: 500_00,
      otherObligations: 0,
    });
    const result = computeSafeToSpend(ctx);
    expect(result.value_cents).toBe(500_00);
  });

  it('A-03: 월급일이 오늘이면 €0을 반환하고 경고를 포함한다', () => {
    const ctx = buildTestContext({ daysUntilPayday: 0 });
    const result = computeSafeToSpend(ctx);
    expect(result.value_cents).toBe(0);
    expect(result.warnings.some(w => w.code === 'PAYDAY_TODAY_OR_OVERDUE')).toBe(true);
  });

  it('A-04: 월급일이 이미 지났으면 €0과 overdue 경고를 반환한다', () => {
    const ctx = buildTestContext({ daysUntilPayday: -3 });
    const result = computeSafeToSpend(ctx);
    expect(result.value_cents).toBe(0);
    expect(result.warnings.some(w => w.code === 'PAYDAY_TODAY_OR_OVERDUE')).toBe(true);
  });

  it('A-05: payday_date 미설정 시 계산 자체를 차단하고 예외를 던진다', () => {
    const ctx = buildTestContext({ paydayConfigured: false });
    expect(() => computeSafeToSpend(ctx)).toThrow('PAYDAY_NOT_CONFIGURED');
  });

  it('A-06: 월급일이 주말이어도 날짜를 자동 이동하지 않는다', () => {
    const ctx = buildTestContext({
      paydayDate: new Date('2026-04-26'),
      today: new Date('2026-04-22'),
    });
    const result = computeSafeToSpend(ctx);
    expect(result.days_until_payday).toBe(4);
  });

  it('A-07: 이달에 아직 급여 거래가 없어도 설정된 payday_date로 계산한다', () => {
    const ctx = buildTestContext({
      daysUntilPayday: 3,
      salaryLandedThisMonth: false,
    });
    const result = computeSafeToSpend(ctx);
    expect(result.warnings.some(w => w.code === 'SALARY_NOT_DETECTED')).toBe(true);
    expect(result.value_cents).toBeGreaterThanOrEqual(0);
  });

  it('A-08: days_until_payday가 30보다 크면 staleness 경고를 포함한다', () => {
    const ctx = buildTestContext({ daysUntilPayday: 45 });
    const result = computeSafeToSpend(ctx);
    expect(result.warnings.some(w => w.code === 'PAYDAY_FAR_FUTURE')).toBe(true);
  });

  it('A-09: assumption_trail에 payday 날짜와 days_until_payday가 항상 포함된다', () => {
    const ctx = buildTestContext({ daysUntilPayday: 5 });
    const result = computeSafeToSpend(ctx);
    const payTrail = result.assumption_trail.find(a => a.key === 'days_until_payday');
    expect(payTrail).toBeDefined();
    expect(payTrail?.value).toBe(5);
  });

});
