# 70 — Merchant Mapping Registry

Version 1.0 · 2026-04-28  
Owner: Seungjae  
Status: V1 — static registry, no AI classification

---

## Purpose

The merchant mapping registry provides rule-based category and intent suggestions at CSV import time.  
It maps raw transaction descriptions (from ING/T212 CSVs) to:

- A canonical **merchant name** (display label)
- A suggested **category** (matches system categories in `categories` table)
- A suggested **intent** (`living_expense` | `recurring_bill`)

This is merchant-assisted categorisation, not AI classification. No LLM is called.

---

## Location

```
packages/core/src/merchants/mapping.ts
```

The registry is part of `@dart/core` — zero UI, zero DB imports.  
It exports:

```ts
suggestFromMerchantName(rawDescription: string): MerchantSuggestion | null

type MerchantSuggestion = {
  merchantName: string;
  categoryName: string;
  suggestedIntent: 'living_expense' | 'recurring_bill';
}
```

---

## Matching Logic

1. The raw description is lowercased and padded with spaces: ` ${lower} `
2. Each registry entry is checked in order (first match wins)
3. Patterns are substring-matched against the padded string
4. If no pattern matches, `null` is returned (no suggestion)

---

## Import-Time Behaviour

When a CSV row is imported (`executeImport` in `apps/web/src/imports/service.ts`):

1. `suggestFromMerchantName(row.raw_description)` is called
2. If a suggestion is returned:
   - `merchantName` is set on the transaction record
   - `categoryId` is resolved from `categories` table by the suggested category name
   - The suggested intent overrides a missing `intent_hint` (e.g. ING rows have no hint)
   - The CSV parser's own `intent_hint` (T212) takes precedence over the suggestion
3. The user can override any of these in the Transactions review screen

---

## V1 Merchant Registry

### Groceries

| Pattern(s) | Merchant Name |
|---|---|
| `albert heijn`, `albertheijn`, `ah.nl`, ` ah ` | Albert Heijn |
| `dirk` | Dirk |
| `jumbo` | Jumbo |
| `lidl` | Lidl |
| `aldi` | Aldi |
| `plus supermarkt`, `plus markt` | Plus Supermarkt |
| `coop supermarkt`, `coop.nl` | Coop |
| `ekoplaza` | Ekoplaza |

### Eating Out

| Pattern(s) | Merchant Name |
|---|---|
| `mcdonald`, `mc donald` | McDonald's |
| `domino` | Domino's |
| `thuisbezorgd` | Thuisbezorgd |
| `uber eats`, `ubereats` | Uber Eats |
| `deliveroo` | Deliveroo |
| `starbucks` | Starbucks |
| `new york pizza`, `newyorkpizza` | New York Pizza |
| `just eat`, `justeat` | Just Eat |
| `burger king`, `burgerking` | Burger King |
| `kfc ` | KFC |

### Shopping

| Pattern(s) | Merchant Name |
|---|---|
| `amazon`, `amzn` | Amazon |
| `bol.com`, `bol com` | Bol.com |
| `zalando` | Zalando |
| `ikea` | IKEA |
| `mediamarkt`, `media markt` | MediaMarkt |
| `coolblue` | Coolblue |
| `hema ` | HEMA |
| `primark` | Primark |
| `h&m`, `hm.com` | H&M |
| `zara` | Zara |
| `decathlon` | Decathlon |

### Transport

| Pattern(s) | Merchant Name |
|---|---|
| `ns reizigers`, `ns groep`, `ns.nl`, `ns international` | NS (Dutch Rail) |
| `ov-chipkaart`, `ov chipkaart`, `trans link`, `translink` | OV-Chipkaart |
| `gvb `, `gvb.nl` | GVB |
| `ret `, `ret.nl` | RET |
| `htm `, `htm.nl` | HTM |
| `uber b.v`, `uber technologies`, `uber trip` | Uber |
| `bolt.eu`, `bolt transport` | Bolt |
| `shell tankstation`, `shell station` | Shell |
| `bp station`, `bp nederland` | BP |
| `esso station`, `esso neder` | Esso |

### Subscriptions (intent: `recurring_bill`)

| Pattern(s) | Merchant Name |
|---|---|
| `netflix` | Netflix |
| `spotify` | Spotify |
| `apple.com/bill`, `apple subscriptions`, `itunes.com/bill` | Apple |
| `google one`, `google storage` | Google One |
| `disney+`, `disneyplus` | Disney+ |
| `youtube premium` | YouTube Premium |
| `amazon prime`, `prime video` | Amazon Prime |
| `microsoft 365`, `office 365` | Microsoft 365 |
| `hbo max`, `max.com` | Max (HBO) |
| `videoland` | Videoland |

### Utilities (intent: `recurring_bill`)

| Pattern(s) | Merchant Name |
|---|---|
| `vattenfall` | Vattenfall |
| `eneco` | Eneco |
| `essent` | Essent |
| `greenchoice` | Greenchoice |
| `nuon ` | Nuon |
| `ziggo` | Ziggo |
| `kpn ` | KPN |
| `odido`, `t-mobile nl` | Odido/T-Mobile |
| `vodafone nl` | Vodafone |
| `xs4all` | XS4ALL |
| `tele2 nl` | Tele2 |

### Health

| Pattern(s) | Merchant Name |
|---|---|
| `apotheek`, `pharmacy` | Pharmacy |
| `etos ` | Etos |
| `kruidvat` | Kruidvat |

### Insurance (intent: `recurring_bill`)

| Pattern(s) | Merchant Name |
|---|---|
| `zorgverzekering`, `zilveren kruis`, `cz groep`, `vgz `, `menzis`, `dsw verzekering`, `interpolis zorg` | Health Insurance |

---

## Adding New Merchants

Edit `packages/core/src/merchants/mapping.ts` and add a new entry to `MERCHANT_REGISTRY`.

Rules:
- Patterns are **lowercased** and matched as **substrings** — be specific enough to avoid false positives
- Trailing/leading spaces in patterns help prevent partial-word matches (e.g. ` kpn ` prevents matching `okpn`)
- `categoryName` must exactly match a value in `SYSTEM_CATEGORY_NAMES` from `apps/web/src/categories/repository.ts`
- Always update this doc when entries are added or changed
- Do not add merchant patterns for banks or ING itself (those should be flagged as `transfer`)

---

## V1 Exclusions

The following are NOT supported in V1:
- AI/ML-based classification
- User-defined merchant rules (V1.5)
- Merchant logo/icon lookup
- Merchant website metadata
