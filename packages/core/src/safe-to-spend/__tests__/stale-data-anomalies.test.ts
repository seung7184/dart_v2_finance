import { describe, it, expect } from 'vitest';
import { computeSafeToSpend } from '../engine';
import { buildTestContext } from './test-utils';

describe('F. Stale Data & Anomaly Reserve', () => {

  it('F-01: 마지막 import가 5일 이상 지났으면 STALE_DATA 경고를 포함한다', () => {
    const ctx = buildTestContext({
      lastImportDaysAgo: 6,
      daysUntilPayday: 5,
    });
    const result = computeSafeToSpend(ctx);
    expect(result.warnings.some(w => w.code === 'STALE_IMPORT_DATA')).toBe(true);
  });

  it('F-02: 마지막 import가 4일 이하이면 STALE_DATA 경고 없음', () => {
    const ctx = buildTestContext({ lastImportDaysAgo: 4, daysUntilPayday: 5 });
    const result = computeSafeToSpend(ctx);
    expect(result.warnings.some(w => w.code === 'STALE_IMPORT_DATA')).toBe(false);
  });

  it('F-03: import 자체가 없으면 NO_IMPORT_DATA 에러를 던진다', () => {
    const ctx = buildTestContext({ hasImport: false });
    expect(() => computeSafeToSpend(ctx)).toThrow('NO_IMPORT_DATA');
  });

  it('F-04: 최근 14일 내 pending 거래가 있으면 그 금액이 anomaly_reserve에 포함된다', () => {
    const ctx = buildTestContext({
      recentPendingTransactions: [
        { amount: -7_60, daysAgo: 2, review_status: 'pending' },
        { amount: -15_00, daysAgo: 5, review_status: 'pending' },
      ],
      daysUntilPayday: 5,
    });
    const result = computeSafeToSpend(ctx);
    expect(result.anomaly_reserve_cents).toBe(7_60 + 15_00);
  });

  it('F-05: 14일보다 오래된 pending 거래는 anomaly_reserve에 포함되지 않는다', () => {
    const ctx = buildTestContext({
      recentPendingTransactions: [
        { amount: -50_00, daysAgo: 15, review_status: 'pending' },
      ],
      daysUntilPayday: 5,
    });
    const result = computeSafeToSpend(ctx);
    expect(result.anomaly_reserve_cents).toBe(0);
  });

  it('F-06: reviewed 거래는 anomaly_reserve에 포함되지 않는다', () => {
    const ctx = buildTestContext({
      recentPendingTransactions: [
        { amount: -50_00, daysAgo: 3, review_status: 'reviewed' },
      ],
      daysUntilPayday: 5,
    });
    const result = computeSafeToSpend(ctx);
    expect(result.anomaly_reserve_cents).toBe(0);
  });

  it('F-07: anomaly_reserve는 assumption_trail에 별도 항목으로 표시된다', () => {
    const ctx = buildTestContext({
      recentPendingTransactions: [{ amount: -7_60, daysAgo: 2, review_status: 'pending' }],
      daysUntilPayday: 5,
    });
    const result = computeSafeToSpend(ctx);
    const trail = result.assumption_trail.find(a => a.key === 'unreviewed_anomalies_reserve');
    expect(trail).toBeDefined();
    expect(trail?.value).toBe(7_60);
  });

});
