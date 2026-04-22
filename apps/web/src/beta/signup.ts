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

export type BetaSignupRecord = {
  createdAt: Date;
  email: string;
  ticketId: string;
};

export type BetaSignupRepository = {
  createSignup: (input: {
    broker: string;
    createdAt: Date;
    email: string;
    primaryBank: string;
    reason: string;
    source: 'beta_page';
    status: 'pending';
    ticketId: string;
  }) => Promise<BetaSignupRecord>;
  findSignupByEmail: (email: string) => Promise<BetaSignupRecord | null>;
};

const SUPPORTED_BANK = 'ing';
const SUPPORTED_BROKER = 'trading 212';

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function createTicketId(email: string) {
  return `beta-${Buffer.from(email).toString('hex').slice(0, 8)}`;
}

export async function submitBetaSignup(
  input: BetaSignupInput,
  repository?: BetaSignupRepository,
): Promise<BetaSignupResult> {
  const email = normalize(input.email);
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

  if (!repository) {
    throw new Error('BETA_SIGNUP_DESTINATION_NOT_CONFIGURED');
  }

  const existingSignup = await repository.findSignupByEmail(email);
  if (existingSignup) {
    return {
      status: 'accepted',
      ticketId: existingSignup.ticketId,
    };
  }

  const ticketId = createTicketId(email);

  await repository.createSignup({
    broker,
    createdAt: new Date(),
    email,
    primaryBank,
    reason,
    source: 'beta_page',
    status: 'pending',
    ticketId,
  });

  return {
    status: 'accepted',
    ticketId,
  };
}
