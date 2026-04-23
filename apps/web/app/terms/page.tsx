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
          <h2 style={{ fontSize: 'var(--text-xl)' }}>Beta terms details</h2>
          <p style={{ color: 'var(--color-text-muted)' }}>
            These beta terms are provided by Dart Finance (beta), Rotterdam, Netherlands. They are
            effective from April 23, 2026 and governed by the laws of The Netherlands.
          </p>
          <p style={{ color: 'var(--color-text-muted)' }}>
            Support and feedback should be sent to support@dartfinance.app. The target response time
            for beta support is 5 business days.
          </p>
          <p style={{ color: 'var(--color-text-muted)' }}>
            Beta access may be revoked if needed to operate or protect the beta. If the beta is
            paused or ended, Dart Finance will give a simple sunset notice where practical. Beta
            users may request deletion or export of their beta data through privacy@dartfinance.app.
          </p>
        </Card>
      </div>
    </main>
  );
}
