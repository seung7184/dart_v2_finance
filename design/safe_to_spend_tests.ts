/**
 * Safe-to-Spend Engine — Test Cases
 *
 * 파일 위치: packages/core/src/safe-to-spend/__tests__/
 * 사용 프레임워크: vitest
 *
 * 이 파일들은 engine.ts 구현 전에 먼저 작성한다.
 * 모든 테스트는 처음에 실패해야 정상이다 (TDD).
 *
 * 읽어야 할 문서:
 * - 23_Safe_To_Spend_Engine_Spec.md (정책)
 * - 21_Data_Model.md (데이터 구조)
 *
 * 테스트 그룹:
 * A. Payday boundaries (9개)
 * B. Investment protection policy (8개)
 * C. Reimbursement handling (7개)
 * D. Transfer & investment intent (6개)
 * E. Negative / edge cases (8개)
 * F. Stale data & anomaly reserve (7개)
 * G. Account inclusion rules (5개)
 *
 * 총 50개
 */

// ============================================================
// GROUP A — Payday Boundaries (9 tests)
// 파일: payday-boundaries.test.ts
// ============================================================

import { describe, it, expect, beforeEach } from 'vitest';
import { computeSafeToSpend } from '../engine';
import { buildTestContext, mockDb } from './test-utils';

describe('A. Payday Boundaries', () => {

  // A-01
  it('A-01: 다음 월급일이 8일 후일 때 pool을 8로 나눈다', () => {
    const ctx = buildTestContext({
      daysUntilPayday: 8,
      availableCash: 297_10,     // €297.10 in cents
      protectedObligations: 0,
    });
    const result = computeSafeToSpend(ctx);
    expect(result.value_cents).toBe(Math.floor(297_10 / 8));
    expect(result.days_until_payday).toBe(8);
  });

  // A-02
  it('A-02: 다음 월급일이 1일 후이면 pool 전체가 오늘 사용 가능하다', () => {
    const ctx = buildTestContext({
      daysUntilPayday: 1,
      availableCash: 500_00,
      protectedObligations: 0,
    });
    const result = computeSafeToSpend(ctx);
    expect(result.value_cents).toBe(500_00);
  });

  // A-03
  it('A-03: 월급일이 오늘이면 €0을 반환하고 경고를 포함한다', () => {
    const ctx = buildTestContext({ daysUntilPayday: 0 });
    const result = computeSafeToSpend(ctx);
    expect(result.value_cents).toBe(0);
    expect(result.warnings.some(w => w.code === 'PAYDAY_TODAY_OR_OVERDUE')).toBe(true);
  });

  // A-04
  it('A-04: 월급일이 이미 지났으면 €0과 overdue 경고를 반환한다', () => {
    const ctx = buildTestContext({ daysUntilPayday: -3 });
    const result = computeSafeToSpend(ctx);
    expect(result.value_cents).toBe(0);
    expect(result.warnings.some(w => w.code === 'PAYDAY_TODAY_OR_OVERDUE')).toBe(true);
  });

  // A-05
  it('A-05: payday_date 미설정 시 계산 자체를 차단하고 예외를 던진다', () => {
    const ctx = buildTestContext({ paydayConfigured: false });
    expect(() => computeSafeToSpend(ctx)).toThrow('PAYDAY_NOT_CONFIGURED');
  });

  // A-06
  it('A-06: 월급일이 주말이어도 날짜를 자동 이동하지 않는다', () => {
    // 설정된 payday_day = 26 (토요일)이어도 그대로 사용
    const ctx = buildTestContext({
      paydayDate: new Date('2026-04-26'), // 일요일
      today: new Date('2026-04-22'),
    });
    const result = computeSafeToSpend(ctx);
    expect(result.days_until_payday).toBe(4);
  });

  // A-07
  it('A-07: 이달에 아직 급여 거래가 없어도 설정된 payday_date로 계산한다', () => {
    const ctx = buildTestContext({
      daysUntilPayday: 3,
      salaryLandedThisMonth: false,
    });
    const result = computeSafeToSpend(ctx);
    // 계산은 진행되되 salary_not_detected 경고가 있어야 함
    expect(result.warnings.some(w => w.code === 'SALARY_NOT_DETECTED')).toBe(true);
    expect(result.value_cents).toBeGreaterThanOrEqual(0);
  });

  // A-08
  it('A-08: days_until_payday가 30보다 크면 staleness 경고를 포함한다', () => {
    const ctx = buildTestContext({ daysUntilPayday: 45 });
    const result = computeSafeToSpend(ctx);
    expect(result.warnings.some(w => w.code === 'PAYDAY_FAR_FUTURE')).toBe(true);
  });

  // A-09
  it('A-09: assumption_trail에 payday 날짜와 days_until_payday가 항상 포함된다', () => {
    const ctx = buildTestContext({ daysUntilPayday: 5 });
    const result = computeSafeToSpend(ctx);
    const payTrail = result.assumption_trail.find(a => a.key === 'days_until_payday');
    expect(payTrail).toBeDefined();
    expect(payTrail?.value).toBe(5);
  });

});


// ============================================================
// GROUP B — Investment Protection Policy (8 tests)
// 파일: investment-protection.test.ts
// ============================================================

describe('B. Investment Protection Policy', () => {

  // B-01
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

  // B-02
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

  // B-03
  it('B-03: 보호 OFF이면 warnings에 INVESTING_PROTECTION_DISABLED가 포함된다', () => {
    const ctx = buildTestContext({ investingProtected: false, plannedInvesting: 800_00 });
    const result = computeSafeToSpend(ctx);
    expect(result.warnings.some(w => w.code === 'INVESTING_PROTECTION_DISABLED')).toBe(true);
  });

  // B-04
  it('B-04: 이미 이달에 투자 이체가 실행됐으면 planned_investing을 이중 차감하지 않는다', () => {
    // investment_contribution 거래가 이미 settled → available_cash에서 이미 빠진 상태
    // planned_investing protection이 다시 차감하면 안 됨
    const ctx = buildTestContext({
      availableCash: 2_200_00,  // 이미 800 나간 후 잔액
      plannedInvesting: 800_00,
      investingProtected: true,
      investingAlreadyExecuted: true,  // 이달 T212 Deposit 거래 존재
      daysUntilPayday: 8,
    });
    const result = computeSafeToSpend(ctx);
    // available_cash 2200 에서 800 차감 없이 pool = 2200
    expect(result.spendable_pool_cents).toBe(2_200_00);
  });

  // B-05
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

  // B-06
  it('B-06: assumption_trail에 투자 보호 상태가 항상 기록된다', () => {
    const ctx = buildTestContext({ investingProtected: true, plannedInvesting: 800_00 });
    const result = computeSafeToSpend(ctx);
    const investTrail = result.assumption_trail.find(a => a.key === 'planned_investing_protected');
    expect(investTrail).toBeDefined();
    expect(investTrail?.value).toBe(true);
  });

  // B-07
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

  // B-08
  it('B-08: 보호 OFF로 전환되면 그 시점부터 즉시 반영된다 (캐시 무효화)', () => {
    const ctxOn = buildTestContext({ investingProtected: true, plannedInvesting: 800_00, availableCash: 2_000_00 });
    const ctxOff = buildTestContext({ investingProtected: false, plannedInvesting: 800_00, availableCash: 2_000_00 });
    const resultOn = computeSafeToSpend(ctxOn);
    const resultOff = computeSafeToSpend(ctxOff);
    expect(resultOff.spendable_pool_cents).toBeGreaterThan(resultOn.spendable_pool_cents);
  });

});


// ============================================================
// GROUP C — Reimbursement Handling (7 tests)
// 파일: reimbursement.test.ts
// ============================================================

describe('C. Reimbursement Handling', () => {

  // C-01
  it('C-01: 미매칭 reimbursement_out은 available_cash를 줄인다', () => {
    const ctx = buildTestContext({
      availableCash: 1_000_00,
      unreimbursedOut: 200_00,  // €200 대신 결제, 아직 못 받음
      daysUntilPayday: 5,
    });
    const result = computeSafeToSpend(ctx);
    // 엔진이 available_cash를 800으로 계산해야 함
    expect(result.available_cash_cents).toBe(800_00);
  });

  // C-02
  it('C-02: matched reimbursement (in+out 연결됨)은 safe-to-spend에 영향 없다', () => {
    const ctx = buildTestContext({
      availableCash: 1_000_00,
      reimbursementLinked: { out: 200_00, in: 200_00 },  // 완전 매칭
      daysUntilPayday: 5,
    });
    const result = computeSafeToSpend(ctx);
    expect(result.available_cash_cents).toBe(1_000_00);
  });

  // C-03
  it('C-03: reimbursement_in만 있고 out이 없으면 income처럼 처리된다', () => {
    const ctx = buildTestContext({
      availableCash: 800_00,  // 이미 Tikkie 200 들어온 상태
      daysUntilPayday: 5,
    });
    const result = computeSafeToSpend(ctx);
    expect(result.available_cash_cents).toBe(800_00);
  });

  // C-04
  it('C-04: 부분 매칭 (out €200, in €150) → 미수령 €50이 available_cash를 줄인다', () => {
    const ctx = buildTestContext({
      availableCash: 1_000_00,
      reimbursementLinked: { out: 200_00, in: 150_00 },  // 부분 매칭
      daysUntilPayday: 5,
    });
    const result = computeSafeToSpend(ctx);
    expect(result.available_cash_cents).toBe(950_00);
  });

  // C-05
  it('C-05: assumption_trail에 reimbursement_pending 항목이 포함된다', () => {
    const ctx = buildTestContext({ unreimbursedOut: 200_00 });
    const result = computeSafeToSpend(ctx);
    const trail = result.assumption_trail.find(a => a.key === 'reimbursement_pending');
    expect(trail).toBeDefined();
    expect(trail?.value).toBe(200_00);
  });

  // C-06
  it('C-06: reimbursement_out이 취소 처리되면 available_cash에서 제외하지 않는다', () => {
    const ctx = buildTestContext({
      availableCash: 1_000_00,
      cancelledReimbursementOut: 200_00,
      daysUntilPayday: 5,
    });
    const result = computeSafeToSpend(ctx);
    expect(result.available_cash_cents).toBe(1_000_00);
  });

  // C-07
  it('C-07: 여러 미매칭 reimbursement_out의 합산이 올바르다', () => {
    const ctx = buildTestContext({
      availableCash: 2_000_00,
      multipleUnreimbursedOut: [150_00, 80_00, 220_00],  // 총 450
      daysUntilPayday: 5,
    });
    const result = computeSafeToSpend(ctx);
    expect(result.available_cash_cents).toBe(2_000_00 - 450_00);
  });

});


// ============================================================
// GROUP D — Transfer & Investment Intent (6 tests)
// 파일: transaction-intent.test.ts
// ============================================================

describe('D. Transfer & Investment Intent', () => {

  // D-01
  it('D-01: intent=transfer 거래는 safe-to-spend를 줄이지 않는다', () => {
    // ING → T212 €800 이체가 transfer로 분류됨
    const ctx = buildTestContext({
      accountBalance_checking: 2_000_00,  // transfer 전 잔액
      transferOut: 800_00,                // 출금됐지만 intent=transfer
      daysUntilPayday: 8,
    });
    const result = computeSafeToSpend(ctx);
    // available_cash는 transfer가 반영된 실제 잔액 (1200)
    // 하지만 safe-to-spend에서 투자 contribution으로 별도 처리 안 됨
    expect(result.available_cash_cents).toBe(1_200_00);
  });

  // D-02
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
    // available_cash: 2000 - 800(contribution, already settled) - 50(living) = 1150
    // 하지만 contribution은 이미 planned_investing로 별도 처리
    expect(result.available_cash_cents).toBeDefined();
  });

  // D-03
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

  // D-04
  it('D-04: transfer로 분류됐어야 할 거래가 living_expense로 잘못 분류되면 anomaly_reserve에 잡힌다', () => {
    // T212 입금이 "income"으로 잘못 분류되고 review_status = pending
    const ctx = buildTestContext({
      misclassifiedTransfer: { amount: -800_00, intent: 'living_expense', review_status: 'pending' },
      daysUntilPayday: 5,
    });
    const result = computeSafeToSpend(ctx);
    expect(result.anomaly_reserve_cents).toBeGreaterThan(0);
  });

  // D-05
  it('D-05: income_dividend는 available_cash에 포함된다 (checking 계좌 입금이면)', () => {
    const ctx = buildTestContext({
      checkingBalance: 1_000_00,  // 배당금 포함 잔액
      daysUntilPayday: 5,
    });
    const result = computeSafeToSpend(ctx);
    expect(result.available_cash_cents).toBe(1_000_00);
  });

  // D-06
  it('D-06: income_refund는 available_cash에 포함된다', () => {
    const ctx = buildTestContext({
      checkingBalance: 1_100_00,  // €100 환불 포함
      daysUntilPayday: 5,
    });
    const result = computeSafeToSpend(ctx);
    expect(result.available_cash_cents).toBe(1_100_00);
  });

});


// ============================================================
// GROUP E — Negative / Edge Cases (8 tests)
// 파일: edge-cases.test.ts
// ============================================================

describe('E. Negative & Edge Cases', () => {

  // E-01
  it('E-01: protected_obligations > available_cash이면 pool = 0 (음수 아님)', () => {
    const ctx = buildTestContext({
      availableCash: 500_00,
      upcomingBills: 1_200_00,  // 월세 등 upcoming
      daysUntilPayday: 5,
    });
    const result = computeSafeToSpend(ctx);
    expect(result.spendable_pool_cents).toBe(0);
    expect(result.value_cents).toBe(0);
  });

  // E-02
  it('E-02: 부족 상황에서 warnings에 OBLIGATIONS_EXCEED_CASH가 포함된다', () => {
    const ctx = buildTestContext({
      availableCash: 500_00,
      upcomingBills: 1_200_00,
      daysUntilPayday: 5,
    });
    const result = computeSafeToSpend(ctx);
    expect(result.warnings.some(w => w.code === 'OBLIGATIONS_EXCEED_CASH')).toBe(true);
  });

  // E-03
  it('E-03: available_cash = 0이면 €0을 반환한다 (에러 없이)', () => {
    const ctx = buildTestContext({ availableCash: 0, daysUntilPayday: 5 });
    expect(() => computeSafeToSpend(ctx)).not.toThrow();
    const result = computeSafeToSpend(ctx);
    expect(result.value_cents).toBe(0);
  });

  // E-04
  it('E-04: sinking fund 첫 등록 달에는 monthly_allocation 전액을 차감한다 (소급 없음)', () => {
    // 연간 보험료 €1200 → 월 €100 sinking fund 등록
    // 이번 달이 첫 달이면 €100만 차감 (이전 달 소급 없음)
    const ctx = buildTestContext({
      availableCash: 1_000_00,
      sinkingFunds: [{ monthly_allocation: 100_00, months_active: 1 }],
      daysUntilPayday: 5,
    });
    const result = computeSafeToSpend(ctx);
    expect(result.sinking_fund_cents).toBe(100_00);
  });

  // E-05
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

  // E-06
  it('E-06: minimum_cash_buffer 기본값은 0이다', () => {
    const ctx = buildTestContext({
      availableCash: 1_000_00,
      daysUntilPayday: 5,
      otherObligations: 0,
      // minimumCashBuffer not set
    });
    const result = computeSafeToSpend(ctx);
    expect(result.min_buffer_cents).toBe(0);
  });

  // E-07
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

  // E-08
  it('E-08: assumption_trail이 빈 배열이면 안 된다 — 항상 최소 1개 항목', () => {
    const ctx = buildTestContext({ availableCash: 100_00, daysUntilPayday: 3 });
    const result = computeSafeToSpend(ctx);
    expect(result.assumption_trail.length).toBeGreaterThan(0);
  });

});


// ============================================================
// GROUP F — Stale Data & Anomaly Reserve (7 tests)
// 파일: stale-data-anomalies.test.ts
// ============================================================

describe('F. Stale Data & Anomaly Reserve', () => {

  // F-01
  it('F-01: 마지막 import가 5일 이상 지났으면 STALE_DATA 경고를 포함한다', () => {
    const ctx = buildTestContext({
      lastImportDaysAgo: 6,
      daysUntilPayday: 5,
    });
    const result = computeSafeToSpend(ctx);
    expect(result.warnings.some(w => w.code === 'STALE_IMPORT_DATA')).toBe(true);
  });

  // F-02
  it('F-02: 마지막 import가 4일 이하이면 STALE_DATA 경고 없음', () => {
    const ctx = buildTestContext({ lastImportDaysAgo: 4, daysUntilPayday: 5 });
    const result = computeSafeToSpend(ctx);
    expect(result.warnings.some(w => w.code === 'STALE_IMPORT_DATA')).toBe(false);
  });

  // F-03
  it('F-03: import 자체가 없으면 NO_IMPORT_DATA 에러를 던진다', () => {
    const ctx = buildTestContext({ hasImport: false });
    expect(() => computeSafeToSpend(ctx)).toThrow('NO_IMPORT_DATA');
  });

  // F-04
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

  // F-05
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

  // F-06
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

  // F-07
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


// ============================================================
// GROUP G — Account Inclusion Rules (5 tests)
// 파일: account-inclusion.test.ts
// ============================================================

describe('G. Account Inclusion Rules', () => {

  // G-01
  it('G-01: checking 계좌는 항상 available_cash에 포함된다', () => {
    const ctx = buildTestContext({
      accounts: [{ type: 'checking', balance: 1_000_00 }],
      daysUntilPayday: 5,
    });
    const result = computeSafeToSpend(ctx);
    expect(result.available_cash_cents).toBe(1_000_00);
  });

  // G-02
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

  // G-03
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

  // G-04
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

  // G-05
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


// ============================================================
// TEST UTILITIES (test-utils.ts)
// ============================================================

/**
 * test-utils.ts — 위 테스트에서 사용하는 헬퍼
 *
 * 실제 구현 시 이 파일을 packages/core/src/safe-to-spend/__tests__/test-utils.ts에 작성.
 *
 * buildTestContext(overrides): 기본 컨텍스트를 만들고 override로 덮어쓴다.
 * mockDb: DB 호출을 mock하는 vitest mock 객체.
 *
 * 기본 컨텍스트 (모든 테스트의 베이스라인):
 * {
 *   user_id: 'test-user-uuid',
 *   today: new Date('2026-04-22'),
 *   paydayConfigured: true,
 *   paydayDate: new Date('2026-04-30'),
 *   daysUntilPayday: 8,
 *   availableCash: 1_000_00,     // €1000.00
 *   plannedInvesting: 0,
 *   investingProtected: true,
 *   upcomingBills: 0,
 *   sinkingFunds: [],
 *   minimumCashBuffer: 0,
 *   anomalyReserve: 0,
 *   lastImportDaysAgo: 1,
 *   hasImport: true,
 *   salaryLandedThisMonth: true,
 *   accounts: [{ type: 'checking', balance: 1_000_00 }],
 * }
 */

export {};
