# 23 — Safe-to-Spend Engine Spec

Version 1.0 · 2026-04-22
Owner: Seungjae
Status: Policy-first draft — finalize before implementation

---

## 0. Purpose

This document defines what "Safe to Spend Today" means, how it is calculated, what policy decisions govern that calculation, and how the engine must behave at the edges.

This is a **policy document first, implementation document second.** Engineers and AI agents must read this before writing a single line of the engine.

---

## 1. Product Definition

### What it is

> Safe to Spend is a conservative daily cash guide based on your available cash, upcoming obligations, and planned investing — counted until your next payday.

### What it is NOT

- It is not a wealth guarantee.
- It is not a prediction of future balance.
- It is not a budget limit.
- It is not a daily spending maximum in the strict sense — it is a **cashflow confidence number.**

### UI copy (canonical)

> Safe to spend is a conservative daily guide based on your cash, upcoming obligations, and planned investing until payday.

This copy must not change without updating this spec. It is the contract with the user.

---

## 2. Input Data

The engine reads from the following inputs. All must be present before a number is computed.

| Input | Source | Required? |
|-------|--------|-----------|
| `available_cash` | Sum of checking + cash + user-enabled accessible savings accounts | Required |
| `payday_date` | User-configured setting | Required |
| `planned_investing_this_month` | User-configured recurring investment plan | Required if investing plan exists |
| `upcoming_recurring_bills` | Recurring series before next payday | Required if any exist |
| `sinking_fund_monthly_allocation` | User-configured sinking funds | Optional |
| `minimum_cash_buffer` | User-configured floor | Optional (default: €0) |
| `unreviewed_anomalies_reserve` | Auto-computed from import review queue | Auto-applied |

If `payday_date` is missing, the engine must not compute a number. It must prompt the user to set it.

---

## 3. Calculation Model

### 3.1 Base formula

```
available_cash
  = sum(checking + cash + user_enabled_accessible_savings)

protected_obligations
  = upcoming_recurring_bills_before_next_payday
  + sinking_fund_monthly_allocation
  + minimum_cash_buffer
  + planned_investing_contribution_this_month    [if protection is ON]
  + unreviewed_anomalies_reserve

spendable_pool
  = max(0, available_cash - protected_obligations)

safe_to_spend_today
  = spendable_pool / days_until_next_payday
```

### 3.2 Payday model (not month-end)

The engine uses **payday as the reference boundary**, not end of month.

Reasoning: users think in terms of "I have X days until my salary hits." Month-end is an abstraction that doesn't match mental models for salaried workers. The safe-to-spend number resets and recalculates when salary lands.

`days_until_next_payday` is calculated as:
```
days_until_next_payday = (next_payday_date - today).days
```

If `days_until_next_payday <= 0`, the engine should show `€0` with a status label "Payday today or overdue — update your payday date."

### 3.3 Minimum days floor

If `days_until_next_payday == 1`, compute normally (result is the full spendable pool).
Do not apply a floor of "at least 7 days" or similar smoothing. The number must be honest.

---

## 4. Policy Decisions (Confirmed)

### 4.1 Planned investing — default protection ON

Planned investing (monthly ETF contribution, DCA plan) is **protected by default.**

This means:
- If the user has a plan to invest €800 this month, that €800 is subtracted from `available_cash` before the daily number is computed.
- The user can toggle this protection OFF in Settings.
- When protection is OFF, a persistent UI warning is shown: "Your investing plan is not protected. Safe to spend may draw from your investment budget."

This is a product value, not just a setting. The whole point of Dart Finance is that safe-to-spend respects the investment plan. Defaulting to OFF would betray that promise.

### 4.2 Accessible savings — user-controlled inclusion

Savings accounts are **not included by default.**

Users can mark any savings account as "accessible" in Settings. When marked accessible, that account's balance is included in `available_cash`.

Why not include by default: emergency funds and locked savings must not silently inflate the safe-to-spend number. The user must consciously opt in.

### 4.3 Unreviewed anomalies reserve

When there are unreviewed transactions in the import review queue, the engine applies a reserve:

```
unreviewed_anomalies_reserve = sum(abs(amount)) of unreviewed transactions
  that are unclassified or flagged as potentially misclassified
```

This reserve is subtracted from the spendable pool. The reserve is shown as a line item in the "Why this number?" drill-down.

When all transactions are reviewed, the reserve drops to €0.

### 4.4 Investment transactions are never deducted from safe-to-spend

The following transaction intents are never counted as expenses:
- `transfer`
- `investment_contribution`
- `investment_buy`
- `investment_sell`

They do not reduce safe-to-spend. `investment_contribution` is separately shown in the "Planned investing this month" card.

---

## 5. Account Inclusion Rules

| Account Type | Included in available_cash? | Condition |
|---|---|---|
| `checking` | Yes | Always |
| `cash` | Yes | Always |
| `savings` | Only if user has marked it "accessible" | User setting |
| `brokerage` | No | Never |
| `pension` | No | Never |
| `credit_card` | No — but unsettled charges reduce available cash indirectly via transactions | Via settled transactions only |

### Credit card handling (V1)

V1 does not model credit card debt natively. Unsettled credit card transactions are not reflected until they appear in the bank account (i.e., when the direct debit posts to ING).

This is a known limitation. It will be flagged in the "Why this number?" drill-down if the user has a credit card account connected.

---

## 6. Reimbursement Pending

### Definition

A `reimbursement_out` transaction is money the user paid on behalf of someone else and expects to get back.

### Policy

- Reimbursements **out** that are unmatched (no corresponding `reimbursement_in`) reduce available cash, because the money is genuinely gone until returned.
- The engine does NOT proactively add "expected reimbursements" to available cash. It takes a conservative stance: money not yet received is not counted.
- When a matching `reimbursement_in` is linked, the pair is neutralized and neither affects safe-to-spend.

---

## 7. Edge Cases

### 7.1 Payday falls on a weekend or holiday

Policy: use the configured payday date as-is. Do not auto-shift to Friday or Monday. The user is responsible for updating their payday date if their employer pays early.

Future consideration: allow users to configure "salary typically lands 1 day early" as an offset.

### 7.2 Payday has already passed this month but salary not yet received

The engine uses the transaction ledger, not the calendar. If salary has not landed as a transaction, it is not counted. The `payday_date` setting is only used for the days_until calculation.

If today > payday_date and no salary transaction this month, show warning: "Expected salary not detected. Safe to spend may be understated."

### 7.3 Multiple salary sources

V1 supports a single `payday_date` and a single income plan. If the user has two salary sources, they should enter the combined expected salary and the earlier of the two payday dates.

Multi-source salary modeling is V2.

### 7.4 Negative available cash

If `available_cash - protected_obligations < 0`, show €0 with label "Your upcoming obligations exceed available cash." Do not show a negative number.

The drill-down must show which obligation caused the shortfall.

### 7.5 No payday configured

Block computation. Show onboarding prompt. Do not show €0 — that implies the answer is zero, which is misleading.

### 7.6 First time sinking fund starts

When a sinking fund is first added (e.g., annual insurance €1,200 → €100/month), start the allocation from the current month. Do not backdate.

### 7.7 Savings account marked accessible mid-period

If the user marks a savings account as accessible mid-period, the engine immediately includes it. The change is reflected in the next computation. The assumption change is logged in the drill-down: "Savings account added to available cash on [date]."

### 7.8 User toggles planned investing protection OFF

Show persistent inline warning in the home screen and in the drill-down. Do not hide the toggle state from the UI. Log the policy change with date in the assumption trail.

### 7.9 Import is stale (5+ days old)

If the most recent import is older than 5 days, show a banner: "Your import data is [N] days old. Safe to spend may not reflect recent transactions." The number is still shown — the user decides whether to act on it.

### 7.10 Unreviewed transactions make up >30% of recent imports

If more than 30% of transactions imported in the last 14 days are unreviewed, show additional warning in the drill-down: "Many recent transactions are unclassified. Reserve increased."

---

## 8. "Why This Number?" Drill-Down Structure

The drill-down is a first-class feature, not an afterthought. Every line item in the calculation must be tappable/clickable and must link to the underlying transactions or assumption.

### Required line items

```
Safe to Spend Today: € [X]

Available Cash
  ├── [Account name] (checking)       € [balance]
  ├── [Account name] (savings*)       € [balance]   *if accessible
  └── Total available cash            € [sum]

Protected Obligations
  ├── Upcoming bills (before [payday date])
  │     ├── [Bill name]   [date]      € [amount]
  │     └── ...
  ├── Sinking fund allocation         € [monthly amount]
  ├── Minimum cash buffer             € [configured amount]
  ├── Planned investing               € [amount]   [if protected]
  └── Unreviewed transactions reserve € [amount]

Spendable pool                        € [pool]
Days until payday                     [N] days

Safe to Spend Today                   € [pool / N]
```

### Drill-down interactions

- Tap "Upcoming bills" → opens recurring series list filtered to before payday
- Tap "Planned investing" → opens investment plan settings
- Tap "Unreviewed transactions reserve" → opens import review queue
- Tap any account → opens account transaction list

---

## 9. Test Scenarios

The following scenarios must have explicit unit tests before engine implementation begins.

### Group A — Payday boundaries

| # | Scenario | Expected behavior |
|---|----------|-------------------|
| A1 | Payday is tomorrow | `days_until_next_payday = 1`; safe-to-spend = full spendable pool |
| A2 | Payday is today | Show €0 with "Payday today — update your payday date" |
| A3 | Payday was 3 days ago | Show €0 with overdue warning |
| A4 | Payday falls on Saturday | Use Saturday date; no auto-shift |
| A5 | No payday configured | Block computation; show setup prompt |

### Group B — Investment protection

| # | Scenario | Expected behavior |
|---|----------|-------------------|
| B1 | Protection ON, €800 planned | €800 subtracted from pool |
| B2 | Protection OFF | €800 NOT subtracted; UI warning shown |
| B3 | Investment already executed this month | If contribution is settled, no double-deduction |
| B4 | Planned investing > available cash | Show €0; drill-down highlights investment protection as cause |

### Group C — Reimbursements

| # | Scenario | Expected behavior |
|---|----------|-------------------|
| C1 | Reimbursement out, unmatched | Reduces available cash |
| C2 | Reimbursement out, matched to in | Neutralized; no effect |
| C3 | Reimbursement in, no matching out | Treated as income-like inflow; increases available cash |

### Group D — Transfers and investment transactions

| # | Scenario | Expected behavior |
|---|----------|-------------------|
| D1 | ING → T212 transfer tagged as `transfer` | No expense; no safe-to-spend reduction |
| D2 | ING → T212 transfer misclassified as expense | Included in unreviewed anomalies reserve |
| D3 | T212 market buy | No expense; not counted |
| D4 | Dividend received | Counted as income-like inflow if in accessible account |

### Group E — Negative scenarios

| # | Scenario | Expected behavior |
|---|----------|-------------------|
| E1 | Bills exceed available cash | Show €0 with shortfall message |
| E2 | Savings not marked accessible | Not included in available cash |
| E3 | User marks savings accessible | Immediately included in next computation |
| E4 | Missing recurring bill data | Warn in drill-down; do not fabricate |

### Group F — Stale data

| # | Scenario | Expected behavior |
|---|----------|-------------------|
| F1 | Last import 6 days ago | Show number with staleness banner |
| F2 | Last import 30+ days ago | Show number with strong warning; suggest re-import |
| F3 | No import ever | Block computation; show import prompt |

---

## 10. Implementation Notes

### Computation timing

The engine recomputes on every page load and after every transaction review action. It does NOT cache and return a static value.

### Assumption trail

Every computation must produce an `assumption_trail` object alongside the result:

```typescript
type SafeToSpendResult = {
  value: number;               // in EUR cents
  computed_at: Date;
  days_until_payday: number;
  available_cash: number;
  protected_obligations: ProtectedObligations;
  spendable_pool: number;
  assumption_trail: AssumptionEntry[];
  warnings: Warning[];
};
```

The `assumption_trail` is what powers the "Why this number?" drill-down. Every policy decision that affected the result must appear as an entry.

### Policy config

Before computing, the engine reads the user's policy configuration:

```typescript
type PolicyConfig = {
  payday_date: Date;
  planned_investing_protected: boolean;    // default: true
  accessible_savings_account_ids: string[];
  minimum_cash_buffer: number;
  anomaly_reserve_threshold: number;       // default: 0.30 (30%)
};
```

Math is applied after policy is read. Never reverse this order.

### Test tooling

- Framework: `vitest`
- DB mock: `@packages/db` test utilities
- No external calls in unit tests
- All test files in `packages/core/src/safe-to-spend/__tests__/`

---

*This document is the source of truth for the safe-to-spend engine. Any deviation requires updating this spec first, then the implementation.*
