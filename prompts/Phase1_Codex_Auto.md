# Phase1_Codex_Auto.md

## 사용 방법

이 파일을 Dart Finance 레포 루트에서 사용한다.

예시:

```bash
cd /Users/seungjaehong/Documents/CodeSpace/dart_v2_finance/dart_v2_finance
codex < Phase1_Codex_Auto.md
```

또는 파일이 다른 위치에 있으면:

```bash
cd /Users/seungjaehong/Documents/CodeSpace/dart_v2_finance/dart_v2_finance
codex < /absolute/path/to/Phase1_Codex_Auto.md
```

---

## Global Instruction

Before coding, read the relevant docs first and quote the acceptance criteria back to me in bullet form.

You are working in the Dart Finance monorepo.

Read these files first:
- CLAUDE.md
- Dart_Finance_Handoff_v1.md
- docs/23_Safe_To_Spend_Engine_Spec.md
- docs/21_Data_Model.md
- docs/Dart_Finance_Execution_Lock_v1_3.md

---

## Global Rules

- Do NOT guess missing product decisions.
- Do NOT expand scope beyond V1.
- V1 supports ING + Trading 212 only.
- Follow web-first order.
- All money values must be INTEGER cents only. Never use float for money.
- TypeScript strict mode only. No `any`. No `@ts-ignore`.
- Use the existing project structure and naming.
- Do not rewrite unrelated files.
- If spec and implementation context conflict, stop and report the exact ambiguity.

After every code change, run:

```bash
pnpm tsc --noEmit
```

Do NOT modify these files:
- .env*
- supabase/config.toml
- CLAUDE.md
- src/lib/supabase/client.ts

Important environment note:
- `/Users/seungjaehong/Documents/CodeSpace/dart_v2_finance/dart_v2_finance/apps/web/.env.local` already exists.
- Do not overwrite or inject credentials into it.
- You may only rely on it if needed.
- If any example env file is needed, create `.env.example` only.

---

## Execution Mode

You must execute tasks sequentially in this exact order:
1. Phase 1-A — Safe-to-spend engine
2. Phase 1-B — Supabase connection readiness
3. Phase 1-C — Web onboarding
4. Phase 1-D — ING CSV parser
5. Phase 1-E — T212 CSV parser
6. Phase 1-F — Web CSV import UI
7. Phase 1-G — Web transactions UI
8. Phase 1-H — Web "Why This Number?" page

After each phase:
1. Summarize what you read and the acceptance criteria in bullet form
2. Implement only that phase
3. Run validation commands
4. Report changed files and results
5. Automatically continue to the next phase without waiting for user input

Do not skip phases.
Do not jump ahead.
Do not add extra features.

---

# Phase 1-A — Safe-to-Spend Engine

## Goal

Implement the safe-to-spend engine incrementally by following the existing tests and spec.

## Files

- `packages/core/src/safe-to-spend/engine.ts`
- `packages/core/src/safe-to-spend/__tests__/test-utils.ts`
- Other files inside `packages/core/src/safe-to-spend/` only if required by the existing test structure

## Required Formula

- `available_cash = sum(checking + cash + user_enabled_accessible_savings)`
- `protected_obligations = upcoming_recurring_bills_before_next_payday + sinking_fund_monthly_allocation + minimum_cash_buffer + planned_investing_contribution (if protection = ON) + unreviewed_anomalies_reserve`
- `spendable_pool = max(0, available_cash - protected_obligations)`
- `safe_to_spend_today = floor(spendable_pool / days_until_next_payday)`

## Required Rules

- Ignore these intents in spend calculation:
  - `transfer`
  - `investment_contribution`
  - `investment_buy`
  - `investment_sell`
- anomaly reserve includes transactions from the last 14 days where `review_status` is `pending` or `needs_attention`
- If payday is null: throw `new Error('PAYDAY_NOT_CONFIGURED')`
- If no import data exists: throw `new Error('NO_IMPORT_DATA')`
- Always return `assumption_trail` with at least one entry
- Clamp negative spendable pool to 0

## Error Codes To Support If Covered By Tests

- `PAYDAY_NOT_CONFIGURED`
- `PAYDAY_TODAY_OR_OVERDUE`
- `PAYDAY_FAR_FUTURE`
- `SALARY_NOT_DETECTED`
- `INVESTING_PROTECTION_DISABLED`
- `INVESTING_EXCEEDS_CASH`
- `OBLIGATIONS_EXCEED_CASH`
- `STALE_IMPORT_DATA`
- `NO_IMPORT_DATA`

## Execution Steps

1. Inspect the current engine types and all test files under `packages/core/src/safe-to-spend/__tests__/`
2. Implement `buildTestContext` in `test-utils.ts`
   - default `today = 2026-04-22`
   - default `paydayDate = 2026-04-30`
   - default `availableCash = 100000`
3. Run tests group by group in this order:
   - A: Payday boundaries
   - B: Investment protection
   - C: Reimbursement
   - D: Transaction intent
   - E: Edge cases
   - F: Stale data
   - G: Account inclusion
4. For each group, implement only the minimum production logic required for that group to pass
5. At the end of Phase 1-A, run:

```bash
pnpm test
pnpm tsc --noEmit
```

6. Confirm whether all 50/50 tests pass

---

# Phase 1-B — Supabase Connection Readiness

## Goal

Prepare the repo for Supabase connection without writing real credentials.

## Important Note

This file already exists:

`/Users/seungjaehong/Documents/CodeSpace/dart_v2_finance/dart_v2_finance/apps/web/.env.local`

Do not overwrite it.

## Requirements

1. Do not write real credentials anywhere
2. Only prepare code/config so the manual steps will work cleanly
3. Assume the owner will manually manage:
   - `apps/web/.env.local`
   - `packages/db/.env.local`
4. If needed, create `.env.example` only
5. Verify the setup is ready for:

```bash
pnpm --filter @dart/db db:generate
pnpm --filter @dart/db db:migrate
pnpm tsc --noEmit
```

6. Fix only code/config issues that block this phase

---

# Phase 1-C — Web Onboarding

## Goal

Implement only the onboarding flow in:

`apps/web/app/(app)/onboarding/`

## Required Steps

1. `/onboarding/payday`
2. `/onboarding/income`
3. `/onboarding/investing`
4. `/onboarding/accounts`

## Rules

- 4-step flow only
- After completion, redirect to dashboard
- Do not add extra onboarding steps
- Keep V1 English-only
- Use existing design system and tokens
- No hardcoded colors

## Validation

```bash
pnpm tsc --noEmit
```

---

# Phase 1-D — ING CSV Parser

## Goal

Implement only:

`packages/csv-parsers/src/ing/parser.ts`

## Requirements

- semicolon-delimited ING CSV
- validate required columns
- `Datum`: `DD-MM-YYYY` → `Date`
- `Naam / Omschrijving` → `raw_description`
- `Bedrag (EUR)`: Dutch comma decimal → INTEGER cents
- `Af` = negative
- `Bij` = positive
- no `external_id`, so generate fallback dedup hash
- return `ParseResult` with `rows` and `errors`
- do not add Rabobank or other bank support

## Validation

```bash
pnpm tsc --noEmit
```

---

# Phase 1-E — T212 CSV Parser

## Goal

Implement only:

`packages/csv-parsers/src/t212/parser.ts`

## Mapping

- `Deposit` → `investment_contribution`
- `Market buy` → `investment_buy`
- `Market sell` → `investment_sell`
- `Dividend (Ordinary)` → `income_dividend`
- `Interest on cash` → `income_other`

## Requirements

- `Time` → `occurred_at`
- `Total` → INTEGER cents
- `ID` → `external_id`
- support dedup priority using `(account_id, external_id)`
- return `ParseResult` with `rows` and `errors`

## Validation

```bash
pnpm tsc --noEmit
```

---

# Phase 1-F — Web CSV Import UI

## Goal

Implement only:

`apps/web/app/(app)/import/`

## Required Features

1. File upload (drag & drop + click)
2. Bank select (`ING` / `T212` only)
3. Column mapping UI
4. Import preview (top 5 rows)
5. Import execution
6. Dedup notice: `N duplicates skipped`

## Rules

- Keep within V1 scope only
- No extra screens
- Use design reference if available
- No hardcoded colors

## Validation

```bash
pnpm tsc --noEmit
```

---

# Phase 1-G — Web Transactions UI

## Goal

Implement only:

`apps/web/app/(app)/transactions/`

## Required Features

- Table columns:
  - Date
  - Description
  - Amount
  - Intent
  - Review status
- Intent edit dropdown
- Bulk review actions
- Needs attention filter
- Amber banner when unreviewed transactions exist

## Rules

- No hardcoded colors
- Use CSS variables only

## Validation

```bash
pnpm tsc --noEmit
```

---

# Phase 1-H — Web "Why This Number?"

## Goal

Implement only:

`apps/web/app/(app)/why/`

## Required Sections

1. Safe-to-spend header
2. Available Cash section
3. Protected Obligations section
4. Calculation breakdown (`pool / days = daily`)
5. Each item clickable and linked to relevant data/settings where possible

## Rules

- Do not invent new financial logic beyond the engine spec
- Use design references if available
- No hardcoded colors

## Validation

```bash
pnpm tsc --noEmit
```

---

# Final Check

At the very end, run:

```bash
pnpm test
pnpm tsc --noEmit
pnpm build
```

---

# Final Output Format

At the end, print:

1. Completed phases
2. Files changed per phase
3. Test results
4. Typecheck result
5. Build result
6. Remaining issues, if any
7. Any ambiguity found in docs/spec
