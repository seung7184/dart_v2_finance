import type { ObservabilityPayload } from './core';

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

  sentryTarget?.captureException(error, {
    extra: payload,
  });
}

