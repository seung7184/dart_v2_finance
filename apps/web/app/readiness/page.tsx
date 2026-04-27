export const dynamic = 'force-dynamic';

type ReadinessItem = { t: string; s: string; on: boolean; partial?: boolean };
type ReadinessGroup = { label: string; items: ReadinessItem[] };

const GROUPS: ReadinessGroup[] = [
  {
    label: 'Auth',
    items: [
      { t: 'Supabase magic-link delivery', s: 'auth env wired · callback registered', on: true },
      { t: 'Session persistence', s: '30-day refresh · HttpOnly cookie', on: true },
      { t: 'Real authenticated user smoke', s: 'Owner verified locally · Apr 2026', on: true },
    ],
  },
  {
    label: 'Data',
    items: [
      { t: 'Transactions DB-backed', s: 'Authenticated, read-only', on: true },
      { t: 'ING import', s: 'nl-NL · parser tested', on: true },
      { t: 'Trading 212 import', s: 'Owner verified 20 rows imported', on: true },
    ],
  },
  {
    label: 'Telemetry',
    items: [
      { t: 'PostHog events wired', s: 'Key provided · ingest pending verification', on: true, partial: true },
      { t: 'Sentry error capture wired', s: 'DSN provided · dashboard pending verification', on: true, partial: true },
    ],
  },
  {
    label: 'Legal & contact',
    items: [
      { t: 'Privacy page live', s: '/privacy · readable', on: true },
      { t: 'Terms page live', s: '/terms · readable', on: true },
      { t: 'Contact email', s: 'support@dart.eu', on: true },
    ],
  },
  {
    label: 'Operations',
    items: [
      { t: 'beta_signups migration applied', s: 'Pending real DB', on: false },
      { t: 'Invite workflow defined', s: 'Pending owner decision', on: false },
    ],
  },
];

const allItems = GROUPS.flatMap((g) => g.items);
const done = allItems.filter((i) => i.on && !i.partial).length;
const partial = allItems.filter((i) => i.partial).length;
const pending = allItems.length - done - partial;

function Pill({ tone, children }: { tone: 'positive' | 'warn' | 'neutral'; children: React.ReactNode }) {
  const styles = {
    positive: { bg: 'var(--positive-tint)', color: 'var(--positive)' },
    warn: { bg: 'var(--warning-tint)', color: 'var(--warning)' },
    neutral: { bg: 'var(--surface-2)', color: 'var(--text-tertiary)' },
  }[tone];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' as const, padding: '3px 9px', borderRadius: 999, background: styles.bg, color: styles.color }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor' }}/>
      {children}
    </span>
  );
}

export default function ReadinessPage() {
  const pct = Math.round(((done + partial * 0.5) / allItems.length) * 100);

  return (
    <main style={{ minHeight: '100vh', padding: '48px 24px 72px', background: 'var(--surface-0)', fontFamily: 'var(--font-sans)' }}>
      <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Header */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: 'var(--text-tertiary)', marginBottom: 8 }}>
            Beta launch · readiness
          </div>
          <h1 style={{ margin: 0, fontSize: 32, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.025em' }}>
            We&apos;re {pct}% ready
          </h1>
          <p style={{ margin: '8px 0 0', fontSize: 14, color: 'var(--text-secondary)', maxWidth: 640, lineHeight: 1.55 }}>
            Live snapshot of what&apos;s needed before opening private beta. Operational gates only — core product and visual design are shipped.
          </p>
        </div>

        {/* Summary stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {[
            { l: 'Done', v: done, c: 'var(--positive)' },
            { l: 'Partial', v: partial, c: 'var(--warning)' },
            { l: 'Pending', v: pending, c: 'var(--text-tertiary)' },
          ].map((s) => (
            <div key={s.l} style={{ background: 'var(--surface-1)', border: '1px solid var(--border-subtle)', borderRadius: 12, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: 'var(--text-tertiary)' }}>{s.l}</div>
              <div style={{ fontSize: 30, fontWeight: 600, color: s.c, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>{s.v}</div>
            </div>
          ))}
        </div>

        {/* Groups */}
        {GROUPS.map((g) => (
          <div key={g.label}>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: 'var(--text-tertiary)', marginBottom: 10 }}>
              {g.label}
            </div>
            <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border-subtle)', borderRadius: 12, overflow: 'hidden' }}>
              {g.items.map((it, i) => {
                const tone = it.on && !it.partial ? 'positive' : it.partial ? 'warn' : 'neutral';
                const label = it.on && !it.partial ? 'Ready' : it.partial ? 'Partial' : 'Pending';
                return (
                  <div
                    key={i}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '28px 1fr auto',
                      alignItems: 'center',
                      padding: '14px 18px',
                      gap: 14,
                      borderTop: i === 0 ? 'none' : '1px solid var(--border-subtle)',
                    }}
                  >
                    <span style={{
                      width: 22, height: 22, borderRadius: 999, display: 'grid', placeItems: 'center',
                      background: it.on && !it.partial ? 'var(--positive-tint)' : it.partial ? 'var(--warning-tint)' : 'var(--surface-2)',
                      color: it.on && !it.partial ? 'var(--positive)' : it.partial ? 'var(--warning)' : 'var(--text-tertiary)',
                      fontWeight: 700, fontSize: 12,
                    }}>
                      {it.on && !it.partial ? '✓' : it.partial ? '~' : ''}
                    </span>
                    <div>
                      <div style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 500 }}>{it.t}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>{it.s}</div>
                    </div>
                    <Pill tone={tone}>{label}</Pill>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
