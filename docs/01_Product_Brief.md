# 01 — Dart Finance Product Brief

Version 1.3 · 2026-04-22
Owner: Seungjae
Status: Execution lock

---

## Problem

Employed investors in Europe can't get a reliable answer to "how much can I spend today?" because existing budget apps treat investment transfers as expenses — breaking the numbers. Portfolio trackers don't know about rent, insurance, or upcoming bills. The result: people either overspend into their investment buffer, or under-invest because they can't see their real slack.

The core failure is that no tool combines cashflow confidence with investment awareness in one place.

## Target User

A salaried worker in the Netherlands — 2–3 accounts (bank + broker), monthly ETF DCA habit, comfortable with CSV export, currently using Excel or a broken budget app, frustrated that investment transfers are classified as expenses.

## Positioning

Dart Finance is the only calm, CSV-first money app that tells you what you can safely spend today — without ignoring your investment plan.

---

## 5 Differentiators

1. **Investor-aware safe-to-spend** — planned investing is protected by default; the number reflects your full financial picture, not just checking account balance.
2. **Transfer + reimbursement intent model** — transactions are classified by intent (transfer, reimbursement, income, expense), not just amount. Investment deposits are not expenses.
3. **Auditability** — every number drills down to the transactions and assumptions behind it. "Why €37?" has a real answer.
4. **CSV-first, no bank sync** — privacy-first by design. Works without open banking. ING + T212 V1; Rabobank + DeGiro V1.5.
5. **Web + mobile role split** — mobile = 3-second reassurance; web = full review, import, and drill-down.

---

## 6-Month MVP Goal

Ship a web + mobile app that gives a trusted safe-to-spend number to 50–150 private beta users in the Netherlands. Core loop: onboard → set payday + salary + planned investing → upload ING/T212 CSV → review transactions → see safe-to-spend + drill-down.

Paid plan (€4–7/mo or €36–60/yr) available from day one.

---

## V1 Includes

- Manual entry + ING + Trading 212 CSV import
- Transaction intent classification (transfer, reimbursement, income, expense, investment)
- Recurring bills + sinking fund allocation
- Safe-to-spend engine (payday model, planned investing protected)
- "Why this number?" drill-down
- Web onboarding + CSV review + transactions grid
- Mobile home (safe-to-spend hero) + quick add expense
- Dutch market, English language only
- Freemium: free tier + paid plan

## V1 Does NOT Include

- Bank sync / open banking
- Rabobank or DeGiro CSV support
- Forecast engine or what-if simulations
- AI chat surface
- Household / shared account support
- Dutch or Korean language UI
- Deep investment analytics

---

## Market Entry

- **V1**: Netherlands only — fastest path to validate problem + CSV format assumptions
- **V1.5**: English-speaking EU expansion
- **V2**: Dutch/Korean UI, Rabobank + DeGiro, bank sync exploration

---

## Success Metrics (3 Core)

| Metric | Target |
|--------|--------|
| Onboarding completion (CSV import → first trusted number) | ≥ 40% |
| D30 retention | ≥ 12% |
| Free → Paid conversion | ≥ 3% |

---

## What We Are Betting On

That a meaningful segment of employed investors in Europe will pay for a tool that gives them a number they trust — not because it's beautifully designed, but because it correctly handles investment transfers, explains its assumptions, and doesn't break when their payday lands on a Friday.
