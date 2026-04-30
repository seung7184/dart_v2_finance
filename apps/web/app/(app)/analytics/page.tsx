import type { CSSProperties } from 'react';
import Link from 'next/link';
import { formatEUR } from '@dart/core';
import { requireAuthenticatedAppUser } from '@/auth/session';
import {
  getDatabaseRuntimeErrorMessage,
  getTransactionsRuntimeState,
  withDatabaseRuntimeTimeout,
} from '@/transactions/runtime';
import {
  loadAvailableMonths,
  loadManualTrackingStats,
  loadMonthlyCategoryBreakdown,
  loadMonthlyCumulativeSpending,
  loadMonthlyStats,
} from '@/safe-to-spend/monthly';
import { loadMerchantInsights, type MerchantInsights } from '@/merchants/insights';
import MonthSelector from '../dashboard/MonthSelector';

export const dynamic = 'force-dynamic';

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

// ── Style helpers ─────────────────────────────────────────────────────────────

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

function chartPath(points: Array<{ x: number; y: number }>): string {
  return points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
    .join(' ');
}

function CumulativeSpendingChartCard({
  points,
  year,
  month,
}: {
  points: Awaited<ReturnType<typeof loadMonthlyCumulativeSpending>>;
  year: number;
  month: number;
}) {
  const width = 720;
  const height = 260;
  const padding = { top: 24, right: 28, bottom: 40, left: 52 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const maxAmountCents = Math.max(...points.map((point) => point.amountCents), 0);
  const hasSpending = maxAmountCents > 0;
  const yMax = hasSpending ? maxAmountCents : 100;
  const totalCents = points.at(-1)?.amountCents ?? 0;
  const midIndex = points.length > 0 ? Math.floor((points.length - 1) / 2) : 0;
  const dateFormatter = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
  const monthLabel = dateFormatter.format(new Date(Date.UTC(year, month - 1, 1)));

  const svgPoints = points.map((point, index) => {
    const x =
      padding.left + (points.length > 1 ? (index / (points.length - 1)) * plotWidth : 0);
    const y = padding.top + plotHeight - (point.amountCents / yMax) * plotHeight;
    return { x, y };
  });
  const linePath = chartPath(svgPoints);
  const firstPoint = svgPoints[0];
  const lastPoint = svgPoints.at(-1);
  const areaPath =
    firstPoint && lastPoint
      ? `${linePath} L ${lastPoint.x.toFixed(2)} ${padding.top + plotHeight} L ${firstPoint.x.toFixed(
          2,
        )} ${padding.top + plotHeight} Z`
      : '';

  const labelPoints = [
    points[0] ?? { day: 1, amountCents: 0 },
    points[midIndex] ?? { day: 1, amountCents: 0 },
    points.at(-1) ?? { day: 1, amountCents: 0 },
  ];

  return (
    <section
      style={{
        background: 'var(--surface-1)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 16,
        padding: '22px 24px 18px',
        display: 'flex',
        flexDirection: 'column',
        gap: 18,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 18,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <div style={eyebrowStyle()}>Cumulative spending</div>
          <h2
            style={{
              margin: '6px 0 0',
              color: 'var(--text-primary)',
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: '-0.02em',
            }}
          >
            Reviewed spending over the selected month
          </h2>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{monthLabel}</div>
          <div
            style={{
              marginTop: 4,
              color: 'var(--text-primary)',
              fontSize: 28,
              fontWeight: 700,
              letterSpacing: '-0.03em',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {formatEUR(totalCents)}
          </div>
        </div>
      </div>

      <div
        style={{
          minHeight: 260,
          borderRadius: 12,
          background: 'var(--surface-2)',
          border: '1px solid var(--border-subtle)',
          overflow: 'hidden',
        }}
      >
        <svg
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label={`Cumulative reviewed spending for ${monthLabel}`}
          style={{ width: '100%', height: '100%', display: 'block', color: 'var(--accent-500)' }}
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="cumulative-spending-fill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0.28" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0.02" />
            </linearGradient>
          </defs>
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = padding.top + ratio * plotHeight;
            return (
              <line
                key={ratio}
                x1={padding.left}
                x2={width - padding.right}
                y1={y}
                y2={y}
                stroke="var(--border-subtle)"
                strokeWidth="1"
              />
            );
          })}
          {hasSpending && areaPath ? (
            <path d={areaPath} fill="url(#cumulative-spending-fill)" />
          ) : (
            <rect
              x={padding.left}
              y={padding.top}
              width={plotWidth}
              height={plotHeight}
              rx="10"
              fill="none"
              stroke="var(--border-default)"
              strokeDasharray="8 8"
            />
          )}
          {linePath ? (
            <path
              d={linePath}
              fill="none"
              stroke={hasSpending ? 'currentColor' : 'var(--border-strong)'}
              strokeWidth={hasSpending ? 4 : 2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : null}
          {lastPoint && hasSpending ? (
            <circle
              cx={lastPoint.x}
              cy={lastPoint.y}
              r="5"
              fill="var(--surface-2)"
              stroke="currentColor"
              strokeWidth="4"
            />
          ) : null}
          <text
            x={padding.left}
            y={height - 14}
            fill="var(--text-tertiary)"
            fontSize="12"
            fontWeight="600"
          >
            Day {labelPoints[0]?.day}
          </text>
          <text
            x={padding.left + plotWidth / 2}
            y={height - 14}
            fill="var(--text-tertiary)"
            fontSize="12"
            fontWeight="600"
            textAnchor="middle"
          >
            Day {labelPoints[1]?.day}
          </text>
          <text
            x={width - padding.right}
            y={height - 14}
            fill="var(--text-tertiary)"
            fontSize="12"
            fontWeight="600"
            textAnchor="end"
          >
            Day {labelPoints[2]?.day}
          </text>
          <text
            x={padding.left}
            y={padding.top + 4}
            fill="var(--text-tertiary)"
            fontSize="12"
            fontWeight="600"
          >
            {formatEUR(yMax)}
          </text>
          {!hasSpending ? (
            <text
              x={width / 2}
              y={height / 2}
              fill="var(--text-tertiary)"
              fontSize="14"
              fontWeight="600"
              textAnchor="middle"
            >
              No reviewed spending yet
            </text>
          ) : null}
        </svg>
      </div>
    </section>
  );
}

// ── Month progress card ───────────────────────────────────────────────────────

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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <div style={eyebrowStyle()}>
          Month progress · {monthLabel}
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

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: 12,
        }}
      >
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
          ? `Elapsed ${stats.daysElapsed} of ${stats.daysInMonth} days. Actual spend/day uses reviewed spending ÷ elapsed days.`
          : `Full historical month: ${stats.daysInMonth} days.`}
      </div>
    </div>
  );
}

// ── Manual tracking card ──────────────────────────────────────────────────────

function ManualTrackingCard({
  stats,
}: {
  stats: Awaited<ReturnType<typeof loadManualTrackingStats>>;
}) {
  return (
    <div
      style={{
        background: 'var(--surface-1)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 16,
        padding: '18px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div style={eyebrowStyle()}>Manual tracking</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {stats.suggestedMatchCount > 0 && (
            <Link href="/transactions/matches" style={{ fontSize: 12, color: 'var(--accent-400)', fontWeight: 600 }}>
              Review matches →
            </Link>
          )}
          <Link href="/transactions/new" style={{ fontSize: 12, color: 'var(--accent-400)', fontWeight: 600 }}>
            Add manual →
          </Link>
        </div>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: 10,
        }}
      >
        {[
          { label: 'Manual this month', value: stats.manualTransactionCount, tone: 'var(--text-primary)' },
          { label: 'Suggested matches', value: stats.suggestedMatchCount, tone: 'var(--warning)' },
          { label: 'Matched manual', value: stats.confirmedMatchedManualCount, tone: 'var(--positive)' },
          { label: 'Unmatched manual', value: stats.unmatchedManualCount, tone: 'var(--accent-400)' },
        ].map((item) => (
          <div key={item.label} style={statCardStyle()}>
            <div style={eyebrowStyle()}>{item.label}</div>
            <div
              style={{
                color: item.tone,
                fontSize: 24,
                fontWeight: 700,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {item.value}
            </div>
          </div>
        ))}
      </div>
      <div style={{ color: 'var(--text-tertiary)', fontSize: 12, lineHeight: 1.5 }}>
        Suggested manual rows stay active until you confirm a match. Confirmed manual duplicates are excluded from spending analytics.
      </div>
    </div>
  );
}

// ── Merchant insights card ────────────────────────────────────────────────────

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
          flexWrap: 'wrap',
          gap: 8,
        }}
      >
        <div style={eyebrowStyle()}>
          Merchant insights · {monthLabel}
        </div>
        <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
          Reviewed transactions only
        </span>
      </div>

      {insights.topMerchants.length > 0 && (
        <div>
          {insights.topMerchants.map((m, i) => (
            <div
              key={m.merchantName}
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 1fr) 56px auto',
                alignItems: 'center',
                gap: 16,
                padding: '14px 20px',
                borderTop: i === 0 ? 'none' : '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
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
                    height: 10,
                    borderRadius: 999,
                    background: 'var(--surface-2)',
                    width: '100%',
                    overflow: 'hidden',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      borderRadius: 999,
                      background: 'var(--accent-500)',
                      width: `${m.concentrationPct}%`,
                      minWidth: m.concentrationPct > 0 ? 4 : 0,
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

// ── Category breakdown section ────────────────────────────────────────────────

function CategoryBreakdownCard({
  breakdown,
  monthlyStats,
  selectedYear,
  selectedMonth,
}: {
  breakdown: Awaited<ReturnType<typeof loadMonthlyCategoryBreakdown>>;
  monthlyStats: Awaited<ReturnType<typeof loadMonthlyStats>>;
  selectedYear: number;
  selectedMonth: number;
}) {
  if (breakdown.length === 0) return null;

  const monthLabel = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(selectedYear, selectedMonth - 1, 1)));

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
          flexWrap: 'wrap',
          gap: 8,
        }}
      >
        <div style={eyebrowStyle()}>Spending by category · {monthLabel}</div>
        <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
          Reviewed transactions only
        </span>
      </div>
      {breakdown.map((row, i) => {
        const pct =
          monthlyStats.reviewedSpendingCents > 0
            ? Math.round((row.amountCents / monthlyStats.reviewedSpendingCents) * 100)
            : 0;
        return (
          <div
            key={row.categoryId ?? '__uncategorized__'}
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1fr) 88px auto',
              alignItems: 'center',
              gap: 16,
              padding: '14px 20px',
              borderTop: i === 0 ? 'none' : '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0 }}>
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
                  height: 10,
                  borderRadius: 999,
                  background: 'var(--surface-2)',
                  width: '100%',
                  overflow: 'hidden',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    borderRadius: 999,
                    background: row.categoryId ? 'var(--accent-500)' : 'var(--border-default)',
                    width: `${pct}%`,
                    minWidth: pct > 0 ? 4 : 0,
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
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function AnalyticsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const userId = await requireAuthenticatedAppUser();
  const runtimeState = getTransactionsRuntimeState(process.env);
  const today = new Date();

  const currentYear = today.getUTCFullYear();
  const currentMonth = today.getUTCMonth() + 1;

  const selectedYearRaw =
    typeof params['year'] === 'string' ? parseInt(params['year'], 10) : NaN;
  const selectedMonthRaw =
    typeof params['month'] === 'string' ? parseInt(params['month'], 10) : NaN;

  const selectedYear = Number.isFinite(selectedYearRaw) ? selectedYearRaw : currentYear;
  const selectedMonth = Number.isFinite(selectedMonthRaw) ? selectedMonthRaw : currentMonth;
  const isCurrentMonth = selectedYear === currentYear && selectedMonth === currentMonth;

  const monthLabel = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(selectedYear, selectedMonth - 1, 1)));

  if (!runtimeState.databaseConfigured) {
    return (
      <AnalyticsUnavailable
        message={
          runtimeState.message ??
          'Configure DATABASE_URL in the approved local environment path, then restart the web server.'
        }
      />
    );
  }

  let availableMonths: Array<{ year: number; month: number; label: string }> = [];
  let monthlyStats: Awaited<ReturnType<typeof loadMonthlyStats>> | null = null;
  let cumulativeSpending: Awaited<ReturnType<typeof loadMonthlyCumulativeSpending>> = [];
  let manualTrackingStats: Awaited<ReturnType<typeof loadManualTrackingStats>> | null = null;
  let categoryBreakdown: Awaited<ReturnType<typeof loadMonthlyCategoryBreakdown>> = [];
  let merchantInsights: MerchantInsights | null = null;
  let databaseErrorMessage: string | null = null;

  try {
    [
      availableMonths,
      monthlyStats,
      cumulativeSpending,
      manualTrackingStats,
      categoryBreakdown,
      merchantInsights,
    ] = await withDatabaseRuntimeTimeout(
      Promise.all([
        loadAvailableMonths(userId, today),
        loadMonthlyStats(userId, selectedYear, selectedMonth, today),
        loadMonthlyCumulativeSpending(userId, selectedYear, selectedMonth),
        loadManualTrackingStats(userId, selectedYear, selectedMonth),
        loadMonthlyCategoryBreakdown(userId, selectedYear, selectedMonth),
        loadMerchantInsights(userId, selectedYear, selectedMonth),
      ]),
    );
  } catch (error) {
    databaseErrorMessage = getDatabaseRuntimeErrorMessage(error);
  }

  if (databaseErrorMessage) {
    return <AnalyticsUnavailable message={databaseErrorMessage} />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
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
          <h1
            style={{
              margin: 0,
              fontSize: 20,
              fontWeight: 600,
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
            }}
          >
            Analytics
          </h1>
          <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>
            {monthLabel} · reviewed transactions only
          </div>
        </div>
        {availableMonths.length > 0 && (
          <MonthSelector
            options={availableMonths}
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
            basePath="/analytics"
          />
        )}
      </div>

      <div style={{ padding: '24px 32px 48px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <CumulativeSpendingChartCard
          points={cumulativeSpending}
          year={selectedYear}
          month={selectedMonth}
        />

        {/* Month progress */}
        {monthlyStats && (
          <MonthlyStatsCard stats={monthlyStats} isCurrentMonth={isCurrentMonth} />
        )}

        {/* Manual tracking */}
        {manualTrackingStats && (
          <ManualTrackingCard stats={manualTrackingStats} />
        )}

        {/* Spending by category */}
        {monthlyStats && categoryBreakdown.length > 0 && (
          <CategoryBreakdownCard
            breakdown={categoryBreakdown}
            monthlyStats={monthlyStats}
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
          />
        )}

        {/* Merchant insights */}
        {merchantInsights && merchantInsights.topMerchants.length > 0 && (
          <MerchantInsightsCard
            insights={merchantInsights}
            year={selectedYear}
            month={selectedMonth}
          />
        )}

        {/* Empty state when no data */}
        {!monthlyStats && !manualTrackingStats && categoryBreakdown.length === 0 && (
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
                color: 'var(--text-tertiary)',
                marginBottom: 10,
              }}
            >
              No data yet
            </div>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Import your bank transactions to see monthly analytics.{' '}
              <Link href="/import" style={{ color: 'var(--accent-400)', fontWeight: 500 }}>
                Import CSV →
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function AnalyticsUnavailable({ message }: { message: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div
        style={{
          padding: '18px 32px',
          borderBottom: '1px solid var(--border-subtle)',
          background: 'var(--surface-0)',
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: 20,
            fontWeight: 600,
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
          }}
        >
          Analytics
        </h1>
        <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>
          Monthly spending breakdown
        </div>
      </div>
      <div style={{ padding: '24px 32px 48px' }}>
        <div
          style={{
            background: 'var(--surface-1)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 12,
            padding: 24,
            maxWidth: 640,
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '2px 8px',
              borderRadius: 4,
              background: 'var(--warning-tint)',
              color: 'var(--warning)',
              fontSize: 11,
              fontWeight: 600,
              marginBottom: 14,
            }}
          >
            Database not connected
          </div>
          <h2
            style={{
              margin: '0 0 8px',
              fontSize: 18,
              fontWeight: 600,
              color: 'var(--text-primary)',
            }}
          >
            Analytics needs a live database.
          </h2>
          <p
            style={{
              margin: 0,
              color: 'var(--text-secondary)',
              fontSize: 13,
              lineHeight: 1.6,
            }}
          >
            {message}
          </p>
        </div>
      </div>
    </div>
  );
}
