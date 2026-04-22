export type ObservabilityEventName =
  | 'onboarding_completed'
  | 'first_import'
  | 'first_trusted_number'
  | 'csv_import_completed'
  | 'transaction_reviewed';

export type ObservabilityPayload = Record<string, string | number | boolean | null | undefined>;

export type BrowserObservabilityTargets = {
  posthog?: {
    capture: (eventName: string, properties?: ObservabilityPayload) => void;
  };
  sentry?: {
    captureException: (
      error: unknown,
      context?: {
        extra?: ObservabilityPayload;
      },
    ) => void;
  };
};

type FirstSeenStorage = {
  get: (key: string) => string | undefined;
  set: (key: string, value: string) => void;
};

export function captureBrowserEvent(
  targets: BrowserObservabilityTargets,
  eventName: ObservabilityEventName,
  payload: ObservabilityPayload,
) {
  targets.posthog?.capture(eventName, payload);
}

export function shouldCaptureFirstSeenEvent(
  storage: FirstSeenStorage,
  key: string,
) {
  if (storage.get(key) === 'true') {
    return false;
  }

  storage.set(key, 'true');
  return true;
}

export function captureBrowserException(
  targets: BrowserObservabilityTargets,
  error: unknown,
  payload: ObservabilityPayload,
) {
  targets.sentry?.captureException(error, {
    extra: payload,
  });
}
