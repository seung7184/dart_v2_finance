import Link from 'next/link';
import { Card, Badge } from '@dart/ui';
import { TrackTrustedNumberView } from '@/observability/TrackTrustedNumberView';

const AVAILABLE_CASH_ITEMS = [
  { label: 'ING Checking', value: '€2,640.00', href: '/transactions' },
  { label: 'Accessible Savings', value: '€600.00', href: '/transactions' },
];

const PROTECTED_ITEMS = [
  { label: 'Upcoming bills before payday', value: '€1,240.00', href: '/transactions' },
  { label: 'Sinking fund allocation', value: '€120.00', href: '/transactions' },
  { label: 'Minimum cash buffer', value: '€400.00', href: '/onboarding/payday' },
  { label: 'Planned investing', value: '€800.00', href: '/onboarding/investing' },
  { label: 'Unreviewed transactions reserve', value: '€75.00', href: '/import' },
];

function LinkedRow({
  label,
  value,
  href,
}: {
  label: string;
  value: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        gap: '12px',
        padding: '12px 14px',
        borderRadius: '12px',
        border: '1px solid var(--color-border)',
        textDecoration: 'none',
        color: 'var(--color-text)',
        background: 'var(--color-bg)',
      }}
    >
      <span>{label}</span>
      <span style={{ color: 'var(--color-safe)' }}>{value}</span>
    </Link>
  );
}

export default function WhyPage() {
  return (
    <div style={{ padding: '32px', display: 'grid', gap: '20px' }}>
      <TrackTrustedNumberView />
      <Card
        style={{
          display: 'grid',
          gap: '18px',
          background:
            'linear-gradient(135deg, var(--color-accent-muted), var(--color-sidebar))',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'grid', gap: '8px' }}>
            <Badge variant="protected">Safe-to-spend header</Badge>
            <h1 style={{ fontSize: 'var(--text-4xl)', lineHeight: 'var(--leading-tight)' }}>
              Why today is €75.62
            </h1>
            <p style={{ color: 'var(--color-text-muted)', maxWidth: '720px' }}>
              Safe to spend is a conservative daily guide based on your cash, upcoming
              obligations, and planned investing until payday.
            </p>
          </div>

          <div
            style={{
              border: '1px solid var(--color-border)',
              borderRadius: '16px',
              padding: '16px',
              minWidth: '220px',
              background: 'var(--color-bg)',
            }}
          >
            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
              Calculation breakdown
            </p>
            <p style={{ fontSize: 'var(--text-2xl)', marginTop: '8px' }}>€605.00 / 8 days</p>
            <p style={{ color: 'var(--color-safe)', marginTop: '6px' }}>= €75.62 today</p>
          </div>
        </div>
      </Card>

      <Card style={{ display: 'grid', gap: '14px' }}>
        <div style={{ display: 'grid', gap: '6px' }}>
          <h2 style={{ fontSize: 'var(--text-2xl)' }}>Available Cash</h2>
          <p style={{ color: 'var(--color-text-muted)' }}>
            Click any line to inspect the underlying account activity.
          </p>
        </div>
        {AVAILABLE_CASH_ITEMS.map((item) => (
          <LinkedRow key={item.label} {...item} />
        ))}
        <LinkedRow label="Total available cash" value="€3,240.00" href="/transactions" />
      </Card>

      <Card style={{ display: 'grid', gap: '14px' }}>
        <div style={{ display: 'grid', gap: '6px' }}>
          <h2 style={{ fontSize: 'var(--text-2xl)' }}>Protected Obligations</h2>
          <p style={{ color: 'var(--color-text-muted)' }}>
            Every protected item links to the relevant review queue or setting.
          </p>
        </div>
        {PROTECTED_ITEMS.map((item) => (
          <LinkedRow key={item.label} {...item} />
        ))}
        <LinkedRow label="Total protected obligations" value="€2,635.00" href="/transactions" />
      </Card>

      <Card style={{ display: 'grid', gap: '14px' }}>
        <div style={{ display: 'grid', gap: '6px' }}>
          <h2 style={{ fontSize: 'var(--text-2xl)' }}>Calculation Breakdown</h2>
          <p style={{ color: 'var(--color-text-muted)' }}>
            Pool is clamped at zero when obligations exceed available cash.
          </p>
        </div>
        <LinkedRow label="Spendable pool" value="€605.00" href="/transactions" />
        <LinkedRow label="Days until payday" value="8 days" href="/onboarding/payday" />
        <LinkedRow label="Pool / days = daily guide" value="€75.62" href="/dashboard" />
      </Card>
    </div>
  );
}
