export default function PrivacyPage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        padding: '48px 24px 72px',
        background: 'var(--surface-0)',
        fontFamily: 'var(--font-sans)',
      }}
    >
      <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Header */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' as const }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' as const, padding: '3px 9px', borderRadius: 999, background: 'var(--accent-tint)', color: 'var(--accent-400)' }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor' }}/>EU-hosted
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' as const, padding: '3px 9px', borderRadius: 999, background: 'var(--surface-2)', color: 'var(--text-secondary)' }}>GDPR</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' as const, padding: '3px 9px', borderRadius: 999, background: 'var(--surface-2)', color: 'var(--text-secondary)' }}>Last updated · Apr 2026</span>
          </div>
          <h1 style={{ margin: 0, fontSize: 32, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.025em', lineHeight: 1.1 }}>
            What we store, where, and why
          </h1>
        </div>

        {/* Stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
          {[
            { l: 'Where', v: 'EU (Frankfurt) · Supabase' },
            { l: 'Encryption', v: 'TLS in transit · AES-256 at rest' },
            { l: 'Trackers', v: 'None · no third-party pixels' },
            { l: 'Bank credentials', v: 'Never collected' },
          ].map((s) => (
            <div key={s.l} style={{ background: 'var(--surface-1)', border: '1px solid var(--border-subtle)', borderRadius: 12, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: 'var(--text-tertiary)' }}>{s.l}</div>
              <div style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 500 }}>{s.v}</div>
            </div>
          ))}
        </div>

        {/* Prose sections */}
        {[
          { h: 'What we store', body: 'Your email address, the transactions you import, and basic settings. That\'s it. No bank credentials. No social profiles. No location data.' },
          { h: 'What we don\'t do', body: 'We don\'t sell data. We don\'t run third-party analytics in the product. We don\'t share anything with advertisers.' },
          { h: 'Your rights', body: 'Export everything anytime as CSV + JSON. Delete your account from Settings — your data is removed within 24 hours, including from backups within 30 days.' },
          { h: 'Sub-processors', body: 'Supabase (auth + database, EU), PostHog Cloud EU (product analytics), Sentry EU (error monitoring), Postmark EU (transactional email). DPA available on request.' },
          { h: 'Contact', body: 'Privacy questions: privacy@dart.eu · Data subject requests: dpo@dart.eu' },
        ].map((s) => (
          <section key={s.h}>
            <h2 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.015em' }}>{s.h}</h2>
            <p style={{ margin: 0, fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.65 }}>{s.body}</p>
          </section>
        ))}
      </div>
    </main>
  );
}
