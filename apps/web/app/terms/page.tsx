export default function TermsPage() {
  return (
    <main style={{ minHeight: '100vh', padding: '40px 24px', background: 'var(--color-bg)' }}>
      <div style={{ maxWidth: '760px', margin: '0 auto', display: 'grid', gap: '18px' }}>
        <h1 style={{ fontSize: 'var(--text-3xl)' }}>Beta terms</h1>
        <p style={{ color: 'var(--color-text-muted)' }}>
          The private beta is provided for evaluation only. The product is still being hardened, so
          data flows, billing, and auth behavior may change before public launch.
        </p>
        <p style={{ color: 'var(--color-text-muted)' }}>
          Safe-to-spend is a conservative guide, not a guarantee. Users remain responsible for
          verifying imported transactions, recurring obligations, and planned investing settings.
        </p>
        <p style={{ color: 'var(--color-text-muted)' }}>
          Paid access is not enabled by this scaffold. Any subscription terms remain inactive until
          real Stripe and RevenueCat integrations are attached.
        </p>
      </div>
    </main>
  );
}

