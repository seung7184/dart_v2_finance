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
  const normalized = value.replace(/[€\s.]/g, '').replace(',', '.');
  return Math.round(parseFloat(normalized) * 100);
}
