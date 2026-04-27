# Beta Readiness Hardening Prompt

Use this prompt to start the next workstream after Phase 1 completion.

---

Review the current repository for Private Beta readiness after Phase 1 completion.

Do not implement new product features.

Focus only on beta hardening:
- auth callback states
- observability verification
- user-facing error copy
- empty/error/loading states
- import/review/confirm end-to-end polish
- docs/checklists update

Before coding, read:
- docs/50_Current_Status_2026-04-27.md
- docs/Dart_Finance_Current_State_Handoff_Summary.md
- docs/Beta_Readiness_Verification_Checklist.md if present
- docs/Dart_Finance_Execution_Lock_v1_3.md if present

First, quote beta-readiness acceptance criteria.
Then inspect the code.
Then implement only minimal hardening fixes.

Do not add:
- mobile features
- billing activation
- bank sync
- AI/chat
- new CSV providers
- full category/rule engine

Run:
- pnpm tsc --noEmit
- pnpm --dir apps/web test
- pnpm test
- pnpm build

Report:
- files changed
- beta blockers remaining
- validation results
- GO / CONDITIONAL GO / NO-GO recommendation for private beta
