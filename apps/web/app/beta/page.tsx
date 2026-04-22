'use client';

import { useState } from 'react';
import { Badge, Button, Card, Input } from '@dart/ui';
import { trackEvent, trackException } from '@/observability/client';

type SubmissionState =
  | { status: 'idle' }
  | { status: 'success'; ticketId: string }
  | { status: 'error'; message: string };

export default function BetaPage() {
  const [email, setEmail] = useState('');
  const [primaryBank, setPrimaryBank] = useState('ING');
  const [broker, setBroker] = useState('Trading 212');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionState, setSubmissionState] = useState<SubmissionState>({ status: 'idle' });

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmissionState({ status: 'idle' });

    try {
      const response = await fetch('/api/beta-signup', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          broker,
          email,
          primaryBank,
          reason,
        }),
      });

      const payload = (await response.json()) as Record<string, unknown>;
      if (!response.ok) {
        throw new Error(typeof payload.error === 'string' ? payload.error : 'BETA_SIGNUP_FAILED');
      }

      const ticketId = typeof payload.ticketId === 'string' ? payload.ticketId : 'beta-pending';
      trackEvent('onboarding_completed', {
        source: 'beta_waitlist',
      });
      setSubmissionState({ status: 'success', ticketId });
    } catch (error) {
      trackException(error, {
        context: 'beta_signup_form',
      });
      setSubmissionState({
        status: 'error',
        message: error instanceof Error ? error.message : 'BETA_SIGNUP_FAILED',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main style={{ minHeight: '100vh', padding: '40px 24px', background: 'var(--color-bg)' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto', display: 'grid', gap: '20px' }}>
        <div style={{ display: 'grid', gap: '8px' }}>
          <Badge variant="transfer">Beta ops</Badge>
          <h1 style={{ fontSize: 'var(--text-3xl)' }}>Request beta access</h1>
          <p style={{ color: 'var(--color-text-muted)' }}>
            This mock flow accepts only the documented V1 account mix: ING plus Trading 212. It
            gives beta operations a local submission path without assuming email automation or a
            production CRM.
          </p>
        </div>

        <Card style={{ display: 'grid', gap: '16px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '14px' }}>
            <Input
              label="Email"
              placeholder="name@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <Input
              label="Primary bank"
              placeholder="ING"
              value={primaryBank}
              onChange={(event) => setPrimaryBank(event.target.value)}
            />
            <Input
              label="Broker"
              placeholder="Trading 212"
              value={broker}
              onChange={(event) => setBroker(event.target.value)}
            />
            <label
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                color: 'var(--color-text-muted)',
                fontSize: 'var(--text-sm)',
              }}
            >
              Why do you want to join the beta?
              <textarea
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                rows={5}
                style={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '6px',
                  color: 'var(--color-text)',
                  fontFamily: 'var(--font-sans)',
                  fontSize: 'var(--text-base)',
                  padding: '8px 12px',
                }}
              />
            </label>

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting request…' : 'Join the beta waitlist'}
            </Button>
          </form>

          <p style={{ color: 'var(--color-text-faint)', fontSize: 'var(--text-sm)' }}>
            This local handler returns a mock ticket only. TODO(owner): connect the accepted ticket
            flow to the real beta inbox or CRM destination.
          </p>

          {submissionState.status === 'success' ? (
            <p style={{ color: 'var(--color-safe)', fontSize: 'var(--text-sm)' }}>
              Request accepted. Mock ticket: {submissionState.ticketId}
            </p>
          ) : null}

          {submissionState.status === 'error' ? (
            <p style={{ color: 'var(--color-warning)', fontSize: 'var(--text-sm)' }}>
              {submissionState.message === 'INVALID_BETA_SIGNUP'
                ? 'Use a valid email, ING as the bank, Trading 212 as the broker, and give a short reason.'
                : submissionState.message}
            </p>
          ) : null}
        </Card>
      </div>
    </main>
  );
}

