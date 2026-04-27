import Link from 'next/link';
import { formatEUR } from '@dart/core';
import { requireAuthenticatedAppUser } from '@/auth/session';
import { TrackTrustedNumberView } from '@/observability/TrackTrustedNumberView';
import { loadSafeToSpendSourceData } from '@/safe-to-spend/data';
import { buildSafeToSpendViewModel, type SafeToSpendViewModel } from '@/safe-to-spend/view-model';
import { getTransactionsRuntimeState } from '@/transactions/runtime';

export const dynamic = 'force-dynamic';

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

function Section({
  title,
  totalCents,
  sign,
  children,
  badge,
  accent,
}: {
  title: string;
  totalCents: number;
  sign: string;
  children: React.ReactNode;
  badge?: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <div
      style={{
        background: 'var(--surface-1)',
        border: `1px solid ${accent ? 'var(--accent-500)' : 'var(--border-subtle)'}`,
        borderRadius: 12,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          width: '100%',
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          textAlign: 'left',
          background: 'transparent',
          border: 'none',
          fontFamily: 'var(--font-sans)',
        }}
      >
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
      </div>
      <div style={{ borderTop: '1px solid var(--border-subtle)' }}>{children}</div>
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

function GroupHeader({ label, cents, badge }: { label: string; cents: number; badge?: React.ReactNode }) {
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
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        {label}
        {badge}
      </span>
      <Num cents={cents} sign="−" color="var(--text-secondary)" />
    </div>
  );
}

function EmptyState({ viewModel }: { viewModel: SafeToSpendViewModel }) {
  if (viewModel.status === 'ready') {
    return null;
  }

  return (
    <div style={{ padding: '24px 32px 48px' }}>
      <div
        style={{
          background: 'var(--surface-1)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 12,
          padding: 24,
          maxWidth: 680,
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--warning)',
            marginBottom: 10,
          }}
        >
          Setup needed
        </div>
        <h2 style={{ margin: '0 0 8px', fontSize: 20, color: 'var(--text-primary)' }}>
          {viewModel.title}
        </h2>
        <p style={{ margin: '0 0 18px', fontSize: 13, lineHeight: 1.6, color: 'var(--text-secondary)' }}>
          {viewModel.message}
        </p>
        <Link
          href={viewModel.actionHref}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            height: 38,
            padding: '0 14px',
            borderRadius: 8,
            background: 'var(--accent-500)',
            color: 'var(--text-inverse)',
            textDecoration: 'none',
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          {viewModel.actionLabel}
        </Link>
      </div>
    </div>
  );
}

function DatabaseUnavailable({ message }: { message: string | null }) {
  return (
    <EmptyState
      viewModel={{
        actionHref: '/settings',
        actionLabel: 'Open settings',
        message:
          message ??
          'Configure DATABASE_URL in the approved local environment path, then restart the web server.',
        status: 'database_unavailable',
        title: 'Safe-to-spend needs the live database',
      }}
    />
  );
}

export default async function WhyPage() {
  const userId = await requireAuthenticatedAppUser();
  const runtimeState = getTransactionsRuntimeState(process.env);
  const viewModel = runtimeState.databaseConfigured
    ? buildSafeToSpendViewModel(await loadSafeToSpendSourceData(userId))
    : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {viewModel?.status === 'ready' ? <TrackTrustedNumberView /> : null}

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
            {viewModel?.status === 'ready'
              ? `Why € ${fmtEUR(viewModel.result.value_cents)}? · ${viewModel.result.days_until_payday} days until payday`
              : 'A real breakdown appears after setup is complete'}
          </div>
        </div>
      </div>

      {!runtimeState.databaseConfigured ? (
        <DatabaseUnavailable message={runtimeState.message} />
      ) : !viewModel ? (
        <DatabaseUnavailable message={runtimeState.message} />
      ) : viewModel?.status !== 'ready' ? (
        <EmptyState viewModel={viewModel} />
      ) : (
        <div style={{ padding: '24px 32px 48px', display: 'flex', flexDirection: 'column', gap: 12 }}>
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
                  {Math.floor(viewModel.result.value_cents / 100)}
                  <span style={{ opacity: 0.55, fontWeight: 500 }}>
                    ,{String(viewModel.result.value_cents % 100).padStart(2, '0')}
                  </span>
                </span>
              </div>
              <div style={{ marginTop: 12, fontSize: 13, color: 'var(--text-secondary)' }}>
                {viewModel.availableAccounts.filter((account) => account.included).length} included accounts ·{' '}
                {viewModel.upcomingBills.length + viewModel.sinkingFunds.length} scheduled obligations ·{' '}
                {viewModel.pendingReviewCount} pending review
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
              <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
                {viewModel.computedAtLabel}
              </span>
            </div>
          </div>

          {viewModel.warnings.map((warning) => (
            <div
              key={warning.code}
              style={{
                padding: '12px 16px',
                border: '1px solid var(--border-subtle)',
                borderRadius: 12,
                background: warning.severity === 'info' ? 'var(--surface-1)' : 'var(--warning-tint)',
                color: 'var(--text-primary)',
                fontSize: 13,
              }}
            >
              {warning.message}
            </div>
          ))}

          <Section title="Available Cash" totalCents={viewModel.result.available_cash_cents} sign="+" >
            {viewModel.availableAccounts.map((account) => (
              <SubRow
                key={account.id}
                label={account.name}
                meta={account.included ? account.label : `${account.label} · excluded`}
                cents={account.balanceCents}
                indent={14}
                href="/transactions"
                muted={!account.included}
                {...(account.included ? { sign: '+' } : {})}
                {...(!account.included ? { badge: <MiniBadge>Excluded</MiniBadge> } : {})}
              />
            ))}
          </Section>

          <Section
            title="Protected Obligations"
            totalCents={viewModel.result.protected_obligations.total_cents}
            sign="−"
          >
            <GroupHeader
              label={`Bills before ${viewModel.paydayLabel}`}
              cents={viewModel.result.protected_obligations.upcoming_bills_cents}
            />
            {viewModel.upcomingBills.length === 0 ? (
              <SubRow label="No upcoming recurring bills before payday" cents={0} indent={14} muted />
            ) : (
              viewModel.upcomingBills.map((bill) => (
                <SubRow
                  key={bill.id}
                  label={bill.name}
                  meta={`${bill.dateLabel} · recurring`}
                  cents={bill.amountCents}
                  sign="−"
                  indent={14}
                  href="/transactions"
                />
              ))
            )}

            <GroupHeader label="Sinking funds" cents={viewModel.result.protected_obligations.sinking_fund_cents} />
            {viewModel.sinkingFunds.length === 0 ? (
              <SubRow label="No active sinking fund allocations" cents={0} indent={14} muted />
            ) : (
              viewModel.sinkingFunds.map((fund) => (
                <SubRow
                  key={fund.id}
                  label={fund.name}
                  meta="Monthly allocation"
                  cents={fund.amountCents}
                  sign="−"
                  indent={14}
                />
              ))
            )}

            <GroupHeader label="Minimum cash buffer" cents={viewModel.result.protected_obligations.min_buffer_cents} />
            <SubRow
              label="Configured safety floor"
              cents={viewModel.result.protected_obligations.min_buffer_cents}
              sign="−"
              indent={14}
              muted={viewModel.result.protected_obligations.min_buffer_cents === 0}
            />

            <GroupHeader
              label="Planned investing"
              cents={viewModel.result.protected_obligations.investing_cents}
              badge={
                viewModel.result.investing_protected ? (
                  <MiniBadge tone="accent">Protected</MiniBadge>
                ) : (
                  <MiniBadge tone="warning">Off</MiniBadge>
                )
              }
            />
            <SubRow
              label="Current month investing plan"
              meta={viewModel.result.investing_protected ? 'Protected by default' : 'Not protected'}
              cents={viewModel.result.protected_obligations.investing_cents}
              sign="−"
              indent={14}
              href="/settings"
              muted={viewModel.result.protected_obligations.investing_cents === 0}
            />

            <GroupHeader
              label="Unreviewed transactions reserve"
              cents={viewModel.result.protected_obligations.anomaly_reserve_cents}
              badge={
                viewModel.pendingReviewCount > 0 ? (
                  <MiniBadge tone="warning">{viewModel.pendingReviewCount} pending</MiniBadge>
                ) : undefined
              }
            />
            <SubRow
              label={viewModel.pendingReviewCount > 0 ? 'Pending or needs-review transactions' : 'No pending review reserve'}
              meta="Recent imports"
              cents={viewModel.result.protected_obligations.anomaly_reserve_cents}
              sign="−"
              indent={14}
              href="/transactions"
              muted={viewModel.result.protected_obligations.anomaly_reserve_cents === 0}
            />
          </Section>

          <Section
            title={`How this becomes € ${fmtEUR(viewModel.result.value_cents)}`}
            totalCents={viewModel.result.value_cents}
            sign="="
            accent
            badge={<MiniBadge tone="accent">Formula</MiniBadge>}
          >
            <div style={{ padding: '18px 20px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 500 }}>
                {formatEUR(viewModel.result.available_cash_cents)} available cash −{' '}
                {formatEUR(viewModel.result.protected_obligations.total_cents)} protected obligations ={' '}
                {formatEUR(viewModel.result.spendable_pool_cents)} spendable pool
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {formatEUR(viewModel.result.spendable_pool_cents)} ÷{' '}
                {viewModel.result.days_until_payday} days until payday ({viewModel.paydayLabel}) ={' '}
                <span style={{ color: 'var(--accent-400)', fontWeight: 600 }}>
                  {' '}
                  {formatEUR(viewModel.result.value_cents)} per day
                </span>
              </div>
              <div
                style={{
                  marginTop: 4,
                  padding: '12px 14px',
                  borderRadius: 10,
                  background: 'var(--surface-2)',
                  color: 'var(--text-tertiary)',
                  fontSize: 12,
                  lineHeight: 1.55,
                }}
              >
                Safe to spend is a conservative daily guide based on your cash, upcoming
                obligations, and planned investing until payday.
              </div>
            </div>
          </Section>
        </div>
      )}
    </div>
  );
}
