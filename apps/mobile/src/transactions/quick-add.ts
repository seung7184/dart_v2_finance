import type { QuickAddPayload } from '@/src/api/transactions';
import type { MobileCategoryOption } from '@/src/api/categories';

/**
 * Converts keypad digit string to integer cents.
 * Typing "1240" represents 1240 cents (€12.40).
 * Empty string or non-numeric input returns 0.
 */
export function digitsToAmountCents(digits: string): number {
  if (digits.length === 0) {
    return 0;
  }

  const parsed = Number.parseInt(digits, 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

/**
 * Returns true if the amount is a valid, positive integer cents value
 * that may be saved as a manual expense.
 */
export function isValidAmountCents(cents: number): boolean {
  return Number.isInteger(cents) && cents > 0;
}

/**
 * Appends a digit or "00" string to the current digit buffer.
 * Strips leading zeros and caps at 6 digits (max €999.99).
 */
export function appendDigit(currentDigits: string, digit: string): string {
  const next = `${currentDigits}${digit}`.replace(/^0+(?=\d)/, '');
  return next.slice(0, 6);
}

/**
 * Removes the last character from the digit buffer.
 */
export function removeLastDigit(currentDigits: string): string {
  return currentDigits.slice(0, -1);
}

/**
 * Builds the payload to POST to /api/mobile/transactions/manual.
 * categoryId is null when no table-backed category is available.
 */
export function buildQuickAddPayload(
  amountCents: number,
  selectedCategoryId: string | null,
  notes: string,
): QuickAddPayload {
  return {
    amountCents,
    categoryId: selectedCategoryId,
    notes: notes.trim().length > 0 ? notes.trim() : null,
  };
}

/**
 * Static fallback category options used when the categories API is
 * unavailable or returns no results. These are display-only — the
 * categoryId is null, so the saved transaction has no DB category
 * assignment. The user can categorize later on the web.
 */
export const FALLBACK_CATEGORIES: MobileCategoryOption[] = [
  { id: '', name: 'Groceries', icon: null, color: null, isSystem: true },
  { id: '', name: 'Transport', icon: null, color: null, isSystem: true },
  { id: '', name: 'Dining', icon: null, color: null, isSystem: true },
  { id: '', name: 'Health', icon: null, color: null, isSystem: true },
  { id: '', name: 'Other', icon: null, color: null, isSystem: true },
];

/**
 * Returns the category ID to send to the API.
 * Empty-string IDs (fallback categories) are treated as null.
 */
export function resolveCategoryId(category: MobileCategoryOption | null): string | null {
  if (!category) {
    return null;
  }

  return category.id.length > 0 ? category.id : null;
}
