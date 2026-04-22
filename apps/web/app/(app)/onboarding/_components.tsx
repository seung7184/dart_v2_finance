import Link from 'next/link';
import { Card, Button } from '@dart/ui';

interface OnboardingLayoutProps {
  step: number;
  title: string;
  description: string;
  children: React.ReactNode;
}

const STEPS = ['Payday', 'Income', 'Investing', 'Accounts'];

export function OnboardingLayout({
  step,
  title,
  description,
  children,
}: OnboardingLayoutProps) {
  return (
    <div
      style={{
        minHeight: '100vh',
        background:
          'radial-gradient(circle at top, var(--color-accent-muted), var(--color-bg) 48%)',
        padding: '40px 24px',
      }}
    >
      <div
        style={{
          margin: '0 auto',
          maxWidth: '960px',
          display: 'grid',
          gap: '24px',
          gridTemplateColumns: 'minmax(0, 280px) minmax(0, 1fr)',
        }}
      >
        <Card
          style={{
            background: 'var(--color-sidebar)',
            borderColor: 'var(--color-border)',
            display: 'grid',
            gap: '20px',
            alignSelf: 'start',
          }}
        >
          <div style={{ display: 'grid', gap: '8px' }}>
            <p style={{ color: 'var(--color-safe)', fontSize: 'var(--text-sm)' }}>
              Onboarding
            </p>
            <h1 style={{ fontSize: 'var(--text-3xl)', lineHeight: 'var(--leading-tight)' }}>
              Calm setup for a trusted safe-to-spend number.
            </h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
              Web-first setup for ING + Trading 212. English only for V1.
            </p>
          </div>

          <div style={{ display: 'grid', gap: '10px' }}>
            {STEPS.map((label, index) => {
              const isActive = index + 1 === step;

              return (
                <div
                  key={label}
                  style={{
                    border: `1px solid ${
                      isActive ? 'var(--color-safe)' : 'var(--color-border)'
                    }`,
                    borderRadius: '12px',
                    padding: '12px 14px',
                    background: isActive ? 'var(--color-surface)' : 'transparent',
                  }}
                >
                  <p
                    style={{
                      color: isActive ? 'var(--color-safe)' : 'var(--color-text-muted)',
                      fontSize: 'var(--text-xs)',
                    }}
                  >
                    Step {index + 1}
                  </p>
                  <p style={{ fontWeight: 600, marginTop: '4px' }}>{label}</p>
                </div>
              );
            })}
          </div>

          <Link
            href="/dashboard"
            style={{
              color: 'var(--color-text-muted)',
              textDecoration: 'none',
              fontSize: 'var(--text-sm)',
            }}
          >
            Skip for now
          </Link>
        </Card>

        <Card
          style={{
            padding: '28px',
            display: 'grid',
            gap: '20px',
          }}
        >
          <div style={{ display: 'grid', gap: '8px' }}>
            <p style={{ color: 'var(--color-safe)', fontSize: 'var(--text-sm)' }}>
              Step {step} of 4
            </p>
            <h2 style={{ fontSize: 'var(--text-3xl)', lineHeight: 'var(--leading-tight)' }}>
              {title}
            </h2>
            <p
              style={{
                color: 'var(--color-text-muted)',
                fontSize: 'var(--text-base)',
                maxWidth: '640px',
              }}
            >
              {description}
            </p>
          </div>

          {children}
        </Card>
      </div>
    </div>
  );
}

export function StepActions({
  backHref,
  nextLabel,
}: {
  backHref?: string;
  nextLabel: string;
}) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '12px',
        flexWrap: 'wrap',
      }}
    >
      {backHref ? (
        <Link href={backHref} style={{ textDecoration: 'none' }}>
          <Button variant="ghost" type="button">
            Back
          </Button>
        </Link>
      ) : (
        <span style={{ color: 'var(--color-text-faint)', fontSize: 'var(--text-sm)' }}>
          You can edit these later.
        </span>
      )}

      <Button type="submit">{nextLabel}</Button>
    </div>
  );
}
