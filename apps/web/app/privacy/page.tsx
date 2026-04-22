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
            The waitlist flow in this phase is mock-only. It accepts an email address, declared
            institution pair, and a short reason for joining so the beta queue can be triaged
            before any live automation is connected.
          </p>
        </Card>

        <Card style={{ display: 'grid', gap: '12px' }}>
          <h2 style={{ fontSize: 'var(--text-xl)' }}>Operational placeholders</h2>
          <p style={{ color: 'var(--color-text-muted)' }}>
            TODO(owner): insert legal entity name, registered address, and final privacy contact
            inbox.
          </p>
          <p style={{ color: 'var(--color-text-muted)' }}>
            TODO(owner): define retention windows for CSV uploads, waitlist submissions, and
            support conversations.
          </p>
          <p style={{ color: 'var(--color-text-muted)' }}>
            TODO(owner): document the final deletion workflow once support ownership and backend
            storage are finalized.
          </p>
        </Card>
      </div>
    </main>
  );
}

