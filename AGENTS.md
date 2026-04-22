# AGENTS.md

Dart Finance project operating rules for Codex and other coding agents.

## Mission
Build Dart Finance V1 exactly within documented scope.

## Read first
Before coding, read the relevant docs first and quote the acceptance criteria back to me in bullet form.

Always read:
1. CLAUDE.md
2. Dart_Finance_Handoff_v1.md
3. Relevant files in `docs/`
4. Relevant files in `design/screens/` for UI work

## Hard constraints
- Do not guess missing business logic. Ask instead.
- Do not expand scope beyond V1.
- V1 supports ING + Trading 212 only.
- Development order is web-first.
- All money values are INTEGER cents only.
- Never use float for money.
- TypeScript strict mode only.
- No `any`.
- No `@ts-ignore`.
- No hardcoded hex colors in app components.
- Reuse existing components and design tokens before creating new ones.

## Protected files
Never modify:
- `.env*`
- `supabase/config.toml`
- `CLAUDE.md`
- `src/lib/supabase/client.ts`

## Work style
Before coding:
1. Quote acceptance criteria back in bullet form.
2. Name exact files you plan to edit.
3. Call out ambiguity instead of guessing.

During coding:
- Make surgical changes only.
- Touch only files required for the requested task.
- Prefer the smallest implementation that satisfies the spec.
- Do not refactor unrelated code.

After coding:
1. Summarize files changed.
2. Summarize commands run.
3. Summarize whether stopping rules passed.
4. Summarize remaining blockers or ambiguity.

## Validation rules
After every meaningful change:
```bash
pnpm tsc --noEmit
```

For engine/domain logic changes:
```bash
pnpm test
```

For parser changes:
- Run relevant parser tests if they exist.
- Then run `pnpm tsc --noEmit`.

For web UI changes:
```bash
pnpm tsc --noEmit
pnpm build
```

## Review severity guide
- P0: money precision issue, security issue, protected file change, spec-violating business logic
- P1: missing tests, missing docs alignment, V1 scope expansion, broken route flow
- P2: clarity, naming, cleanup suggestions
