import { Badge, Card } from '@dart/ui';

function providerValue(value: string | undefined) {
  return value?.trim() ? 'Configured in environment' : 'Missing public key';
}

export default function BillingPage() {
  return (
    <main style={{ minHeight: '100vh', padding: '40px 24px', background: 'var(--color-bg)' }}>
      <div style={{ maxWidth: '760px', margin: '0 auto', display: 'grid', gap: '20px' }}>
        <div style={{ display: 'grid', gap: '8px' }}>
          <Badge variant="warning">Billing scaffold</Badge>
          <h1 style={{ fontSize: 'var(--text-3xl)' }}>Billing readiness</h1>
          <p style={{ color: 'var(--color-text-muted)' }}>
            Web billing stays at scaffold level here. No live checkout, entitlement sync, or plan
            enforcement is implemented in this phase.
          </p>
        </div>

        <Card style={{ display: 'grid', gap: '12px' }}>
          <h2 style={{ fontSize: 'var(--text-xl)' }}>Stripe</h2>
          <p style={{ color: 'var(--color-text-muted)' }}>
            Publishable key status: {providerValue(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)}
          </p>
          <p style={{ color: 'var(--color-text-faint)', fontSize: 'var(--text-sm)' }}>
            Server-side checkout, webhook handling, and plan persistence remain future work.
          </p>
        </Card>

        <Card style={{ display: 'grid', gap: '12px' }}>
          <h2 style={{ fontSize: 'var(--text-xl)' }}>RevenueCat</h2>
          <p style={{ color: 'var(--color-text-muted)' }}>
            Public Apple key status:{' '}
            {providerValue(process.env.NEXT_PUBLIC_REVENUECAT_APPLE_PUBLIC_KEY)}
          </p>
          <p style={{ color: 'var(--color-text-faint)', fontSize: 'var(--text-sm)' }}>
            Mobile entitlement activation is intentionally deferred until the mobile build is
            attached to the trusted web flow.
          </p>
        </Card>
      </div>
    </main>
  );
}

