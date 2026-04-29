import type { CSSProperties } from 'react';
import Link from 'next/link';
import { formatEUR } from '@dart/core';
import { requireAuthenticatedAppUser } from '@/auth/session';
import {
  getDatabaseRuntimeErrorMessage,
  getTransactionsRuntimeState,
  withDatabaseRuntimeTimeout,
} from '@/transactions/runtime';
import { loadSafeToSpendSourceData } from '@/safe-to-spend/data';
import { buildSafeToSpendViewModel, type SafeToSpendViewModel } from '@/safe-to-spend/view-model';

export const dynamic = 'force-dynamic';

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

function centsParts(cents: number) {
  return {
    euros: Math.floor(Math.abs(cents) / 100),
    cents: String(Math.abs(cents) % 100).padStart(2, '0'),
  };
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
        <div style={{ ...eyebrowStyle(), color: 'var(--warning)' }}>Setup needed</div>
        <h2
          style={{
            margin: '0 0 8px',
            color: 'var(--text-primary)',
            fontSize: 20,
            fontWeight: 600,
          }}
        >
          {viewModel.title}
        </h2>
        <p
          style={{
            margin: '0 0 18px',
            color: 'var(--text-secondary)',
            fontSize: 13,
            lineHeight: 1.6,
          }}
        >
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

export default async function DashboardPage() {
  const userId = await requireAuthenticatedAppUser();
  const runtimeState = getTransactionsRuntimeState(process.env);

  let databaseErrorMessage = runtimeState.message;
  let viewModel: SafeToSpendViewModel | null = null;

  if (runtimeState.databaseConfigured) {
    try {
      const sourceData = await withDatabaseRuntimeTimeout(loadSafeToSpendSourceData(userId));
      viewModel = buildSafeToSpendViewModel(sourceData);
    } catch (error) {
      databaseErrorMessage = getDatabaseRuntimeErrorMessage(error);
    }
  }

  const dailyParts = viewModel?.status === 'ready' ? centsParts(viewModel.result.value_cents) : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div
        style={{
          padding: '18px 32px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--surface-0)',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Home
          </h1>
          <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>
            {viewModel?.status === 'ready'
              ? `${viewModel.result.days_until_payday} days until payday · real safe-to-spend estimate`
              : 'Real safe-to-spend estimate'}
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

      {!runtimeState.databaseConfigured ? (
        <DatabaseUnavailable message={databaseErrorMessage} />
      ) : !viewModel ? (
        <DatabaseUnavailable message={databaseErrorMessage} />
      ) : viewModel?.status !== 'ready' ? (
        <EmptyState viewModel={viewModel} />
      ) : (
        <div style={{ padding: '24px 32px 48px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Critical warning banner */}
          {viewModel.warnings.length > 0 ? (
            <div
              style={{
                padding: '12px 16px',
                background: 'var(--warning-tint)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 12,
                color: 'var(--text-primary)',
                fontSize: 13,
              }}
            >
              {viewModel.warnings[0]?.message}
            </div>
          ) : null}

          {/* Safe-to-spend hero */}
          <div
            style={{
              background: 'var(--surface-1)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 16,
              padding: '28px 32px',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 16,
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
                  {dailyParts?.euros}
                  <span style={{ opacity: 0.55, fontWeight: 500 }}>,{dailyParts?.cents}</span>
                </span>
              </div>
              <div style={{ marginTop: 14, fontSize: 13, color: 'var(--text-secondary)' }}>
                Pool of {formatEUR(viewModel.result.spendable_pool_cents)} ÷{' '}
                {viewModel.result.days_until_payday} days ·{' '}
                <Link href="/why" style={{ color: 'var(--accent-400)', fontWeight: 500 }}>
                  See breakdown →
                </Link>
              </div>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-tertiary)', textAlign: 'right' }}>
              <div>Last updated</div>
              <div style={{ color: 'var(--text-secondary)', fontWeight: 500, marginTop: 2 }}>
                {viewModel.computedAtLabel}
              </div>
            </div>
          </div>

          {/* Stat cards: Available cash, Protected obligations, Investing protected */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: 12,
            }}
          >
            <div style={statCardStyle()}>
              <div style={eyebrowStyle()}>Available cash</div>
              <div style={{ fontSize: 22, fontWeight: 600, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>
                {formatEUR(viewModel.result.available_cash_cents)}
              </div>
            </div>
            <div style={statCardStyle()}>
              <div style={eyebrowStyle()}>Protected obligations</div>
              <div style={{ fontSize: 22, fontWeight: 600, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>
                {formatEUR(viewModel.result.protected_obligations.total_cents)}
              </div>
            </div>
            <div style={statCardStyle()}>
              <div style={eyebrowStyle()}>Investing protected</div>
              <div style={{ fontSize: 22, fontWeight: 600, color: 'var(--accent-400)', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>
                {formatEUR(viewModel.result.investing_cents)}
              </div>
            </div>
          </div>

          {/* Next bills before payday */}
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
            {viewModel.upcomingBills.length === 0 ? (
              <div style={{ padding: '18px 20px', color: 'var(--text-tertiary)', fontSize: 13 }}>
                No recurring bills are scheduled before {viewModel.paydayLabel}.
              </div>
            ) : (
              viewModel.upcomingBills.slice(0, 4).map((bill, i) => (
                <div
                  key={bill.id}
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
                  <span style={{ fontSize: 12, color: 'var(--text-tertiary)', fontVariantNumeric: 'tabular-nums' }}>{bill.dateLabel}</span>
                  <span style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                    {formatEUR(bill.amountCents)}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Quick actions */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: 12,
            }}
          >
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
              href="/transactions/new"
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
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Add transaction</div>
                <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>Manual web entry</div>
              </div>
              <span style={{ fontSize: 18, color: 'var(--text-tertiary)' }}>+</span>
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
                <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>
                  {viewModel.pendingReviewCount} pending review
                </div>
              </div>
              <span style={{ fontSize: 18, color: 'var(--text-tertiary)' }}>↔</span>
            </Link>
            <Link
              href="/transactions/matches"
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
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Review matches</div>
                <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>Manual → import matching</div>
              </div>
              <span style={{ fontSize: 18, color: 'var(--text-tertiary)' }}>⇄</span>
            </Link>
          </div>

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
      )}
    </div>
  );
}
