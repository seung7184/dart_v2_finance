import { describe, expect, it } from 'vitest';
import { parseMobileIntegerCents, bodyContainsUserId } from './mobile-manual';

describe('parseMobileIntegerCents', () => {
  it('returns null for zero', () => {
    expect(parseMobileIntegerCents(0)).toBeNull();
  });

  it('returns null for negative integers', () => {
    expect(parseMobileIntegerCents(-1)).toBeNull();
    expect(parseMobileIntegerCents(-100)).toBeNull();
  });

  it('returns null for float values', () => {
    expect(parseMobileIntegerCents(12.40)).toBeNull();
    expect(parseMobileIntegerCents(0.99)).toBeNull();
  });

  it('returns null for non-number types', () => {
    expect(parseMobileIntegerCents('1240')).toBeNull();
    expect(parseMobileIntegerCents(null)).toBeNull();
    expect(parseMobileIntegerCents(undefined)).toBeNull();
    expect(parseMobileIntegerCents({})).toBeNull();
  });

  it('returns the value for a valid positive integer', () => {
    expect(parseMobileIntegerCents(1)).toBe(1);
    expect(parseMobileIntegerCents(1240)).toBe(1240);
    expect(parseMobileIntegerCents(99999)).toBe(99999);
  });
});

describe('bodyContainsUserId', () => {
  it('returns false when neither userId nor user_id is present', () => {
    expect(bodyContainsUserId({ amountCents: 1240, categoryId: null })).toBe(false);
  });

  it('returns true when camelCase userId is present', () => {
    expect(bodyContainsUserId({ amountCents: 1240, userId: 'some-uuid' })).toBe(true);
  });

  it('returns true when snake_case user_id is present', () => {
    expect(bodyContainsUserId({ amountCents: 1240, user_id: 'some-uuid' })).toBe(true);
  });

  it('returns true even when the value is null or empty string', () => {
    expect(bodyContainsUserId({ userId: null })).toBe(true);
    expect(bodyContainsUserId({ user_id: '' })).toBe(true);
  });
});
