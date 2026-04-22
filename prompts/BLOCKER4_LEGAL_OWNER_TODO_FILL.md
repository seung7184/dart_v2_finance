# Blocker 4 — Legal and Contact TODO Fill

Before coding, read the relevant docs first and quote the acceptance criteria back to me in bullet form.

Read first:
- docs/Beta_Launch_Owner_Checklist.md
- apps/web/app/privacy/page.tsx
- apps/web/app/terms/page.tsx

Task:
Do not guess legal facts. Audit the current privacy/terms TODO(owner) placeholders and produce the smallest owner-input checklist needed to finalize them.

Scope:
- identify each missing legal/contact variable
- map each variable to where it is used
- produce a concise owner fill-in checklist doc

Constraints:
- do not fabricate company/legal details
- do not pretend legal review is complete
- preserve current safe placeholder copy if values are unknown

Stopping rule:
- every unresolved legal/contact placeholder is explicitly listed
- exact insertion points are documented
- app still builds

At the end, report:
1. missing values list
2. files changed
3. commands run
