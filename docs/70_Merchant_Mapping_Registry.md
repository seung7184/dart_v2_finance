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

1. **T212 Card debit rows** carry actual `Merchant name` and `Merchant category` columns from the CSV.
   These are stored directly as `merchant_name` and `merchant_category` on the transaction.
2. **Registry lookup** (`suggestFromMerchantName`) runs against the CSV merchant name if present,
   otherwise against the raw description (ING rows, non-card T212 rows).
3. The **persisted `merchant_name`** is:
   - The CSV merchant name (T212 Card debit) if available, **or**
   - The registry-matched canonical name (e.g. "Albert Heijn"), **or**
   - `null` if no match is found.
4. `normalized_merchant_name` is always derived from the final `merchant_name`:
   lowercase → trim → collapse repeated spaces.
5. `merchant_category` is persisted as-is from the T212 CSV (e.g. `RETAIL_STORES`).
   ING rows have `null` for this field.
6. `categoryId` is resolved from the `categories` table using the registry suggestion's category name.
7. The suggested intent overrides a missing `intent_hint`; T212 `intent_hint` always takes precedence.
8. The user can override merchant name, category, and intent in the Transactions review screen.

### Existing Import Data (pre-2026-04-28)
Transactions imported before migration `0004_merchant_fields` was applied will have
`merchant_category = null` and `normalized_merchant_name = null`.
A fresh re-import after a data reset will persist all merchant fields correctly.
Duplicate detection is unaffected by the new columns.

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
