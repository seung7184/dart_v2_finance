# Dart Finance — Master Venture Report

**A calm money app that tells you what you can safely spend today — without ignoring your investments.**

Version 1.2 · 2026-04-22
Owner: Seungjae
Status: Pre-MVP planning

**v1.2 변경점**
- 새 9장 "AI 에이전트 워크플로우" 삽입: Claude Design (2026-04-17 출시) + Claude Code + Codex의 역할 분담과 구체적 프롬프트
- 기존 9–18장 전부 +1 번호 재배치 (이제 10–19장)
- 13장 개발 로드맵에 Phase별 AI 플레이북 상세화
- 17장 준비 문서 체크리스트에 AI 관련 산출물 3개 추가
- 부록 B: Claude Design / Claude Code 프롬프트 템플릿 모음 신설

---

## 0. 이 문서는 무엇인가

이 문서는 Dart Finance를 기획 · 개발 · 출시하기 위한 **단일 마스터 보고서**다.
두 개의 선행 문서를 합쳐 하나의 제품으로 재정의한 결과물이다:

1. **SJ-Investment 상세 기획서** — 투자 운영 터미널, transaction-first, auditability
2. **EU Budget App Venture Report** — 유럽 시장 safe-to-spend 소비자 금융 앱

합친 결과는 "가계부 + 투자 추적" 따로 두 개가 아니라, **하나의 money operating system**이다.
핵심 약속은 단 하나:

> **"오늘 얼마를 써도 되는지, 그리고 그 판단에 투자 계획과 현금 버퍼를 함께 반영해준다."**

---

## 목차

1. Executive Summary
2. 제품 정의와 포지셔닝
3. 타깃 유저
4. 해결하는 문제와 차별점
5. 제품 구조 (Cashflow OS + Investment OS)
6. 정보 구조와 화면 흐름
7. 데이터 모델
8. 기술 스택 재구상 (혼자 + AI 에이전트 개발에 최적화)
9. **AI 에이전트 워크플로우 (Claude Design + Claude Code + Codex)** ← v1.2 신설
10. MVP 범위와 기능 체크리스트
11. 수익 모델과 가격 전략
12. 법률 · 컴플라이언스 기준선 (EU/GDPR)
13. 개발 로드맵 (Phase 0 → Phase 10, AI 플레이북 포함)
14. 12개월 로드맵
15. 성공 지표 (KPI)
16. 리스크와 대응
17. 브랜드 · 로고 방향
18. 준비해야 할 문서 목록 (전체 체크리스트)
19. 다음 액션

부록 A — 결정 로그
부록 B — AI 프롬프트 템플릿 모음 (v1.2 신설)

---

## 1. Executive Summary

**Dart Finance**는 유럽 거주, 월급 받으며 꾸준히 투자하는 직장인을 위한 **investor-aware safe-to-spend** 앱이다.
일반 가계부는 투자 이체를 지출로 잡아 숫자가 틀리고, 일반 portfolio tracker는 생활 cashflow와 단절되어 있다.
Dart Finance는 이 둘을 **하나의 ledger**로 묶고, 그 위에 **"오늘 안전하게 쓸 수 있는 금액"** 이라는 단일 지표를 제공한다. 이 숫자는 장기 자산 계획 전체를 확정적으로 보장하는 값이 아니라, **투자 계획을 무시하지 않은 cashflow-confidence number**로 설계한다.

### 핵심 전략 결정 (확정됨)

| 항목 | 결정 |
|---|---|
| 제품 한 줄 정의 | A calm money app that tells you what you can safely spend today — without ignoring your investments. |
| 초기 타깃 | 월급 받고 생활비 관리하며 꾸준히 투자하는 유럽 거주 직장인 |
| 초기 진입 시장 | 네덜란드를 테스트 마켓, 영어 기본 + 네덜란드어/한국어 V1.5 |
| 입력 방식 | Manual + CSV-first, bank sync는 V2 이후 |
| 제품명 / 브랜드 | **Dart Finance**, Dart lettermark 로고 유지 |
| 플랫폼 | Web + Mobile 동시, monorepo, 공유 도메인 |
| 개발 체제 | 1인 개발, Claude Code + Claude Design + Codex 중심 |
| 수익 모델 | Freemium, 월 €4–7 / 연 €36–60 |

### 초기 유료 코어 타깃

* 월급 직장인
* ETF 중심 DCA 투자 습관 보유
* 은행/브로커 계좌가 2–3개 이상으로 분산됨
* CSV export에 거부감이 없음
* 기존 budget app이 투자 이체를 지출로 잡아 불만이 있었음

### 기존 자산 활용

* **SJ-Investment**: transaction/import/reconciliation 로직, investment ledger 철학 → **코드 재활용이 아니라 도메인 모델 재활용**으로 이관
* **Dart Finance (기존 프로토타입)**: D lettermark 로고, 기존 CSV 파이프라인 개념, Dutch Box 3 감각 → V1에서 계승

### 6개월 MVP 목표

웹 + 모바일 동시 릴리즈, 무료 플랜 + 프리미엄 플랜, 수동 + CSV 입력, recurring bills, safe-to-spend, 투자 이체 분리, 월간 리뷰. 네덜란드 기반 private beta 50–150명.

---

## 2. 제품 정의와 포지셔닝

### 2.1 한 줄 정의 (대외)

> **A calm money app that tells you what you can safely spend today — without ignoring your investments.**

보조 카피로는 아래 표현을 우선 사용한다:

> **Dart helps you know what you can safely spend today — while keeping your investing plan in view.**

초기 대외 카피에서는 "장기 자산 계획까지 완전히 보장한다"는 인상을 주는 문구는 피한다. V1은 wealth planning 엔진이 아니라, **investing-aware cashflow confidence**를 주는 제품이기 때문이다.

### 2.2 제품 철학 (내부)

> **A transaction-driven money operating system that connects budgeting and investing.**

대외적으로는 소비자 친화적으로 보이되, 내부 설계는 power-user용 operating system 수준으로 간다. 이 이중 구조가 Dart Finance의 장기 차별점이다.

### 2.3 포지셔닝 맵

```
                    투자 기능 풍부
                         ▲
                         │
       Trading 212 ──────┼───────  (우측 상단 비어있음)
       DeGiro            │               ← Dart Finance
                         │                 목표 위치
                         │
   ─ 자동화·sync ────────┼────────── 수동·CSV first ─►
                         │
           Monarch       │     YNAB
           Rocket Money  │     Tiller
                         │
                         ▼
                    투자 기능 부재
```

Dart Finance는 **"manual/CSV + 투자 인식 + 유럽 프라이버시"** 4분면에서 빈 자리를 차지한다.

### 2.4 포지셔닝 원칙

* **Investor-aware** — 일반 가계부와 가장 큰 차이
* **Calm** — YNAB 식 "봉투 예산 훈련" 강요하지 않음
* **Privacy-first** — EU 사용자 핵심 가치, bank sync 없는 것이 장점
* **Traceable** — 모든 숫자는 근거 거래와 가정까지 되짚을 수 있음
* **Bilingual-native** — 영어 · 네덜란드어 · 한국어 (V1.5)

---

## 3. 타깃 유저

### 3.1 Primary Persona — "투자하는 직장인"

**이름**: Lars, 32세, 암스테르담 거주, senior product analyst

**재무 상황**:
* 월급 €4,200 (Rabobank salary account)
* ING 생활비, T212 투자 (VWCE + SXR8), 비상금 ING Savings
* 연간 보험료, 휴가비, 자동차세 등 비정기 비용 존재
* 월 €800–1000 투자 (ETF DCA)

**불편**:
* 가계부 앱은 T212 이체를 "지출"로 잡아 숫자가 깨짐
* Excel 스프레드시트로 수기 정리하지만 유지가 어려움
* Portfolio tracker는 생활비와 연결되지 않아 "이번 달 얼마 투자해도 되지?"를 답해주지 않음

**원하는 것**:
* 매일 아침 열면 "오늘 €X 쓸 수 있음" 한 줄
* 월 투자 이체가 생활 버퍼를 깨지 않는지 확인
* CSV 한 번 올리면 분류가 자동으로 되는 수준
* 내 데이터가 third-party에 팔리지 않는다는 신뢰

### 3.2 Secondary Persona — "체계적인 프리랜서"

불규칙 소득, 연간 납세, 투자까지 스스로 관리. CSV-first에 특히 잘 맞음.

### 3.3 유료 전환 가능성이 가장 높은 코어 세그먼트

초기 가입자 전체보다 더 중요한 것은 **누가 실제로 돈을 낼지**다. Dart Finance의 초기 유료 코어는 아래 조건을 만족하는 사용자다.

* 은행, 저축, 브로커 계좌가 2개 이상으로 분산되어 있음
* ETF 또는 인덱스 중심의 월간 투자 습관이 있음
* 기존 budget app의 transfer / reimbursement 처리에 불만이 있음
* CSV export/import를 감수할 만큼 숫자 정확성을 중시함
* 단순 소비 기록보다 "이번 달 얼마 투자해도 되는지"를 알고 싶어함

### 3.4 Anti-persona — 피해야 할 초기 타깃

* 완전한 금융 초보자 (onboarding 복잡도 감당 못함)
* 가족 공동 가계부 유저 (V1 기능 밖)
* 실시간 bank sync 필수 유저
* 세무 최적화, 부채 관리가 주 목적인 유저

---

## 4. 해결하는 문제와 차별점

### 4.1 기존 Budget App이 못하는 것

| 문제 | 구체적 예 |
|---|---|
| Transfer가 지출처럼 잡힘 | ING → T212 €500이 "식비 €500"처럼 보임 |
| Reimbursement 처리 부정확 | 동료 대신 결제 후 받은 돈이 "수입"으로 잡힘 |
| Recurring/annual 신뢰 낮음 | 연 1회 보험료 €1,200이 월 예산 계산에 반영 안 됨 |
| 투자 맥락 없음 | "이번 달 얼마 투자 가능?"에 답 못함 |

### 4.2 기존 Portfolio Tracker가 못하는 것

| 문제 | 구체적 예 |
|---|---|
| 생활 cashflow와 단절 | 포트폴리오는 보이지만 월 현금 여유는 모름 |
| 월간 투자 가능액 미표시 | "추가 매수해도 될까?"를 모름 |
| 예산 맥락 없음 | 비정기 지출이 다가오는지 알 수 없음 |

### 4.3 Dart Finance의 5가지 차별점

1. **Investor-aware safe-to-spend** — 투자 이체까지 반영한 오늘 사용 가능 금액
2. **Transfer/reimbursement intent model** — 금액이 아니라 **의도** 단위로 거래 분류
3. **CSV-first with strong review** — bank sync 없이도 power user가 쓸 수 있는 import UX
4. **Auditability** — 모든 숫자가 거래와 가정으로 되짚어진다 ("why this number?")
5. **Web + Mobile 역할 분리** — 모바일 = 빠른 판단, 웹 = 설정 · 검토 · 감사

---

## 5. 제품 구조 — Two Operating Layers

Dart Finance는 **하나의 제품, 두 개의 operating layer, 하나의 브릿지**로 구성된다.

### 5.1 Layer A — Cashflow OS

**역할**: 생활 자금의 흐름과 판단

**기능**:
* 수입 (salary, dividends, refunds, reimbursements)
* Recurring bills (월/연 정기)
* Sinking funds (비정기 지출 적립)
* Transfers (계좌 간 이동)
* Month rollover
* **Safe-to-spend 계산** ← 핵심 산출물

### 5.2 Layer B — Investment OS

**역할**: 투자 자산과 의사결정 흐름

**기능**:
* 투자 transaction import (T212, DeGiro CSV)
* Holdings derivation (from transactions)
* Monthly contribution tracking
* Benchmark comparison (V1.5)
* Audit ledger
* Investment-aware planner

### 5.3 Bridge — 두 layer를 잇는 규칙

| 규칙 | 설명 |
|---|---|
| 투자계좌 이체 = asset transfer | 지출 아님, safe-to-spend 차감 아님 |
| 배당금 = income-like inflow | salary와 분리 표시 |
| 투자 매수/매도 = portfolio movement | 생활 지출 아님 |
| 투자 contribution은 월간 plan에 분리 표시 | "이번 달 투자 예정 €800" 별도 카드 |
| "€X 투자하면 safe buffer 얼마 남나" 시뮬레이션 | V1.2 이후 검토, 초기 홈에서는 후순위 |

이 브릿지가 Dart Finance의 **진짜 차별점**이다. 이게 무너지면 그냥 "투자 기능 붙은 가계부"가 된다.

---

## 6. 정보 구조와 화면 흐름

### 6.1 모바일 — 오늘의 판단 (Daily Decisions)

모바일은 **reassurance** 전용. 첫 화면에 "오늘 안심하고 쓸 수 있는 금액"을 크게 보여준다.

**홈 스크린 카드 순서 (V1)**:
1. Safe to spend today — 큰 숫자
2. This month remaining
3. Next bills due (3건)
4. Planned investing this month
5. Quick add expense (button)
6. Recent transactions (5건)

**V1에서 일부러 뒤로 미루는 것**:
* What if: "If I invest €X now, safe buffer becomes €Y" 시뮬레이션
* 과도한 차트/성과 위젯
* investment analytics drill-down

**주요 화면**:
* 홈
* Quick add (keypad + category)
* Recurring bills
* Upcoming bills
* Transactions list
* Investing overview (readonly)
* Settings

### 6.2 웹 — 검토와 통제 (Review & Control)

웹은 **control** 전용. SJ-Investment의 operations center 철학 계승.

**대시보드 섹션**:
1. Cashflow summary (월 기준)
2. Investment book summary
3. Recent imports + reconciliation needed
4. Budget anomalies
5. Upcoming large bills
6. Portfolio changes
7. Monthly plan vs actual

**주요 페이지**:
* Dashboard
* Transactions (full grid, rules, bulk edit)
* Imports (CSV upload, field mapping, dedup)
* Recurring series
* Budget / Sinking funds
* Investments (holdings, transactions, performance)
* Reports (monthly, yearly, tax)
* Settings (accounts, categories, rules, subscription)

### 6.3 Admin Console

초기에는 별도 제품 화면으로 만들지 않는다. Supabase / PostHog / Stripe / RevenueCat / Sentry 대시보드와 간단한 내부 페이지 조합으로 운영하고, 독립적인 admin console은 PMF 이후 검토한다.

---

## 7. 데이터 모델

SJ-Investment의 transaction-first 철학을 **그대로 계승**하되, cashflow intent를 1급 시민으로 승격시킨다.

### 7.1 핵심 엔티티

```
User ─── Account ─── Transaction ─── ImportBatch
             │           │
             │           ├── TransferLink
             │           ├── ReimbursementLink
             │           └── RecurringSeries
             │
             ├── Category
             ├── Rule
             └── BudgetPeriod ─── SinkingFund
```

### 7.2 Account Types

* `checking` — 생활 주계좌 (ING)
* `savings` — 저축 (ING Savings, Rabobank)
* `credit_card` — 신용카드
* `brokerage` — 투자 계좌 (T212, DeGiro)
* `pension` — 연금 wrapper
* `cash` — 현금
* `manual_external` — 수기 추적용

### 7.3 Transaction Intent ← **핵심**

금액만 보지 않고 **intent**를 필수 필드로 둔다.

* `living_expense`
* `recurring_bill`
* `income_salary`
* `income_dividend`
* `income_refund`
* `transfer` (계좌 간)
* `reimbursement_out` / `reimbursement_in`
* `investment_contribution`
* `investment_buy` / `investment_sell`
* `fee`
* `tax`
* `adjustment`

Safe-to-spend 엔진은 이 intent를 보고 계산한다. 예를 들어 `transfer`와 `investment_contribution`은 safe-to-spend에서 차감되지 않는다 (대신 `planned investing`에 표시).

### 7.4 Safe-to-spend 계산식 (v1 초안)

```
available_cash
  = sum(checking + cash + user_enabled_accessible_savings)

protected_obligations
  = upcoming_recurring_bills_before_next_payday
  + sinking_fund_monthly_allocation
  + minimum_cash_buffer
  + planned_investment_contribution_this_month
  + unreviewed_anomalies_reserve

safe_to_spend_today
  = max(0, available_cash - protected_obligations) / days_until_next_payday
```

이 계산식은 **확정본이 아니라 제품 엔진 초안**이다. 실제 구현 전 `23_Safe_To_Spend_Engine_Spec.md`에서 아래 정책을 반드시 먼저 확정한다.

* `accessible_savings`에 어떤 계좌를 포함할지
* planned investment contribution을 기본적으로 보호할지, 사용자 설정으로 둘지
* payday 기준과 month-end 기준 중 어떤 모델을 우선 채택할지
* 신용카드 pending settlement를 V1에서 반영할지
* 연간 비용을 sinking fund에 언제부터 배분할지
* reimbursement expected 상태를 어떤 보수성으로 반영할지

**모든 구성 요소는 UI에서 tap-through 가능**해야 한다. "왜 €37인가?" → 근거 거래와 가정까지 드릴다운.

### 7.5 Safe-to-spend 엔진 원칙

1. **Trust over cleverness** — 똑똑해 보이는 것보다 설명 가능한 계산이 우선
2. **Policy before math** — 수식보다 먼저 계좌 포함 규칙, 의도 분류 규칙, 보호 항목 규칙을 확정
3. **Visible assumptions** — 예상 투자금, 최소 버퍼, 미검토 이상치 reserve는 화면에 분리 표시
4. **User override** — savings 포함 여부, planned investing 보호 여부 등은 차후 설정값으로 열어둘 수 있게 설계
5. **First trusted number** — 첫 숫자가 맞다고 느껴져야 리텐션이 생긴다

### 7.6 Derived Views

같은 ledger에서 파생되는 뷰:

* Budget view (월별 category 지출)
* Cashflow forecast (30일 예측)
* Portfolio holdings view (positions from transactions)
* Benchmark view (V1.5)
* Import audit view
* Monthly planner view

---

## 8. 기술 스택 재구상

**전제**: 1인 개발, Claude Code + Claude Design + Codex 주 사용, monorepo, 웹 + 모바일 동시 출시.

이 전제에서는 **"AI 에이전트가 가장 잘 다루는 스택"** 이 최우선이다. 에이전트 친화적 = 문서 풍부 + TS 일관성 + 구조가 예측 가능한 스택.

### 8.1 권장 스택

| Layer | 선택 | 근거 |
|---|---|---|
| Monorepo | **Turborepo + pnpm** | TS 기반, Vercel 표준, 에이전트 친화 |
| 공유 도메인 | `packages/core` (TypeScript) | money engine, validation, types 단일 소스 |
| 웹 | **Next.js 15 (App Router)** | SSR, API routes, SEO 마케팅 페이지, Vercel 배포 |
| 모바일 | **Expo (React Native) + expo-router** | iOS/Android 동시, OTA, 웹과 코드 공유 |
| UI (공통) | **NativeWind + shadcn/ui** | v1.2 확정. Tamagui는 학습곡선 + 에이전트 학습량 부족. shadcn은 Claude Code가 압도적으로 잘 다루고 Claude Design handoff 번들과 정합 |
| 백엔드 | **Supabase** (Postgres + Auth + Storage + RLS) | 1인 개발에 가장 빠름, EU 리전 선택 가능, RLS로 보안 |
| ORM | **Drizzle ORM** | Dart Finance 기존 선택과 호환, TS 네이티브, 마이그레이션 명확 |
| 인증 | Supabase Auth (email + magic link + Apple/Google) | 표준 흐름 |
| 결제 | **RevenueCat** (모바일) + **Stripe** (웹) | 업계 표준 조합 |
| 분석 | **PostHog** (self-host 옵션, EU 리전) | GDPR 친화 |
| 크래시/에러 | **Sentry** | EU 리전 |
| CI/CD | **GitHub Actions + Vercel + EAS** | 에이전트가 쉽게 관리 |
| 인프라 | Vercel (웹), Supabase (DB), EAS (모바일 빌드) | 운영 부담 최소 |

### 8.2 권장 이유 요약

* **왜 Supabase인가**: 1인 개발자가 Auth + DB + Storage + Realtime + EU 리전을 한 번에 가져가는 가장 빠른 길. 나중에 Postgres 그대로 self-host로 탈출 가능.
* **왜 Next.js + Expo 조합인가**: 둘 다 React 기반이라 `packages/core`에 로직, UI 컴포넌트 상당수도 공유 가능. Expo가 웹 빌드도 지원해서 진짜 monorepo로 갈 수 있음.
* **왜 Drizzle인가**: Prisma보다 가볍고, 스키마가 TS로 정의돼서 Claude Code가 읽고 수정하기 쉬움. 기존 Dart Finance 경험과 이어짐.
* **왜 FastAPI를 버리는가**: SJ-Investment의 Python 코드는 **코드로 재활용하지 않고 도메인 지식으로만 재활용**. 이유: 1인 개발자가 Python 백엔드 + TS 프론트 + RN 모바일 세 개 언어를 유지하는 건 Claude Code로도 비효율. 단일 TS 코드베이스가 에이전트 작업에 압도적으로 유리.

### 8.3 Monorepo 구조

```
dart-finance/
├── apps/
│   ├── web/              # Next.js 15
│   ├── mobile/           # Expo
│   └── admin/            # 필요시 생성, 초기에는 선택 사항
├── packages/
│   ├── core/             # 도메인 로직 (money engine, intents, safe-to-spend)
│   ├── db/               # Drizzle 스키마 + 마이그레이션
│   ├── ui/               # 공유 UI 컴포넌트
│   ├── config/           # eslint, tsconfig, tailwind
│   └── csv-parsers/      # 은행별 CSV 파서 (ING, T212, DeGiro, Rabobank)
├── supabase/             # migrations, RLS policies, seed
├── .github/workflows/
├── CLAUDE.md             # AI agent rules (Dart Finance 규칙 승계)
└── turbo.json
```

### 8.4 CLAUDE.md 승계

기존 Dart Finance 규칙을 이 프로젝트에도 가져간다:

1. CLAUDE.md 먼저 읽기
2. 편집 전 관련 파일 읽기
3. `pnpm tsc --noEmit` 검증
4. DO NOT TOUCH: Auth / Supabase config / .env / CLAUDE.md
5. Currency: `Intl.NumberFormat('nl-NL')` 기본, i18n로 확장
6. Colors: CSS 변수만
7. Sidebar: always dark

### 8.5 보안 기본선

* Supabase RLS로 user_id 격리 (모든 테이블)
* EU 리전 (Frankfurt/Ireland)
* PII는 컬럼 암호화 (pgsodium)
* API key rotation 정책
* 감사 로그: audit_log 테이블

---

## 9. AI 에이전트 워크플로우

이 섹션은 v1.2에서 신설됐다. 1인 개발자가 웹+모바일 제품을 6개월 안에 내려면 AI 에이전트 활용을 "있으면 좋은 것"이 아니라 **빌드 시스템의 일부**로 다뤄야 한다. 여기서는 세 도구의 역할 분담, 각각을 언제·어떻게 쓰는지, 그리고 출력물을 어떻게 코드베이스에 통합할지까지 구체적으로 정한다.

### 9.1 도구 3종의 역할 분담

| 도구 | 주 역할 | 쓰는 시점 | 쓰지 말아야 할 때 |
|---|---|---|---|
| **Claude Design** | 브랜드/디자인 시스템, 화면 목업, 인터랙티브 프로토타입, 피치덱, 앱스토어 자산 | Phase 1–2 (디자인), Phase 7–8 (런치 자산) | 프로덕션 코드 직접 생성 — 참고용으로만 |
| **Claude Code** | 구현 전담. 코드베이스 전체 컨텍스트 필요한 모든 작업 | Phase 3 이후 전 단계 | 디자인 탐색, 추상적 브레인스토밍 |
| **Codex** | Second opinion, 알고리즘 스니펫, Claude Code가 막힐 때 대안 검증 | 특정 함수/알고리즘 단위 | 레포 전체 컨텍스트 필요한 작업 |

**원칙**: Claude Design이 출력하는 코드는 **참고용**이다. 그대로 프로덕션에 쓰지 말고 Claude Code가 프로젝트 구조(`packages/core`, shadcn/ui, Drizzle 타입, i18n 규칙)에 맞게 재구현한다. 이걸 놓치면 코드베이스 일관성이 빠르게 무너진다.

### 9.2 Claude Design — 사실 확인 (2026-04-22 기준)

이 시점에서 검증된 사실만 나열한다. 훈련 데이터 아닌 공식 문서·출시 기사 기준.

* **출시**: 2026-04-17, Anthropic Labs 아래 research preview
* **모델**: Claude Opus 4.7 (2026-04-16 출시, 비전 해상도 2,576px)
* **접근**: claude.ai 왼쪽 사이드바의 **팔레트 아이콘**
* **구독 요건**: Pro / Max / Team / Enterprise. 무료 티어 불가. Enterprise는 admin이 조직 설정에서 켜야 함
* **사용량 한도**: 기존 chat / Claude Code 쿼터와 **별도**의 주간 한도. 초과 시 추가 사용량 설정 가능 (pay-as-you-go)
* **입력**: 텍스트 프롬프트, 이미지, DOCX/PPTX/XLSX, **코드베이스**, 웹 캡처 도구 (기존 사이트에서 요소 가져오기)
* **출력/Export**: 조직 내부 URL, 폴더 저장, **PDF / PPTX / HTML / Canva / Claude Code handoff 번들**. **Figma export는 없음**
* **디자인 시스템**: 온보딩 시 코드베이스와 디자인 파일을 읽어 팀별 디자인 시스템 자동 생성. 이후 모든 프로젝트에 자동 적용, 여러 시스템 동시 운용 가능
* **정교한 편집**: 인라인 코멘트, 직접 편집, Claude가 만드는 커스텀 슬라이더 (간격/색/레이아웃 실시간 조정)

**주의/불확실**:
* 주간 토큰 한도의 구체적 숫자는 플랜별로 공개되지 않았고, 첫 주 실사용으로 측정해야 한다. The New Stack 리뷰어의 "주 50% 소진" 보고는 1회 경험이므로 일반화하지 않는다.
* research preview이므로 기능과 한도가 수 주 내에 바뀔 가능성이 있다.

### 9.3 Dart Finance에서 Claude Design을 쓰는 5가지 용도

#### 9.3.1 브랜드/디자인 시스템 학습 — Phase 2 시작 시 1회

첫 온보딩 때 Dart Finance의 브랜드 핵심을 입력해 디자인 시스템을 생성한다. 이후 모든 목업이 이걸 자동 적용한다.

**프롬프트 템플릿** (복붙 후 수정):
```
Create a design system for "Dart Finance" — a calm European money app for
employed investors. Brand pillars: calm, clear, honest, european, privacy-first.

Constraints:
- Product personality: Linear/Monzo hybrid, not playful, not corporate-stuffy
- Primary typeface: Plus Jakarta Sans (inherit from existing Dart lettermark)
- Color system: neutral base + 1 accent; no gratuitous red — even negatives are
  muted; dark sidebar always; light and dark mode both required
- Motion: restrained; no celebratory confetti or animations for money events
- Density: medium. Numbers are the hero; all other UI defers to them.
- Must work on small mobile home screen (primary KPI "Safe to spend today"
  must feel calm, not alarming, regardless of value sign)

Output: color tokens, type scale, spacing scale, base component set
(Button, Input, Card, List Row, KPI block, Badge, Tabs, Modal).
Generate both web and mobile variants. Export as Claude Code handoff bundle.
```

#### 9.3.2 핵심 15개 화면 목업 — Phase 1–2

와이어프레임 수준에서 UI 방향을 빠르게 확정하기 위함. **Figma를 거치지 않는다**. Claude Design에서 바로 생성하고, Claude Code로 handoff.

우선 15개 선정 기준: MVP에서 유저가 반드시 통과하는 화면 + 판단이 갈릴 화면.

**모바일 (8개)**:
1. 홈 — Safe to spend today
2. Quick add expense
3. Recent transactions (리스트 + 상세)
4. Upcoming bills
5. Planned investing 카드 상세
6. Onboarding 1–4단계 (계정, 월급, recurring, buffer)
7. 계정 목록 + 추가
8. Settings

**웹 (7개)**:
1. Dashboard (cashflow + investment 요약)
2. Transactions grid (필터/편집/bulk)
3. CSV import — field mapping 화면
4. CSV import — dedup/리뷰 화면
5. Recurring series 관리
6. Budget / Sinking funds
7. "Why this number?" 드릴다운 화면 ← **가장 중요**

#### 9.3.3 인터랙티브 프로토타입 — Phase 1 말에 1회

15개 중 핵심 5개(모바일 홈, 모바일 quick add, 웹 대시보드, CSV import mapping, "Why this number?")는 클릭 가능한 프로토타입으로 만들어 유저 인터뷰 5명에게 테스트한다. 코드 리뷰나 PR 없이 바로 공유.

#### 9.3.4 피치덱 / 런치 자산 — Phase 8

이 마스터 보고서에서 요지를 뽑아 Claude Design에 넣으면 브랜드 시스템이 적용된 피치덱을 생성한다. PPTX로 export 후 투자자/파트너 미팅용 수정.

**동시에 만들 자산**:
* 피치덱 (15–20 슬라이드)
* 랜딩페이지 와이어프레임
* 앱스토어 스크린샷 템플릿 (iOS/Android)
* 1-pager 영업자료

#### 9.3.5 스토어 스크린샷 배경 / 프로모 그래픽 — Phase 8–9

앱스토어 8장, Play Store 8장. Claude Design으로 화면 목업 + 카피 + 배경을 한 번에. Canva로 export해서 지역별(NL/EN/KR) 로컬라이즈.

### 9.4 Claude Code — 구현 전담

기존 프로젝트(sj-investment, Dart Finance)에서 이미 확립한 패턴을 이 프로젝트에도 그대로 이식한다.

**운영 원칙**:
1. `CLAUDE.md`를 가장 먼저 읽기 (8.4장 승계 규칙)
2. 편집 전 관련 파일 읽기
3. 편집 후 `pnpm tsc --noEmit` 검증
4. DO NOT TOUCH: Auth / Supabase config / `.env` / `CLAUDE.md`
5. Currency: `Intl.NumberFormat('nl-NL')` 기본, i18n 확장
6. Colors: CSS 변수만
7. Sidebar: always dark

**자율 실행 패턴** (sj-investment에서 유효성 확인됨):
```bash
while true; do
  claude --dangerously-skip-permissions --max-turns 200 -p "$(cat PROMPT.txt)";
  sleep 300;
done
```

단 Dart Finance는 사용자 데이터를 다루는 프로덕션 지향 앱이기 때문에 이 패턴은 **Phase 3–4 내부 기반 작업에만** 쓴다. Phase 5 이후 UI·결제·인증 관련 코드는 auto-approve 없이 수동 리뷰를 유지한다.

### 9.5 Claude Design → Claude Code handoff 실제 흐름

여기가 v1.2의 핵심이다. Claude Design의 handoff 번들을 그대로 쓰지 않고 재구현하는 구체적 절차.

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│ Claude Design    │     │ 중간 리뷰 (너)   │     │ Claude Code      │
│                  │     │                  │     │                  │
│ 화면 목업 생성   │────▶│ handoff 번들     │────▶│ 프로젝트 구조에  │
│ (HTML+CSS+JSX)   │     │ 읽고 체크리스트  │     │ 맞게 재구현      │
│                  │     │ 작성             │     │                  │
└──────────────────┘     └──────────────────┘     └──────────────────┘
                                  │                        │
                                  ▼                        ▼
                         어떤 컴포넌트를         - packages/ui 재사용
                         재사용/신규생성?        - shadcn/ui 기반
                         어떤 copy를 i18n?       - TS 타입 안전
                                                 - Drizzle 스키마 정합
```

**중간 리뷰 체크리스트 (Claude Design 출력을 Claude Code에 넘기기 전)**:
- [ ] 이 화면에 쓰인 컴포넌트 중 `packages/ui`에 이미 있는 건?
- [ ] 새로 만들 컴포넌트는? (최소화 원칙)
- [ ] 화면의 모든 텍스트 → i18n 키로 빼야 함
- [ ] 숫자/통화 포맷 → `Intl.NumberFormat('nl-NL')` 강제
- [ ] 색은 Tailwind 유틸 말고 **CSS 변수만**
- [ ] 데이터 형태 → `packages/db`의 Drizzle 스키마와 일치하는지
- [ ] Safe-to-spend 숫자 드릴다운은 `23_Safe_To_Spend_Engine_Spec.md`의 assumptions 구조와 맞는지

이 체크리스트를 거치지 않고 Claude Design 출력을 그대로 붙이면, 3개월 뒤 코드베이스가 서로 다른 디자인 토큰을 가진 화면들로 뒤섞인다.

### 9.6 Codex의 역할 (minimal)

Claude Code가 주력인 체제에서 Codex는 다음 3가지에만 쓴다:

1. **Second opinion** — Claude Code가 "불가능" 또는 "이 방식밖에 없다"고 할 때 다른 접근이 있는지 교차 검증
2. **알고리즘 스니펫** — safe-to-spend 엣지 케이스의 수식, CSV 파서의 특정 포맷 처리 같은 **self-contained** 함수
3. **빠른 문법 질문** — "TypeScript discriminated union에서 exhaustive check 어떻게 쓰나" 류

Codex에게는 레포 전체를 주지 않는다. 주어도 Claude Code만큼 잘 다루지 못하고 컨텍스트 비용만 든다.

### 9.7 비용·사용량 관리

세 도구 합쳐 월 예산을 미리 잡는다. 1인 개발 프로젝트에서 AI 비용이 월 €200을 넘으면 ROI가 흐려진다.

| 도구 | 권장 플랜 | 월 비용 | Dart Finance에서 언제 쓰는가 |
|---|---|---|---|
| Claude (Pro 또는 Max) | Pro 시작 → 부족하면 Max 승격 | €18–90 | 전 기간, Design + Code 포함 |
| Claude Design 초과분 | pay-as-you-go, 월 €30 cap | 0–30 | Phase 1–2, 8–9 집중 |
| Codex (ChatGPT Plus) | 유지 중이면 그대로 | €22 | 가끔, 유지하되 해지 가능 |

**첫 달은 Claude Pro + Codex 유지**로 시작, Phase 1의 Claude Design 사용량 측정 후 Max 업그레이드 여부 결정. Max 승격은 "주 한도 70% 이상 지속 소진" 기준.

### 9.8 해야 할 일과 하지 말아야 할 일 — 요약

**해야 할 일**
* Claude Design 브랜드 시스템은 프로젝트 시작 때 **한 번 제대로** 셋업 (이후 모든 화면에 자동 적용됨)
* Claude Design handoff 번들은 **참고용**으로 Claude Code가 재구현
* Claude Code의 `CLAUDE.md`에 9장의 규칙을 반영
* 주간 사용량 실측 — 추정치에 의존하지 않기

**하지 말아야 할 일**
* Claude Design 출력 코드를 그대로 커밋
* 같은 작업을 Claude Code와 Codex에게 동시에 시키고 "더 좋은 쪽 채택" — 시간 낭비
* Figma를 중간 단계로 끼워넣기 (혼자 개발이면 불필요). 디자이너 합류 시에만 재검토
* Phase 3 이전에 Claude Design으로 과도하게 시간 쓰기 — 목업 수렴이 안 될 때 멈출 것

---

## 10. MVP 범위와 기능 체크리스트

### 10.1 V1 (MVP) — 반드시 포함

**Onboarding**
- [ ] 계정 생성 (email + magic link)
- [ ] 월급일 설정
- [ ] 월 수입 입력
- [ ] 주요 recurring bills 입력
- [ ] 최소 cash buffer 설정
- [ ] 투자 계좌 존재 여부 + 월 투자 금액
- [ ] 계좌 목록 입력 (수기)
- [ ] 첫 safe-to-spend 숫자 출력

**Daily use (모바일 우선)**
- [ ] Home: safe to spend today
- [ ] Quick add expense
- [ ] Recent transactions
- [ ] Upcoming bills
- [ ] Planned investing 카드

**Data input**
- [ ] Manual add (웹 + 모바일)
- [ ] CSV import (ING, Rabobank, T212, DeGiro 최소)
- [ ] Field mapping UI
- [ ] Duplicate detection
- [ ] Import history
- [ ] Recurring template 저장

**Intent handling**
- [ ] Transfer tagging
- [ ] Reimbursement tagging (out + in matching)
- [ ] Investment contribution 구분
- [ ] Intent별 safe-to-spend 계산 로직

**Review (웹 우선)**
- [ ] Transactions grid (필터, 정렬, 편집)
- [ ] Rule-based categorization (기본)
- [ ] Needs-attention 큐
- [ ] Monthly overview

**Investment view**
- [ ] Total invested
- [ ] Monthly contributions
- [ ] Holdings snapshot (from transactions)
- [ ] Recent portfolio changes
- [ ] 투자 분석은 요약 수준에 한정 (deep analytics 제외)

**Trust layer**
- [ ] "Why this number?" drill-down
- [ ] 가정 (assumptions) 표시
- [ ] Unreviewed anomalies 배지
- [ ] 데이터 freshness 배지

**System**
- [ ] Subscription gating (RevenueCat + Stripe)
- [ ] Sentry + PostHog
- [ ] Privacy policy + Terms
- [ ] Support (intercom/crisp 또는 email)

### 10.2 V1에서 **뺄 것** (중요)

- ❌ Bank sync / Open banking
- ❌ Receipt OCR
- ❌ AI chatbot 전면 배치
- ❌ Household 공유 예산
- ❌ 복잡한 세무 시뮬레이션
- ❌ Deep attribution analytics
- ❌ Social / community
- ❌ 화려한 market intel feed

### 10.3 V1.5 (3–6개월 후)

- [ ] Sinking funds 고도화
- [ ] 투자 계획 추천
- [ ] Better recurring detection (ML 기반 제안)
- [ ] Portfolio-aware alerts
- [ ] Export 개선 (PDF 월간 리포트)
- [ ] 네덜란드어 / 한국어 localization
- [ ] Cross-device sync 완성

### 10.4 V2 (6–12개월)

- [ ] Bank connect pilot (PSD2 via Tink/GoCardless/Salt Edge)
- [ ] Advanced forecasting (30/60/90일)
- [ ] Advisor mode (CPA/재무설계사용 multi-client)
- [ ] Box 3 tax simulation (네덜란드)
- [ ] 벤치마크 비교 강화
- [ ] Daily report AI summary (optional, 사용자 선택)

---

## 11. 수익 모델과 가격 전략

### 11.1 Freemium 구조

| Plan | 포함 기능 | 제한 | 가격 |
|---|---|---|---|
| **Free** | Manual log, safe-to-spend, recurring bills, 1 계좌, 3개월 히스토리, 단일 기기 | 고급 분석 · CSV · 멀티 디바이스 없음 | €0 |
| **Premium Monthly** | 무제한 히스토리, CSV import, 무제한 계좌, forecasting, rules, export, 멀티 디바이스 | - | €5.99/월 |
| **Premium Annual** | 동일 | - | €49/년 (≈€4.08/월, 32% 할인) |
| **Lifetime (early adopter)** | 전체 + beta access | 선착순 500명 한정 | €149 1회 |

### 11.2 가격 설계 원칙

* 핵심 loop (safe-to-spend) 는 **무료**에서도 작동해야 함 → 습관 형성 우선
* Paywall 타이밍: 첫 CSV import 시도 시점 또는 두 번째 계좌 추가 시점
* Trial: 필요 없음 (free tier가 실질적 trial)
* 연간 플랜 비중 목표: 유료 중 35%+

### 11.3 수익 시나리오 (12개월)

| 시나리오 | 유료 사용자 | MRR | ARR |
|---|---|---|---|
| 비관 | 500 | €2,500 | €30K |
| 기본 | 2,000 | €10,000 | €120K |
| 낙관 | 5,000 | €25,000 | €300K |

기본 시나리오에 도달하려면 12개월 내 40,000 가입 (5% 유료 전환).

---

## 12. 법률 · 컴플라이언스 기준선 (EU)

**이 섹션은 법률 자문이 아니다.** 출시 전 변호사 검토 필수.

### 12.1 GDPR 필수 항목

- [ ] Privacy Policy (EN/NL/KR)
- [ ] Terms of Service
- [ ] Cookie Consent (EU 표준)
- [ ] Data Processing Agreement (Supabase, RevenueCat, Stripe, PostHog, Sentry 각각)
- [ ] Data Subject Access Request flow (앱 내 삭제/다운로드)
- [ ] Data Breach 대응 플레이북 (72시간 신고)
- [ ] DPO 지정 검토 (처리 규모에 따라)
- [ ] Records of Processing Activities (ROPA)

### 12.2 앱스토어 컴플라이언스

- [ ] App Store Privacy "Nutrition Label"
- [ ] Google Play Data Safety Section
- [ ] Subscription 자동갱신 명시
- [ ] Trial 기간 명시 (있다면)
- [ ] Cancellation path 명확 (dark pattern 금지)

### 12.3 결제/금융 규제

* V1은 **bank sync 없음** → payment services 규제 대상 아님
* 단순 소프트웨어 (budgeting tool) 카테고리 유지
* V2에서 bank connect 추가 시 → PSD2 / Open Banking API 사용 (직접 AISP 라이선스 X, Tink/GoCardless 중개)

### 12.4 보안 기본선

- [ ] 전송 TLS 1.3
- [ ] DB 저장 암호화 (Supabase 기본)
- [ ] 민감 컬럼 pgsodium 암호화
- [ ] Admin access 역할 기반
- [ ] 감사 로그
- [ ] Incident response 절차

---

## 13. 개발 로드맵 (Phase 0 → Phase 10)

1인 개발 + AI 에이전트 체제에서 현실적인 타임라인. 각 Phase의 **AI 플레이북** 칼럼은 v1.2에서 신설됐고, 9장의 도구 분담을 Phase별로 구체화한 것이다.

| Phase | 기간 | 목표 | 산출물 |
|---|---|---|---|
| Phase 0 | 1주 | Founder framing | 이 문서 (master report), 1페이지 브리프 |
| Phase 1 | 2주 | Product spec | 화면 와이어프레임, 유저 스토리, 데이터 모델 확정 |
| Phase 2 | 1주 | Design system | Color/Type/Spacing tokens, 컴포넌트 라이브러리 초안 |
| Phase 3 | 2주 | Architecture & setup | Turborepo, Supabase 프로젝트, CI/CD, Sentry, PostHog |
| Phase 4 | 3주 | Core: money engine | `packages/core` safe-to-spend 엔진, 테스트 커버리지 90%+ |
| Phase 5 | 4주 | Web MVP | Onboarding, dashboard, transactions, CSV import |
| Phase 6 | 4주 | Mobile MVP | Expo 앱, home, quick add, recurring, settings |
| Phase 7 | 3주 | Beta | 50–150명 private beta (네덜란드 중심), 활성화 지표 수집 |
| Phase 8 | 2주 | Launch readiness | 법무 검토, 스토어 자산, 지원 매크로, 모니터링 |
| Phase 9 | 1주 | Public launch | EU 출시, 모니터링 |
| Phase 10 | 지속 | Optimization | Retention, paywall, 기능 우선순위 |

**총 예상 기간: 약 5–6개월** (Phase 0–9). 실제로는 7–8개월로 잡고 여유를 두는 편이 맞다. 특히 Phase 4(엔진)와 Phase 7(베타 피드백 반영)이 예상보다 오래 걸린다.

### 13.1 1인 + AI 에이전트 생산성 가정

* Claude Code가 TypeScript 코드의 70%+ 초안 생성
* Claude Design이 UI/브랜드 자산을 웹+모바일 전역으로 생성
* Codex는 second opinion 및 스니펫용 백업
* 인간의 일: 의사결정, 디자인 방향 판정, 테스트 리뷰, PRD 작성, 비즈니스/법무, 엣지 케이스 검증

### 13.2 Phase별 AI 플레이북

#### Phase 0 — Founder framing (1주)

| 도구 | 작업 | 산출물 |
|---|---|---|
| Claude (chat) | 이 마스터 보고서 v1.2 확정 | `00_Master_Report_v1_2.md` |
| Claude (chat) | 1페이지 브리프 드래프트 | `01_Product_Brief.md` |
| Claude Design | — (아직 쓰지 않음) | — |
| Claude Code | — (아직 쓰지 않음) | — |

**이번 주 프롬프트 예**:
```
Read 00_Master_Report_v1_2.md. Extract the 1-page product brief covering:
problem, target user, one-sentence positioning, 5 differentiators,
6-month goal, 12-month bet. Max 1 page.
```

#### Phase 1 — Product spec (2주)

| 도구 | 작업 | 산출물 |
|---|---|---|
| Claude (chat) | PRD, 유저 스토리, 개인 | `02_PRD.md`, `03_User_Stories.md`, `04_Personas.md` |
| Claude Design | 브랜드 시스템 셋업 (9.3.1 프롬프트) | 디자인 시스템 v0 |
| Claude Design | 15개 핵심 화면 와이어프레임 (9.3.2) | 와이어프레임 세트 |
| Claude Design | 5개 인터랙티브 프로토타입 (9.3.3) | 유저 인터뷰용 링크 |
| Claude Code | — | — |

**산출물 체크포인트**: 이 Phase 끝에 실제 Lars 같은 사람 3–5명과 인터뷰. 프로토타입은 Claude Design URL로 바로 공유.

#### Phase 2 — Design system (1주)

| 도구 | 작업 | 산출물 |
|---|---|---|
| Claude Design | Phase 1 와이어프레임을 리뷰 + 디자인 시스템 v1 확정 | tokens export |
| Claude Design | Claude Code handoff 번들 생성 (15개 화면) | handoff.zip |
| Claude (chat) | `13_Design_System.md` 작성 | 문서화 |
| Claude Code | — | — |

이 Phase 끝에 **디자인 방향이 흔들리면 안 됨**. Phase 3 이후는 디자인 탐색을 최소화한다.

#### Phase 3 — Architecture & setup (2주) ← **Claude Code 투입 시작**

| 도구 | 작업 | 산출물 |
|---|---|---|
| Claude Code | Turborepo + pnpm 초기화 | monorepo 구조 |
| Claude Code | Supabase 프로젝트 + Drizzle 스키마 초안 | `packages/db` |
| Claude Code | CI/CD (GitHub Actions), Vercel/EAS 연결 | 파이프라인 |
| Claude Code | `CLAUDE.md` 작성 (규칙, 금지 항목) | `26_CLAUDE.md` |
| Claude (chat) | `20_Architecture.md`, `21_Data_Model.md` 작성 | 아키텍처 문서 |

**자율 실행 가능 작업** (이 Phase는 auto-approve로 돌려도 안전):
```bash
while true; do
  claude --dangerously-skip-permissions --max-turns 200 \
    -p "$(cat PHASE3_SETUP.txt)";
  sleep 300;
done
```

단 `.env`와 Supabase auth 설정은 수동으로 네가 직접.

#### Phase 4 — Core: money engine (3주) ← **가장 중요한 Phase**

| 도구 | 작업 | 산출물 |
|---|---|---|
| Claude (chat) | `23_Safe_To_Spend_Engine_Spec.md` 완성 | spec 문서 |
| Claude Code | spec 기반 엔진 구현 (TDD) | `packages/core/safe-to-spend` |
| Claude Code | 엣지 케이스 50+ 테스트 작성 | `.test.ts` 파일들 |
| Codex | 엣지 케이스 second opinion | 보완 리스트 |

**TDD 워크플로우** (권장):
1. Claude Code에게 spec 문서를 주고 "edge case 50개 나열하고 각각 테스트 파일 만들어"
2. 너가 리뷰 — 특히 payday 경계, 음수 버퍼, 연간 비용 첫 적립, reimbursement pending, 신용카드 미결제, 다중 통화 케이스가 누락 없는지
3. 테스트부터 커밋, 그 다음 Claude Code가 구현하며 통과시킴
4. Codex에 "이 엣지 케이스들 외에 내가 놓친 게 있을까?" 질문

**이 Phase에서는 Claude Design 거의 안 씀** (엔진은 UI가 없다).

#### Phase 5 — Web MVP (4주)

| 도구 | 작업 | 산출물 |
|---|---|---|
| Claude Design | Phase 2 handoff 번들을 참고로 작업 지시 생성 | 화면별 instruction |
| Claude Code | 각 화면을 `packages/ui` + shadcn/ui로 재구현 | Next.js 앱 |
| Claude Code | CSV 파서 구현 (ING, Rabobank, T212, DeGiro) | `packages/csv-parsers` |
| Claude Code | "Why this number?" 드릴다운 (Phase 4 엔진 연결) | 핵심 trust 기능 |

**9.5 체크리스트**를 매 화면마다 적용. Claude Design 출력을 그대로 복붙하지 않는다.

#### Phase 6 — Mobile MVP (4주)

| 도구 | 작업 | 산출물 |
|---|---|---|
| Claude Design | 모바일 8개 화면 최종 목업 확정 | 모바일 디자인 v1 |
| Claude Code | Expo + expo-router 구현, `packages/core` 공유 | 모바일 앱 |
| Claude Code | RevenueCat 연동 | paywall |
| Claude Code | OTA 업데이트 파이프라인 | EAS 설정 |

#### Phase 7 — Beta (3주)

| 도구 | 작업 | 산출물 |
|---|---|---|
| Claude (chat) | 베타 유저 온보딩 이메일, FAQ 초안 | 지원 매크로 |
| Claude Code | PostHog 이벤트 계측 + 대시보드 | `44_Analytics_Plan.md` |
| Claude Code | 버그 수정 스프린트 | 릴리즈 노트 |
| Codex | 회귀 버그 해결 시 대체 구현 비교 | 필요시 |

#### Phase 8 — Launch readiness (2주)

| 도구 | 작업 | 산출물 |
|---|---|---|
| Claude Design | **피치덱 / 랜딩 / 스토어 스크린샷 / 1-pager** (9.3.4, 9.3.5) | 런치 자산 전체 |
| Claude (chat) | Privacy Policy, Terms (EN/NL 초안, 변호사 검토 전) | `30_*.md`, `31_*.md` |
| Claude Code | Support 매크로 자동화, 에러 모니터링 alert 룰 | 운영 자동화 |

**Phase 8은 Claude Design 사용량이 급증하는 구간**. 주간 한도 관리 필요.

#### Phase 9 — Public launch (1주)

| 도구 | 작업 | 산출물 |
|---|---|---|
| Claude (chat) | 런치 블로그, 소셜 카피 | `41_Go_To_Market.md` |
| Claude Code | hot-fix 대응 | PR |
| Claude Design | 런치 시각 자산 변형 (소셜용 크롭 등) | 소셜 그래픽 |

#### Phase 10 — Optimization (지속)

| 도구 | 작업 |
|---|---|
| Claude Code | 주간 KPI 리뷰 → 우선순위 작업 구현 |
| Claude Design | 신규 기능 목업, A/B 배리언트 |
| Claude (chat) | 유저 인터뷰 요약 → 로드맵 업데이트 |

### 13.3 Phase별 AI 비용 추정 (€/월)

| Phase | Claude Pro/Max | Claude Design 초과 | Codex | 월 합계 |
|---|---|---|---|---|
| 0–1 | 18 (Pro) | 0–20 | 22 | 40–60 |
| 2 | 18 | 20–30 (집중 사용) | 22 | 60–70 |
| 3–4 | 90 (Max 승격 추천) | 0 | 22 | 112 |
| 5–6 | 90 | 10–20 | 22 | 122–132 |
| 7 | 90 | 0 | 22 | 112 |
| 8 | 90 | 20–30 (런치 자산) | 22 | 132–142 |
| 9+ | 90 | 10 | 22 | 122 |

**6개월 합계 예상**: €650–800. 1인 개발자 인건비 절감 대비하면 합리적 범위.

---

## 14. 12개월 로드맵

| 분기 | 목표 | 주요 deliverable |
|---|---|---|
| Q1 (M1–3) | MVP 완성 | Phase 0–6 완료, 베타 직전 |
| Q2 (M4–6) | 런치 + 초기 견인 | Phase 7–10, 네덜란드 공개 출시, 첫 1,000 가입 |
| Q3 (M7–9) | Retention 개선 | Sinking funds 고도화, 자동 rule 제안, 가격 실험, 독일 진출 준비 |
| Q4 (M10–12) | Trust 강화 + 스케일 | Forecasting 개선, investment-aware planner 고도화, bank connect pilot 평가 |

---

## 15. 성공 지표 (KPI)

| 지표 | 초기 목표 | 근거 |
|---|---|---|
| Onboarding 완료율 | 40–60%+ | 첫 safe-to-spend 숫자 도달까지 |
| D7 retention | 25–35%+ | 습관 형성 신호 |
| D30 retention | 12–20%+ | novelty 이후 생존 |
| Free → Paid 전환 | 3–8% | 카테고리 평균 |
| 연간 플랜 비중 (유료 중) | 35%+ | 현금흐름 + churn |
| Support ticket / 100 user | 낮고 감소 추세 | 숫자 신뢰도 신호 |
| NPS | 40+ | 돈 앱의 강한 지표 |
| First trusted number rate | 70%+ 목표 | 첫 safe-to-spend 숫자가 맞다고 느껴지는지 |

### 15.1 Leading Indicators (매주 볼 것)

* 첫 CSV import 성공률
* 첫 safe-to-spend 숫자 "맞다고 느낀" 비율 (in-app 1-tap feedback)
* savings 포함/제외 설정 변경률
* "Why this number?" 탭 사용률
* Recurring bill 등록 평균 개수

---

## 16. 리스크와 대응

| 리스크 | 영향 | 대응 |
|---|---|---|
| 유저가 로그를 포기 | 치명 | 입력 속도 최우선, recurring 템플릿, 웹 review 강화 |
| Safe-to-spend 숫자가 틀려 보임 | 치명 | Edge case 테스트, traceability, "why" 드릴다운, 초기에는 보수적 계산 우선 |
| 전환율 약함 | 중대 | 핵심 loop free 유지, 두 번째 자산 시 paywall |
| 컴플라이언스 gap | 중대 | 데이터 인벤토리, 스토어 공시 일치, 법무 검토 |
| Scope 폭발 | 중대 | MVP를 "trusted cashflow confidence" 하나로 고정 |
| 1인 개발 burnout | 중대 | AI 에이전트 활용 극대화, 주간 리듬, 무리한 마감 금지 |
| 경쟁자 진입 (TapSheet EU 진출 등) | 중 | Investor-aware 해자 + EU 프라이버시 포지션 유지 |
| CSV 포맷 변경 | 중 | 파서 분리 + 회귀 테스트, 사용자 제보 루프 |

---

## 17. 브랜드 · 로고 방향

### 17.1 확정 사항

* **제품명**: Dart Finance (또는 Dart)
* **로고**: 기하학 D lettermark (Plus Jakarta Sans 600, white 아이콘, 배경 박스 없음) — 기존 자산 계승
* **톤**: Calm, clear, trustworthy, not cute, not overly corporate

### 17.2 네이밍 검토

"Dart"는 좋은 선택이다. 짧고, 정확·속도 느낌, 영어/네덜란드어/한국어 모두 발음 가능, 금융 고유 명사와 충돌 없음.

주의: DART는 미국 SEC의 재무 공시 데이터베이스와 이름이 동일 → 한국 사용자에게는 오히려 친숙함이지만, B2B/핀테크 검색 시 혼란 가능. 필요시 "Dart Finance"로 풀네임 유지.

### 17.3 Brand pillars

1. **Calm** — 쓸데없이 빨간 숫자나 경고 없음
2. **Clear** — 숫자 하나에 설명 한 줄
3. **Honest** — 모든 숫자는 증거로 이어짐
4. **European** — 프라이버시 우선, 과시 없음

### 17.4 Marketing 한줄 (Launch)

* "Know what you can spend. Today."
* "A calmer way to manage money — without ignoring what you invest."
* NL: "Weet wat je vandaag veilig kunt uitgeven."

---

## 18. 준비해야 할 문서 목록 — 전체 체크리스트

이 섹션이 네가 "만들기 위해 뭘 준비해야 하냐"의 답이다.

### 18.1 제품 · 전략 문서 (Phase 0–1)

- [x] **00_Master_Report.md** — 이 문서
- [ ] **01_Product_Brief.md** — 1페이지 요약 (제품 정의, 타깃, 성공지표)
- [ ] **02_PRD.md** — Product Requirements Document, 기능 단위
- [ ] **03_User_Stories.md** — As a [user], I want [goal], so that [reason]
- [ ] **04_Personas.md** — Lars + secondary + anti-personas 상세
- [ ] **05_Competitive_Analysis.md** — YNAB, Monarch, Rocket Money, Emma, Tink 사례
- [ ] **06_Positioning_Statement.md** — 1문장 포지셔닝 + 3개 대안

### 18.2 디자인 문서 (Phase 1–2)

- [ ] **10_Information_Architecture.md** — 화면 맵, 네비게이션
- [ ] **11_User_Flows.md** — Onboarding, daily use, CSV import, paywall
- [ ] **12_Wireframes/** — 모바일 + 웹 주요 화면 (Claude Design URL + export)
- [ ] **13_Design_System.md** — Color, type, spacing, components (Claude Design tokens export)
- [ ] **14_Accessibility_Checklist.md** — WCAG AA 기본선
- [ ] **15_Copy_Guidelines.md** — tone, error messages, CTA 표준
- [ ] **16_Claude_Design_Handoff_Log.md** — ★ v1.2 신설. 각 화면의 Claude Design URL, handoff 번들 경로, Claude Code 재구현 PR 링크

### 18.3 엔지니어링 문서 (Phase 3–6)

- [ ] **20_Architecture.md** — 시스템 다이어그램, monorepo 구조
- [ ] **21_Data_Model.md** — Drizzle 스키마 전체 + ERD
- [ ] **22_API_Spec.md** — REST / RPC / Server Actions 명세
- [ ] **23_Safe_To_Spend_Engine_Spec.md** — 계산식, 엣지케이스, 테스트 케이스
- [ ] **24_CSV_Parsers.md** — 은행별 포맷 문서화
- [ ] **25_RLS_Policies.md** — Supabase Row Level Security 정책 전체
- [ ] **26_CLAUDE.md** — AI 에이전트 작업 규칙 (9.4 + 9.5 반영)
- [ ] **27_Testing_Strategy.md** — unit / integration / E2E
- [ ] **28_Deployment_Runbook.md** — 배포, 롤백, 마이그레이션
- [ ] **29_Incident_Response.md** — 장애 대응 플레이북
- [ ] **2A_AI_Workflow_Runbook.md** — ★ v1.2 신설. 9장 내용 축약본 + 부록 B 프롬프트 링크, 주간 Claude Design 한도 실측 로그

### 18.4 법률 · 컴플라이언스 문서 (Phase 7–8)

- [ ] **30_Privacy_Policy.md** (EN/NL)
- [ ] **31_Terms_of_Service.md** (EN/NL)
- [ ] **32_Cookie_Policy.md**
- [ ] **33_Data_Processing_Agreements/** — 벤더별 DPA 사본
- [ ] **34_ROPA.md** — Records of Processing Activities
- [ ] **35_DSAR_Procedure.md** — 사용자 데이터 요청 처리
- [ ] **36_Data_Breach_Playbook.md**
- [ ] **37_Subprocessor_List.md**
- [ ] **38_App_Store_Privacy_Labels.md** — iOS + Android

### 18.5 비즈니스 · 운영 문서 (Phase 7–10)

- [ ] **40_Pricing_Strategy.md** — 가격 실험 계획
- [ ] **41_Go_To_Market.md** — 채널, 메시지, 런치 타임라인
- [ ] **42_Launch_Checklist.md** — D-30 → D-Day
- [ ] **43_Support_Playbook.md** — 매크로, FAQ, 에스컬레이션
- [ ] **44_Analytics_Plan.md** — PostHog 이벤트 명세, 퍼널
- [ ] **45_KPI_Dashboard.md** — 주간/월간 모니터링
- [ ] **46_Post_Launch_Retro_Template.md**

### 18.6 파이낸셜 · 합자 (필요시)

- [ ] **50_Financial_Model.xlsx** — 3년 cashflow 모델
- [ ] **51_Pitch_Deck.pptx** — 투자 유치 시
- [ ] **52_Cap_Table.xlsx**
- [ ] **53_Company_Registration.md** — BV 설립 (네덜란드) 절차

### 18.7 이번 답변에서 같이 드래프트할 문서

다음 단계로 바로 드래프트 가능한 것들:

* `01_Product_Brief.md`
* `02_PRD.md` 초안
* `20_Architecture.md`
* `21_Data_Model.md` (Drizzle 스키마)
* `23_Safe_To_Spend_Engine_Spec.md`
* `26_CLAUDE.md`

원하는 문서 순서를 말하면 하나씩 진행.

---

## 19. 다음 액션

### 19.1 이번 주 안에 (Week 1)

1. 이 마스터 보고서 (v1.2) 확정
2. **claude.ai/design 첫 접속** — 9.3.1 프롬프트 그대로 넣어 브랜드 시스템 v0 생성, 결과 판단
3. 그 결과 기반으로 브랜드 방향 3가지 중 결정 (Linear-ish / Monzo-ish / Terminal-ish)
4. 모바일 홈 1개 화면만 먼저 목업 (15개 전부 말고)
5. `23_Safe_To_Spend_Engine_Spec.md` 초안 작성 ← **가장 중요**, Phase 4 전에 확정돼야 함
6. 경쟁사 1개 (YNAB 권장) 유료 3일 테스트 — 직접 써야 안 만들 기능이 보인다

### 19.2 2주 내

7. `01_Product_Brief.md` 1페이지 요약 작성
8. `02_PRD.md` 작성
9. 데이터 모델 확정 (`21_Data_Model.md`)
10. Persona Lars 인터뷰 3–5명 실제 진행
11. Claude Design 첫 주 사용량 측정 → Pro 유지 vs Max 승격 판단

### 19.3 한 달 내

12. Turborepo + Supabase 프로젝트 셋업 (빈 상태)
13. `packages/core` 머니 엔진 구현 + 테스트 (Phase 4 착수)
14. 웹 onboarding 흐름 구현 초기
15. 첫 Lars 인터뷰 결과 반영하여 PRD 업데이트

### 19.4 한 가지 당부

MVP를 여기서 정의한 범위보다 **더 좁혀도 된다**. 넓히지는 말 것.
"trusted cashflow confidence" 하나만 지키면, 나머지는 V1.5에서 붙인다.

AI 도구에 관해서도 같은 원칙이다. Claude Design 출력을 그대로 쓰고 싶은 유혹을 이겨내라 — 9.5의 handoff 체크리스트 없이 붙이면 3개월 뒤 후회한다.

---

## 부록 A — 결정 로그

| 날짜 | 결정 | 근거 |
|---|---|---|
| 2026-04-21 | 제품명 = Dart Finance | 기존 자산 계승, lettermark 로고 유지 |
| 2026-04-21 | 한 줄 정의 = "calm money app… without ignoring your investments" | 옵션 A 채택 |
| 2026-04-21 | 타깃 = 유럽 직장인 투자자 | 시장 공백 + 네 자산 최대 활용 |
| 2026-04-21 | 플랫폼 = 웹+모바일 동시, monorepo | 습관(모바일) + 검토(웹) 분리 |
| 2026-04-21 | 백엔드 = Supabase + Drizzle | 1인 개발 + AI 에이전트 생산성 |
| 2026-04-21 | FastAPI (SJ-Investment 기존) 버림 | 단일 TS 코드베이스로 에이전트 효율 |
| 2026-04-21 | Bank sync = V2 이후 | 규제/복잡도 회피, CSV-first 유효성 검증 우선 |
| 2026-04-21 | 홈 화면 What-if investing 시뮬레이션은 V1.2 이후 | V1은 trust와 단순성 우선 |
| 2026-04-21 | 별도 Admin Console은 PMF 이후 | 초기 운영은 기존 SaaS 대시보드와 내부 도구로 충분 |
| 2026-04-21 | Safe-to-spend 문구는 wealth guarantee가 아니라 cashflow confidence 중심 | 기대치 관리와 신뢰 확보 |
| 2026-04-22 | **Claude Design을 Phase 1–2 및 Phase 8 주 도구로 채택, Figma는 V1에서 배제** | 1인 개발 체제에서 Figma가 중간 단계로 끼어들 필요가 없고, Claude Design이 Claude Code로 직접 handoff됨 |
| 2026-04-22 | **Claude Design 출력 코드는 참고용, Claude Code가 재구현** | 코드베이스 일관성 유지, shadcn/ui + Drizzle 타입 정합 필요 |
| 2026-04-22 | **Codex는 second opinion 용도로만 유지, 레포 컨텍스트 작업에는 쓰지 않음** | 중복 투자 방지, Claude Code 단일 주력 |
| 2026-04-22 | **AI 도구 월 예산 €100–150 기준, Claude Pro로 시작 → Max 승격 기준 "주 한도 70% 이상 지속 소진"** | ROI 관리, Phase 3 이후 Max 권장 |
| 2026-04-22 | **UI 라이브러리 = NativeWind + shadcn/ui (Tamagui 배제)** | Claude Code/Design 둘 다 shadcn 패턴을 가장 많이 학습, handoff 번들과 정합성 우수 |

---

## 부록 B — AI 프롬프트 템플릿 모음

v1.2 신설. 9장과 13.2의 Phase별 플레이북에 쓰이는 프롬프트를 한 곳에 모아두어, 실제 작업 때 복붙으로 바로 쓸 수 있게 한다. 각 프롬프트는 Dart Finance의 실제 맥락에 맞춰 이미 커스터마이즈돼 있다.

### B.1 Claude (chat) — 1페이지 브리프 추출 (Phase 0)

```
Read 00_Master_Report_v1_2.md. Extract a 1-page product brief covering:
- Problem (2–3 sentences)
- Target user (1 sentence, specific)
- One-sentence positioning
- 5 differentiators (one line each)
- 6-month goal (MVP scope in 1 bullet)
- 12-month bet (what we're betting on)

Max 1 page. No marketing fluff. Save as 01_Product_Brief.md.
```

### B.2 Claude Design — 브랜드 시스템 초기 셋업 (Phase 1)

9.3.1의 풀 프롬프트를 여기에 그대로 복사. 첫 온보딩 때 1회 실행.

```
Create a design system for "Dart Finance" — a calm European money app for
employed investors. Brand pillars: calm, clear, honest, european, privacy-first.

Constraints:
- Product personality: Linear/Monzo hybrid, not playful, not corporate-stuffy
- Primary typeface: Plus Jakarta Sans (inherit from existing Dart lettermark)
- Color system: neutral base + 1 accent; no gratuitous red — even negatives are
  muted; dark sidebar always; light and dark mode both required
- Motion: restrained; no celebratory confetti or animations for money events
- Density: medium. Numbers are the hero; all other UI defers to them.
- Must work on small mobile home screen (primary KPI "Safe to spend today"
  must feel calm, not alarming, regardless of value sign)

Output: color tokens, type scale, spacing scale, base component set
(Button, Input, Card, List Row, KPI block, Badge, Tabs, Modal).
Generate both web and mobile variants. Export as Claude Code handoff bundle.
```

### B.3 Claude Design — 핵심 화면 목업 (Phase 1–2)

브랜드 시스템 셋업 후, 화면마다 하나씩.

```
Using the Dart Finance design system, create a mobile home screen.

Hero: "Safe to spend today" — a single large number in EUR, format nl-NL
(e.g., "€ 37,20"). Below it, a single explanatory line (e.g., "Until payday on
the 25th"). Calm tone; no red, no alert icon, even if the number is 0.

Secondary cards (in this order, each roughly equal size):
1. This month remaining
2. Next 3 bills due (date + amount + name)
3. Planned investing this month (amount + target date)

Bottom: floating "+ Quick add" button.

Avoid: charts, percentage changes, congratulatory messaging.

Export: HTML + PPTX (for review). Also generate a Claude Code handoff
bundle tagged "mobile-home-v1".
```

(웹 대시보드, CSV 임포트 매핑, "Why this number?" 등은 같은 패턴으로 요청)

### B.4 Claude Code — Phase 3 monorepo 초기화 (자율 실행용)

`PHASE3_SETUP.txt` 파일로 저장 후 `while true; do claude --dangerously-skip-permissions --max-turns 200 -p "$(cat PHASE3_SETUP.txt)"; sleep 300; done`로 실행.

```
You are setting up the Dart Finance monorepo from scratch.

Requirements (read-only):
- Stack: Turborepo + pnpm, Next.js 15 (App Router), Expo + expo-router,
  Supabase (EU region, Frankfurt), Drizzle ORM, NativeWind + shadcn/ui,
  RevenueCat, Stripe, PostHog, Sentry.
- Structure: apps/web, apps/mobile, packages/core, packages/db, packages/ui,
  packages/config, packages/csv-parsers, supabase/.
- Read CLAUDE.md (26_CLAUDE.md content) before every edit.
- Never touch .env, supabase/auth config. Those are managed manually.
- After every edit, run `pnpm tsc --noEmit`. If it fails, fix before continuing.

Goals for this session:
1. Initialize monorepo (turbo.json, pnpm-workspace.yaml, tsconfig base)
2. Scaffold apps/web (Next.js 15 App Router, empty landing page)
3. Scaffold apps/mobile (Expo, empty home screen)
4. Scaffold packages/core with safe-to-spend placeholder exports
5. Set up packages/db with Drizzle config + empty migration
6. Set up packages/ui with shadcn/ui base components (Button, Card, Input)
7. GitHub Actions workflow: lint + typecheck on PR
8. Commit after each major step with clear message

Do NOT:
- Add Supabase credentials (I'll do that)
- Initialize Sentry/PostHog keys (I'll do that)
- Write any business logic (that's Phase 4)

When done, summarize what was created and list any unresolved warnings.
```

### B.5 Claude Code — Phase 4 TDD 엔진 구현

spec 문서와 함께 사용. 먼저 엣지 케이스 나열 단계 → 그 다음 구현 단계로 나눈다.

**Step 1: 엣지 케이스 enumeration**
```
Read 23_Safe_To_Spend_Engine_Spec.md.

List 50+ edge cases the safe-to-spend engine must handle. Group by category:
1. Payday boundaries (last day of period, payday falling on weekend/holiday)
2. Negative buffers (user overspent, recurring bill exceeds balance)
3. Annual costs first accrual (first time sinking fund starts)
4. Reimbursement pending (out sent, in not yet received)
5. Credit card unsettled transactions
6. Multi-currency (future-proof, even if V1 is EUR only)
7. Account visibility changes (user toggles a savings account as accessible)
8. Investment contribution timing (scheduled vs executed)
9. Transfer misclassification (transfer tagged as expense by mistake)
10. Data freshness (imports from 5 days ago vs today)

For each edge case: a one-line description + expected behavior.
Save as packages/core/src/safe-to-spend/edge-cases.md.
Do not implement yet.
```

**Step 2: 테스트 파일 생성**
```
Using edge-cases.md, generate corresponding test files in
packages/core/src/safe-to-spend/__tests__/. Each test file should be per
category (payday-boundaries.test.ts, negative-buffers.test.ts, ...).

Use vitest. Mock the database via the @/packages/db test utilities.
All tests should fail initially (implementation doesn't exist yet).
Do not implement the engine. Only tests.
```

**Step 3: 구현**
```
Now implement packages/core/src/safe-to-spend/engine.ts to make all tests
in __tests__/ pass. Follow these principles (from section 7.5 of the master
report):
1. Trust over cleverness — explainable calculations over clever shortcuts
2. Policy before math — read policy config first, apply math second
3. Visible assumptions — every computed value must carry its assumption trail
4. User override — respect user settings for savings inclusion, planned
   investing protection
5. First trusted number — conservative defaults, not optimistic

After implementation: run `pnpm test`. All tests must pass.
```

### B.6 Codex — Second opinion 프롬프트

Claude Code가 막혔거나 "이 방식밖에 없다"고 할 때 사용.

```
I'm building a safe-to-spend engine for a personal finance app.

Context (minimal, do not assume full repo access):
[Paste the specific function or snippet, 50–200 lines max]

Claude Code's current approach: [one-sentence summary]

Question: Is there a materially different approach that would be:
(a) more maintainable, or
(b) handle edge case X better?

If Claude's approach is already reasonable, say so directly. Don't invent
alternatives just to seem helpful.
```

### B.7 Claude Design — 피치덱 생성 (Phase 8)

```
Read 00_Master_Report_v1_2.md and 01_Product_Brief.md.

Generate a pitch deck for Dart Finance using our design system.
15 slides, in this order:
1. Title (product name, one-liner, your name/date)
2. The problem (Lars persona, 1 quote)
3. Why existing tools fail (2-column: Budget apps / Portfolio trackers)
4. Our insight (investor-aware safe-to-spend)
5. Product demo (mobile home screenshot)
6. Product demo (web "Why this number?" drill-down)
7. Market (EU budget app users, growth, TAM estimate)
8. Positioning map (the 4-quadrant chart from section 2.3)
9. Business model (freemium, pricing, projections from 11.3)
10. Traction (if any; else: beta plan)
11. Competitive landscape (YNAB, Monarch, Rocket Money, Emma)
12. Roadmap (Phase 0–10 condensed)
13. Team (founder-only for now)
14. Ask (if raising) or plan (if not)
15. Thank you + contact

Tone: calm, confident, not hypey. No stock photos of smiling people.
Data where possible, aspiration where unavoidable.
Export as PPTX.
```

### B.8 Claude Design — 앱스토어 스크린샷 (Phase 8–9)

```
Using Dart Finance design system, generate 8 iOS App Store screenshots
(1290x2796 for iPhone Pro Max).

Screen 1: Mobile home with "Safe to spend today" — €37,20 example value,
  label "Until payday, Jul 25", secondary cards visible.
Screen 2: Quick add expense modal mid-interaction (€12,50 being entered,
  category "Groceries").
Screen 3: Upcoming bills list with 3 items (Rent, Spotify, Gym).
Screen 4: Planned investing card detail (€800 planned, VWCE + SXR8 visible).
Screen 5: Transactions list with Transfer and Reimbursement intent badges
  visible (demonstrating the differentiator).
Screen 6: "Why this number?" drill-down, showing the assumptions under
  safe-to-spend.
Screen 7: CSV import mapping UI (web-style, but optimized for vertical phone).
Screen 8: Settings showing privacy controls + EU data residency note.

Each screen: minimal marketing overlay text at top (3–5 words), no bottom
overlay. NL + EN versions. Export as PNGs.
```

### B.9 운영 프롬프트 — 매주 KPI 리뷰 (Phase 10)

```
Here are this week's PostHog metrics:
[paste CSV or JSON]

Compare to previous week and to our targets (from section 15):
- Onboarding completion: target 40–60%
- D7 retention: target 25–35%
- D30 retention: target 12–20%
- Free→Paid conversion: target 3–8%
- First trusted number rate: target 70%

Produce:
1. Which targets are met, close, or missed (one line each)
2. Top 2 anomalies (unexpected moves, good or bad)
3. Suggested 3 experiments for next week, ranked by expected impact

No speculation beyond the data. If a metric's movement has no clear cause
from the data, say so.
```

---

*End of Master Report v1.2 — 2026-04-22*
