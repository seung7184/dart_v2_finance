# PHASE2_MOBILE_LOOP.md

## Goal
Implement Phase 2 mobile for Dart Finance only after Phase 1 web core is stable.

Before coding, read the relevant docs first and quote the acceptance criteria back to me in bullet form.

## Read first
- AGENTS.md
- CLAUDE.md
- docs/Dart_Finance_Handoff_v1.md
- docs/21_Data_Model.md
- docs/23_Safe_To_Spend_Engine_Spec.md
- design/screens/Mobile_Home.html
- design/screens/Mobile_Quick_Add.html

## Scope for this loop
Only implement documented Phase 2 items:
1. `apps/mobile/app/(tabs)/index.tsx`
2. `apps/mobile/app/quick-add.tsx`
3. `apps/mobile/app/(tabs)/transactions.tsx`
4. `apps/mobile/app/(tabs)/bills.tsx`

## Hard constraints
- Do not expand scope beyond documented Phase 2
- No new tabs/screens beyond documented ones
- All money values remain INTEGER cents only
- Use existing domain logic and design tokens
- Do not invent portfolio analytics or forecast features
- Keep mobile aligned with the existing safe-to-spend engine behavior

## Implementation order

### Step 1 — Mobile Home
Implement `apps/mobile/app/(tabs)/index.tsx`
Requirements:
- safe-to-spend hero
- 3 cards: remaining, upcoming bills, planned investing
- `+ Quick Add` FAB
- use existing engine output / placeholder integration path if backend data is not fully connected yet

### Step 2 — Quick Add
Implement `apps/mobile/app/quick-add.tsx`
Requirements:
- amount keypad
- category chips
- save flow
- write to transactions table or existing transaction insertion layer
- keep input flow fast and minimal

### Step 3 — Transactions tab
Implement `apps/mobile/app/(tabs)/transactions.tsx`
Requirements:
- recent transactions list
- readonly view
- stable formatting for date, description, amount, intent/status if relevant

### Step 4 — Bills tab
Implement `apps/mobile/app/(tabs)/bills.tsx`
Requirements:
- upcoming recurring bills list
- minimal, clean layout
- no extra planning or forecasting UI

## UI iteration loop
For each screen:
1. implement with existing components/tokens
2. run mobile typecheck/build checks available in repo
3. visually compare against design reference
4. iterate until spacing, hierarchy, and readability are acceptable

## Validation
After meaningful changes, run the relevant checks available in the repo.
Minimum required:

```bash
pnpm tsc --noEmit
pnpm build
```

If the monorepo has app-specific mobile checks, run them too and report them.

## Stopping rule
Stop only when:
- all 4 documented mobile routes are implemented
- no extra Phase 2 scope was added
- typecheck passes
- build passes
- design hierarchy is acceptably close
- no protected files were modified

## Required output
At the end, report:
1. Acceptance criteria
2. Files changed
3. Commands run
4. What is fully complete
5. What is placeholder vs production-ready
6. Any blocker caused by missing backend wiring
