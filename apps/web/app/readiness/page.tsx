import { ReadinessSummary } from '@/readiness/ui';

export default function ReadinessPage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'var(--color-bg)',
        padding: '40px 24px 72px',
      }}
    >
      <div style={{ maxWidth: '960px', margin: '0 auto', display: 'grid', gap: '24px' }}>
        <div style={{ display: 'grid', gap: '10px' }}>
          <span style={{ color: 'var(--color-safe)', fontSize: 'var(--text-sm)' }}>
            Phase 3 beta readiness
          </span>
          <h1 style={{ fontSize: 'var(--text-3xl)' }}>Auth, observability, ops, and billing</h1>
          <p style={{ color: 'var(--color-text-muted)', maxWidth: '760px' }}>
            This surface tracks the non-core scaffolds requested for Phase 3 without inventing live
            provider flows, backend writes, or out-of-scope V1 business logic.
          </p>
        </div>

        <ReadinessSummary />
      </div>
    </main>
  );
}

