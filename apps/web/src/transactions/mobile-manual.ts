/**
 * Validates that a value is a positive integer representing cents.
 * Mobile Quick Add sends integer cents directly (e.g., 1240 = €12.40).
 * Returns the cents value, or null if invalid.
 */
export function parseMobileIntegerCents(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isInteger(value) || value <= 0) {
    return null;
  }
  return value;
}

/**
 * Checks that the request body does not contain client-supplied user identity.
 * user_id must always come from the server-side token validation.
 */
export function bodyContainsUserId(body: Record<string, unknown>): boolean {
  return 'userId' in body || 'user_id' in body;
}
