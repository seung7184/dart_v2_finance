import Link from 'next/link';

interface OnboardingLayoutProps {
  step: number;
  title: string;
  description: string;
  children: React.ReactNode;
}

const STEPS = [
  { label: 'Payday', desc: 'When do you get paid?' },
  { label: 'Income', desc: 'Monthly salary & buffer' },
  { label: 'Investing', desc: 'Planned DCA amount' },
  { label: 'Accounts', desc: 'ING + Trading 212' },
];

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
        background: 'var(--surface-0)',
        padding: '40px 24px',
      }}
    >
      <div
        style={{
          margin: '0 auto',
          maxWidth: 960,
          display: 'grid',
          gap: 20,
          gridTemplateColumns: '260px 1fr',
          alignItems: 'start',
        }}
      >
        {/* Sidebar steps */}
        <div
          style={{
            background: 'var(--surface-1)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 16,
            padding: '24px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: 24,
          }}
        >
          {/* Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 16, borderBottom: '1px solid var(--border-subtle)' }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                background: 'var(--accent-500)',
                color: '#fff',
                display: 'grid',
                placeItems: 'center',
                fontWeight: 800,
                fontSize: 15,
                letterSpacing: '-0.02em',
                flexShrink: 0,
              }}
            >
              D
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
              Dart Finance
            </span>
          </div>

          {/* Intro */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-tertiary)' }}>
              Setup
            </p>
            <h1 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1.3 }}>
              Calm setup for a trusted number.
            </h1>
            <p style={{ fontSize: 12, color: 'var(--text-tertiary)', lineHeight: 1.5 }}>
              ING + Trading 212 · English · V1
            </p>
          </div>

          {/* Steps */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {STEPS.map((s, index) => {
              const isActive = index + 1 === step;
              const isDone = index + 1 < step;
              return (
                <div
                  key={s.label}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 10,
                    border: `1px solid ${isActive ? 'rgba(59,130,246,0.4)' : 'var(--border-subtle)'}`,
                    background: isActive ? 'var(--accent-tint)' : isDone ? 'var(--surface-2)' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                  }}
                >
                  <div
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      background: isDone ? 'var(--positive-tint)' : isActive ? 'var(--accent-tint)' : 'var(--surface-3)',
                      border: `1px solid ${isDone ? 'rgba(110,231,183,0.3)' : isActive ? 'rgba(59,130,246,0.4)' : 'var(--border-subtle)'}`,
                      display: 'grid',
                      placeItems: 'center',
                      fontSize: 10,
                      fontWeight: 700,
                      color: isDone ? 'var(--positive)' : isActive ? 'var(--accent-400)' : 'var(--text-tertiary)',
                      flexShrink: 0,
                    }}
                  >
                    {isDone ? '✓' : index + 1}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 1, minWidth: 0 }}>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: isActive ? 600 : 500,
                        color: isActive ? 'var(--accent-400)' : isDone ? 'var(--text-secondary)' : 'var(--text-tertiary)',
                      }}
                    >
                      {s.label}
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{s.desc}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <Link
            href="/dashboard"
            style={{
              fontSize: 12,
              color: 'var(--text-tertiary)',
              textDecoration: 'none',
              marginTop: 'auto',
            }}
          >
            Skip for now →
          </Link>
        </div>

        {/* Main form card */}
        <div
          style={{
            background: 'var(--surface-1)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 16,
            padding: '28px 28px',
            display: 'flex',
            flexDirection: 'column',
            gap: 24,
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <p
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--accent-400)',
              }}
            >
              Step {step} of {STEPS.length}
            </p>
            <h2
              style={{
                fontSize: 22,
                fontWeight: 600,
                color: 'var(--text-primary)',
                letterSpacing: '-0.02em',
                lineHeight: 1.2,
              }}
            >
              {title}
            </h2>
            <p
              style={{
                fontSize: 14,
                color: 'var(--text-secondary)',
                lineHeight: 1.6,
                maxWidth: 520,
              }}
            >
              {description}
            </p>
          </div>

          {children}
        </div>
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
        gap: 12,
        paddingTop: 8,
        borderTop: '1px solid var(--border-subtle)',
        marginTop: 8,
      }}
    >
      {backHref ? (
        <Link href={backHref} style={{ textDecoration: 'none' }}>
          <button
            type="button"
            style={{
              height: 40,
              padding: '0 16px',
              background: 'transparent',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-default)',
              borderRadius: 8,
              fontFamily: 'var(--font-sans)',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              letterSpacing: '-0.005em',
            }}
          >
            ← Back
          </button>
        </Link>
      ) : (
        <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
          You can edit these later.
        </span>
      )}

      <button
        type="submit"
        style={{
          height: 40,
          padding: '0 20px',
          background: 'var(--accent-500)',
          color: '#fff',
          border: 'none',
          borderRadius: 8,
          fontFamily: 'var(--font-sans)',
          fontSize: 14,
          fontWeight: 600,
          cursor: 'pointer',
          letterSpacing: '-0.005em',
        }}
      >
        {nextLabel}
      </button>
    </div>
  );
}
