import { describe, expect, it } from 'vitest';
import { submitBetaSignup } from './signup';

describe('submitBetaSignup', () => {
  it('accepts an ING + Trading 212 waitlist request and returns a mock ticket', async () => {
    const result = await submitBetaSignup({
      broker: 'Trading 212',
      email: 'beta@example.com',
      primaryBank: 'ING',
      reason: 'I want a trusted safe-to-spend number.',
    });

    expect(result.status).toBe('accepted');
    expect(result.ticketId).toMatch(/^beta-/);
  });

  it('rejects unsupported institutions and invalid email addresses', async () => {
    await expect(
      submitBetaSignup({
        broker: 'Robinhood',
        email: 'bad-email',
        primaryBank: 'Revolut',
        reason: '',
      }),
    ).rejects.toThrow('INVALID_BETA_SIGNUP');
  });
});
