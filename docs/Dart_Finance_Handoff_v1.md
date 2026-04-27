# Dart Finance — AI Agent Handoff Document

> **SUPERSEDED** — This was the original Korean-language handoff as of 2026-04-22. For current status see `50_Current_Status_2026-04-27.md` and `Dart_Finance_Current_State_Handoff_Summary.md`. Kept for historical reference.

**Version**: 1.0 · 2026-04-22
**Owner**: Seungjae
**Purpose**: ChatGPT / Codex 인계 문서 — 지금까지 완료된 것, 남은 것, 규칙 전체

---

## 0. 이 문서를 읽는 AI에게

너는 Dart Finance라는 개인 금융 앱 개발을 돕고 있다. 이 문서 하나에 제품 맥락, 기술 스택, 확정된 결정, 완료된 작업, 남은 작업이 전부 들어있다. **코드 작업 전에 이 문서를 끝까지 읽어라.**

핵심 원칙:
- 문서에 없는 결정은 오너(Seungjae)에게 물어라. 추측하지 마라.
- 범위를 임의로 넓히지 마라. V1 제외 목록이 명시되어 있다.
- 금액은 항상 INTEGER cents. float 절대 금지.
- 모든 편집 후 `pnpm tsc --noEmit` 실행. 에러 있으면 고치고 진행.

---

## 1. 제품 한 줄 정의

> **A calm money app that tells you what you can safely spend today — without ignoring your investments.**

대상: 네덜란드 거주 월급쟁이, ETF DCA 투자 습관, ING + Trading 212 사용자.

핵심 약속: 투자 이체를 지출로 오해하지 않고, 다음 월급일까지 안전하게 쓸 수 있는 금액을 매일 알려준다.

---

## 2. 확정된 핵심 결정 (변경 불가)

| 항목 | 결정 |
|------|------|
| 초기 시장 | 네덜란드 단일 시장 |
| 언어 | V1: 영어만. V1.5에서 네덜란드어/한국어 추가 |
| CSV 지원 | **ING + Trading 212만** (Rabobank, DeGiro는 V1.5) |
| 개발 순서 | **Web-first** — 웹 먼저 안정화 후 모바일 붙임 |
| Safe-to-spend 기준 | 월말 아닌 **payday(월급일) 기준** |
| 투자 보호 | planned investing 기본 보호 ON, 사용자 토글로 OFF 가능 |
| 플랫폼 릴리즈 | Web + Mobile 동시 출시 (개발 순서는 web-first) |
| 수익 모델 | Freemium — 무료 + 월 €4–7 / 연 €36–60 |
| 인증 | Supabase Auth |
| 배포 | Vercel (web), EAS (mobile) |

---

## 3. V1 포함 / 제외

### 포함
- Manual entry + ING + T212 CSV import
- Transaction intent 분류 (transfer, reimbursement, investment 등 16종)
- Recurring bills + sinking fund
- Safe-to-spend engine (payday 모델)
- "Why this number?" 드릴다운
- Web: onboarding, CSV import/review, transactions grid, drill-down
- Mobile: home (safe-to-spend hero), quick add expense
- 네덜란드 private beta 50–150명

### 제외 (V1에서 절대 추가하지 말 것)
```
❌ Bank sync / open banking
❌ Rabobank, DeGiro CSV 파서
❌ AI chat surface
❌ Forecast / what-if 시뮬레이션
❌ Household / shared account
❌ Dutch/Korean UI
❌ Deep portfolio analytics
❌ 핵심 5개 화면 외 추가 화면 (Phase 0에서)
```

---

## 4. 기술 스택

| Layer | 선택 |
|-------|------|
| Monorepo | Turborepo + pnpm |
| Web | Next.js 15 App Router |
| Mobile | Expo + expo-router |
| DB | Supabase (EU Frankfurt) + Drizzle ORM |
| UI (web) | shadcn/ui + Tailwind |
| UI (mobile) | NativeWind |
| 인증 | Supabase Auth |
| 결제 | RevenueCat (mobile) + Stripe (web) |
| Analytics | PostHog |
| Error | Sentry |
| CI/CD | GitHub Actions + Vercel + EAS |

---

## 5. 레포 구조 (Phase 0 완료 상태)

```
dart_v2_finance/
├── docs/                          ← 모든 스펙 문서
│   ├── 00_Dart_Finance_Master_Report_v1_2.md
│   ├── 01_Product_Brief.md
│   ├── 11_Lars_Interview_Guide.md
│   ├── 21_Data_Model.md
│   ├── 23_Safe_To_Spend_Engine_Spec.md
│   ├── Dart_Finance_Execution_Lock_v1_3.md
│   └── Dart_Finance_v1_3_Execution_Update.md
├── prompts/                       ← Claude Code 프롬프트
│   ├── PHASE0_BOOTSTRAP.txt       ← 완료됨
│   └── PHASE_MONOREPO_SETUP.txt
├── design/                        ← Claude Design 산출물
│   └── screens/
│       ├── Mobile_Home.html
│       ├── Mobile_Quick_Add.html
│       ├── Web_Transactions.html
│       ├── Web_CSV_Mapping.html
│       └── Web_Why_This_Number.html
├── packages/
│   ├── config/                    ← tsconfig, tailwind, eslint 공유
│   ├── db/                        ← Drizzle 스키마 15개 테이블
│   ├── core/                      ← 도메인 로직 (engine placeholder + 50 tests)
│   ├── ui/                        ← 디자인 토큰 + 기본 컴포넌트
│   └── csv-parsers/               ← ING + T212 파서 skeleton
├── apps/
│   ├── web/                       ← Next.js 15 (placeholder pages)
│   └── mobile/                    ← Expo (placeholder home)
├── supabase/
├── .github/workflows/ci.yml
└── CLAUDE.md                      ← 에이전트 규칙 (항상 먼저 읽을 것)
```

---

## 6. Phase 0 완료 상태 (확인됨)

```
✅ 폴더 구조 정리 완료
✅ Turborepo + pnpm 초기화
✅ packages/config (tsconfig, tailwind, eslint)
✅ packages/db — Drizzle 스키마 15개 테이블 전부
✅ packages/core — 타입 정의 + engine placeholder + 테스트 50개
✅ packages/ui — 디자인 토큰 CSS + 기본 컴포넌트
✅ packages/csv-parsers — ING + T212 타입 + stub
✅ apps/web — Next.js 15 shell + placeholder 6 routes
✅ apps/mobile — Expo home placeholder
✅ .github/workflows/ci.yml
✅ 10개 커밋 완료
✅ pnpm tsc --noEmit: 0 에러
✅ pnpm build: ✓
✅ pnpm test: 50 failing (정상 — engine 미구현)
```

---

## 7. 코드 규칙 (모든 에이전트 필수 준수)

```
금액          → INTEGER cents만. float/string 금지.
              → 표시할 때만: Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' })
색상          → CSS 변수만. 컴포넌트에 hex 하드코딩 금지.
              → var(--color-bg), var(--color-accent) 등
사이드바      → 항상 dark: var(--color-sidebar)
PK            → UUID (gen_random_uuid()). serial/int 금지.
TypeScript    → strict mode. any 금지. @ts-ignore 금지.
Import        → 절대경로 @/ alias. 상대경로 ../../ 금지.
편집 후       → 반드시 pnpm tsc --noEmit 실행. 에러 있으면 고치고 진행.
커밋 형식     → feat(scope): description
```

### 절대 건드리지 말 것
```
.env* 파일          (수동 관리)
supabase/config.toml
CLAUDE.md
src/lib/supabase/client.ts
```
`.env.example`만 생성 가능. 실제 credential 절대 코드에 넣지 말 것.

---

## 8. 데이터 모델 핵심 요약

### 핵심 테이블 15개
```
users, accounts, transactions (핵심),
import_batches, import_rows,
transfer_links, reimbursement_links,
categories, rules, recurring_series,
budget_periods, sinking_funds,
safe_to_spend_snapshots, audit_logs
```

### transactions 테이블 — 가장 중요

**intent enum (16개):**
```
living_expense, recurring_bill,
income_salary, income_dividend, income_refund, income_other,
transfer, reimbursement_out, reimbursement_in,
investment_contribution, investment_buy, investment_sell,
fee, tax, adjustment, unclassified
```

**review_status enum:**
```
pending, reviewed, needs_attention, auto_approved
```

**account_type enum:**
```
checking, savings, credit_card, brokerage, pension, cash, manual_external
```

### Safe-to-spend 엔진이 읽는 것
```
available_cash에 포함:
  account_type IN ('checking', 'cash')
  account_type = 'savings' AND is_accessible_savings = TRUE

available_cash에서 제외:
  account_type IN ('brokerage', 'pension') — 절대 포함 안 됨

safe-to-spend 계산에서 무시 (차감 없음):
  intent IN ('transfer', 'investment_contribution', 'investment_buy', 'investment_sell')

anomaly reserve에 포함:
  review_status IN ('pending', 'needs_attention')
  AND occurred_at >= NOW() - INTERVAL '14 days'
```

---

## 9. Safe-to-Spend 엔진 공식

```
available_cash
  = sum(checking + cash + user_enabled_accessible_savings)

protected_obligations
  = upcoming_recurring_bills_before_next_payday
  + sinking_fund_monthly_allocation
  + minimum_cash_buffer
  + planned_investing_contribution    [if protection = ON]
  + unreviewed_anomalies_reserve

spendable_pool = max(0, available_cash - protected_obligations)

safe_to_spend_today = floor(spendable_pool / days_until_next_payday)
```

### 엔진 정책 확정사항
- payday 기준 (월말 아님)
- planned investing → 기본 보호 ON, 사용자 토글로 OFF
- savings → 기본 미포함, 사용자가 accessible 설정 시 포함
- 미검토 거래 → anomaly reserve로 자동 차감
- pool이 음수면 0으로 클램프 (음수 표시 안 함)
- payday 미설정 → throw `'PAYDAY_NOT_CONFIGURED'`
- import 없음 → throw `'NO_IMPORT_DATA'`
- 모든 계산 결과는 `assumption_trail[]` 배열을 함께 반환

### 에러 코드 전체
```
PAYDAY_NOT_CONFIGURED
PAYDAY_TODAY_OR_OVERDUE
PAYDAY_FAR_FUTURE
SALARY_NOT_DETECTED
INVESTING_PROTECTION_DISABLED
INVESTING_EXCEEDS_CASH
OBLIGATIONS_EXCEED_CASH
STALE_IMPORT_DATA       (마지막 import > 5일)
NO_IMPORT_DATA
```

---

## 10. 핵심 5개 화면 (V1 고정)

| # | 화면 | 플랫폼 | 역할 |
|---|------|---------|------|
| 1 | Mobile Home | Mobile | Safe-to-spend 숫자 hero |
| 2 | Mobile Quick Add | Mobile | 빠른 지출 입력 (≤5초) |
| 3 | Web Transactions / Import Review | Web | 거래 분류·검토 |
| 4 | Web CSV Field Mapping | Web | CSV 컬럼 매핑 |
| 5 | Web "Why This Number?" | Web | safe-to-spend 드릴다운 |

Claude Design 산출물: `design/screens/*.html` (5개 파일)
→ 구현 시 참고용. 그대로 복붙 말고 React 컴포넌트로 재구현.

---

## 11. CSV 파서 규칙

### ING CSV
| ING 컬럼 | Dart 필드 | 변환 |
|----------|-----------|------|
| Datum | occurred_at | DD-MM-YYYY → ISO |
| Naam / Omschrijving | raw_description | 그대로 |
| Bedrag (EUR) | amount | 쉼표→점, ×100 cents |
| Af Bij | amount 부호 | Af=음수, Bij=양수 |
| external_id | NULL | ING에 없음 → fallback dedup |

### T212 CSV
| T212 컬럼 | Dart 필드 | 변환 |
|-----------|-----------|------|
| Time | occurred_at | ISO 변환 |
| Action | intent hint | Deposit→investment_contribution 등 |
| Total | amount | ×100 cents |
| ID | external_id | 있음 (T212는 제공) |

### Dedup 기준
```
1순위: (account_id, external_id) — T212에 적용
2순위: (account_id, occurred_at, amount, raw_description) — ING fallback
```

---

## 12. 디자인 토큰

```css
--color-bg:            #0f1117;
--color-sidebar:       #0a0c10;
--color-surface:       #161b22;
--color-surface-hover: #1c2330;
--color-border:        #21262d;
--color-text:          #e6edf3;
--color-text-muted:    #8b949e;
--color-text-faint:    #484f58;
--color-accent:        #3b82f6;
--color-accent-muted:  #1d3a6e;
--color-positive:      #3fb950;
--color-warning:       #d29922;
--color-safe:          #58a6ff;   /* safe-to-spend 숫자 색상 */
```

폰트: Plus Jakarta Sans (Google Fonts)
모션: 없음 또는 최소. 돈 이벤트에 confetti/celebration 절대 금지.
숫자가 hero. 나머지 UI는 숫자에 종속.

---

## 13. 남은 작업 — 우선순위 순서

### Phase 1 — 엔진 + 웹 핵심 루프 (6주)

#### 1-A. Safe-to-spend engine 구현
```
파일: packages/core/src/safe-to-spend/engine.ts
테스트: packages/core/src/safe-to-spend/__tests__/ (50개 있음)
스펙: docs/23_Safe_To_Spend_Engine_Spec.md

작업 순서:
1. test-utils.ts의 buildTestContext 구현
2. 테스트 그룹 A부터 순서대로 통과시키기
   A: Payday boundaries (9개)
   B: Investment protection (8개)
   C: Reimbursement (7개)
   D: Transaction intent (6개)
   E: Edge cases (8개)
   F: Stale data (7개)
   G: Account inclusion (5개)
3. pnpm test → 50/50 pass 확인
```

#### 1-B. Supabase 연결
```
1. Supabase 프로젝트 생성 (EU Frankfurt 리전)
2. apps/web/.env.local에 URL + anon key 수동 추가
3. packages/db/.env.local에 DATABASE_URL 추가
4. pnpm --filter @dart/db db:generate
5. pnpm --filter @dart/db db:migrate
6. Supabase 대시보드에서 RLS 활성화 확인
```

#### 1-C. Web onboarding 구현
```
라우트: apps/web/app/(app)/onboarding/

단계별 구현 순서:
1. /onboarding/payday    → 월급일 설정
2. /onboarding/income    → 월 수입 + minimum buffer 입력
3. /onboarding/investing → 월 투자 계획 입력
4. /onboarding/accounts  → 계좌 추가

완료 기준: 4단계 완료 후 대시보드로 이동
```

#### 1-D. ING CSV 파서 구현
```
파일: packages/csv-parsers/src/ing/parser.ts
스펙: docs/21_Data_Model.md section 5

구현 항목:
- 세미콜론 구분자 파싱
- Af/Bij → 부호 변환
- 쉼표 소수점 → cents 변환
- DD-MM-YYYY → ISO Date
- fallback dedup hash 생성
- 필수 컬럼 누락 시 에러 반환
```

#### 1-E. T212 CSV 파서 구현
```
파일: packages/csv-parsers/src/t212/parser.ts

구현 항목:
- Action → intent 매핑
  'Deposit' → investment_contribution
  'Market buy' → investment_buy
  'Market sell' → investment_sell
  'Dividend (Ordinary)' → income_dividend
  'Interest on cash' → income_other
- ID → external_id (dedup 1순위)
- Total × 100 → cents
```

#### 1-F. Web CSV import 화면 구현
```
라우트: apps/web/app/(app)/import/

구현 항목:
1. 파일 업로드 (drag & drop + click)
2. 은행 선택 (ING / T212)
3. 컬럼 매핑 UI (design/screens/Web_CSV_Mapping.html 참고)
4. Import preview (상위 5행)
5. Import 실행 → import_batch 생성 → transactions 생성
6. 중복 감지 알림 ("N개 중복 건너뜀")
```

#### 1-G. Web transactions 화면 구현
```
라우트: apps/web/app/(app)/transactions/

구현 항목:
1. 거래 테이블 (design/screens/Web_Transactions.html 참고)
   - Date, Description, Amount, Intent badge, Review status
2. intent 수정 (드롭다운)
3. bulk review (체크박스 선택 → 일괄 처리)
4. "Needs attention" 필터
5. amber 배너 — 미검토 거래 있을 시
```

#### 1-H. Web "Why This Number?" 구현
```
라우트: apps/web/app/(app)/why/

구현 항목 (design/screens/Web_Why_This_Number.html 참고):
1. Safe-to-spend 숫자 헤더
2. Available Cash 섹션 (계좌별 목록)
3. Protected Obligations 섹션 (접을 수 있음):
   - Upcoming bills
   - Sinking fund allocation
   - Min buffer
   - Planned investing (protected badge)
   - Anomaly reserve
4. 계산 결과 (pool ÷ days = daily)
5. 각 항목 클릭 → 해당 거래/설정으로 이동
```

### Phase 2 — Mobile (엔진 + 웹 안정화 후)

```
구현 순서:
1. apps/mobile/app/(tabs)/index.tsx
   → safe-to-spend 숫자 hero (design/screens/Mobile_Home.html 참고)
   → 카드 3개: remaining, upcoming bills, planned investing
   → "+ Quick Add" FAB

2. apps/mobile/app/quick-add.tsx
   → 금액 keypad
   → 카테고리 chip 선택
   → 저장 → transactions에 insert
   (design/screens/Mobile_Quick_Add.html 참고)

3. apps/mobile/app/(tabs)/transactions.tsx
   → 최근 거래 목록 (readonly)

4. apps/mobile/app/(tabs)/bills.tsx
   → 다가오는 고정지출 목록
```

### Phase 3 — Private Beta 준비

```
[ ] Supabase RLS 전체 테이블 활성화 + 검증
[ ] Stripe 결제 연동 (web)
[ ] RevenueCat 연동 (mobile)
[ ] PostHog 이벤트 설정:
    - onboarding_completed
    - first_import
    - first_trusted_number (첫 safe-to-spend 계산)
    - csv_import_completed
    - transaction_reviewed
[ ] Sentry 연결
[ ] Privacy policy 초안
[ ] Terms 초안
[ ] Beta signup form
[ ] 50명 초대
```

---

## 14. Codex / ChatGPT에게 작업 넘기는 방법

### 엔진 구현 프롬프트 예시

```
Context:
- Dart Finance monorepo, packages/core/src/safe-to-spend/engine.ts
- Read docs/23_Safe_To_Spend_Engine_Spec.md for policy
- Tests are in packages/core/src/safe-to-spend/__tests__/
- All amounts are INTEGER cents (never float)

Task:
1. Implement buildTestContext in __tests__/test-utils.ts
   Default context: today=2026-04-22, paydayDate=2026-04-30, availableCash=100000
2. Run Group A tests (payday-boundaries.test.ts) — expect failures
3. Implement the payday boundary logic in engine.ts
4. Run Group A tests again — all 9 must pass
5. Repeat for Group B (investment protection)

Constraints:
- spendable_pool = max(0, available_cash - protected_obligations) — never negative
- value = floor(spendable_pool / days_until_payday)
- Always return assumption_trail array with minimum 1 entry
- If paydayDate is null → throw new Error('PAYDAY_NOT_CONFIGURED')
```

### CSV 파서 구현 프롬프트 예시

```
Context:
- packages/csv-parsers/src/ing/parser.ts (currently a stub)
- ING CSV format: semicolon-delimited, Dutch locale
  - Date column: 'Datum', format DD-MM-YYYY
  - Amount column: 'Bedrag (EUR)', comma as decimal separator (e.g. '28,40')
  - Direction column: 'Af Bij' — 'Af'=debit(negative), 'Bij'=credit(positive)
  - No external_id — use fallback dedup hash
- Output type: ParsedRow[] (defined in packages/csv-parsers/src/shared/types.ts)
- All amounts must be converted to INTEGER cents

Task:
Implement the ING CSV parser. Handle:
1. Header row detection and validation (required columns check)
2. Date parsing: DD-MM-YYYY → Date object
3. Amount parsing: '28,40' → 2840 (cents)
4. Direction: 'Af' → negative, 'Bij' → positive
5. Dedup hash: SHA-256 of (account_id + occurred_at.toISOString() + amount + raw_description)
6. Return ParseResult { rows: ParsedRow[], errors: ParseError[] }
```

### Web 화면 구현 프롬프트 예시

```
Context:
- apps/web/app/(app)/transactions/page.tsx
- Design reference: design/screens/Web_Transactions.html (read this file first)
- UI components: @dart/ui (Button, Card, Badge, Input)
- Design tokens: CSS variables (--color-bg, --color-surface, etc.)
- Framework: Next.js 15 App Router, TypeScript strict mode

Task:
Implement the transactions page. Requirements:
1. Fetch transactions from Supabase for current user, ordered by occurred_at DESC
2. Display as a table: Date | Description | Amount | Intent badge | Status
3. Intent badge colors:
   - living_expense: muted gray
   - investment_contribution: blue (var(--color-accent))
   - reimbursement_in: green (var(--color-positive))
   - transfer: faint
   - needs_attention: amber (var(--color-warning))
4. Amber banner at top if any transactions have review_status='pending'
5. Click on intent → dropdown to change it → update DB
6. No hardcoded colors — use CSS variables only
7. Run pnpm tsc --noEmit after implementation
```

---

## 15. 성공 지표 (MVP 기준)

| 지표 | 목표 |
|------|------|
| Onboarding completion | ≥ 40% |
| D7 retention | ≥ 25% |
| D30 retention | ≥ 12% |
| Free→Paid conversion | ≥ 3% |
| "First trusted number" rate | ≥ 70% |

"First trusted number" = 사용자가 첫 safe-to-spend 숫자를 보고 리뷰 없이 다음 날 재방문.

---

## 16. 문서 위치 (레포 내)

```
docs/01_Product_Brief.md               → 제품 1페이지 요약
docs/21_Data_Model.md                  → DB 스키마 전체 (Drizzle 구현 기준)
docs/23_Safe_To_Spend_Engine_Spec.md   → 엔진 정책 + 테스트 시나리오 전체
docs/Dart_Finance_Execution_Lock_v1_3.md → 확정 결정 3개 (화면, CSV, web-first)
CLAUDE.md                              → 에이전트 규칙 (모든 AI 세션 시작 시 읽을 것)
```

---

*이 문서는 Dart Finance Phase 0 완료 시점(2026-04-22) 기준으로 작성됐다.*
*이후 결정이 바뀌면 해당 docs/*.md를 먼저 업데이트하고 코드를 수정한다.*
