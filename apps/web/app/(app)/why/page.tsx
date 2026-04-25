'use client';

import { useState } from 'react';
import Link from 'next/link';
import { TrackTrustedNumberView } from '@/observability/TrackTrustedNumberView';

function fmtEUR(cents: number): string {
  const abs = Math.abs(cents) / 100;
  return new Intl.NumberFormat('nl-NL', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(abs);
}

function Num({
  cents,
  sign = '',
  bold,
  color,
}: {
  cents: number;
  sign?: string;
  bold?: boolean;
  color?: string;
}) {
  return (
    <span
      style={{
        fontVariantNumeric: 'tabular-nums',
        fontFeatureSettings: '"tnum","ss01"',
        color: color ?? 'var(--text-primary)',
        fontWeight: bold ? 600 : 500,
        fontSize: 13,
        letterSpacing: '-0.005em',
        whiteSpace: 'nowrap',
      }}
    >
      {sign}€ {fmtEUR(cents)}
    </span>
  );
}

function MiniBadge({
  children,
  tone = 'neutral',
}: {
  children: React.ReactNode;
  tone?: 'neutral' | 'accent' | 'warning';
}) {
  const t =
    tone === 'accent'
      ? { bg: 'var(--accent-tint)', fg: 'var(--accent-400)' }
      : tone === 'warning'
      ? { bg: 'var(--warning-tint)', fg: 'var(--warning)' }
      : { bg: 'var(--surface-2)', fg: 'var(--text-secondary)' };
  return (
    <span
      style={{
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        padding: '2px 7px',
        borderRadius: 999,
        background: t.bg,
        color: t.fg,
        flexShrink: 0,
      }}
    >
      {children}
    </span>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="14"
      height="14"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        transform: open ? 'rotate(90deg)' : 'rotate(0)',
        transition: `transform var(--duration-fast) var(--ease-standard)`,
        color: 'var(--text-tertiary)',
        flexShrink: 0,
      }}
    >
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

function Section({
  title,
  totalCents,
  sign,
  defaultOpen,
  children,
  badge,
  accent,
}: {
  title: string;
  totalCents: number;
  sign: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
  badge?: React.ReactNode;
  accent?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen ?? true);
  return (
    <div
      style={{
        background: 'var(--surface-1)',
        border: `1px solid ${accent ? 'rgba(59,130,246,0.22)' : 'var(--border-subtle)'}`,
        borderRadius: 12,
        overflow: 'hidden',
      }}
    >
      <button
        type="button"
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          cursor: 'pointer',
          textAlign: 'left',
          background: 'transparent',
          border: 'none',
          fontFamily: 'var(--font-sans)',
        }}
      >
        <Chevron open={open} />
        <span
          style={{
            fontSize: 13,
            color: 'var(--text-primary)',
            fontWeight: 600,
            letterSpacing: '-0.005em',
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          {title}
          {badge}
        </span>
        <Num
          cents={totalCents}
          sign={sign}
          bold
          {...(accent ? { color: 'var(--accent-400)' } : {})}
        />
      </button>
      {open && (
        <div style={{ borderTop: '1px solid var(--border-subtle)' }}>{children}</div>
      )}
    </div>
  );
}

function SubRow({
  label,
  meta,
  cents,
  sign,
  indent = 0,
  href,
  muted,
  badge,
}: {
  label: string;
  meta?: string;
  cents: number;
  sign?: string;
  indent?: number;
  href?: string;
  muted?: boolean;
  badge?: React.ReactNode;
}) {
  const content = (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        alignItems: 'center',
        gap: 16,
        padding: `10px 20px 10px ${20 + indent}px`,
        borderTop: '1px solid var(--border-subtle)',
        transition: 'background 80ms var(--ease-standard)',
        cursor: href ? 'pointer' : 'default',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
        <span
          style={{
            fontSize: 13,
            color: muted ? 'var(--text-tertiary)' : 'var(--text-primary)',
            fontWeight: 500,
            letterSpacing: '-0.005em',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {label}
        </span>
        {meta && <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>· {meta}</span>}
        {badge}
      </div>
      <Num
        cents={cents}
        {...(sign !== undefined ? { sign } : {})}
        {...(muted ? { color: 'var(--text-tertiary)' } : {})}
      />
    </div>
  );

  if (href) {
    return (
      <Link href={href} style={{ textDecoration: 'none' }}>
        {content}
      </Link>
    );
  }
  return content;
}

function GroupHeader({ label, cents }: { label: string; cents: number }) {
  return (
    <div
      style={{
        padding: '10px 20px',
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        gap: 16,
        alignItems: 'center',
        borderTop: '1px solid var(--border-subtle)',
      }}
    >
      <span
        style={{
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: 'var(--text-tertiary)',
        }}
      >
        {label}
      </span>
      <Num cents={cents} sign="−" color="var(--text-secondary)" />
    </div>
  );
}

// Static demo values (cents)
const AVAILABLE_CASH = 294060;
const SAVINGS_EXCLUDED = 420000;
const BILLS_TOTAL = 89198;
const SINKING_TOTAL = 94392;
const INVESTING_TOTAL = 80000;
const ANOMALY_TOTAL = 760;
const PROTECTED_TOTAL = BILLS_TOTAL + SINKING_TOTAL + INVESTING_TOTAL + ANOMALY_TOTAL;
const POOL = AVAILABLE_CASH - PROTECTED_TOTAL;
const DAYS = 8;
const DAILY = Math.floor(POOL / DAYS);

export default function WhyPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <TrackTrustedNumberView />

      {/* Topbar */}
      <div
        style={{
          padding: '18px 32px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          background: 'var(--surface-0)',
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: 20,
              fontWeight: 600,
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
            }}
          >
            Safe to Spend Today
          </h1>
          <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>
            Why € {fmtEUR(DAILY)}? · {DAYS} days until payday
          </div>
        </div>
      </div>

      <div style={{ padding: '24px 32px 48px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Hero card */}
        <div
          style={{
            background: 'var(--surface-1)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 16,
            padding: '24px 28px',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--text-tertiary)',
                marginBottom: 10,
              }}
            >
              Safe to spend today · per day
            </div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'baseline',
                gap: 6,
                color: 'var(--text-primary)',
                fontVariantNumeric: 'tabular-nums',
                fontFeatureSettings: '"tnum","ss01"',
                fontWeight: 600,
                letterSpacing: '-0.04em',
                lineHeight: 0.96,
              }}
            >
              <span style={{ fontSize: 28, color: 'var(--text-tertiary)', fontWeight: 500 }}>€</span>
              <span style={{ fontSize: 64 }}>
                {Math.floor(DAILY / 100)}
                <span style={{ color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>
                  ,{String(DAILY % 100).padStart(2, '0')}
                </span>
              </span>
            </div>
            <div style={{ marginTop: 12, fontSize: 13, color: 'var(--text-secondary)' }}>
              2 accounts · 4 protected obligations · 1 pending review
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              gap: 4,
              fontSize: 12,
              color: 'var(--text-tertiary)',
            }}
          >
            <span>Last updated</span>
            <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Today</span>
          </div>
        </div>

        {/* Available Cash */}
        <Section title="Available Cash" totalCents={AVAILABLE_CASH} sign="+" defaultOpen>
          <SubRow
            label="ING Checking"
            meta="NL91INGB · updated today"
            cents={AVAILABLE_CASH}
            sign="+"
            indent={14}
            href="/transactions"
          />
          <SubRow
            label="ING Savings"
            meta="Not accessible · buffer"
            cents={SAVINGS_EXCLUDED}
            indent={14}
            muted
            badge={<MiniBadge>Excluded</MiniBadge>}
          />
        </Section>

        {/* Protected Obligations */}
        <Section title="Protected Obligations" totalCents={PROTECTED_TOTAL} sign="−" defaultOpen>
          <GroupHeader label="Bills before payday" cents={BILLS_TOTAL} />
          <SubRow
            label="Spotify Family"
            meta="Apr 23 · recurring"
            cents={1199}
            sign="−"
            indent={14}
            href="/transactions"
          />
          <SubRow
            label="Rent"
            meta="Apr 25 · direct debit"
            cents={85000}
            sign="−"
            indent={14}
            href="/transactions"
          />

          <GroupHeader label="Sinking funds" cents={SINKING_TOTAL} />
          <SubRow
            label="Car insurance"
            meta="Annual · due Jun 15"
            cents={68000}
            sign="−"
            indent={14}
            href="/transactions"
          />
          <SubRow
            label="Holiday fund"
            meta="Target Aug 01 · €1.200"
            cents={26392}
            sign="−"
            indent={14}
            href="/transactions"
          />

          <div
            style={{
              padding: '10px 20px',
              display: 'grid',
              gridTemplateColumns: '1fr auto',
              gap: 16,
              alignItems: 'center',
              borderTop: '1px solid var(--border-subtle)',
            }}
          >
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: 'var(--text-tertiary)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              Planned investing <MiniBadge tone="accent">Protected</MiniBadge>
            </span>
            <Num cents={INVESTING_TOTAL} sign="−" color="var(--text-secondary)" />
          </div>
          <SubRow
            label="VWCE + SXR8 DCA"
            meta="Target Apr 28 · Trading 212"
            cents={INVESTING_TOTAL}
            sign="−"
            indent={14}
            href="/transactions"
          />

          <div
            style={{
              padding: '10px 20px',
              display: 'grid',
              gridTemplateColumns: '1fr auto',
              gap: 16,
              alignItems: 'center',
              borderTop: '1px solid var(--border-subtle)',
            }}
          >
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: 'var(--text-tertiary)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              Anomaly reserve <MiniBadge tone="warning">1 pending</MiniBadge>
            </span>
            <Num cents={ANOMALY_TOTAL} sign="−" color="var(--text-secondary)" />
          </div>
          <SubRow
            label="Unreviewed transaction"
            meta="Apr 20 · needs review"
            cents={ANOMALY_TOTAL}
            sign="−"
            indent={14}
            href="/transactions"
          />
        </Section>

        {/* Calculation */}
        <Section
          title={`How this becomes € ${fmtEUR(DAILY)}`}
          totalCents={DAILY}
          sign="="
          defaultOpen
          accent
          badge={<MiniBadge tone="accent">Formula</MiniBadge>}
        >
          <div
            style={{ padding: '18px 20px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto',
                alignItems: 'center',
                rowGap: 8,
              }}
            >
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Available cash</span>
              <Num cents={AVAILABLE_CASH} sign="+" />
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                Protected obligations
              </span>
              <Num cents={PROTECTED_TOTAL} sign="−" />
              <div
                style={{
                  gridColumn: '1 / -1',
                  height: 1,
                  background: 'var(--border-subtle)',
                  margin: '4px 0',
                }}
              />
              <span style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 600 }}>
                Spendable pool
              </span>
              <Num cents={POOL} bold />
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>÷ Days until payday</span>
              <span
                style={{
                  fontVariantNumeric: 'tabular-nums',
                  color: 'var(--text-primary)',
                  fontWeight: 600,
                  fontSize: 13,
                }}
              >
                {DAYS} days
              </span>
            </div>
            <div
              style={{
                marginTop: 4,
                background: 'var(--accent-tint)',
                border: '1px solid rgba(59,130,246,0.22)',
                borderRadius: 10,
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'baseline',
                justifyContent: 'space-between',
              }}
            >
              <span
                style={{
                  fontSize: 13,
                  color: 'var(--accent-400)',
                  fontWeight: 600,
                  letterSpacing: '-0.005em',
                }}
              >
                Safe to Spend Today
              </span>
              <span
                style={{
                  color: 'var(--text-primary)',
                  fontWeight: 600,
                  fontSize: 22,
                  letterSpacing: '-0.02em',
                  fontVariantNumeric: 'tabular-nums',
                  fontFeatureSettings: '"tnum","ss01"',
                }}
              >
                € {fmtEUR(DAILY)}
              </span>
            </div>
          </div>
        </Section>

        <p style={{ fontSize: 12, color: 'var(--text-tertiary)', padding: '4px 2px' }}>
          Every value above links to the source transaction or setting. Dart never moves money —
          these are plans, not orders.
        </p>
      </div>
    </div>
  );
}
