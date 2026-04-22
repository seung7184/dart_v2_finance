function assertDigits(value: string, message: string): void {
  if (!/^\d+$/.test(value)) {
    throw new Error(message);
  }
}

export function decimalStringToCents(
  rawValue: string,
  options: {
    decimalSeparator: ',' | '.';
    thousandsSeparator?: '.' | ',';
    errorPrefix: string;
  },
): number {
  const trimmed = rawValue.trim();
  if (trimmed.length === 0) {
    throw new Error(`${options.errorPrefix}: ${rawValue}`);
  }

  const isNegative = trimmed.startsWith('-');
  const unsigned = trimmed.replace(/^[+-]/, '');
  const withoutThousands = options.thousandsSeparator
    ? unsigned.split(options.thousandsSeparator).join('')
    : unsigned;
  const parts = withoutThousands.split(options.decimalSeparator);

  if (parts.length > 2) {
    throw new Error(`${options.errorPrefix}: ${rawValue}`);
  }

  const whole = parts[0] ?? '0';
  const fraction = parts[1] ?? '0';
  assertDigits(whole, `${options.errorPrefix}: ${rawValue}`);
  assertDigits(fraction, `${options.errorPrefix}: ${rawValue}`);

  if (fraction.length > 2) {
    throw new Error(`${options.errorPrefix}: ${rawValue}`);
  }

  const cents = Number.parseInt(whole, 10) * 100 + Number.parseInt(fraction.padEnd(2, '0'), 10);
  return isNegative ? -cents : cents;
}
