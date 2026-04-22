export function validateRequiredColumns(
  headers: string[],
  required: string[],
  source: string,
): void {
  const missing = required.filter((col) => !headers.includes(col));
  if (missing.length > 0) {
    throw new Error(
      `${source} CSV missing required columns: ${missing.join(', ')}`,
    );
  }
}
