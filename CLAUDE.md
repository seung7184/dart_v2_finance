# CLAUDE.md — Dart Finance Agent Rules

**Read this file completely before taking any action. No exceptions.**
**After reading, confirm: "CLAUDE.md read. Proceeding."**

---

## 0. What This Project Is

Dart Finance is a calm, investor-aware safe-to-spend app for employed people in the Netherlands.

One-line promise: *"오늘 얼마를 써도 되는지, 투자 계획을 무시하지 않고 알려준다."*

Core tech: Turborepo + pnpm monorepo, Next.js 15 (web), Expo (mobile), Supabase + Drizzle ORM, shadcn/ui + NativeWind.

---

## 1. Mandatory Rules (break these = stop and ask)

1. **Read CLAUDE.md first** — you are doing this now
2. **Read the relevant spec/doc before editing any domain logic**
   - Safe-to-spend engine → read `docs/23_Safe_To_Spend_Engine_Spec.md` first
   - Data schema → read `docs/21_Data_Model.md` first
   - Product scope → read `docs/01_Product_Brief.md` first
3. **Read the target file before editing it** — never edit blind
4. **After every edit** → run `pnpm tsc --noEmit` → fix ALL errors before continuing
5. **Commit after each major step** with format: `feat(scope): description`

---

## 2. DO NOT TOUCH (ever)

```
.env*                          # never create or modify real env files
supabase/config.toml           # managed manually
CLAUDE.md                      # this file
src/lib/supabase/client.ts     # auth config, hands off
```

Only create `.env.example` files with placeholder values.

---

## 3. Code Style Rules

| Rule | Value |
|------|-------|
| Currency formatting | `Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' })` always |
| Colors | CSS variables only — never hardcode hex in components |
| Sidebar | Always dark background (`var(--color-sidebar)`) |
| Amounts in DB | INTEGER cents only — never float, never string |
| Primary key | UUID via `gen_random_uuid()` — never serial/int |
| TypeScript | Strict mode. No `any`. No `@ts-ignore` without comment explaining why |
| Imports | Absolute paths via `@/` alias — no relative `../../` chains |

---

## 4. Architecture Rules

```
packages/core/     → ALL business logic. Zero UI imports. Zero DB imports.
packages/db/       → Drizzle schema ONLY. No business logic.
packages/ui/       → Shared components only. No business logic.
apps/web/          → Next.js 15 App Router. Imports from packages only.
apps/mobile/       → Expo. Imports from packages/core and packages/ui only.
packages/csv-parsers/ → ING + T212 only. No other banks in V1.
```

**Cross-package import rule**: `apps/*` can import from `packages/*`. `packages/*` cannot import from `apps/*`. `packages/core` cannot import from `packages/db` (db imports happen at the app boundary only).

---

## 5. Safe-to-Spend Engine Rules

The engine lives at: `packages/core/src/safe-to-spend/engine.ts`

**Do not implement the engine without:**
1. Reading `23_Safe_To_Spend_Engine_Spec.md` fully
2. Confirming test files exist in `packages/core/src/safe-to-spend/__tests__/`
3. Running the tests first (they should fail — TDD)

Key engine constraints:
- All amounts in cents (INTEGER) — never divide until final display
- `spendable_pool = max(0, available_cash - protected_obligations)` — never negative
- `value = spendable_pool / days_until_payday` — always floor, never round up
- Every computation must produce an `assumption_trail` array
- If `payday_date` is not configured → throw `'PAYDAY_NOT_CONFIGURED'`
- If no import data exists → throw `'NO_IMPORT_DATA'`

---

## 6. V1 Scope Lock (do not add these)

```
❌ Bank sync / open banking
❌ CSV parsers beyond ING and Trading 212
❌ AI chat / assistant surface
❌ Forecast / what-if simulations
❌ Household / shared account features
❌ Dutch or Korean UI (V1 is English only)
❌ Rabobank or DeGiro support
❌ More than 5 core screens in initial design phase
```

---

## 7. Document Map

| File | Purpose | Read when |
|------|---------|-----------|
| `docs/00_Dart_Finance_Master_Report_v1_2.md` | Full product context | First session only |
| `docs/01_Product_Brief.md` | 1-page product summary | Start of any session |
| `docs/21_Data_Model.md` | Full DB schema spec | Before any schema work |
| `docs/23_Safe_To_Spend_Engine_Spec.md` | Engine policy | Before any engine work |
| `docs/Dart_Finance_Execution_Lock_v1_3.md` | Locked decisions | When scope is unclear |
| `docs/11_Lars_Interview_Guide.md` | User research | Not relevant to code |
| `prompts/PHASE_MONOREPO_SETUP.txt` | Monorepo setup prompt | Phase 0 only |
| `design/safe_to_spend_tests.ts` | Engine test cases | Before engine implementation |

---

## 8. Session Start Checklist

At the start of every new Claude Code session, before any work:

```
[ ] Read CLAUDE.md (this file)
[ ] Read 01_Product_Brief.md
[ ] Identify which phase/task is being worked on
[ ] Read the relevant spec doc for that task
[ ] Confirm: pnpm install passes, pnpm tsc --noEmit passes
```

---

## 9. When You're Unsure

- Scope unclear → read `docs/Dart_Finance_Execution_Lock_v1_3.md`
- Engine behavior unclear → read `docs/23_Safe_To_Spend_Engine_Spec.md`, section by section
- Schema unclear → read `docs/21_Data_Model.md`
- **Do not guess. Do not invent. Ask or read the spec.**
