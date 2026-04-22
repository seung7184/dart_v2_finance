# PHASE1_HARDENING_POSTRUN.md

## Goal
Lock in the successful Phase 1 implementation, resolve the remaining operational gaps, and prepare the repo for Phase 2 mobile work without destabilizing the web core.

Before coding, read the relevant docs first and quote the acceptance criteria back to me in bullet form.

## Read first
- AGENTS.md
- CLAUDE.md
- docs/Dart_Finance_Handoff_v1.md
- docs/21_Data_Model.md
- docs/23_Safe_To_Spend_Engine_Spec.md

## Current known status
Phase 1 implementation is complete and passed:
- pnpm test
- pnpm tsc --noEmit
- pnpm build

Open gaps still remaining:
1. Database migration cannot complete until a live Postgres/Supabase database is available
2. The web import page UI is not yet wired to a server-side import pipeline / persistence layer

## Hard constraints
- Do not expand scope beyond V1
- Do not modify protected files
- All money values must remain INTEGER cents only
- Use TypeScript strict mode only
- Do not invent new product logic that is not in the docs

## Work items

### Work item A — Phase 1 freeze review
Review the current Phase 1 implementation and confirm:
- no protected files were changed
- no obvious scope creep was introduced
- money logic still uses integer cents only
- UI work uses tokens / no hardcoded hex colors in app components

If violations are found, fix them surgically.

### Work item B — DB readiness pass
Prepare the repo so that once `.env.local` values are present and Supabase is live, the following commands are expected to work without further code changes:

```bash
pnpm --filter @dart/db db:generate
pnpm --filter @dart/db db:migrate
```

Do not add real credentials.
Do not modify `.env*` contents.
You may improve docs, examples, comments, or config validation if needed.

### Work item C — Server-side import pipeline
Wire the existing import flow to a persistence layer.
Target outcome:
- upload/import path creates `import_batches`
- parsed rows are validated
- transactions are created server-side
- duplicates are skipped using existing dedup rules
- import result is returned to the UI with counts

Do not add bank sync or other V1-excluded features.
Support ING + T212 only.
Reuse existing parser package instead of duplicating parser logic in web code.

### Work item D — Minimal verification
After changes, run:

```bash
pnpm tsc --noEmit
pnpm test
pnpm build
```

If a live DB is not available, clearly separate:
- code/config readiness
- runtime DB connectivity readiness

## Stopping rule
Stop only when all of the following are true:
- Phase 1 codebase is reviewed and any rule violations are fixed
- import flow is server-side and persistent, or the exact missing blocker is documented
- pnpm tsc --noEmit passes
- pnpm test passes
- pnpm build passes
- no protected files were modified

## Required output
At the end, report:
1. Acceptance criteria
2. Files changed
3. Commands run
4. What is fully complete
5. What still depends on a live database
6. Any ambiguity or blocker
