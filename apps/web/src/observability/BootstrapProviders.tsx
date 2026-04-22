'use client';

import { useEffect } from 'react';
import type { ObservabilityPayload } from './core';
import {
  createPosthogEventBody,
  createSentryEnvelope,
  getObservabilityBootstrapConfig,
} from './bootstrap';

type BrowserObservabilityWindow = Window & {
  posthog?: {
    capture: (eventName: string, properties?: ObservabilityPayload) => void;
  };
  Sentry?: {
    captureException: (
      error: unknown,
      context?: {
        extra?: ObservabilityPayload;
      },
    ) => void;
  };
  __dartObservabilityBootstrap?: {
    posthog: 'configured' | 'disabled';
    sentry: 'configured' | 'disabled';
  };
};

function postJson(url: string, body: string) {
  void fetch(url, {
    body,
    credentials: 'omit',
    headers: {
      'Content-Type': 'application/json',
    },
    keepalive: true,
    method: 'POST',
    mode: 'cors',
  }).catch(() => undefined);
}

function postEnvelope(url: string, body: string) {
  void fetch(url, {
    body,
    credentials: 'omit',
    headers: {
      'Content-Type': 'application/x-sentry-envelope',
    },
    keepalive: true,
    method: 'POST',
    mode: 'cors',
  }).catch(() => undefined);
}

export function BootstrapProviders() {
  useEffect(() => {
    const browserWindow = window as BrowserObservabilityWindow;
    const config = getObservabilityBootstrapConfig({
      NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
      NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
      NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
    });
    const posthogConfig = config.posthog;
    const sentryConfig = config.sentry;

    if (!browserWindow.posthog && posthogConfig) {
      browserWindow.posthog = {
        capture(eventName, properties = {}) {
          const eventBody = createPosthogEventBody(
            eventName,
            properties,
            posthogConfig.apiKey,
            window.location.href,
          );

          postJson(posthogConfig.captureEndpoint, JSON.stringify(eventBody));
        },
      };
    }

    if (!browserWindow.Sentry && sentryConfig) {
      browserWindow.Sentry = {
        captureException(error, context) {
          const envelope = createSentryEnvelope(error, context?.extra ?? {}, sentryConfig.dsn);

          postEnvelope(sentryConfig.envelopeUrl, envelope);
        },
      };
    }

    browserWindow.__dartObservabilityBootstrap = {
      posthog: posthogConfig ? 'configured' : 'disabled',
      sentry: sentryConfig ? 'configured' : 'disabled',
    };
  }, []);

  return null;
}
