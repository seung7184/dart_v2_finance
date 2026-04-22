import { describe, expect, it } from 'vitest';
import { submitBetaSignup, type BetaSignupRepository } from './signup';

function createRepositoryStub(
  overrides: Partial<BetaSignupRepository> = {},
): BetaSignupRepository {
  return {
    createSignup: async (input) => ({
      createdAt: input.createdAt,
      email: input.email,
      ticketId: input.ticketId,
    }),
    findSignupByEmail: async () => null,
    ...overrides,
  };
}

describe('submitBetaSignup', () => {
  it('persists an ING + Trading 212 waitlist request and returns a durable ticket', async () => {
    const result = await submitBetaSignup({
      broker: 'Trading 212',
      email: 'beta@example.com',
      primaryBank: 'ING',
      reason: 'I want a trusted safe-to-spend number.',
    }, createRepositoryStub());

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
      }, createRepositoryStub()),
    ).rejects.toThrow('INVALID_BETA_SIGNUP');
  });

  it('returns the existing durable ticket for a repeat signup email', async () => {
    const result = await submitBetaSignup({
      broker: 'Trading 212',
      email: 'BETA@example.com',
      primaryBank: 'ING',
      reason: 'I want a trusted safe-to-spend number.',
    }, createRepositoryStub({
      findSignupByEmail: async () => ({
        createdAt: new Date('2026-04-22T00:00:00.000Z'),
        email: 'beta@example.com',
        ticketId: 'beta-1234abcd',
      }),
    }));

    expect(result).toEqual({
      status: 'accepted',
      ticketId: 'beta-1234abcd',
    });
  });

  it('surfaces an explicit destination error when no durable repository exists', async () => {
    await expect(
      submitBetaSignup({
        broker: 'Trading 212',
        email: 'beta@example.com',
        primaryBank: 'ING',
        reason: 'I want a trusted safe-to-spend number.',
      }),
    ).rejects.toThrow('BETA_SIGNUP_DESTINATION_NOT_CONFIGURED');
  });
});
