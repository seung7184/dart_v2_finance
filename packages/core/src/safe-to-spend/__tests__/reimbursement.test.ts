import { describe, it, expect } from 'vitest';
import { computeSafeToSpend } from '../engine';
import { buildTestContext } from './test-utils';

describe('C. Reimbursement Handling', () => {

  it('C-01: 미매칭 reimbursement_out은 available_cash를 줄인다', () => {
    const ctx = buildTestContext({
      availableCash: 1_000_00,
      unreimbursedOut: 200_00,
      daysUntilPayday: 5,
    });
    const result = computeSafeToSpend(ctx);
    expect(result.available_cash_cents).toBe(800_00);
  });

  it('C-02: matched reimbursement (in+out 연결됨)은 safe-to-spend에 영향 없다', () => {
    const ctx = buildTestContext({
      availableCash: 1_000_00,
      reimbursementLinked: { out: 200_00, in: 200_00 },
      daysUntilPayday: 5,
    });
    const result = computeSafeToSpend(ctx);
    expect(result.available_cash_cents).toBe(1_000_00);
  });

  it('C-03: reimbursement_in만 있고 out이 없으면 income처럼 처리된다', () => {
    const ctx = buildTestContext({
      availableCash: 800_00,
      daysUntilPayday: 5,
    });
    const result = computeSafeToSpend(ctx);
    expect(result.available_cash_cents).toBe(800_00);
  });

  it('C-04: 부분 매칭 (out €200, in €150) → 미수령 €50이 available_cash를 줄인다', () => {
    const ctx = buildTestContext({
      availableCash: 1_000_00,
      reimbursementLinked: { out: 200_00, in: 150_00 },
      daysUntilPayday: 5,
    });
    const result = computeSafeToSpend(ctx);
    expect(result.available_cash_cents).toBe(950_00);
  });

  it('C-05: assumption_trail에 reimbursement_pending 항목이 포함된다', () => {
    const ctx = buildTestContext({ unreimbursedOut: 200_00 });
    const result = computeSafeToSpend(ctx);
    const trail = result.assumption_trail.find(a => a.key === 'reimbursement_pending');
    expect(trail).toBeDefined();
    expect(trail?.value).toBe(200_00);
  });

  it('C-06: reimbursement_out이 취소 처리되면 available_cash에서 제외하지 않는다', () => {
    const ctx = buildTestContext({
      availableCash: 1_000_00,
      cancelledReimbursementOut: 200_00,
      daysUntilPayday: 5,
    });
    const result = computeSafeToSpend(ctx);
    expect(result.available_cash_cents).toBe(1_000_00);
  });

  it('C-07: 여러 미매칭 reimbursement_out의 합산이 올바르다', () => {
    const ctx = buildTestContext({
      availableCash: 2_000_00,
      multipleUnreimbursedOut: [150_00, 80_00, 220_00],
      daysUntilPayday: 5,
    });
    const result = computeSafeToSpend(ctx);
    expect(result.available_cash_cents).toBe(2_000_00 - 450_00);
  });

});
