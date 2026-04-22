# Phase 1 Post-Run Plan

Use this after the current long Codex Phase 1 run finishes.

## Why this exists
The current Phase 1 run is a valid bootstrap pass, but it is too broad for efficient iteration.
After it finishes, switch to smaller loop-based Codex workflows.

## What to do when the current run ends
Collect and save these four outputs:
1. Final Codex summary
2. `pnpm test` result
3. `pnpm tsc --noEmit` result
4. Changed file list

Then decide which case applies.

---

## Case A — Full success
Use this when:
- `pnpm test` passes
- `pnpm tsc --noEmit` passes
- The main requested Phase 1 scope is complete

Next actions:
1. Add `AGENTS.md` to project root.
2. Stop using one giant prompt for all of Phase 1.
3. Move to loop-based prompts for each area:
   - engine
   - supabase
   - onboarding
   - parsers
   - import UI
   - transactions UI
   - why page
4. Add review rules for future PR-style checks.

---

## Case B — Partial success
Use this when:
- some groups pass, but not all
- typecheck passes but tests fail
- implementation exists but specific pieces are incomplete

Next actions:
1. Do not rerun the entire giant prompt.
2. Create a focused loop for only the failed area.
3. Keep the stopping rule narrow and mechanical.
4. Review git diff before the next run.

Example:
- engine tests failing → run only `PHASE1A_ENGINE_LOOP.md`
- onboarding incomplete → run only `PHASE1C_ONBOARDING_LOOP.md`

---

## Case C — Failure / drift
Use this when:
- Codex changed unrelated files
- business logic drifted from spec
- scope expanded beyond V1
- protected files were touched

Next actions:
1. Revert unrelated changes.
2. Add `AGENTS.md` before the next run.
3. Restart with the smallest loop that reproduces the issue.
4. Add stricter file scope and stopping rules.

---

## Recommended operating model from now on
Codex should be used as a loop worker, not a one-shot code generator.

Each loop should do this:
1. Read docs first.
2. Quote acceptance criteria back in bullet form.
3. Name files to edit.
4. Implement only the requested scope.
5. Run validation commands.
6. Summarize result and blockers.
7. Stop only when the loop stopping rule is satisfied.

## Recommended file placement
Place these files in project root or `prompts/`:
- `AGENTS.md`
- `prompts/PHASE1A_ENGINE_LOOP.md`
- `prompts/PHASE1B_SUPABASE_LOOP.md`
- `prompts/PHASE1C_ONBOARDING_LOOP.md`
- `prompts/PHASE1D_PARSERS_LOOP.md`
- `prompts/PHASE1E_IMPORT_LOOP.md`
- `prompts/PHASE1F_TRANSACTIONS_LOOP.md`
- `prompts/PHASE1G_WHY_LOOP.md`
- `prompts/PR_REVIEW_RULES.md`

## Practical recommendation for your current situation
Because Phase 1 is already running right now:
- do not interrupt that run just to adopt the new workflow
- wait for final results
- then switch to the loop-based system for the next iteration
