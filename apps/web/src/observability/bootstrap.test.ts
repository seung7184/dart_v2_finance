import { describe, expect, it } from 'vitest';
import {
  createPosthogEventBody,
  createSentryEnvelope,
  getObservabilityBootstrapConfig,
} from './bootstrap';

describe('getObservabilityBootstrapConfig', () => {
  it('keeps no-key mode safe', () => {
    expect(getObservabilityBootstrapConfig({})).toEqual({
      posthog: null,
      sentry: null,
    });
  });

  it('builds provider config when env values exist', () => {
    expect(
      getObservabilityBootstrapConfig({
        NEXT_PUBLIC_POSTHOG_HOST: 'https://eu.i.posthog.com',
        NEXT_PUBLIC_POSTHOG_KEY: 'phc_test',
        NEXT_PUBLIC_SENTRY_DSN: 'https://public@example.ingest.sentry.io/123456',
      }),
    ).toEqual({
      posthog: {
        apiHost: 'https://eu.i.posthog.com',
        apiKey: 'phc_test',
        captureEndpoint: 'https://eu.i.posthog.com/capture/',
      },
      sentry: {
        dsn: 'https://public@example.ingest.sentry.io/123456',
        envelopeUrl: 'https://example.ingest.sentry.io/api/123456/envelope/',
        publicKey: 'public',
      },
    });
  });
});

describe('createPosthogEventBody', () => {
  it('builds the payload expected by the posthog ingest endpoint', () => {
    expect(
      createPosthogEventBody(
        'onboarding_completed',
        { source: 'onboarding_accounts' },
        'phc_test',
        'https://dart.finance/onboarding/accounts',
      ),
    ).toMatchObject({
      api_key: 'phc_test',
      event: 'onboarding_completed',
      properties: {
        $current_url: 'https://dart.finance/onboarding/accounts',
        source: 'onboarding_accounts',
      },
    });
  });
});

describe('createSentryEnvelope', () => {
  it('creates a sentry envelope containing the extra payload', () => {
    const envelope = createSentryEnvelope(
      new Error('import failed'),
      { context: 'api_import' },
      'https://public@example.ingest.sentry.io/123456',
    );

    expect(envelope).toContain('"dsn":"https://public@example.ingest.sentry.io/123456"');
    expect(envelope).toContain('"context":"api_import"');
    expect(envelope).toContain('"message":"import failed"');
  });
});
