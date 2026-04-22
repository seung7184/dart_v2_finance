# POST_PHASE1_RECOMMENDED_ORDER.md

## Recommended order after a successful Phase 1

Phase 1 implementation succeeded, but before jumping straight into more feature work, use this order:

### Priority 1 — Freeze and validate
- Review diff vs project rules
- Confirm no protected files changed
- Confirm integer cents only in money logic
- Confirm no Phase 1 scope creep

### Priority 2 — Close operational gaps
- Finish live database readiness
- Wire web import flow to server-side persistence
- Re-run:
  - `pnpm tsc --noEmit`
  - `pnpm test`
  - `pnpm build`

### Priority 3 — Only then start Phase 2 mobile
Implement in this order:
1. Mobile Home
2. Quick Add
3. Transactions tab
4. Bills tab

## Why this order is best
If mobile starts before import persistence and DB readiness are stabilized, you increase the risk of:
- duplicated transaction write logic
- inconsistent engine inputs between web and mobile
- avoidable rework once live DB wiring is finished

## Suggested execution commands

### If you want to harden Phase 1 first
```bash
codex < prompts/PHASE1_HARDENING_POSTRUN.md
```

### If Phase 1 hardening is done and you want to start mobile
```bash
codex < prompts/PHASE2_MOBILE_LOOP.md
```

## Decision guide
Use this quick rule:
- if DB + import persistence are not fully finished -> run Phase 1 hardening first
- if DB + import persistence are already stable -> start Phase 2 mobile

## What to send back after each run
Share:
1. completed items
2. files changed
3. `pnpm test` result
4. `pnpm tsc --noEmit` result
5. `pnpm build` result
6. blockers
