# Blocker 2 — PostHog and Sentry Live Bootstrap

Before coding, read the relevant docs first and quote the acceptance criteria back to me in bullet form.

Read first:
- CLAUDE.md
- docs/Beta_Launch_Owner_Checklist.md
- docs/Beta_Readiness_Verification_Checklist.md

Task:
Convert the existing provider-agnostic observability hooks into live-bootstrap-ready integration paths for PostHog and Sentry, without adding secrets.

Scope:
- install/bootstrap-safe client wiring points if missing
- ensure existing event hooks can route through the real provider initialization path
- keep graceful no-key behavior
- add owner-facing setup notes for required public keys / DSNs

Constraints:
- Do not modify protected files
- No real secrets
- Use .env.example only if needed
- Do not remove existing event hooks
- Keep failure behavior safe when providers are absent

Deliverables:
- live-bootstrap-ready PostHog wiring
- live-bootstrap-ready Sentry wiring
- clear env/key documentation
- tests or lightweight validation where feasible

Stopping rule:
- existing observability hooks route through real bootstrap-capable wiring
- no-key mode remains safe
- pnpm tsc --noEmit passes
- pnpm build passes

At the end, report:
1. files changed
2. commands run
3. bootstrap gaps still requiring owner input
