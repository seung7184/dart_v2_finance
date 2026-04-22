'use client';

import { useEffect } from 'react';
import { trackFirstSeenEvent } from './client';

export function TrackTrustedNumberView() {
  useEffect(() => {
    trackFirstSeenEvent('observability:first_trusted_number', 'first_trusted_number', {
      source: 'why_page',
    });
  }, []);

  return null;
}

