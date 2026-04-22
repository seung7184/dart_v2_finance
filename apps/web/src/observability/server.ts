import type { ObservabilityPayload } from './core';
import { createSentryEnvelope, getSentryBootstrapConfig } from './bootstrap';

async function postSentryEnvelope(error: unknown, payload: ObservabilityPayload) {
  const config = getSentryBootstrapConfig(process.env);
  if (!config) {
    return;
  }

  const envelope = createSentryEnvelope(error, payload, config.dsn);

  await fetch(config.envelopeUrl, {
    body: envelope,
    headers: {
      'Content-Type': 'application/x-sentry-envelope',
    },
    method: 'POST',
  }).catch(() => undefined);
}

export function captureServerException(error: unknown, payload: ObservabilityPayload = {}) {
  const sentryTarget = (globalThis as typeof globalThis & {
    Sentry?: {
      captureException: (
        cause: unknown,
        context?: {
          extra?: ObservabilityPayload;
        },
      ) => void;
    };
  }).Sentry;

  if (sentryTarget) {
    sentryTarget.captureException(error, {
      extra: payload,
    });
    return;
  }

  void postSentryEnvelope(error, payload);
}
