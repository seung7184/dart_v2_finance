export default function LandingPage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-bg)',
        gap: '18px',
        padding: '24px',
      }}
    >
      <h1
        style={{
          fontSize: '2rem',
          fontWeight: 700,
          color: 'var(--color-safe)',
        }}
      >
        Dart Finance
      </h1>
      <p style={{ color: 'var(--color-text-muted)', fontSize: '1rem' }}>
        Investor-aware safe-to-spend for employed investors in the Netherlands.
      </p>
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <a
          href="/readiness"
          style={{
            color: 'var(--color-text)',
            textDecoration: 'none',
            border: '1px solid var(--color-border)',
            borderRadius: '999px',
            padding: '10px 16px',
            background: 'var(--color-surface)',
          }}
        >
          Phase 3 readiness
        </a>
        <a
          href="/beta"
          style={{
            color: 'var(--color-text)',
            textDecoration: 'none',
            border: '1px solid var(--color-border)',
            borderRadius: '999px',
            padding: '10px 16px',
            background: 'var(--color-surface)',
          }}
        >
          Beta access
        </a>
        <a
          href="/privacy"
          style={{
            color: 'var(--color-text)',
            textDecoration: 'none',
            border: '1px solid var(--color-border)',
            borderRadius: '999px',
            padding: '10px 16px',
            background: 'var(--color-surface)',
          }}
        >
          Privacy
        </a>
      </div>
    </main>
  );
}
