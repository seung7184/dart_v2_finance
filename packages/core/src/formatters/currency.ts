const formatter = new Intl.NumberFormat('nl-NL', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Format cents to EUR string. Input: 3720 → "€ 37,20" */
export function formatEUR(cents: number): string {
  return formatter.format(cents / 100);
}

/** Parse EUR string back to cents. Input: "37,20" → 3720 */
export function parseEURtoCents(value: string): number {
  const normalized = value.replace(/[€\s]/g, '').replace(/\./g, '');
  const [whole = '0', fraction = '0'] = normalized.split(',');

  if (!/^\d+$/.test(whole) || !/^\d+$/.test(fraction) || fraction.length > 2) {
    throw new Error(`Invalid EUR amount: ${value}`);
  }

  return Number.parseInt(whole, 10) * 100 + Number.parseInt(fraction.padEnd(2, '0'), 10);
}
