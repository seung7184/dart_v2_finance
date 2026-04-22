# Dart Finance — Execution Lock Document

Version 1.3 · 2026-04-22
Owner: Seungjae
Status: **LOCKED** — do not modify without explicit decision log entry

---

> This document captures three product decisions that are **locked for V1.**
> They must not be renegotiated during development unless a specific user research or engineering finding forces a change. Any change requires a dated entry in the decision log (Appendix A of the Master Report).

---

## Lock 1 — Core 5 Screens

V1 design and development focuses exclusively on the following 5 screens. No other screen is designed, mocked, or implemented until these are trusted and stable.

### The 5 Screens

| # | Screen | Platform | Purpose |
|---|--------|----------|---------|
| 1 | **Mobile Home** | Mobile | Safe-to-spend hero — primary daily touchpoint |
| 2 | **Mobile Quick Add Expense** | Mobile | Fast transaction entry in ≤5 seconds |
| 3 | **Web Transactions / Import Review** | Web | Review, classify, and correct imported transactions |
| 4 | **Web CSV Field Mapping** | Web | Map CSV columns to Dart Finance fields per bank |
| 5 | **Web "Why This Number?"** | Web | Drill-down showing every assumption behind safe-to-spend |

### Rationale

Designing 15 screens before the engine is trusted leads to a well-designed product with a broken core. Screen 5 ("Why this number?") is the most important — if it cannot explain itself, the app has failed at its primary promise.

### What is explicitly deferred

The following screens are V1.5 or later:

- Web Dashboard / cashflow summary
- Recurring series management
- Budget / Sinking funds editor
- Investment holdings view
- Monthly reports
- Settings (beyond minimal onboarding)
- Mobile: Recurring bills list
- Mobile: Upcoming bills detail
- Mobile: Investing overview
- Admin console (any form)

---

## Lock 2 — CSV Scope

V1 CSV import supports **ING and Trading 212 only.**

### V1 Supported

| Bank / Broker | Account Type | CSV Format Notes |
|---|---|---|
| **ING** | Checking (main life account) | Dutch ING format; semicolon-delimited; date format DD-MM-YYYY |
| **Trading 212** | Brokerage (investment account) | English; comma-delimited; includes transaction type column |

### V1 Not Supported (deferred to V1.5+)

- Rabobank
- DeGiro
- Any other bank or broker

### ING — Required Columns (minimum)

| Column | Purpose |
|--------|---------|
| Date | Transaction date (`occurred_at`) |
| Name / Description | `raw_description` |
| Account | Source account identifier |
| Amount | Signed amount (negative = expense) |
| Balance after transaction | Used for balance reconciliation |

### Trading 212 — Required Columns (minimum)

| Column | Purpose |
|--------|---------|
| Action | Transaction type (e.g., "Deposit", "Market buy", "Dividend") |
| Time | Transaction datetime |
| Ticker | Instrument |
| No. of shares | Quantity |
| Price / share | Unit price |
| Total | Net amount |
| Currency | Should be EUR for V1 |

### Duplicate detection

Deduplication is based on:
```
(account_id, external_id) → if external_id present in CSV
(account_id, occurred_at, amount, normalized_description) → fallback
```

Both ING and T212 CSVs include stable unique identifiers. Use them. Fallback only when the identifier is missing.

### Import history

Every import session is stored as an `import_batch` record with:
- Source bank
- File hash (SHA-256 of original file)
- Row count
- Import timestamp
- Review status (pending / reviewed / partially reviewed)

This allows re-import detection ("You've imported this file before") and audit trail.

### Review fields

In the import review UI, users can modify:
- `intent` — the transaction's classification
- `category_id` — spending category
- `notes` — free text
- Transfer link (pair two transactions as a transfer)
- Reimbursement link (pair out + in)

Users cannot modify: `amount`, `occurred_at`, `raw_description`. These are source-of-truth fields.

### Canonical lock statement

> **V1 CSV support is limited to ING and Trading 212 only.**
> Rabobank and DeGiro are deferred to V1.5.
> Adding additional parsers in V1 is not permitted without a formal decision log entry.

---

## Lock 3 — Web-First Development Principle

V1 is shipped as web + mobile simultaneously, but **development order is web-first.**

### Canonical lock statement

> Web is the primary build surface for the first 6 weeks.
> Mobile is attached after the core engine and import review loop are trusted.

### Build order

#### Phase A — Web first (weeks 1–6)

Build and stabilize in this order:

1. Web onboarding (signup, payday setup, salary input, buffer config, investing plan)
2. Web accounts setup
3. Web CSV import (field mapping screen)
4. Web import review (transaction review + intent classification)
5. Web safe-to-spend drill-down ("Why this number?")

The engine is considered trusted when: a real ING + T212 import can be completed, transactions classified, and the safe-to-spend number explained end-to-end with no unreviewed anomalies.

#### Phase B — Mobile (after engine trusted)

6. Mobile home screen (safe-to-spend hero)
7. Mobile quick add expense
8. Mobile recent transactions
9. Mobile upcoming bills

### Why this order

| Reason | Explanation |
|--------|-------------|
| Engine verification | CSV import + drill-down can only be properly verified on web; a small screen cannot show the full assumption trail |
| UX fit | Field mapping and import review require a large surface; forcing them onto mobile first produces compromised UX |
| Risk | Building mobile home first produces a beautiful shell with an untrusted engine underneath — the worst possible outcome for retention |
| Scope control | Mobile can be added cleanly after web is stable; the reverse is harder |

### What "mobile-first" would look like (do not do this)

- Designing and building the mobile home screen before the engine exists
- Shipping a mobile app with hardcoded example numbers
- Optimizing mobile polish before web import review is functional

### Platform release

Despite web-first development order, both platforms are released at the same time to beta users. Mobile is not a V2 product — it is a V1 product built after web, released alongside web.

---

*End of Execution Lock Document — 2026-04-22*
*These decisions are binding until explicitly revised via decision log.*
