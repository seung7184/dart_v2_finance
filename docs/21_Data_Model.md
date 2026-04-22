# 21 — Data Model

Version 1.0 · 2026-04-22
Owner: Seungjae
Status: Drizzle-ready schema spec — implement before CSV parser

---

## 0. 이 문서의 목적

이 문서는 Dart Finance V1의 **전체 데이터 모델**을 정의한다.

완료 기준:
- Drizzle ORM 스키마로 바로 옮길 수 있음
- RLS 정책 초안 작성이 가능함
- CSV parser (`packages/csv-parsers`)와 연결되는 필드가 명확함
- Safe-to-spend 엔진(`23_Safe_To_Spend_Engine_Spec.md`)이 읽는 필드가 명확함

이 문서를 읽는 모든 AI 에이전트는 **편집 전 이 문서 전체를 먼저 읽어야 한다.**

---

## 1. 설계 원칙

### 1.1 Transaction-first

모든 파생 뷰(safe-to-spend, budget summary, portfolio holdings)는 `transactions` 테이블에서 계산된다. 별도 집계 테이블을 만들지 않는다. 예외: `safe_to_spend_snapshots` (감사 목적 캐시).

### 1.2 Intent is a first-class field

거래 금액만 저장하지 않는다. **intent** (거래의 의도)를 필수 필드로 둔다. Safe-to-spend 엔진은 금액이 아니라 intent를 보고 계산한다.

### 1.3 Audit trail everywhere

모든 테이블에 `created_at`, `updated_at`이 있다. 사용자가 변경한 내용은 `audit_logs`에 기록된다. "왜 이 숫자인가"에 항상 답할 수 있어야 한다.

### 1.4 User isolation via RLS

모든 테이블에 `user_id`가 있고, Supabase RLS로 격리된다. 예외 없음.

### 1.5 EUR-first, multi-currency ready

V1은 EUR 단위로만 운영한다. 하지만 `currency` 컬럼은 모든 금액 필드 옆에 둔다. V1.5 multi-currency 전환 시 schema 변경 없이 처리 가능하게.

### 1.6 Amount는 항상 정수 (cents)

`amount INTEGER` — EUR cents 단위. 부동소수점 오차 방지. 표시할 때 100으로 나눔.

---

## 2. 엔티티 관계도

```
users
  └── accounts
        └── transactions
              ├── import_rows (원본 CSV 행 연결)
              ├── transfer_links (이체 쌍 연결)
              └── reimbursement_links (상환 쌍 연결)

users
  ├── recurring_series
  │     └── transactions (recurring 계열)
  ├── categories
  ├── rules (자동 분류 규칙)
  ├── budget_periods
  │     └── sinking_funds
  └── import_batches
        └── import_rows
              └── transactions

safe_to_spend_snapshots (감사용 — users에 귀속)
audit_logs (모든 변경 추적)
```

---

## 3. 테이블 상세 정의

### 3.1 `users`

Supabase Auth와 1:1 연결. Auth 유저가 앱에 처음 접근할 때 row 생성.

```
users
  id                    UUID PRIMARY KEY (= supabase auth.uid())
  email                 TEXT NOT NULL
  display_name          TEXT
  payday_day            INTEGER          -- 1–31, 월 고정 날짜 (예: 25)
  payday_type           TEXT             -- 'fixed_day' | 'last_working_day'
  expected_monthly_income INTEGER        -- cents, EUR
  minimum_cash_buffer   INTEGER          -- cents, EUR, default 0
  planned_investing_protected BOOLEAN    -- default TRUE
  locale                TEXT             -- 'en' | 'nl' | 'ko', default 'en'
  currency              TEXT             -- default 'EUR'
  onboarding_completed  BOOLEAN          -- default FALSE
  created_at            TIMESTAMPTZ      -- default now()
  updated_at            TIMESTAMPTZ      -- default now()
```

**RLS**: `auth.uid() = id`

**설계 메모**:
- `payday_day = 25`이고 해당 월에 25일이 없으면 마지막 날로 처리
- `planned_investing_protected` 토글이 FALSE가 되면 UI에 경고 표시 (엔진 스펙 4.1)

---

### 3.2 `accounts`

유저의 은행/투자/저축 계좌.

```
accounts
  id                    UUID PRIMARY KEY
  user_id               UUID NOT NULL → users.id
  name                  TEXT NOT NULL          -- "ING Checking", "T212 Portfolio"
  institution           TEXT                   -- "ING", "Trading 212", "Rabobank"
  account_type          TEXT NOT NULL          -- enum (아래)
  currency              TEXT NOT NULL          -- default 'EUR'
  is_accessible_savings BOOLEAN                -- default FALSE
    -- TRUE이면 available_cash에 포함됨 (savings 계좌에만 적용)
  is_active             BOOLEAN                -- default TRUE
  display_order         INTEGER                -- UI 정렬용
  last_import_at        TIMESTAMPTZ            -- 마지막 CSV import 시각
  created_at            TIMESTAMPTZ
  updated_at            TIMESTAMPTZ
```

**account_type enum:**
```
'checking'         -- 생활 주계좌 (ING)
'savings'          -- 저축 (ING Savings)
'credit_card'      -- 신용카드
'brokerage'        -- 투자 계좌 (Trading 212, DeGiro)
'pension'          -- 연금
'cash'             -- 현금
'manual_external'  -- 수기 추적용 외부 계좌
```

**RLS**: `user_id = auth.uid()`

**엔진 연결**:
- `account_type IN ('checking', 'cash')` → 항상 `available_cash`에 포함
- `account_type = 'savings' AND is_accessible_savings = TRUE` → 포함
- `account_type IN ('brokerage', 'pension')` → 절대 포함 안 됨

---

### 3.3 `transactions` ← 핵심 테이블

```
transactions
  id                    UUID PRIMARY KEY
  user_id               UUID NOT NULL → users.id
  account_id            UUID NOT NULL → accounts.id

  -- 원본 데이터 (절대 수정 불가)
  source                TEXT NOT NULL          -- 'ing_csv' | 't212_csv' | 'manual'
  external_id           TEXT                   -- CSV row의 고유 식별자 (dedup용)
  occurred_at           TIMESTAMPTZ NOT NULL   -- 거래 발생일시
  settled_at            TIMESTAMPTZ            -- 결제 완료일시 (크레딧카드 등)
  amount                INTEGER NOT NULL       -- cents, 음수 = 출금, 양수 = 입금
  currency              TEXT NOT NULL          -- 'EUR'
  raw_description       TEXT NOT NULL          -- CSV 원본 설명 그대로
  import_batch_id       UUID → import_batches.id

  -- 분류 데이터 (유저/규칙이 수정 가능)
  normalized_description TEXT                  -- 정규화된 상호명
  merchant_name         TEXT                   -- 최종 상호명 (Albert Heijn 등)
  intent                TEXT                   -- enum (아래) ← 핵심
  category_id           UUID → categories.id
  review_status         TEXT NOT NULL          -- enum (아래)
  notes                 TEXT

  -- 파생 관계 (다른 테이블에서 관리, 여기선 읽기 전용)
  -- transfer_links, reimbursement_links로 연결됨

  created_at            TIMESTAMPTZ
  updated_at            TIMESTAMPTZ

  UNIQUE (account_id, external_id)             -- dedup 기본 키
  INDEX (user_id, occurred_at DESC)            -- 기간별 조회
  INDEX (user_id, intent)                      -- 엔진 계산용
  INDEX (user_id, review_status)               -- 리뷰 큐용
```

**intent enum** ← 엔진이 이것만 본다:
```
'living_expense'          -- 일반 생활비 (식비, 쇼핑 등)
'recurring_bill'          -- 정기 지출 (월세, 구독 등)
'income_salary'           -- 급여
'income_dividend'         -- 배당금
'income_refund'           -- 환불
'income_other'            -- 기타 수입
'transfer'                -- 계좌 간 이체 (ING → T212)
'reimbursement_out'       -- 대신 결제 (돈 나감)
'reimbursement_in'        -- 환급 수령 (돈 들어옴)
'investment_contribution' -- 투자 납입 (T212 Deposit)
'investment_buy'          -- 종목 매수
'investment_sell'         -- 종목 매도
'fee'                     -- 수수료
'tax'                     -- 세금
'adjustment'              -- 수동 조정
'unclassified'            -- 미분류 (default)
```

**review_status enum:**
```
'pending'          -- import 직후, 아직 검토 안 됨
'reviewed'         -- 유저가 확인함
'needs_attention'  -- 이상 감지 또는 수동 플래그
'auto_approved'    -- 자동 분류 규칙으로 통과
```

**엔진 연결**:
- `intent IN ('living_expense', 'recurring_bill', 'fee', 'tax')` → available_cash 차감
- `intent IN ('transfer', 'investment_contribution', 'investment_buy', 'investment_sell')` → 무시 (차감 없음)
- `review_status IN ('pending', 'needs_attention')` → `unreviewed_anomalies_reserve`에 합산

**CSV parser 연결**:
- ING: `external_id` = 없음 → `(account_id, occurred_at, amount, raw_description)` fallback dedup
- T212: `external_id` = T212 transaction ID (있음)

---

### 3.4 `import_batches`

CSV import 세션 단위 기록.

```
import_batches
  id                    UUID PRIMARY KEY
  user_id               UUID NOT NULL → users.id
  account_id            UUID NOT NULL → accounts.id
  source                TEXT NOT NULL          -- 'ing_csv' | 't212_csv'
  original_filename     TEXT
  file_hash             TEXT NOT NULL          -- SHA-256 (동일 파일 재업로드 감지)
  row_count             INTEGER                -- 총 CSV 행 수
  imported_count        INTEGER                -- 실제 import된 행 수
  duplicate_count       INTEGER                -- 중복으로 건너뛴 수
  review_status         TEXT                   -- 'pending' | 'in_review' | 'completed'
  import_started_at     TIMESTAMPTZ
  import_completed_at   TIMESTAMPTZ
  created_at            TIMESTAMPTZ
  updated_at            TIMESTAMPTZ

  UNIQUE (user_id, file_hash)                  -- 동일 파일 중복 업로드 방지
```

---

### 3.5 `import_rows`

CSV 원본 행 보존. 파싱 실패나 dedup 처리 내역 추적.

```
import_rows
  id                    UUID PRIMARY KEY
  import_batch_id       UUID NOT NULL → import_batches.id
  user_id               UUID NOT NULL → users.id
  row_index             INTEGER NOT NULL       -- CSV에서의 행 번호
  raw_data              JSONB NOT NULL         -- 원본 CSV 행 전체
  parse_status          TEXT NOT NULL          -- 'success' | 'duplicate' | 'error'
  parse_error           TEXT                   -- 실패 이유
  transaction_id        UUID → transactions.id -- 생성된 거래 (있을 경우)
  created_at            TIMESTAMPTZ
```

---

### 3.6 `transfer_links`

이체 쌍 (출금 + 입금)을 연결. ING → T212 같은 경우.

```
transfer_links
  id                    UUID PRIMARY KEY
  user_id               UUID NOT NULL → users.id
  from_transaction_id   UUID NOT NULL → transactions.id
  to_transaction_id     UUID NOT NULL → transactions.id
  confirmed_by          TEXT                   -- 'auto' | 'user'
  created_at            TIMESTAMPTZ

  UNIQUE (from_transaction_id)
  UNIQUE (to_transaction_id)
```

**제약**: from과 to 모두 `intent = 'transfer'`여야 함. 금액이 대칭이어야 함 (abs 기준).

---

### 3.7 `reimbursement_links`

대신 결제 + 환급 수령 쌍 연결.

```
reimbursement_links
  id                    UUID PRIMARY KEY
  user_id               UUID NOT NULL → users.id
  out_transaction_id    UUID NOT NULL → transactions.id  -- reimbursement_out
  in_transaction_id     UUID → transactions.id           -- reimbursement_in (nullable, 아직 못 받았을 수 있음)
  expected_amount       INTEGER                          -- cents, 예상 환급액
  status                TEXT NOT NULL                    -- 'pending' | 'matched' | 'cancelled'
  notes                 TEXT
  created_at            TIMESTAMPTZ
  updated_at            TIMESTAMPTZ
```

**엔진 연결**:
- `status = 'pending'` (in_transaction 없음) → `reimbursement_out` amount가 available_cash를 줄임
- `status = 'matched'` → 양쪽 중립화, 영향 없음

---

### 3.8 `categories`

거래 분류 카테고리.

```
categories
  id                    UUID PRIMARY KEY
  user_id               UUID → users.id         -- NULL이면 시스템 기본값
  name                  TEXT NOT NULL
  icon                  TEXT                    -- emoji 또는 icon key
  color                 TEXT                    -- hex color
  parent_id             UUID → categories.id    -- 계층 구조 (V1.5)
  is_system             BOOLEAN                 -- default FALSE (시스템 기본값이면 TRUE)
  display_order         INTEGER
  created_at            TIMESTAMPTZ
  updated_at            TIMESTAMPTZ
```

**V1 시스템 기본 카테고리** (seed data):
```
Groceries / Dining / Transport / Housing / Utilities /
Healthcare / Shopping / Entertainment / Subscriptions /
Investment / Transfer / Income / Other
```

---

### 3.9 `rules`

거래 자동 분류 규칙.

```
rules
  id                    UUID PRIMARY KEY
  user_id               UUID NOT NULL → users.id
  name                  TEXT                    -- 규칙 이름 (선택)
  match_field           TEXT NOT NULL           -- 'raw_description' | 'merchant_name' | 'amount'
  match_operator        TEXT NOT NULL           -- 'contains' | 'equals' | 'starts_with' | 'regex'
  match_value           TEXT NOT NULL
  set_intent            TEXT                    -- 설정할 intent (nullable)
  set_category_id       UUID → categories.id   -- 설정할 category (nullable)
  set_merchant_name     TEXT                    -- 설정할 merchant name (nullable)
  priority              INTEGER                 -- 낮을수록 먼저 적용
  is_active             BOOLEAN                 -- default TRUE
  applied_count         INTEGER                 -- 통계용
  created_at            TIMESTAMPTZ
  updated_at            TIMESTAMPTZ
```

**예시 규칙**:
- `raw_description CONTAINS 'TRADING 212'` → `intent = 'investment_contribution'`
- `raw_description CONTAINS 'ALBERT HEIJN'` → `intent = 'living_expense'`, `category = 'Groceries'`

---

### 3.10 `recurring_series`

정기 지출/수입 계열.

```
recurring_series
  id                    UUID PRIMARY KEY
  user_id               UUID NOT NULL → users.id
  account_id            UUID → accounts.id
  name                  TEXT NOT NULL            -- "Rent", "Spotify", "Gym"
  amount                INTEGER NOT NULL         -- cents (예상액)
  currency              TEXT NOT NULL
  intent                TEXT NOT NULL            -- 주로 'recurring_bill' 또는 'income_salary'
  category_id           UUID → categories.id
  frequency             TEXT NOT NULL            -- 'monthly' | 'annual' | 'weekly'
  day_of_month          INTEGER                  -- 1–31 (monthly)
  month_of_year         INTEGER                  -- 1–12 (annual)
  next_expected_at      TIMESTAMPTZ              -- 다음 예정일
  last_matched_at       TIMESTAMPTZ              -- 마지막으로 거래와 매칭된 시각
  is_active             BOOLEAN                  -- default TRUE
  created_at            TIMESTAMPTZ
  updated_at            TIMESTAMPTZ
```

**엔진 연결**: `frequency = 'monthly'`, `intent = 'recurring_bill'`인 계열 중 `next_expected_at <= next_payday_date`인 것들이 `upcoming_recurring_bills`에 포함.

---

### 3.11 `budget_periods`

월별 예산 기간.

```
budget_periods
  id                    UUID PRIMARY KEY
  user_id               UUID NOT NULL → users.id
  year                  INTEGER NOT NULL
  month                 INTEGER NOT NULL         -- 1–12
  expected_income       INTEGER                  -- cents
  planned_investing     INTEGER                  -- cents
  investing_protected   BOOLEAN                  -- 이 기간의 보호 여부 (users 설정 override)
  notes                 TEXT
  created_at            TIMESTAMPTZ
  updated_at            TIMESTAMPTZ

  UNIQUE (user_id, year, month)
```

---

### 3.12 `sinking_funds`

비정기 지출 적립 (연간 보험료, 휴가비 등).

```
sinking_funds
  id                    UUID PRIMARY KEY
  user_id               UUID NOT NULL → users.id
  name                  TEXT NOT NULL            -- "Annual Insurance", "Vacation"
  target_amount         INTEGER NOT NULL         -- cents, 연간 목표액
  monthly_allocation    INTEGER NOT NULL         -- cents, target_amount / 12
  current_balance       INTEGER                  -- cents, 현재 적립액
  target_date           DATE                     -- 목표 지출 날짜
  is_active             BOOLEAN                  -- default TRUE
  created_at            TIMESTAMPTZ
  updated_at            TIMESTAMPTZ
```

**엔진 연결**: 활성 sinking fund의 `monthly_allocation` 합계가 `protected_obligations`에 포함.

---

### 3.13 `safe_to_spend_snapshots`

엔진 계산 결과 스냅샷. "이 숫자가 왜 나왔나"의 감사 기록.

```
safe_to_spend_snapshots
  id                    UUID PRIMARY KEY
  user_id               UUID NOT NULL → users.id
  computed_at           TIMESTAMPTZ NOT NULL
  value_cents           INTEGER NOT NULL         -- 최종 safe-to-spend (일별, cents)
  spendable_pool_cents  INTEGER NOT NULL
  days_until_payday     INTEGER NOT NULL
  available_cash_cents  INTEGER NOT NULL
  protected_total_cents INTEGER NOT NULL

  -- 구성 요소 상세 (드릴다운용)
  upcoming_bills_cents  INTEGER NOT NULL
  sinking_fund_cents    INTEGER NOT NULL
  min_buffer_cents      INTEGER NOT NULL
  investing_cents       INTEGER NOT NULL
  anomaly_reserve_cents INTEGER NOT NULL
  investing_protected   BOOLEAN NOT NULL

  -- 가정 추적
  assumption_trail      JSONB NOT NULL           -- AssumptionEntry[] (엔진 스펙 참조)
  warnings              JSONB                    -- Warning[]

  created_at            TIMESTAMPTZ
```

---

### 3.14 `audit_logs`

사용자가 변경한 모든 내용 추적.

```
audit_logs
  id                    UUID PRIMARY KEY
  user_id               UUID NOT NULL → users.id
  table_name            TEXT NOT NULL
  record_id             UUID NOT NULL
  action                TEXT NOT NULL            -- 'INSERT' | 'UPDATE' | 'DELETE'
  changed_fields        JSONB                    -- {field: {from: x, to: y}}
  actor                 TEXT                     -- 'user' | 'rule' | 'import' | 'system'
  created_at            TIMESTAMPTZ NOT NULL
```

---

## 4. RLS 정책 초안

모든 테이블에 동일한 패턴 적용.

```sql
-- 예시: transactions 테이블
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users can only see their own transactions"
ON transactions FOR ALL
USING (user_id = auth.uid());
```

**추가 제약**:
- `import_rows.raw_data`는 PII 포함 가능 → 컬럼 레벨 암호화 검토 (pgsodium)
- `users.email`은 암호화 권장

---

## 5. CSV Parser ↔ 테이블 필드 매핑

### ING CSV → transactions

| ING 컬럼 | Dart 필드 | 변환 |
|---|---|---|
| Datum | `occurred_at` | `DD-MM-YYYY` → ISO |
| Naam / Omschrijving | `raw_description` | 그대로 |
| Rekening | `account_id` | 계좌 매칭 |
| Bedrag (EUR) | `amount` | 쉼표→점, ×100 → cents |
| Af Bij | `amount` 부호 | Af = 음수, Bij = 양수 |
| Mutatiesoort | 참고용 | rule 매칭에 사용 |
| Mededelingen | `notes` | 그대로 (선택) |
| `source` | `'ing_csv'` | 고정값 |
| `external_id` | NULL | ING CSV에 없음 → fallback dedup |

### T212 CSV → transactions

| T212 컬럼 | Dart 필드 | 변환 |
|---|---|---|
| Time | `occurred_at` | ISO 변환 |
| Action | `intent` 힌트 + `raw_description` | Deposit→`investment_contribution` 등 |
| Ticker | `merchant_name` | 종목 코드 |
| Total | `amount` | ×100 → cents |
| Currency | `currency` | 그대로 |
| ID | `external_id` | 있으면 사용 (T212는 제공) |
| `source` | `'t212_csv'` | 고정값 |

---

## 6. 주요 쿼리 패턴

### 6.1 Safe-to-spend 엔진 — available_cash

```sql
SELECT SUM(amount) as available_cash
FROM transactions t
JOIN accounts a ON t.account_id = a.id
WHERE t.user_id = $user_id
  AND a.account_type IN ('checking', 'cash')
  OR (a.account_type = 'savings' AND a.is_accessible_savings = TRUE)
  AND t.intent NOT IN (
    'transfer', 'investment_contribution', 'investment_buy',
    'investment_sell', 'reimbursement_out'
  );
```

### 6.2 Upcoming recurring bills before next payday

```sql
SELECT SUM(amount) as upcoming_bills
FROM recurring_series
WHERE user_id = $user_id
  AND is_active = TRUE
  AND intent = 'recurring_bill'
  AND next_expected_at <= $next_payday_date;
```

### 6.3 Unreviewed anomalies reserve

```sql
SELECT SUM(ABS(amount)) as anomaly_reserve
FROM transactions
WHERE user_id = $user_id
  AND review_status IN ('pending', 'needs_attention')
  AND occurred_at >= NOW() - INTERVAL '14 days';
```

### 6.4 Import dedup check (ING fallback)

```sql
SELECT id FROM transactions
WHERE account_id = $account_id
  AND occurred_at = $occurred_at
  AND amount = $amount
  AND raw_description = $raw_description
LIMIT 1;
```

---

## 7. 마이그레이션 순서

Claude Code가 schema를 Drizzle로 구현할 때 아래 순서로 마이그레이션 파일 생성:

```
0001_users.ts
0002_accounts.ts
0003_categories.ts           -- users 이후 (system seed 포함)
0004_import_batches.ts
0005_transactions.ts         -- accounts, import_batches 이후
0006_import_rows.ts          -- import_batches, transactions 이후
0007_transfer_links.ts       -- transactions 이후
0008_reimbursement_links.ts  -- transactions 이후
0009_rules.ts
0010_recurring_series.ts
0011_budget_periods.ts
0012_sinking_funds.ts
0013_safe_to_spend_snapshots.ts
0014_audit_logs.ts
0015_rls_policies.ts         -- 모든 테이블 이후
0016_seed_categories.ts      -- 시스템 기본 카테고리
```

---

## 8. V1 제외 / V1.5 이후

V1에서 **의도적으로 구현하지 않는 것:**

- `account_type = 'pension'` 관련 집계
- Multi-currency 환율 변환 (컬럼은 있지만 로직 없음)
- Household / shared user 모델
- Category 계층 구조 (parent_id는 있지만 V1 UI에서 미사용)
- Recurring series 자동 감지 (V1은 수동 등록만)
- 예측/forecast 테이블

---

*이 문서는 `23_Safe_To_Spend_Engine_Spec.md`와 함께 읽어야 한다.*
*엔진이 읽는 필드가 바뀌면 이 문서도 반드시 업데이트한다.*
