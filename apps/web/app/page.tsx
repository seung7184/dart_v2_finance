import Link from 'next/link';
import { RootTokenRedirect } from '@/auth/root-token-redirect.client';
import { DartLockup } from '@/brand/DartLogo';

export default function LandingPage() {
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
        gap: 0,
      }}
    >
      <RootTokenRedirect />

      {/* Brand mark */}
      <div style={{ marginBottom: 48 }}>
        <DartLockup variant="app" size="md" />
      </div>

      {/* Hero number — the product promise */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 12,
          marginBottom: 40,
          textAlign: 'center',
          maxWidth: 560,
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--text-tertiary)',
            marginBottom: 4,
          }}
        >
          Safe to spend today
        </div>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'baseline',
            gap: 6,
            color: 'var(--text-primary)',
            fontVariantNumeric: 'tabular-nums',
            fontFeatureSettings: '"tnum","ss01"',
            fontWeight: 600,
            letterSpacing: '-0.04em',
            lineHeight: 0.96,
          }}
        >
          <span style={{ fontSize: 28, color: 'var(--text-tertiary)', fontWeight: 500 }}>€</span>
          <span style={{ fontSize: 64 }}>
            37
            <span style={{ color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>,20</span>
          </span>
        </div>
        <p
          style={{
            fontSize: 14,
            color: 'var(--text-secondary)',
            marginTop: 8,
          }}
        >
          Until payday on the 25th · 8 days
        </p>
        <p
          style={{
            fontSize: 13,
            color: 'var(--text-tertiary)',
            maxWidth: 440,
            lineHeight: 1.6,
          }}
        >
          Investor-aware safe-to-spend for employed people in the Netherlands.
          Protects your planned investing. No surprises.
        </p>
      </div>

      {/* CTAs */}
      <div
        style={{
          display: 'flex',
          gap: 10,
          flexWrap: 'wrap',
          justifyContent: 'center',
          marginBottom: 48,
        }}
      >
        <Link
          href="/sign-in"
          style={{
            height: 44,
            padding: '0 20px',
            background: 'var(--accent-500)',
            color: 'var(--text-on-accent)',
            borderRadius: 8,
            fontWeight: 600,
            fontSize: 14,
            display: 'inline-flex',
            alignItems: 'center',
            textDecoration: 'none',
            letterSpacing: '-0.005em',
          }}
        >
          Sign in
        </Link>
        <Link
          href="/beta"
          style={{
            height: 44,
            padding: '0 20px',
            background: 'var(--surface-2)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-default)',
            borderRadius: 8,
            fontWeight: 600,
            fontSize: 14,
            display: 'inline-flex',
            alignItems: 'center',
            textDecoration: 'none',
            letterSpacing: '-0.005em',
          }}
        >
          Request beta access
        </Link>
      </div>

      {/* Footer links */}
      <div
        style={{
          display: 'flex',
          gap: 20,
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}
      >
        {[
          { label: 'Privacy', href: '/privacy' },
          { label: 'Terms', href: '/terms' },
          { label: 'Readiness', href: '/readiness' },
        ].map((link) => (
          <Link
            key={link.href}
            href={link.href}
            style={{
              fontSize: 12,
              color: 'var(--text-tertiary)',
              textDecoration: 'none',
            }}
          >
            {link.label}
          </Link>
        ))}
      </div>

      {/* Beta notice */}
      <p
        style={{
          marginTop: 24,
          fontSize: 11,
          color: 'var(--text-disabled)',
          letterSpacing: '-0.005em',
        }}
      >
        Private beta · ING + Trading 212 · Netherlands only
      </p>
    </main>
  );
}
