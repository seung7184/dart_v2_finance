export type MerchantSuggestion = {
  merchantName: string;
  categoryName: string;
  suggestedIntent: 'living_expense' | 'recurring_bill';
};

type RegistryEntry = {
  patterns: readonly string[];
  merchantName: string;
  categoryName: string;
  suggestedIntent: 'living_expense' | 'recurring_bill';
};

const MERCHANT_REGISTRY: readonly RegistryEntry[] = [
  // ── Groceries ─────────────────────────────────────────────────────────────
  { patterns: ['albert heijn', 'albertheijn', 'ah.nl', ' ah '], merchantName: 'Albert Heijn', categoryName: 'Groceries', suggestedIntent: 'living_expense' },
  { patterns: ['dirk'], merchantName: 'Dirk', categoryName: 'Groceries', suggestedIntent: 'living_expense' },
  { patterns: ['jumbo'], merchantName: 'Jumbo', categoryName: 'Groceries', suggestedIntent: 'living_expense' },
  { patterns: ['lidl'], merchantName: 'Lidl', categoryName: 'Groceries', suggestedIntent: 'living_expense' },
  { patterns: ['aldi'], merchantName: 'Aldi', categoryName: 'Groceries', suggestedIntent: 'living_expense' },
  { patterns: ['plus supermarkt', 'plus markt'], merchantName: 'Plus Supermarkt', categoryName: 'Groceries', suggestedIntent: 'living_expense' },
  { patterns: ['coop supermarkt', 'coop.nl'], merchantName: 'Coop', categoryName: 'Groceries', suggestedIntent: 'living_expense' },
  { patterns: ['ekoplaza'], merchantName: 'Ekoplaza', categoryName: 'Groceries', suggestedIntent: 'living_expense' },

  // ── Eating out ────────────────────────────────────────────────────────────
  { patterns: ['mcdonald', 'mc donald'], merchantName: "McDonald's", categoryName: 'Eating out', suggestedIntent: 'living_expense' },
  { patterns: ['domino'], merchantName: "Domino's", categoryName: 'Eating out', suggestedIntent: 'living_expense' },
  { patterns: ['thuisbezorgd'], merchantName: 'Thuisbezorgd', categoryName: 'Eating out', suggestedIntent: 'living_expense' },
  { patterns: ['uber eats', 'ubereats'], merchantName: 'Uber Eats', categoryName: 'Eating out', suggestedIntent: 'living_expense' },
  { patterns: ['deliveroo'], merchantName: 'Deliveroo', categoryName: 'Eating out', suggestedIntent: 'living_expense' },
  { patterns: ['starbucks'], merchantName: 'Starbucks', categoryName: 'Eating out', suggestedIntent: 'living_expense' },
  { patterns: ['new york pizza', 'newyorkpizza'], merchantName: 'New York Pizza', categoryName: 'Eating out', suggestedIntent: 'living_expense' },
  { patterns: ['just eat', 'justeat'], merchantName: 'Just Eat', categoryName: 'Eating out', suggestedIntent: 'living_expense' },
  { patterns: ['burger king', 'burgerking'], merchantName: 'Burger King', categoryName: 'Eating out', suggestedIntent: 'living_expense' },
  { patterns: ['kfc '], merchantName: 'KFC', categoryName: 'Eating out', suggestedIntent: 'living_expense' },

  // ── Shopping ──────────────────────────────────────────────────────────────
  { patterns: ['amazon', 'amzn'], merchantName: 'Amazon', categoryName: 'Shopping', suggestedIntent: 'living_expense' },
  { patterns: ['bol.com', 'bol com'], merchantName: 'Bol.com', categoryName: 'Shopping', suggestedIntent: 'living_expense' },
  { patterns: ['zalando'], merchantName: 'Zalando', categoryName: 'Shopping', suggestedIntent: 'living_expense' },
  { patterns: ['ikea'], merchantName: 'IKEA', categoryName: 'Shopping', suggestedIntent: 'living_expense' },
  { patterns: ['mediamarkt', 'media markt'], merchantName: 'MediaMarkt', categoryName: 'Shopping', suggestedIntent: 'living_expense' },
  { patterns: ['coolblue'], merchantName: 'Coolblue', categoryName: 'Shopping', suggestedIntent: 'living_expense' },
  { patterns: ['hema '], merchantName: 'HEMA', categoryName: 'Shopping', suggestedIntent: 'living_expense' },
  { patterns: ['primark'], merchantName: 'Primark', categoryName: 'Shopping', suggestedIntent: 'living_expense' },
  { patterns: ['h&m', 'hm.com'], merchantName: 'H&M', categoryName: 'Shopping', suggestedIntent: 'living_expense' },
  { patterns: ['zara'], merchantName: 'Zara', categoryName: 'Shopping', suggestedIntent: 'living_expense' },
  { patterns: ['decathlon'], merchantName: 'Decathlon', categoryName: 'Shopping', suggestedIntent: 'living_expense' },

  // ── Transport ─────────────────────────────────────────────────────────────
  { patterns: ['ns reizigers', 'ns groep', 'ns.nl', 'ns international'], merchantName: 'NS (Dutch Rail)', categoryName: 'Transport', suggestedIntent: 'living_expense' },
  { patterns: ['ov-chipkaart', 'ov chipkaart', 'trans link', 'translink'], merchantName: 'OV-Chipkaart', categoryName: 'Transport', suggestedIntent: 'living_expense' },
  { patterns: ['gvb ', 'gvb.nl'], merchantName: 'GVB', categoryName: 'Transport', suggestedIntent: 'living_expense' },
  { patterns: ['ret ', 'ret.nl'], merchantName: 'RET', categoryName: 'Transport', suggestedIntent: 'living_expense' },
  { patterns: ['htm ', 'htm.nl'], merchantName: 'HTM', categoryName: 'Transport', suggestedIntent: 'living_expense' },
  { patterns: ['uber b.v', 'uber technologies', 'uber trip'], merchantName: 'Uber', categoryName: 'Transport', suggestedIntent: 'living_expense' },
  { patterns: ['bolt.eu', 'bolt transport'], merchantName: 'Bolt', categoryName: 'Transport', suggestedIntent: 'living_expense' },
  { patterns: ['shell tankstation', 'shell station'], merchantName: 'Shell', categoryName: 'Transport', suggestedIntent: 'living_expense' },
  { patterns: ['bp station', 'bp nederland'], merchantName: 'BP', categoryName: 'Transport', suggestedIntent: 'living_expense' },
  { patterns: ['esso station', 'esso neder'], merchantName: 'Esso', categoryName: 'Transport', suggestedIntent: 'living_expense' },

  // ── Subscriptions ─────────────────────────────────────────────────────────
  { patterns: ['netflix'], merchantName: 'Netflix', categoryName: 'Subscriptions', suggestedIntent: 'recurring_bill' },
  { patterns: ['spotify'], merchantName: 'Spotify', categoryName: 'Subscriptions', suggestedIntent: 'recurring_bill' },
  { patterns: ['apple.com/bill', 'apple subscriptions', 'itunes.com/bill'], merchantName: 'Apple', categoryName: 'Subscriptions', suggestedIntent: 'recurring_bill' },
  { patterns: ['google one', 'google storage'], merchantName: 'Google One', categoryName: 'Subscriptions', suggestedIntent: 'recurring_bill' },
  { patterns: ['disney+', 'disneyplus'], merchantName: 'Disney+', categoryName: 'Subscriptions', suggestedIntent: 'recurring_bill' },
  { patterns: ['youtube premium'], merchantName: 'YouTube Premium', categoryName: 'Subscriptions', suggestedIntent: 'recurring_bill' },
  { patterns: ['amazon prime', 'prime video'], merchantName: 'Amazon Prime', categoryName: 'Subscriptions', suggestedIntent: 'recurring_bill' },
  { patterns: ['microsoft 365', 'office 365', 'microsoft 365 sub'], merchantName: 'Microsoft 365', categoryName: 'Subscriptions', suggestedIntent: 'recurring_bill' },
  { patterns: ['hbo max', 'max.com'], merchantName: 'Max (HBO)', categoryName: 'Subscriptions', suggestedIntent: 'recurring_bill' },
  { patterns: ['videoland'], merchantName: 'Videoland', categoryName: 'Subscriptions', suggestedIntent: 'recurring_bill' },

  // ── Utilities ─────────────────────────────────────────────────────────────
  { patterns: ['vattenfall'], merchantName: 'Vattenfall', categoryName: 'Utilities', suggestedIntent: 'recurring_bill' },
  { patterns: ['eneco'], merchantName: 'Eneco', categoryName: 'Utilities', suggestedIntent: 'recurring_bill' },
  { patterns: ['essent'], merchantName: 'Essent', categoryName: 'Utilities', suggestedIntent: 'recurring_bill' },
  { patterns: ['greenchoice'], merchantName: 'Greenchoice', categoryName: 'Utilities', suggestedIntent: 'recurring_bill' },
  { patterns: ['nuon '], merchantName: 'Nuon', categoryName: 'Utilities', suggestedIntent: 'recurring_bill' },
  { patterns: ['ziggo'], merchantName: 'Ziggo', categoryName: 'Utilities', suggestedIntent: 'recurring_bill' },
  { patterns: ['kpn '], merchantName: 'KPN', categoryName: 'Utilities', suggestedIntent: 'recurring_bill' },
  { patterns: ['odido', 't-mobile nl'], merchantName: 'Odido/T-Mobile', categoryName: 'Utilities', suggestedIntent: 'recurring_bill' },
  { patterns: ['vodafone nl'], merchantName: 'Vodafone', categoryName: 'Utilities', suggestedIntent: 'recurring_bill' },
  { patterns: ['xs4all'], merchantName: 'XS4ALL', categoryName: 'Utilities', suggestedIntent: 'recurring_bill' },
  { patterns: ['tele2 nl'], merchantName: 'Tele2', categoryName: 'Utilities', suggestedIntent: 'recurring_bill' },

  // ── Health ────────────────────────────────────────────────────────────────
  { patterns: ['apotheek', 'pharmacy'], merchantName: 'Pharmacy', categoryName: 'Health', suggestedIntent: 'living_expense' },
  { patterns: ['etos '], merchantName: 'Etos', categoryName: 'Health', suggestedIntent: 'living_expense' },
  { patterns: ['kruidvat'], merchantName: 'Kruidvat', categoryName: 'Health', suggestedIntent: 'living_expense' },

  // ── Insurance ─────────────────────────────────────────────────────────────
  { patterns: ['zorgverzekering', 'zilveren kruis', 'cz groep', 'vgz ', 'menzis', 'dsw verzekering', 'interpolis zorg'], merchantName: 'Health Insurance', categoryName: 'Insurance', suggestedIntent: 'recurring_bill' },
];

/**
 * Suggests a merchant name, category, and intent from a raw transaction description.
 * Matching is case-insensitive substring search.
 * Returns null if no pattern matches.
 */
export function suggestFromMerchantName(rawDescription: string): MerchantSuggestion | null {
  const lower = ` ${rawDescription.toLowerCase()} `;

  for (const entry of MERCHANT_REGISTRY) {
    for (const pattern of entry.patterns) {
      if (lower.includes(pattern)) {
        return {
          merchantName: entry.merchantName,
          categoryName: entry.categoryName,
          suggestedIntent: entry.suggestedIntent,
        };
      }
    }
  }

  return null;
}
