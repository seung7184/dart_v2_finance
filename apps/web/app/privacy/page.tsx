export default function PrivacyPage() {
  return (
    <main style={{ minHeight: '100vh', padding: '40px 24px', background: 'var(--color-bg)' }}>
      <div style={{ maxWidth: '760px', margin: '0 auto', display: 'grid', gap: '18px' }}>
        <h1 style={{ fontSize: 'var(--text-3xl)' }}>Privacy notice</h1>
        <p style={{ color: 'var(--color-text-muted)' }}>
          Dart Finance beta is CSV-first. V1 supports ING and Trading 212 imports only, and the web
          product remains the primary operational surface while the beta is stabilized.
        </p>
        <p style={{ color: 'var(--color-text-muted)' }}>
          This scaffold does not introduce new collection paths. Uploaded data, once real backend
          storage is enabled, should be limited to the minimum needed for import review,
          safe-to-spend explanations, and beta support.
        </p>
        <p style={{ color: 'var(--color-text-muted)' }}>
          Contact details, retention windows, and deletion workflow are intentionally left as
          placeholders until the production support inbox and legal owner are finalized.
        </p>
      </div>
    </main>
  );
}

