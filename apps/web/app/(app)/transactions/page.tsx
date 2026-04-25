'use client';

import { useState } from 'react';
import { trackEvent } from '@/observability/client';

type ReviewStatus = 'pending' | 'reviewed' | 'needs_attention';
type Intent =
  | 'living_expense'
  | 'recurring_bill'
  | 'transfer'
  | 'investment_contribution'
  | 'income_refund';

type TransactionRow = {
  id: string;
  date: string;
  description: string;
  amountCents: number;
  intent: Intent;
  reviewStatus: ReviewStatus;
};

const INITIAL_ROWS: TransactionRow[] = [
  {
    id: 'tx-1',
    date: 'Apr 20',
    description: 'ING to Trading 212 deposit',
    amountCents: -80000,
    intent: 'transfer',
    reviewStatus: 'pending',
  },
  {
    id: 'tx-2',
    date: 'Apr 19',
    description: 'Albert Heijn',
    amountCents: -4620,
    intent: 'living_expense',
    reviewStatus: 'reviewed',
  },
  {
    id: 'tx-3',
    date: 'Apr 18',
    description: 'Rent',
    amountCents: -120000,
    intent: 'recurring_bill',
    reviewStatus: 'reviewed',
  },
  {
    id: 'tx-4',
    date: 'Apr 17',
    description: 'Dividend received',
    amountCents: 1284,
    intent: 'income_refund',
    reviewStatus: 'needs_attention',
  },
];

const INTENT_CONFIG: Record<Intent, { label: string; bg: string; fg: string; bd: string }> = {
  living_expense: {
    label: 'Living',
    bg: 'var(--surface-2)',
    fg: 'var(--text-secondary)',
    bd: 'var(--border-subtle)',
  },
  investment_contribution: {
    label: 'Investing',
    bg: 'var(--accent-tint)',
    fg: 'var(--accent-400)',
    bd: 'transparent',
  },
  recurring_bill: {
    label: 'Bill',
    bg: 'var(--warning-tint)',
    fg: 'var(--warning)',
    bd: 'transparent',
  },
  transfer: {
    label: 'Transfer',
    bg: 'transparent',
    fg: 'var(--text-tertiary)',
    bd: 'var(--border-subtle)',
  },
  income_refund: {
    label: 'Reimb. In',
    bg: 'var(--positive-tint)',
    fg: 'var(--positive)',
    bd: 'transparent',
  },
};

function formatEURCents(cents: number): string {
  const abs = Math.abs(cents) / 100;
  return new Intl.NumberFormat('nl-NL', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(abs);
}

function IntentBadge({ intent }: { intent: Intent }) {
  const cfg = INTENT_CONFIG[intent];
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '2px 8px',
        borderRadius: 4,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '0.01em',
        background: cfg.bg,
        color: cfg.fg,
        border: `1px solid ${cfg.bd}`,
        whiteSpace: 'nowrap',
      }}
    >
      {cfg.label}
    </span>
  );
}

function StatusPill({ status }: { status: ReviewStatus }) {
  if (status === 'pending' || status === 'needs_attention') {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 5,
          fontSize: 12,
          fontWeight: 500,
          color: 'var(--warning)',
          whiteSpace: 'nowrap',
        }}
      >
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: 'var(--warning)',
            flexShrink: 0,
          }}
        />
        {status === 'needs_attention' ? 'Needs review' : 'Pending'}
      </span>
    );
  }
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        fontSize: 12,
        color: 'var(--text-tertiary)',
        whiteSpace: 'nowrap',
      }}
    >
      <svg
        viewBox="0 0 24 24"
        width="12"
        height="12"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 12l5 5L20 6" />
      </svg>
      Reviewed
    </span>
  );
}

function Amount({ cents }: { cents: number }) {
  const positive = cents > 0;
  return (
    <span
      style={{
        color: positive ? 'var(--positive)' : 'var(--text-primary)',
        fontVariantNumeric: 'tabular-nums',
        fontFeatureSettings: '"tnum","ss01"',
        fontWeight: 600,
        fontSize: 13,
        letterSpacing: '-0.005em',
        display: 'inline-flex',
        alignItems: 'baseline',
        gap: 3,
        whiteSpace: 'nowrap',
      }}
    >
      <span style={{ color: positive ? 'var(--positive)' : 'var(--text-tertiary)', fontWeight: 500 }}>
        {positive ? '+' : '−'}
      </span>
      <span style={{ color: positive ? 'var(--positive)' : 'var(--text-tertiary)', fontWeight: 500 }}>
        €
      </span>
      <span>{formatEURCents(cents)}</span>
    </span>
  );
}

const GRID = '80px 1fr 130px 130px 110px 44px';

export default function TransactionsPage() {
  const [rows, setRows] = useState<TransactionRow[]>(INITIAL_ROWS);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [needsAttentionOnly, setNeedsAttentionOnly] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const visibleRows = needsAttentionOnly
    ? rows.filter((row) => row.reviewStatus !== 'reviewed')
    : rows;
  const unreviewedCount = rows.filter((r) => r.reviewStatus !== 'reviewed').length;
  const unreviewedTotal = rows
    .filter((r) => r.reviewStatus !== 'reviewed')
    .reduce((sum, r) => sum + Math.abs(r.amountCents), 0);

  function toggleSelected(id: string) {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }

  function applyBulkStatus(nextStatus: ReviewStatus) {
    const changedCount = rows.filter((row) => selectedIds.includes(row.id)).length;
    setRows((current) =>
      current.map((row) =>
        selectedIds.includes(row.id) ? { ...row, reviewStatus: nextStatus } : row,
      ),
    );
    if (changedCount > 0) {
      trackEvent('transaction_reviewed', { changedCount, nextStatus, source: 'bulk_review' });
    }
    setSelectedIds([]);
  }

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
            Transactions
          </h1>
          <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>
            Review queue · ING + Trading 212
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 12,
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              userSelect: 'none',
            }}
          >
            <input
              type="checkbox"
              checked={needsAttentionOnly}
              onChange={(e) => setNeedsAttentionOnly(e.target.checked)}
              style={{ accentColor: 'var(--accent-500)' }}
            />
            Needs review only
          </label>
          {selectedIds.length > 0 && (
            <>
              <button
                type="button"
                onClick={() => applyBulkStatus('reviewed')}
                style={{
                  height: 32,
                  padding: '0 12px',
                  background: 'var(--surface-2)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 8,
                  fontFamily: 'var(--font-sans)',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  letterSpacing: '-0.005em',
                }}
              >
                Mark reviewed ({selectedIds.length})
              </button>
              <button
                type="button"
                onClick={() => applyBulkStatus('needs_attention')}
                style={{
                  height: 32,
                  padding: '0 12px',
                  background: 'transparent',
                  color: 'var(--warning)',
                  border: '1px solid rgba(230,194,122,0.32)',
                  borderRadius: 8,
                  fontFamily: 'var(--font-sans)',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  letterSpacing: '-0.005em',
                }}
              >
                Needs attention
              </button>
            </>
          )}
        </div>
      </div>

      <div style={{ padding: '24px 32px 48px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Review banner */}
        {unreviewedCount > 0 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 16px',
              background: 'var(--warning-tint)',
              border: '1px solid rgba(230,194,122,0.24)',
              borderRadius: 12,
              color: 'var(--warning)',
              fontSize: 13,
            }}
          >
            <span
              style={{
                width: 22,
                height: 22,
                borderRadius: 6,
                background: 'rgba(230,194,122,0.18)',
                display: 'grid',
                placeItems: 'center',
                fontWeight: 700,
                fontSize: 13,
                flexShrink: 0,
              }}
            >
              !
            </span>
            <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
              {unreviewedCount} transaction{unreviewedCount !== 1 ? 's' : ''} need{unreviewedCount === 1 ? 's' : ''} review
            </span>
            <span style={{ color: 'var(--text-tertiary)' }}>·</span>
            <span style={{ color: 'var(--text-tertiary)' }}>
              affects safe-to-spend by €{formatEURCents(unreviewedTotal)}
            </span>
          </div>
        )}

        {/* Table */}
        <div
          style={{
            background: 'var(--surface-1)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 12,
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: GRID,
              gap: 16,
              padding: '10px 20px',
              borderBottom: '1px solid var(--border-subtle)',
            }}
          >
            {[
              { label: 'Date', align: 'left' },
              { label: 'Description', align: 'left' },
              { label: 'Amount', align: 'right' },
              { label: 'Intent', align: 'left' },
              { label: 'Status', align: 'right' },
              { label: '', align: 'left' },
            ].map((h, i) => (
              <div
                key={i}
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'var(--text-tertiary)',
                  textAlign: h.align as 'left' | 'right',
                }}
              >
                {h.label}
              </div>
            ))}
          </div>

          {/* Rows */}
          {visibleRows.map((row) => {
            const needsReview = row.reviewStatus !== 'reviewed';
            const isHovered = hoveredId === row.id;
            const isSelected = selectedIds.includes(row.id);
            return (
              <div
                key={row.id}
                onMouseEnter={() => setHoveredId(row.id)}
                onMouseLeave={() => setHoveredId(null)}
                style={{
                  display: 'grid',
                  gridTemplateColumns: GRID,
                  alignItems: 'center',
                  gap: 16,
                  padding: '12px 20px',
                  borderTop: '1px solid var(--border-subtle)',
                  background: isSelected
                    ? 'var(--accent-tint)'
                    : needsReview
                    ? 'rgba(230,194,122,0.04)'
                    : isHovered
                    ? 'var(--surface-2)'
                    : 'transparent',
                  cursor: 'pointer',
                  transition: 'background 80ms var(--ease-standard)',
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    color: 'var(--text-tertiary)',
                    fontVariantNumeric: 'tabular-nums',
                    letterSpacing: '-0.005em',
                  }}
                >
                  {row.date}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 13,
                      color: 'var(--text-primary)',
                      fontWeight: 500,
                      letterSpacing: '-0.005em',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {row.description}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <Amount cents={row.amountCents} />
                </div>
                <div>
                  <select
                    value={row.intent}
                    onChange={(e) => {
                      const nextIntent = e.target.value as Intent;
                      setRows((current) =>
                        current.map((item) =>
                          item.id === row.id ? { ...item, intent: nextIntent } : item,
                        ),
                      );
                      trackEvent('transaction_reviewed', {
                        changedCount: 1,
                        nextIntent,
                        reviewStatus: row.reviewStatus,
                        source: 'intent_select',
                      });
                    }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      outline: 'none',
                      color: 'inherit',
                      fontFamily: 'var(--font-sans)',
                      fontSize: 11,
                      cursor: 'pointer',
                    }}
                  >
                    {(Object.keys(INTENT_CONFIG) as Intent[]).map((key) => (
                      <option key={key} value={key}>
                        {INTENT_CONFIG[key].label}
                      </option>
                    ))}
                  </select>
                  <IntentBadge intent={row.intent} />
                </div>
                <div style={{ textAlign: 'right' }}>
                  <StatusPill status={row.reviewStatus} />
                </div>
                <div>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelected(row.id)}
                    style={{ accentColor: 'var(--accent-500)', cursor: 'pointer' }}
                  />
                </div>
              </div>
            );
          })}

          {/* Footer */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 20px',
              borderTop: '1px solid var(--border-subtle)',
              fontSize: 12,
              color: 'var(--text-tertiary)',
            }}
          >
            <span>
              {visibleRows.length} transaction{visibleRows.length !== 1 ? 's' : ''}
              {needsAttentionOnly ? ' · filtered' : ''}
            </span>
            <span style={{ color: 'var(--text-disabled)', fontSize: 11 }}>
              Import more via Import CSV in the sidebar
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
