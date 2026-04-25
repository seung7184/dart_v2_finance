'use client';

import { useState } from 'react';
import Link from 'next/link';
import { trackEvent, trackException } from '@/observability/client';

type SubmissionState =
  | { status: 'idle' }
  | { status: 'success'; ticketId: string }
  | { status: 'error'; message: string };

const inputStyle = {
  width: '100%',
  height: 44,
  padding: '0 14px',
  borderRadius: 8,
  background: 'var(--surface-2)',
  border: '1px solid var(--border-default)',
  color: 'var(--text-primary)',
  fontFamily: 'var(--font-sans)',
  fontSize: 15,
  outline: 'none',
  letterSpacing: '-0.005em',
} as React.CSSProperties;

const labelStyle = {
  fontSize: 13,
  fontWeight: 500 as const,
  color: 'var(--text-secondary)',
  letterSpacing: '-0.005em',
};

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
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ broker, email, primaryBank, reason }),
      });

      const payload = (await response.json()) as Record<string, unknown>;
      if (!response.ok) {
        throw new Error(typeof payload.error === 'string' ? payload.error : 'BETA_SIGNUP_FAILED');
      }

      const ticketId = typeof payload.ticketId === 'string' ? payload.ticketId : 'beta-pending';
      trackEvent('onboarding_completed', { source: 'beta_waitlist' });
      setSubmissionState({ status: 'success', ticketId });
    } catch (error) {
      trackException(error, { context: 'beta_signup_form' });
      setSubmissionState({
        status: 'error',
        message: error instanceof Error ? error.message : 'BETA_SIGNUP_FAILED',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'var(--surface-0)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
      }}
    >
      {/* Brand */}
      <Link
        href="/"
        style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 40, textDecoration: 'none' }}
      >
        <div
          style={{
            width: 28, height: 28, borderRadius: 8,
            background: 'var(--accent-500)', color: '#fff',
            display: 'grid', placeItems: 'center',
            fontWeight: 800, fontSize: 15, letterSpacing: '-0.02em',
          }}
        >
          D
        </div>
        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
          Dart Finance
        </span>
      </Link>

      <div
        style={{
          width: '100%',
          maxWidth: 480,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '3px 10px',
              background: 'var(--accent-tint)',
              border: '1px solid rgba(59,130,246,0.22)',
              borderRadius: 999,
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: 'var(--accent-400)',
              width: 'fit-content',
            }}
          >
            Private beta · Netherlands
          </div>
          <h1
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: 'var(--text-primary)',
              letterSpacing: '-0.03em',
              lineHeight: 1.1,
            }}
          >
            Request beta access
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            ING + Trading 212 only for V1. We'll email you when your spot opens.
          </p>
        </div>

        {submissionState.status === 'success' ? (
          <div
            style={{
              background: 'var(--positive-tint)',
              border: '1px solid rgba(110,231,183,0.24)',
              borderRadius: 12,
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--positive)' }}>
              You're on the list
            </p>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              Ticket: <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{submissionState.ticketId}</span>
            </p>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              We'll reach out when your spot opens. No spam.
            </p>
          </div>
        ) : (
          <div
            style={{
              background: 'var(--surface-1)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 16,
              padding: '24px',
            }}
          >
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label htmlFor="email" style={labelStyle}>Email</label>
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label htmlFor="bank" style={labelStyle}>Primary bank</label>
                  <input
                    id="bank"
                    value={primaryBank}
                    onChange={(e) => setPrimaryBank(e.target.value)}
                    style={inputStyle}
                    placeholder="ING"
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label htmlFor="broker" style={labelStyle}>Broker</label>
                  <input
                    id="broker"
                    value={broker}
                    onChange={(e) => setBroker(e.target.value)}
                    style={inputStyle}
                    placeholder="Trading 212"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label htmlFor="reason" style={labelStyle}>
                  Why do you want access?{' '}
                  <span style={{ color: 'var(--text-tertiary)', fontWeight: 400 }}>(optional)</span>
                </label>
                <textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  placeholder="A few sentences about your setup…"
                  style={{
                    ...inputStyle,
                    height: 'auto',
                    padding: '10px 14px',
                    resize: 'vertical',
                    lineHeight: 1.6,
                  }}
                />
              </div>

              {submissionState.status === 'error' && (
                <p
                  style={{
                    fontSize: 13,
                    color: 'var(--warning)',
                    background: 'var(--warning-tint)',
                    border: '1px solid rgba(230,194,122,0.24)',
                    borderRadius: 8,
                    padding: '10px 12px',
                  }}
                >
                  {submissionState.message === 'INVALID_BETA_SIGNUP'
                    ? 'Use a valid email, ING as the bank, Trading 212 as the broker.'
                    : submissionState.message}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  height: 44,
                  background: isSubmitting ? 'var(--surface-3)' : 'var(--accent-500)',
                  color: isSubmitting ? 'var(--text-disabled)' : '#fff',
                  border: 'none',
                  borderRadius: 8,
                  fontFamily: 'var(--font-sans)',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  letterSpacing: '-0.005em',
                  marginTop: 4,
                }}
              >
                {isSubmitting ? 'Submitting…' : 'Join the waitlist'}
              </button>
            </form>
          </div>
        )}

        <p style={{ fontSize: 12, color: 'var(--text-tertiary)', textAlign: 'center' }}>
          Already have access?{' '}
          <Link href="/sign-in" style={{ color: 'var(--accent-400)' }}>
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
