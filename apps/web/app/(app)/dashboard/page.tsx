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
import { loadAvailableMonths, loadMonthlyCategoryBreakdown, loadMonthlyStats } from '@/safe-to-spend/monthly';
import { loadMerchantInsights, type MerchantInsights } from '@/merchants/insights';
import MonthSelector from './MonthSelector';

export const dynamic = 'force-dynamic';

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

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

function MonthlyStatsCard({
  stats,
  isCurrentMonth,
}: {
  stats: Awaited<ReturnType<typeof loadMonthlyStats>>;
  isCurrentMonth: boolean;
}) {
  const monthLabel = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(stats.year, stats.month - 1, 1)));

  const spendParts = centsParts(stats.reviewedSpendingCents);
  const spendPerDayParts = centsParts(stats.actualSpendPerDayCents);

  return (
    <div
      style={{
        background: 'var(--surface-1)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 16,
        padding: '24px 28px',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={eyebrowStyle()}>
          {monthLabel} · Monthly overview
        </div>
        {isCurrentMonth && (
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              padding: '2px 8px',
              borderRadius: 999,
              background: 'var(--accent-tint)',
              color: 'var(--accent-400)',
            }}
          >
            Current month
          </span>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 12 }}>
        <div style={statCardStyle()}>
          <div style={eyebrowStyle()}>Reviewed spending</div>
          <div
            style={{
              fontSize: 22,
              fontWeight: 600,
              color: 'var(--text-primary)',
              fontVariantNumeric: 'tabular-nums',
              letterSpacing: '-0.02em',
            }}
          >
            € {spendParts.euros}
            <span style={{ opacity: 0.55, fontWeight: 500, fontSize: 16 }}>,{spendParts.cents}</span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
            {stats.reviewedSpendingCount} transactions
          </div>
        </div>

        <div style={statCardStyle()}>
          <div style={eyebrowStyle()}>Reviewed inflows</div>
          <div
            style={{
              fontSize: 22,
              fontWeight: 600,
              color: 'var(--positive)',
              fontVariantNumeric: 'tabular-nums',
              letterSpacing: '-0.02em',
            }}
          >
            {formatEUR(stats.reviewedInflowCents)}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
            Salary, dividends, refunds
          </div>
        </div>

        <div style={statCardStyle()}>
          <div style={eyebrowStyle()}>
            {isCurrentMonth ? 'Actual spend/day so far' : 'Actual avg spend/day'}
          </div>
          <div
            style={{
              fontSize: 22,
              fontWeight: 600,
              color: 'var(--text-primary)',
              fontVariantNumeric: 'tabular-nums',
              letterSpacing: '-0.02em',
            }}
          >
            € {spendPerDayParts.euros}
            <span style={{ opacity: 0.55, fontWeight: 500, fontSize: 16 }}>,{spendPerDayParts.cents}</span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
            {isCurrentMonth
              ? `Over ${stats.daysElapsed} elapsed day${stats.daysElapsed !== 1 ? 's' : ''}`
              : `Over ${stats.daysInMonth} days`}
          </div>
        </div>
      </div>

      <div
        style={{
          padding: '10px 14px',
          background: 'var(--surface-2)',
          borderRadius: 8,
          fontSize: 12,
          color: 'var(--text-tertiary)',
          lineHeight: 1.5,
        }}
      >
        {isCurrentMonth
          ? 'Actual spend/day = reviewed living spending so far ÷ elapsed days in current month. Safe remaining/day is shown separately above.'
          : 'Actual avg spend/day = total reviewed living spending ÷ calendar days in that month. Based on reviewed transactions only.'}
      </div>
    </div>
  );
}

function MerchantInsightsCard({
  insights,
  year,
  month,
}: {
  insights: MerchantInsights;
  year: number;
  month: number;
}) {
  if (insights.topMerchants.length === 0 && insights.recurringMerchants.length === 0) {
    return null;
  }

  const monthLabel = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, month - 1, 1)));

  return (
    <div
      style={{
        background: 'var(--surface-1)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 16,
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
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase' as const,
            color: 'var(--text-tertiary)',
          }}
        >
          Merchant insights · {monthLabel}
        </div>
        <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
          Reviewed transactions only
        </span>
      </div>

      {/* Top merchants */}
      {insights.topMerchants.length > 0 && (
        <div>
          {insights.topMerchants.map((m, i) => (
            <div
              key={m.merchantName}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 44px auto',
                alignItems: 'center',
                gap: 16,
                padding: '10px 20px',
                borderTop: i === 0 ? 'none' : '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>
                    {m.merchantName}
                  </span>
                  {insights.recurringMerchants.includes(m.merchantName) && (
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase' as const,
                        padding: '1px 6px',
                        borderRadius: 999,
                        background: 'var(--accent-tint)',
                        color: 'var(--accent-400)',
                      }}
                    >
                      Recurring
                    </span>
                  )}
                </div>
                <div
                  style={{
                    height: 3,
                    borderRadius: 999,
                    background: 'var(--border-subtle)',
                    width: 100,
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      borderRadius: 999,
                      background: 'var(--accent-500)',
                      width: `${m.concentrationPct}%`,
                    }}
                  />
                </div>
              </div>
              <span
                style={{
                  fontSize: 11,
                  color: 'var(--text-tertiary)',
                  fontVariantNumeric: 'tabular-nums',
                  textAlign: 'right' as const,
                }}
              >
                {m.concentrationPct}%
              </span>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {formatEUR(m.amountCents)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Recurring-only merchants not in top 10 */}
      {insights.recurringMerchants.filter(
        (name) => !insights.topMerchants.find((m) => m.merchantName === name),
      ).length > 0 && (
        <div
          style={{
            padding: '10px 20px',
            borderTop: '1px solid var(--border-subtle)',
            fontSize: 12,
            color: 'var(--text-tertiary)',
          }}
        >
          Also recurring:{' '}
          {insights.recurringMerchants
            .filter((name) => !insights.topMerchants.find((m) => m.merchantName === name))
            .join(', ')}
        </div>
      )}
    </div>
  );
}

export default async function DashboardPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const userId = await requireAuthenticatedAppUser();
  const runtimeState = getTransactionsRuntimeState(process.env);
  const today = new Date();

  // Month selector
  const currentYear = today.getUTCFullYear();
  const currentMonth = today.getUTCMonth() + 1;

  const selectedYearRaw = typeof params['year'] === 'string' ? parseInt(params['year'], 10) : NaN;
  const selectedMonthRaw = typeof params['month'] === 'string' ? parseInt(params['month'], 10) : NaN;

  const selectedYear = Number.isFinite(selectedYearRaw) ? selectedYearRaw : currentYear;
  const selectedMonth = Number.isFinite(selectedMonthRaw) ? selectedMonthRaw : currentMonth;
  const isCurrentMonth = selectedYear === currentYear && selectedMonth === currentMonth;

  let databaseErrorMessage = runtimeState.message;
  let viewModel: SafeToSpendViewModel | null = null;
  let availableMonths: Array<{ year: number; month: number; label: string }> = [];
  let monthlyStats: Awaited<ReturnType<typeof loadMonthlyStats>> | null = null;
  let categoryBreakdown: Awaited<ReturnType<typeof loadMonthlyCategoryBreakdown>> = [];
  let merchantInsights: MerchantInsights | null = null;

  if (runtimeState.databaseConfigured) {
    try {
      const [sourceData, loadedAvailableMonths, loadedMonthlyStats, loadedCategoryBreakdown, loadedMerchantInsights] =
        await withDatabaseRuntimeTimeout(Promise.all([
          loadSafeToSpendSourceData(userId),
          loadAvailableMonths(userId, today),
          loadMonthlyStats(userId, selectedYear, selectedMonth, today),
          loadMonthlyCategoryBreakdown(userId, selectedYear, selectedMonth),
          loadMerchantInsights(userId, selectedYear, selectedMonth),
        ]));

      viewModel = buildSafeToSpendViewModel(sourceData);
      availableMonths = loadedAvailableMonths;
      monthlyStats = loadedMonthlyStats;
      categoryBreakdown = loadedCategoryBreakdown;
      merchantInsights = loadedMerchantInsights;
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Month selector */}
          {availableMonths.length > 0 && (
            <MonthSelector
              options={availableMonths}
              selectedYear={selectedYear}
              selectedMonth={selectedMonth}
            />
          )}
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
      </div>

      {!runtimeState.databaseConfigured ? (
        <DatabaseUnavailable message={databaseErrorMessage} />
      ) : !viewModel ? (
        <DatabaseUnavailable message={databaseErrorMessage} />
      ) : viewModel?.status !== 'ready' ? (
        <EmptyState viewModel={viewModel} />
      ) : (
        <div style={{ padding: '24px 32px 48px', display: 'flex', flexDirection: 'column', gap: 16 }}>
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

          {/* Monthly stats slicer — only shown when current month is selected */}
          {monthlyStats && isCurrentMonth && (
            <MonthlyStatsCard stats={monthlyStats} isCurrentMonth={true} />
          )}

          {/* Monthly stats slicer — historical month */}
          {monthlyStats && !isCurrentMonth && (
            <MonthlyStatsCard stats={monthlyStats} isCurrentMonth={false} />
          )}

          {/* Category spending breakdown */}
          {categoryBreakdown.length > 0 && (
            <div
              style={{
                background: 'var(--surface-1)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 16,
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
                <div style={eyebrowStyle()}>Spending by category · {new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(Date.UTC(selectedYear, selectedMonth - 1, 1)))}</div>
                <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                  Reviewed transactions only
                </span>
              </div>
              {categoryBreakdown.map((row, i) => {
                const pct = monthlyStats && monthlyStats.reviewedSpendingCents > 0
                  ? Math.round((row.amountCents / monthlyStats.reviewedSpendingCents) * 100)
                  : 0;
                return (
                  <div
                    key={row.categoryId ?? '__uncategorized__'}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr auto auto',
                      alignItems: 'center',
                      gap: 16,
                      padding: '12px 20px',
                      borderTop: i === 0 ? 'none' : '1px solid var(--border-subtle)',
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <span
                        style={{
                          fontSize: 13,
                          color: row.categoryId ? 'var(--text-primary)' : 'var(--text-tertiary)',
                          fontWeight: 500,
                          fontStyle: row.categoryId ? 'normal' : 'italic',
                        }}
                      >
                        {row.categoryName}
                      </span>
                      <div
                        style={{
                          height: 3,
                          borderRadius: 999,
                          background: 'var(--border-subtle)',
                          width: 120,
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            height: '100%',
                            borderRadius: 999,
                            background: row.categoryId ? 'var(--accent-500)' : 'var(--border-default)',
                            width: `${pct}%`,
                          }}
                        />
                      </div>
                    </div>
                    <span style={{ fontSize: 11, color: 'var(--text-tertiary)', fontVariantNumeric: 'tabular-nums' }}>
                      {row.transactionCount} tx · {pct}%
                    </span>
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {formatEUR(row.amountCents)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Merchant insights */}
          {merchantInsights && merchantInsights.topMerchants.length > 0 && (
            <MerchantInsightsCard
              insights={merchantInsights}
              year={selectedYear}
              month={selectedMonth}
            />
          )}

          {/* Safe-to-spend hero — always shown (only meaningful for current period) */}
          {isCurrentMonth && (
            <>
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

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 12 }}>
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
            </>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 12 }}>
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
