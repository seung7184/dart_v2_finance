import type { CSSProperties } from 'react';
import Link from 'next/link';
import { formatEUR } from '@dart/core';

// Static demo values (same as /why page — engine not yet wired to this view)
const AVAILABLE_CASH = 294060;
const BILLS_TOTAL = 89198;
const SINKING_TOTAL = 94392;
const INVESTING_TOTAL = 80000;
const ANOMALY_TOTAL = 760;
const PROTECTED_TOTAL = BILLS_TOTAL + SINKING_TOTAL + INVESTING_TOTAL + ANOMALY_TOTAL;
const POOL = Math.max(0, AVAILABLE_CASH - PROTECTED_TOTAL);
const DAYS = 8;
const DAILY = Math.floor(POOL / DAYS);

const BILLS = [
  { name: 'Spotify Family', date: 'Apr 23', cents: 1199 },
  { name: 'Rent', date: 'Apr 25', cents: 85000 },
  { name: 'Gym', date: 'Apr 28', cents: 2999 },
];

function statCardStyle(): CSSProperties {
  return {
    background: 'var(--surface-1)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 12,
    padding: '16px 18px',
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  };
}

function eyebrowStyle(): CSSProperties {
  return {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.08em',
    textTransform: 'uppercase' as const,
    color: 'var(--text-tertiary)',
  };
}

export default function DashboardPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Topbar */}
      <div
        style={{
          padding: '18px 32px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--surface-0)',
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Home
          </h1>
          <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>
            {DAYS} days until payday · safe-to-spend estimate
          </div>
        </div>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            padding: '3px 9px',
            borderRadius: 999,
            background: 'var(--accent-tint)',
            color: 'var(--accent-400)',
          }}
        >
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor' }} />
          Beta
        </span>
      </div>

      <div style={{ padding: '24px 32px 48px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Hero */}
        <div
          style={{
            background: 'var(--surface-1)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 16,
            padding: '28px 32px',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={eyebrowStyle()}>Safe to spend today · per day</div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'baseline',
                gap: 6,
                marginTop: 12,
                fontVariantNumeric: 'tabular-nums',
                fontFeatureSettings: '"tnum","ss01"',
                fontWeight: 600,
                letterSpacing: '-0.04em',
                lineHeight: 0.96,
                color: 'var(--text-primary)',
              }}
            >
              <span style={{ fontSize: 28, color: 'var(--text-tertiary)', fontWeight: 500 }}>€</span>
              <span style={{ fontSize: 64 }}>
                {Math.floor(DAILY / 100)}
                <span style={{ opacity: 0.55, fontWeight: 500 }}>,{String(DAILY % 100).padStart(2, '0')}</span>
              </span>
            </div>
            <div style={{ marginTop: 14, fontSize: 13, color: 'var(--text-secondary)' }}>
              Pool of {formatEUR(POOL)} ÷ {DAYS} days ·{' '}
              <Link href="/why" style={{ color: 'var(--accent-400)', fontWeight: 500 }}>
                See breakdown →
              </Link>
            </div>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-tertiary)', textAlign: 'right' }}>
            <div>Last updated</div>
            <div style={{ color: 'var(--text-secondary)', fontWeight: 500, marginTop: 2 }}>Today</div>
          </div>
        </div>

        {/* Stat row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          <div style={statCardStyle()}>
            <div style={eyebrowStyle()}>Available cash</div>
            <div style={{ fontSize: 22, fontWeight: 600, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>
              {formatEUR(AVAILABLE_CASH)}
            </div>
          </div>
          <div style={statCardStyle()}>
            <div style={eyebrowStyle()}>Protected obligations</div>
            <div style={{ fontSize: 22, fontWeight: 600, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>
              {formatEUR(PROTECTED_TOTAL)}
            </div>
          </div>
          <div style={statCardStyle()}>
            <div style={eyebrowStyle()}>Investing protected</div>
            <div style={{ fontSize: 22, fontWeight: 600, color: 'var(--accent-400)', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>
              {formatEUR(INVESTING_TOTAL)}
            </div>
          </div>
        </div>

        {/* Next bills */}
        <div
          style={{
            background: 'var(--surface-1)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 12,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '14px 20px',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div style={eyebrowStyle()}>Next bills before payday</div>
            <Link href="/why" style={{ fontSize: 12, color: 'var(--accent-400)' }}>View all →</Link>
          </div>
          {BILLS.map((bill, i) => (
            <div
              key={bill.name}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto auto',
                alignItems: 'center',
                gap: 20,
                padding: '14px 20px',
                borderTop: i === 0 ? 'none' : '1px solid var(--border-subtle)',
              }}
            >
              <span style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 500 }}>{bill.name}</span>
              <span style={{ fontSize: 12, color: 'var(--text-tertiary)', fontVariantNumeric: 'tabular-nums' }}>{bill.date}</span>
              <span style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                {formatEUR(bill.cents)}
              </span>
            </div>
          ))}
        </div>

        {/* Quick links */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Link
            href="/import"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 20px',
              background: 'var(--surface-1)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 12,
              textDecoration: 'none',
            }}
          >
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Import CSV</div>
              <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>ING + Trading 212</div>
            </div>
            <span style={{ fontSize: 18, color: 'var(--text-tertiary)' }}>↑</span>
          </Link>
          <Link
            href="/transactions"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 20px',
              background: 'var(--surface-1)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 12,
              textDecoration: 'none',
            }}
          >
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Transactions</div>
              <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>Review imported rows</div>
            </div>
            <span style={{ fontSize: 18, color: 'var(--text-tertiary)' }}>↔</span>
          </Link>
        </div>

        {/* Free beta notice */}
        <div
          style={{
            padding: '14px 18px',
            background: 'transparent',
            border: '1px solid var(--border-subtle)',
            borderRadius: 12,
            fontSize: 13,
            color: 'var(--text-tertiary)',
            lineHeight: 1.55,
          }}
        >
          <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Free during private beta.</span>{' '}
          Billing isn&apos;t active yet. We&apos;ll email you 14 days before any pricing change.
        </div>
      </div>
    </div>
  );
}
