# Phase 1 UI Loop — Playwright Style

Use this for onboarding, import UI, transactions UI, and the why page.

Before coding, read the relevant docs first and quote the acceptance criteria back to me in bullet form.

## Read first
- `CLAUDE.md`
- `Dart_Finance_Handoff_v1.md`
- relevant docs in `docs/`
- relevant HTML reference in `design/screens/`
- `AGENTS.md`

## Operating principle
Do not stop at first implementation.
Implement the page, render it, inspect it, compare it to the design reference, and iterate until it is acceptably close.

## Required rules
- Use existing `@dart/ui` components before creating new ones.
- Use design tokens / CSS variables only.
- No hardcoded hex colors.
- No extra screens or extra flows.
- Stay inside V1 scope.

## Iteration loop
1. Read the design reference file.
2. Quote acceptance criteria back in bullet form.
3. Identify exact files to edit.
4. Implement the minimum page.
5. Run:
```bash
pnpm tsc --noEmit
pnpm build
```
6. Render and inspect the page in browser.
7. Compare layout, spacing, hierarchy, and interaction states against the design reference.
8. Adjust and repeat until the stopping rule is satisfied.

## Stopping rule
Stop only when all of the following are true:
- route renders without runtime error
- layout and hierarchy are visually close to the design reference
- no hardcoded colors
- `pnpm tsc --noEmit` passes
- `pnpm build` passes

## Output format
After work, report:
1. acceptance criteria bullets
2. files changed
3. commands run
4. what was adjusted during visual iteration
5. remaining UI mismatch if any
