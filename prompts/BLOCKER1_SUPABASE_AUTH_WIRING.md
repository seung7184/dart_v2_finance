# Blocker 1 — Real Supabase Auth Wiring

Before coding, read the relevant docs first and quote the acceptance criteria back to me in bullet form.

Read first:
- CLAUDE.md
- Dart_Finance_Handoff_v1.md
- docs/21_Data_Model.md
- docs/Beta_Launch_Owner_Checklist.md
- docs/Beta_Readiness_Verification_Checklist.md

Task:
Replace the temporary dart_auth_uid cookie boundary with a real Supabase-auth-compatible wiring path for the existing web app, without inventing undocumented business logic.

Scope:
- web auth/session callback wiring
- route protection for existing app surfaces
- session/cookie handling compatible with Supabase auth flow
- keep deny-by-default behavior if no authenticated session exists

Constraints:
- Do not modify protected files: .env*, supabase/config.toml, CLAUDE.md, src/lib/supabase/client.ts
- Do not expand scope beyond current beta-readiness needs
- Do not invent secrets
- Use .env.example only if needed
- Keep money handling rules unchanged

Deliverables:
- real auth wiring replacing the temporary cookie contract where appropriate
- clear owner-facing notes for any required callback URLs / env variables
- tests or validation for session boundary assumptions where feasible

Stopping rule:
- authenticated web flow is wired at scaffold/real-integration level, not placeholder-only
- route protection uses the real auth/session path instead of dart_auth_uid fallback
- pnpm tsc --noEmit passes
- pnpm build passes

At the end, report:
1. acceptance criteria
2. files changed
3. commands run
4. remaining blockers
