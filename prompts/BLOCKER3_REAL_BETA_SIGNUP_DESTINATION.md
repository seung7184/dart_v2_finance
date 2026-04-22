# Blocker 3 — Real Beta Signup Destination

Before coding, read the relevant docs first and quote the acceptance criteria back to me in bullet form.

Read first:
- CLAUDE.md
- Dart_Finance_Handoff_v1.md
- docs/Beta_Launch_Owner_Checklist.md
- docs/Beta_Readiness_Verification_Checklist.md

Task:
Replace the local/mock beta signup handler with a real operational destination that fits the current repo and beta-readiness scope.

Preferred direction:
- use the existing app/backend shape first
- prefer a simple durable destination over introducing an external platform
- if a real external destination cannot be completed without missing owner secrets, implement the maximum real wiring possible and stop with exact remaining owner inputs

Scope:
- beta signup persistence or submission destination
- form validation remains intact
- owner can review collected beta signups through a documented path

Constraints:
- Do not invent secrets
- Do not expand to full CRM/admin product work
- Do not modify protected files
- Keep V1 institution assumptions intact

Stopping rule:
- beta signup no longer ends only in a local/mock ticket flow
- there is a real durable destination or the maximum feasible wiring with exact owner-input blockers
- pnpm tsc --noEmit passes
- pnpm build passes

At the end, report:
1. files changed
2. real destination used
3. commands run
4. remaining owner inputs
