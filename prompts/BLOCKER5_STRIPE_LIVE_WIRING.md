# Blocker 5 — Stripe Live Wiring

Before coding, read the relevant docs first and quote the acceptance criteria back to me in bullet form.

Read first:
- CLAUDE.md
- docs/Beta_Launch_Owner_Checklist.md
- apps/web/app/billing/page.tsx
- apps/web/app/api/billing/stripe/checkout/route.ts
- apps/web/src/billing/stripe.ts

Task:
Upgrade the current Stripe scaffold to the maximum live-ready wiring possible without real secrets.

Scope:
- clear product/price env contract
- checkout session wiring shape
- owner-facing webhook / env setup notes
- preserve safe fallback when keys are absent

Constraints:
- no real secrets
- no pretending checkout is live when keys are absent
- no protected file edits

Stopping rule:
- Stripe path is live-ready at code/config contract level
- missing values are explicitly documented
- pnpm tsc --noEmit passes
- pnpm build passes
