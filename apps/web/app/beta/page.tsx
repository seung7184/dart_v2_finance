import { Badge, Button, Card, Input } from '@dart/ui';

export default function BetaPage() {
  return (
    <main style={{ minHeight: '100vh', padding: '40px 24px', background: 'var(--color-bg)' }}>
      <div style={{ maxWidth: '640px', margin: '0 auto', display: 'grid', gap: '20px' }}>
        <div style={{ display: 'grid', gap: '8px' }}>
          <Badge variant="transfer">Beta ops scaffold</Badge>
          <h1 style={{ fontSize: 'var(--text-3xl)' }}>Request beta access</h1>
          <p style={{ color: 'var(--color-text-muted)' }}>
            This placeholder keeps the beta waitlist flow visible without assuming a backend or
            email service. It is intentionally static until support ownership is confirmed.
          </p>
        </div>

        <Card style={{ display: 'grid', gap: '14px' }}>
          <Input label="Email" placeholder="name@example.com" />
          <Input label="Primary bank" placeholder="ING only for V1" />
          <Input label="Broker" placeholder="Trading 212 only for V1" />
          <Button type="button" disabled>
            Waitlist wiring pending
          </Button>
          <p style={{ color: 'var(--color-text-faint)', fontSize: 'var(--text-sm)' }}>
            This form does not submit anywhere yet. Its purpose is to hold copy, route structure,
            and V1 scope constraints in one place.
          </p>
        </Card>
      </div>
    </main>
  );
}

