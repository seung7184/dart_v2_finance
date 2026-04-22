export type BetaSignupInput = {
  broker: string;
  email: string;
  primaryBank: string;
  reason: string;
};

export type BetaSignupResult = {
  status: 'accepted';
  ticketId: string;
};

const SUPPORTED_BANK = 'ing';
const SUPPORTED_BROKER = 'trading 212';

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function normalize(value: string) {
  return value.trim().toLowerCase();
}

export async function submitBetaSignup(input: BetaSignupInput): Promise<BetaSignupResult> {
  const email = input.email.trim();
  const primaryBank = normalize(input.primaryBank);
  const broker = normalize(input.broker);
  const reason = input.reason.trim();

  if (
    !isValidEmail(email) ||
    primaryBank !== SUPPORTED_BANK ||
    broker !== SUPPORTED_BROKER ||
    reason.length < 10
  ) {
    throw new Error('INVALID_BETA_SIGNUP');
  }

  const ticketId = `beta-${Buffer.from(email).toString('hex').slice(0, 8)}`;

  return {
    status: 'accepted',
    ticketId,
  };
}

