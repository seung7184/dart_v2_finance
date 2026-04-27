export default function TermsPage() {
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
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor' }}/>Beta
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' as const, padding: '3px 9px', borderRadius: 999, background: 'var(--surface-2)', color: 'var(--text-secondary)' }}>Last updated · Apr 2026</span>
          </div>
          <h1 style={{ margin: 0, fontSize: 32, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.025em', lineHeight: 1.1 }}>
            Plain-language terms
          </h1>
          <p style={{ margin: 0, fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Dart Finance is a personal finance tracker. It&apos;s not a bank, broker, or financial advisor.
          </p>
        </div>

        {/* Sections */}
        {[
          { h: '1. What Dart is', body: 'A tool that reads CSVs you upload and shows you what you can safely spend. We don\'t move money. We don\'t connect to your bank. We don\'t give financial advice.' },
          { h: '2. Beta access', body: 'During private beta, the service is free and provided as-is. We may have downtime, change features, or pause access. We\'ll give 14 days\' notice before any pricing change.' },
          { h: '3. Your data', body: 'You own your data. You can export or delete it any time. See the Privacy page for what we store and where.' },
          { h: '4. Acceptable use', body: 'Don\'t try to break it, scrape it, or use it for anyone other than yourself during beta. One person, one account.' },
          { h: '5. Liability', body: 'We do our best, but we can\'t be liable for financial decisions you make based on what Dart shows. Always double-check with your bank\'s official statements.' },
          { h: '6. Termination', body: 'You can close your account from Settings any time. We can suspend accounts that violate these terms — we\'ll explain why.' },
          { h: '7. Governing law', body: 'Netherlands law applies. Disputes go to the Amsterdam district court unless your local consumer protection law says otherwise.' },
        ].map((s) => (
          <section key={s.h}>
            <h2 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.015em' }}>{s.h}</h2>
            <p style={{ margin: 0, fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.65 }}>{s.body}</p>
          </section>
        ))}

        <div style={{ paddingTop: 16, borderTop: '1px solid var(--border-subtle)' }}>
          <p style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
            Questions?{' '}
            <a href="mailto:support@dart.eu" style={{ color: 'var(--accent-400)' }}>support@dart.eu</a>
            {' '}· Effective from April 23, 2026 · Netherlands law governs
          </p>
        </div>
      </div>
    </main>
  );
}
