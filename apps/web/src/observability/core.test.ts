import { describe, expect, it, vi } from 'vitest';
import {
  type BrowserObservabilityTargets,
  captureBrowserEvent,
  captureBrowserException,
  shouldCaptureFirstSeenEvent,
} from './core';

function createTargets(): BrowserObservabilityTargets {
  return {
    posthog: {
      capture: vi.fn(),
    },
    sentry: {
      captureException: vi.fn(),
    },
  };
}

describe('captureBrowserEvent', () => {
  it('forwards event payloads to posthog when available', () => {
    const targets = createTargets();

    captureBrowserEvent(targets, 'csv_import_completed', {
      bank: 'ING',
      importedCount: 2,
    });

    expect(targets.posthog?.capture).toHaveBeenCalledWith('csv_import_completed', {
      bank: 'ING',
      importedCount: 2,
    });
  });

  it('does not throw when providers are absent', () => {
    expect(() => captureBrowserEvent({}, 'first_import', { bank: 'T212' })).not.toThrow();
  });
});

describe('shouldCaptureFirstSeenEvent', () => {
  it('returns true the first time a key is seen and false afterwards', () => {
    const storage = new Map<string, string>();

    expect(shouldCaptureFirstSeenEvent(storage, 'observability:first_import')).toBe(true);
    expect(shouldCaptureFirstSeenEvent(storage, 'observability:first_import')).toBe(false);
  });
});

describe('captureBrowserException', () => {
  it('forwards errors to sentry when available', () => {
    const targets = createTargets();
    const error = new Error('import failed');

    captureBrowserException(targets, error, {
      context: 'import_page',
    });

    expect(targets.sentry?.captureException).toHaveBeenCalledWith(error, {
      extra: {
        context: 'import_page',
      },
    });
  });
});
