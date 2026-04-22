import type { ObservabilityPayload } from './core';

type ObservabilityEnv = Record<string, string | undefined>;

export type PosthogBootstrapConfig = {
  apiHost: string;
  apiKey: string;
  captureEndpoint: string;
};

export type SentryBootstrapConfig = {
  dsn: string;
  envelopeUrl: string;
  publicKey: string;
};

export type ObservabilityBootstrapConfig = {
  posthog: PosthogBootstrapConfig | null;
  sentry: SentryBootstrapConfig | null;
};

function cleanValue(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : null;
}

export function getPosthogBootstrapConfig(env: ObservabilityEnv): PosthogBootstrapConfig | null {
  const apiKey = cleanValue(env.NEXT_PUBLIC_POSTHOG_KEY);

  if (!apiKey) {
    return null;
  }

  const apiHost = cleanValue(env.NEXT_PUBLIC_POSTHOG_HOST) ?? 'https://eu.i.posthog.com';

  return {
    apiHost: apiHost.replace(/\/$/, ''),
    apiKey,
    captureEndpoint: `${apiHost.replace(/\/$/, '')}/capture/`,
  };
}

export function getSentryBootstrapConfig(env: ObservabilityEnv): SentryBootstrapConfig | null {
  const dsn = cleanValue(env.NEXT_PUBLIC_SENTRY_DSN) ?? cleanValue(env.SENTRY_DSN);

  if (!dsn) {
    return null;
  }

  const parsed = new URL(dsn);
  const publicKey = parsed.username;
  const projectId = parsed.pathname.replace(/^\//, '');

  if (!publicKey || !projectId) {
    return null;
  }

  return {
    dsn,
    envelopeUrl: `${parsed.protocol}//${parsed.host}/api/${projectId}/envelope/`,
    publicKey,
  };
}

export function getObservabilityBootstrapConfig(
  env: ObservabilityEnv,
): ObservabilityBootstrapConfig {
  return {
    posthog: getPosthogBootstrapConfig(env),
    sentry: getSentryBootstrapConfig(env),
  };
}

export function createPosthogEventBody(
  eventName: string,
  payload: ObservabilityPayload,
  apiKey: string,
  currentUrl: string,
) {
  return {
    api_key: apiKey,
    event: eventName,
    properties: {
      ...payload,
      $current_url: currentUrl,
    },
    timestamp: new Date().toISOString(),
  };
}

function normalizeError(error: unknown) {
  if (error instanceof Error) {
    return {
      message: error.message,
      stack: error.stack ?? null,
      type: error.name || 'Error',
    };
  }

  return {
    message: String(error),
    stack: null,
    type: 'UnknownError',
  };
}

function createSentryEnvelopeHeaders(dsn: string) {
  return JSON.stringify({
    dsn,
    sent_at: new Date().toISOString(),
  });
}

function createSentryEventPayload(error: unknown, payload: ObservabilityPayload) {
  const normalized = normalizeError(error);

  return JSON.stringify({
    event_id: crypto.randomUUID().replace(/-/g, ''),
    exception: {
      values: [
        {
          type: normalized.type,
          value: normalized.message,
          stacktrace: normalized.stack
            ? {
                frames: normalized.stack.split('\n').map((line) => ({ filename: line })),
              }
            : undefined,
        },
      ],
    },
    extra: payload,
    level: 'error',
    message: normalized.message,
    platform: 'javascript',
    timestamp: Math.floor(Date.now() / 1000),
  });
}

export function createSentryEnvelope(error: unknown, payload: ObservabilityPayload, dsn: string) {
  const eventPayload = createSentryEventPayload(error, payload);

  return `${createSentryEnvelopeHeaders(dsn)}\n${JSON.stringify({ type: 'event' })}\n${eventPayload}`;
}
