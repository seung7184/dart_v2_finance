# Phase 1-A — Engine Loop

Before coding, read the relevant docs first and quote the acceptance criteria back to me in bullet form.

## Read first
- `CLAUDE.md`
- `Dart_Finance_Handoff_v1.md`
- `docs/23_Safe_To_Spend_Engine_Spec.md`
- `docs/21_Data_Model.md`
- `AGENTS.md`

## Task
Implement only the safe-to-spend engine loop.

## Files in scope
- `packages/core/src/safe-to-spend/engine.ts`
- `packages/core/src/safe-to-spend/__tests__/test-utils.ts`
- other files under `packages/core/src/safe-to-spend/` only if required by existing test structure

## Hard constraints
- Do not guess undefined business logic.
- Do not edit unrelated packages.
- All money values are INTEGER cents only.
- Always return `assumption_trail` with at least 1 entry.

## Required formula
- `available_cash = checking + cash + accessible savings`
- `protected_obligations = upcoming bills + sinking fund + minimum buffer + planned investing (if ON) + anomaly reserve`
- `spendable_pool = max(0, available_cash - protected_obligations)`
- `safe_to_spend_today = floor(spendable_pool / days_until_next_payday)`

## Required rules
Ignore these intents in spend calculation:
- `transfer`
- `investment_contribution`
- `investment_buy`
- `investment_sell`

Anomaly reserve must include transactions from the last 14 days where review status is:
- `pending`
- `needs_attention`

Errors to support if covered by tests/spec:
- `PAYDAY_NOT_CONFIGURED`
- `PAYDAY_TODAY_OR_OVERDUE`
- `PAYDAY_FAR_FUTURE`
- `SALARY_NOT_DETECTED`
- `INVESTING_PROTECTION_DISABLED`
- `INVESTING_EXCEEDS_CASH`
- `OBLIGATIONS_EXCEED_CASH`
- `STALE_IMPORT_DATA`
- `NO_IMPORT_DATA`

## Loop execution plan
1. Inspect existing tests under `packages/core/src/safe-to-spend/__tests__/`
2. Implement `buildTestContext`
3. Run Group A only
4. Implement minimum logic to pass Group A
5. Re-run Group A until all pass
6. Continue in order: B → C → D → E → F → G
7. Run full validation at the end

## Commands
```bash
pnpm test
pnpm tsc --noEmit
```

## Stopping rule
Stop only when all of the following are true:
- test groups A-G pass
- `pnpm test` passes
- `pnpm tsc --noEmit` passes
- no protected files changed

## Output format
After work, report:
1. acceptance criteria bullets
2. files changed
3. test results by group
4. final `pnpm tsc --noEmit` result
5. unresolved ambiguity if any
