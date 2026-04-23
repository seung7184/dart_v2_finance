import { Badge, Card } from '@dart/ui';

export default function PrivacyPage() {
  return (
    <main style={{ minHeight: '100vh', padding: '40px 24px', background: 'var(--color-bg)' }}>
      <div style={{ maxWidth: '820px', margin: '0 auto', display: 'grid', gap: '18px' }}>
        <Badge variant="warning">Beta privacy draft</Badge>
        <h1 style={{ fontSize: 'var(--text-3xl)' }}>Privacy notice</h1>

        <Card style={{ display: 'grid', gap: '12px' }}>
          <p style={{ color: 'var(--color-text-muted)' }}>
            Dart Finance beta is CSV-first and limited to ING plus Trading 212 in V1. Uploaded CSV
            content, transaction classifications, and safe-to-spend explanations should be used
            only to operate the product, review imports, and support beta testers.
          </p>
          <p style={{ color: 'var(--color-text-muted)' }}>
            The waitlist flow accepts an email address, declared institution pair, and a short
            reason for joining so the beta queue can be triaged before invites are sent.
          </p>
        </Card>

        <Card style={{ display: 'grid', gap: '12px' }}>
          <h2 style={{ fontSize: 'var(--text-xl)' }}>Beta privacy details</h2>
          <p style={{ color: 'var(--color-text-muted)' }}>
            Dart Finance (beta), Rotterdam, Netherlands, is responsible for this beta privacy
            notice. Privacy questions, deletion requests, and export requests can be sent to
            privacy@dartfinance.app.
          </p>
          <p style={{ color: 'var(--color-text-muted)' }}>
            CSV uploads are retained for up to 30 days. Waitlist submissions and support
            conversations are retained for up to 12 months.
          </p>
          <p style={{ color: 'var(--color-text-muted)' }}>
            Dart Finance processes manual deletion requests on request. Beta users may also request
            an export of their beta data by contacting privacy@dartfinance.app.
          </p>
        </Card>
      </div>
    </main>
  );
}
