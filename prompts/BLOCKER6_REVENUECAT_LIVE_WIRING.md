# Blocker 6 — RevenueCat Live Wiring

Before coding, read the relevant docs first and quote the acceptance criteria back to me in bullet form.

Read first:
- CLAUDE.md
- docs/Beta_Launch_Owner_Checklist.md
- apps/mobile/src/billing/revenuecat.ts
- apps/mobile/app/(tabs)/index.tsx

Task:
Upgrade the current RevenueCat readiness helper to the maximum live-ready wiring possible without installing or configuring live credentials unless strictly needed.

Scope:
- explicit offering / entitlement config contract
- safe app behavior when SDK or keys are absent
- owner-facing setup notes

Constraints:
- no real secrets
- do not misrepresent billing as live
- preserve current app build stability

Stopping rule:
- RevenueCat path is live-ready at contract/config level
- missing owner inputs documented
- pnpm tsc --noEmit passes
- pnpm build passes
