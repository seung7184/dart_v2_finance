# Phase 3-A RLS + Auth (Real)
Before coding, read docs first and quote acceptance criteria back in bullet form.

Task:
Implement real readiness work (not placeholder surfaces) for:
- Review documented tables and add/verify RLS policy scaffolds/migrations where missing
- Verify auth boundary assumptions in app routes touching user data
- Add validation checks or tests for access assumptions
- Do not use live secrets. .env.example only if needed.

Constraints:
- Do not modify protected files (.env*, supabase/config.toml, CLAUDE.md, src/lib/supabase/client.ts)
- Do not expand beyond documented beta readiness.
- INTEGER cents rule remains for money logic.

Stopping rule:
- RLS/auth acceptance criteria met
- pnpm tsc --noEmit passes
- pnpm build passes
- Report files changed, commands run, blockers
