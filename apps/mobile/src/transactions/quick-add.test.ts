import { describe, expect, it } from 'vitest';
import {
  appendDigit,
  buildQuickAddPayload,
  digitsToAmountCents,
  FALLBACK_CATEGORIES,
  isValidAmountCents,
  removeLastDigit,
  resolveCategoryId,
} from './quick-add';

describe('digitsToAmountCents', () => {
  it('returns 0 for empty string', () => {
    expect(digitsToAmountCents('')).toBe(0);
  });

  it('converts a digit string directly to cents', () => {
    expect(digitsToAmountCents('1240')).toBe(1240);
    expect(digitsToAmountCents('500')).toBe(500);
    expect(digitsToAmountCents('1')).toBe(1);
  });

  it('returns 0 for non-numeric input', () => {
    expect(digitsToAmountCents('abc')).toBe(0);
  });

  it('returns 0 for negative digit string', () => {
    expect(digitsToAmountCents('-100')).toBe(0);
  });
});

describe('isValidAmountCents', () => {
  it('returns false for zero', () => {
    expect(isValidAmountCents(0)).toBe(false);
  });

  it('returns false for negative amounts', () => {
    expect(isValidAmountCents(-1)).toBe(false);
  });

  it('returns false for floats', () => {
    expect(isValidAmountCents(12.5)).toBe(false);
  });

  it('returns true for valid positive integers', () => {
    expect(isValidAmountCents(1)).toBe(true);
    expect(isValidAmountCents(1240)).toBe(true);
    expect(isValidAmountCents(99999)).toBe(true);
  });
});

describe('appendDigit', () => {
  it('appends a digit to an empty buffer', () => {
    expect(appendDigit('', '5')).toBe('5');
  });

  it('appends a digit to an existing buffer', () => {
    expect(appendDigit('12', '3')).toBe('123');
  });

  it('appends 00 to an existing buffer', () => {
    expect(appendDigit('12', '00')).toBe('1200');
  });

  it('strips leading zeros', () => {
    expect(appendDigit('0', '5')).toBe('5');
    expect(appendDigit('00', '3')).toBe('3');
  });

  it('caps at 6 digits', () => {
    expect(appendDigit('99999', '9')).toBe('999999');
    expect(appendDigit('999999', '1')).toBe('999999');
  });
});

describe('removeLastDigit', () => {
  it('returns empty string from single digit', () => {
    expect(removeLastDigit('5')).toBe('');
  });

  it('removes the last digit', () => {
    expect(removeLastDigit('123')).toBe('12');
  });

  it('returns empty string for empty input', () => {
    expect(removeLastDigit('')).toBe('');
  });
});

describe('buildQuickAddPayload', () => {
  it('builds a valid payload with a category and no notes', () => {
    const payload = buildQuickAddPayload(1240, 'cat-uuid-123', '');
    expect(payload).toEqual({
      amountCents: 1240,
      categoryId: 'cat-uuid-123',
      notes: null,
    });
  });

  it('builds a valid payload with null category', () => {
    const payload = buildQuickAddPayload(500, null, '');
    expect(payload).toEqual({
      amountCents: 500,
      categoryId: null,
      notes: null,
    });
  });

  it('includes non-empty notes', () => {
    const payload = buildQuickAddPayload(800, null, 'lunch with team');
    expect(payload.notes).toBe('lunch with team');
  });

  it('trims whitespace from notes and returns null for blank notes', () => {
    const payload = buildQuickAddPayload(800, null, '   ');
    expect(payload.notes).toBeNull();
  });
});

describe('resolveCategoryId', () => {
  it('returns null for null input', () => {
    expect(resolveCategoryId(null)).toBeNull();
  });

  it('returns null for a fallback category with empty-string id', () => {
    const fallback = FALLBACK_CATEGORIES[0]!;
    expect(fallback.id).toBe('');
    expect(resolveCategoryId(fallback)).toBeNull();
  });

  it('returns the id for a table-backed category', () => {
    const category = { id: 'real-uuid', name: 'Groceries', icon: null, color: null, isSystem: true };
    expect(resolveCategoryId(category)).toBe('real-uuid');
  });
});

describe('FALLBACK_CATEGORIES', () => {
  it('contains at least one entry', () => {
    expect(FALLBACK_CATEGORIES.length).toBeGreaterThan(0);
  });

  it('all fallback categories have empty-string IDs', () => {
    for (const cat of FALLBACK_CATEGORIES) {
      expect(cat.id).toBe('');
    }
  });
});
