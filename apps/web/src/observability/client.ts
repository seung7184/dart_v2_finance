'use client';

import {
  captureBrowserEvent,
  captureBrowserException,
  shouldCaptureFirstSeenEvent,
  type BrowserObservabilityTargets,
  type ObservabilityEventName,
  type ObservabilityPayload,
} from './core';

type BrowserWindow = Window & {
  posthog?: BrowserObservabilityTargets['posthog'];
  Sentry?: BrowserObservabilityTargets['sentry'];
  __dartObservedEvents?: Array<{
    eventName: ObservabilityEventName;
    payload: ObservabilityPayload;
  }>;
};

function getBrowserWindow(): BrowserWindow | null {
  if (typeof window === 'undefined') {
    return null;
  }

  return window as BrowserWindow;
}

function getTargets(): BrowserObservabilityTargets {
  const browserWindow = getBrowserWindow();
  const targets: BrowserObservabilityTargets = {};

  if (browserWindow?.posthog) {
    targets.posthog = browserWindow.posthog;
  }

  if (browserWindow?.Sentry) {
    targets.sentry = browserWindow.Sentry;
  }

  return targets;
}

function rememberEvent(eventName: ObservabilityEventName, payload: ObservabilityPayload) {
  const browserWindow = getBrowserWindow();
  if (!browserWindow) {
    return;
  }

  browserWindow.__dartObservedEvents = browserWindow.__dartObservedEvents ?? [];
  browserWindow.__dartObservedEvents.push({ eventName, payload });
}

export function trackEvent(eventName: ObservabilityEventName, payload: ObservabilityPayload = {}) {
  captureBrowserEvent(getTargets(), eventName, payload);
  rememberEvent(eventName, payload);
}

export function trackFirstSeenEvent(
  storageKey: string,
  eventName: Extract<ObservabilityEventName, 'first_import' | 'first_trusted_number'>,
  payload: ObservabilityPayload = {},
) {
  if (typeof window === 'undefined') {
    return false;
  }

  const storage = window.localStorage;
  const storageAdapter = {
    get: (key: string) => storage.getItem(key) ?? undefined,
    set: (key: string, value: string) => storage.setItem(key, value),
  };

  if (!shouldCaptureFirstSeenEvent(storageAdapter, storageKey)) {
    return false;
  }

  trackEvent(eventName, payload);
  return true;
}

export function trackException(error: unknown, payload: ObservabilityPayload = {}) {
  captureBrowserException(getTargets(), error, payload);
}
