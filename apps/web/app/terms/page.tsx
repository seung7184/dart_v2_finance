import { Badge, Card } from '@dart/ui';

export default function TermsPage() {
  return (
    <main style={{ minHeight: '100vh', padding: '40px 24px', background: 'var(--color-bg)' }}>
      <div style={{ maxWidth: '820px', margin: '0 auto', display: 'grid', gap: '18px' }}>
        <Badge variant="warning">Beta terms draft</Badge>
        <h1 style={{ fontSize: 'var(--text-3xl)' }}>Beta terms</h1>

        <Card style={{ display: 'grid', gap: '12px' }}>
          <p style={{ color: 'var(--color-text-muted)' }}>
            The private beta is offered for evaluation only while the product is being hardened.
            Features, data flows, auth behavior, and billing integrations may change before public
            launch.
          </p>
          <p style={{ color: 'var(--color-text-muted)' }}>
            Safe-to-spend is a conservative guide, not a guarantee. Beta users remain responsible
            for verifying imported transactions, recurring obligations, and planned investing
            settings before acting on the number.
          </p>
          <p style={{ color: 'var(--color-text-muted)' }}>
            Paid access is not active in this phase. Any subscription or billing commitments remain
            inactive until real Stripe and RevenueCat flows are attached.
          </p>
        </Card>

        <Card style={{ display: 'grid', gap: '12px' }}>
          <h2 style={{ fontSize: 'var(--text-xl)' }}>Owner-supplied details still required</h2>
          <p style={{ color: 'var(--color-text-muted)' }}>
            TODO(owner): insert governing entity, applicable jurisdiction, and effective date.
          </p>
          <p style={{ color: 'var(--color-text-muted)' }}>
            TODO(owner): add the final support email and feedback response expectations for beta
            participants.
          </p>
          <p style={{ color: 'var(--color-text-muted)' }}>
            TODO(owner): decide whether invite revocation, data export, and beta sunset notice need
            explicit clauses before external invites begin.
          </p>
        </Card>
      </div>
    </main>
  );
}
