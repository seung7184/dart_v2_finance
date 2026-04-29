'use client';

import type { CSSProperties } from 'react';
import Link from 'next/link';
import { useState, useMemo, useCallback } from 'react';
import { formatEUR } from '@dart/core';
import {
  filterTransactionsForView,
  type TransactionVisibilityFilter,
  type TransactionVisibilityMatchStatus,
} from '@/transactions/visibility';

type ReviewStatus = 'pending' | 'reviewed' | 'needs_attention' | 'auto_approved';
type TransactionSource = 'manual' | 'ing_csv' | 't212_csv';

type TransactionIntent =
  | 'living_expense'
  | 'recurring_bill'
  | 'income_salary'
  | 'income_dividend'
  | 'income_refund'
  | 'income_other'
  | 'transfer'
  | 'reimbursement_out'
  | 'reimbursement_in'
  | 'investment_contribution'
  | 'investment_buy'
  | 'investment_sell'
  | 'fee'
  | 'tax'
  | 'adjustment'
  | 'unclassified';

export type TransactionRow = {
  id: string;
  accountName: string;
  amount: number;
  currency: string;
  intent: TransactionIntent;
  categoryId: string | null;
  categoryName: string | null;
  occurredAt: Date;
  rawDescription: string;
  merchantName: string | null;
  matchStatus: TransactionVisibilityMatchStatus;
  reviewStatus: ReviewStatus;
  source: TransactionSource;
};

export type CategoryOption = {
  id: string;
  name: string;
};

// ── Layout ────────────────────────────────────────────────────────────────────

const GRID =
  '32px 88px minmax(100px, 0.7fr) minmax(170px, 1.2fr) 96px 92px 116px 112px 112px 108px 150px';

// ── Intent metadata ───────────────────────────────────────────────────────────

const INTENT_LABELS: Record<TransactionIntent, string> = {
  living_expense: 'Living',
  recurring_bill: 'Bill',
  income_salary: 'Salary',
  income_dividend: 'Dividend',
  income_refund: 'Refund',
  income_other: 'Income',
  transfer: 'Transfer',
  reimbursement_out: 'Reimb. out',
  reimbursement_in: 'Reimb. in',
  investment_contribution: 'Investing',
  investment_buy: 'Buy',
  investment_sell: 'Sell',
  fee: 'Fee',
  tax: 'Tax',
  adjustment: 'Adjust',
  unclassified: 'Unclassified',
};

const INTENT_OPTIONS: Array<{ value: TransactionIntent; label: string }> = [
  { value: 'living_expense', label: 'Living expense' },
  { value: 'recurring_bill', label: 'Recurring bill' },
  { value: 'income_salary', label: 'Salary' },
  { value: 'income_dividend', label: 'Dividend' },
  { value: 'income_refund', label: 'Refund' },
  { value: 'income_other', label: 'Other income' },
  { value: 'transfer', label: 'Transfer' },
  { value: 'reimbursement_out', label: 'Reimb. out' },
  { value: 'reimbursement_in', label: 'Reimb. in' },
  { value: 'investment_contribution', label: 'Invest. contribution' },
  { value: 'investment_buy', label: 'Buy' },
  { value: 'investment_sell', label: 'Sell' },
  { value: 'fee', label: 'Fee' },
  { value: 'tax', label: 'Tax' },
  { value: 'adjustment', label: 'Adjustment' },
  { value: 'unclassified', label: 'Unclassified' },
];

// ── Utility ───────────────────────────────────────────────────────────────────

function normalizeDesc(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, ' ');
}

function formatDate(value: Date): string {
  return new Intl.DateTimeFormat('en-NL', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(value);
}

function badgeStyle(tone: 'neutral' | 'positive' | 'warning' | 'accent'): CSSProperties {
  const tones = {
    neutral: {
      background: 'var(--surface-2)',
      border: 'var(--border-subtle)',
      color: 'var(--text-secondary)',
    },
    positive: {
      background: 'var(--positive-tint)',
      border: 'transparent',
      color: 'var(--positive)',
    },
    warning: {
      background: 'var(--warning-tint)',
      border: 'transparent',
      color: 'var(--warning)',
    },
    accent: {
      background: 'var(--accent-tint)',
      border: 'transparent',
      color: 'var(--accent-400)',
    },
  }[tone];

  return {
    display: 'inline-flex',
    alignItems: 'center',
    width: 'fit-content',
    minHeight: 22,
    padding: '2px 8px',
    borderRadius: 4,
    border: `1px solid ${tones.border}`,
    background: tones.background,
    color: tones.color,
    fontSize: 11,
    fontWeight: 600,
    lineHeight: 1,
    whiteSpace: 'nowrap',
  };
}

function intentTone(intent: TransactionIntent): 'neutral' | 'positive' | 'warning' | 'accent' {
  if (
    intent === 'investment_contribution' ||
    intent === 'investment_buy' ||
    intent === 'investment_sell'
  ) return 'accent';

  if (
    intent === 'income_salary' ||
    intent === 'income_dividend' ||
    intent === 'income_refund' ||
    intent === 'income_other' ||
    intent === 'reimbursement_in'
  ) return 'positive';

  if (intent === 'recurring_bill' || intent === 'fee' || intent === 'tax') return 'warning';

  return 'neutral';
}

function statusTone(reviewStatus: ReviewStatus): 'neutral' | 'positive' | 'warning' | 'accent' {
  if (reviewStatus === 'reviewed' || reviewStatus === 'auto_approved') return 'positive';
  if (reviewStatus === 'needs_attention') return 'warning';
  return 'accent';
}

function statusLabel(reviewStatus: ReviewStatus): string {
  if (reviewStatus === 'pending') return 'Ready to confirm';
  if (reviewStatus === 'needs_attention') return 'Needs review';
  if (reviewStatus === 'auto_approved') return 'Auto approved';
  return reviewStatus.charAt(0).toUpperCase() + reviewStatus.slice(1);
}

function sourceLabel(source: TransactionSource): string {
  if (source === 'ing_csv') return 'ING CSV';
  if (source === 't212_csv') return 'T212 CSV';
  return 'Manual';
}

function sourceTone(source: TransactionSource): 'neutral' | 'positive' | 'warning' | 'accent' {
  if (source === 'manual') return 'accent';
  if (source === 't212_csv') return 'positive';
  return 'neutral';
}

function matchLabel(row: TransactionRow): string {
  if (row.source !== 'manual') return 'Imported';
  if (row.matchStatus === 'confirmed') return 'Matched';
  if (row.matchStatus === 'suggested') return 'Match suggested';
  return 'Manual';
}

function matchTone(row: TransactionRow): 'neutral' | 'positive' | 'warning' | 'accent' {
  if (row.source !== 'manual') return 'neutral';
  if (row.matchStatus === 'confirmed') return 'positive';
  if (row.matchStatus === 'suggested') return 'warning';
  return 'accent';
}

function btnStyle(variant: 'default' | 'primary' | 'danger' = 'default', height = 30): CSSProperties {
  const variants = {
    default: {
      background: 'var(--surface-2)',
      color: 'var(--text-primary)',
      border: '1px solid var(--border-default)',
    },
    primary: {
      background: 'var(--accent-tint)',
      color: 'var(--accent-400)',
      border: '1px solid var(--border-default)',
    },
    danger: {
      background: 'var(--warning-tint)',
      color: 'var(--warning)',
      border: '1px solid transparent',
    },
  }[variant];

  return {
    height,
    padding: '0 10px',
    borderRadius: 6,
    fontFamily: 'var(--font-sans)',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    ...variants,
  };
}

function selectStyle(width?: number): CSSProperties {
  return {
    height: 30,
    padding: '0 6px',
    borderRadius: 6,
    border: '1px solid var(--border-default)',
    background: 'var(--surface-2)',
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-sans)',
    fontSize: 12,
    cursor: 'pointer',
    ...(width ? { width } : { maxWidth: 128 }),
  };
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Amount({ amount, currency }: { amount: number; currency: string }) {
  const positive = amount > 0;
  const displayAmount = currency === 'EUR' ? formatEUR(amount) : `${amount} ${currency}`;
  return (
    <span
      style={{
        color: positive ? 'var(--positive)' : 'var(--text-primary)',
        fontVariantNumeric: 'tabular-nums',
        fontFeatureSettings: '"tnum","ss01"',
        fontWeight: 600,
        fontSize: 13,
        whiteSpace: 'nowrap',
      }}
    >
      {positive ? '+' : ''}
      {displayAmount}
    </span>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function TransactionsClient({
  initialRows,
  categories,
}: {
  initialRows: TransactionRow[];
  categories: CategoryOption[];
}) {
  const [rows, setRows] = useState<TransactionRow[]>(initialRows);
  const [filterDesc, setFilterDesc] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkIntent, setBulkIntent] = useState<string>('');
  const [bulkCategoryId, setBulkCategoryId] = useState<string>('');
  const [applying, setApplying] = useState(false);
  const [visibilityFilter, setVisibilityFilter] = useState<TransactionVisibilityFilter>('all_active');

  // ── Filtering ──────────────────────────────────────────────────────────────

  const visibleRows = useMemo(
    () => filterTransactionsForView(rows, visibilityFilter),
    [rows, visibilityFilter],
  );

  const filteredRows = useMemo(() => {
    if (!filterDesc) return visibleRows;
    const normalized = normalizeDesc(filterDesc);
    return visibleRows.filter((row) => normalizeDesc(row.rawDescription) === normalized);
  }, [visibleRows, filterDesc]);

  // ── Selection ──────────────────────────────────────────────────────────────

  const allVisibleSelected =
    filteredRows.length > 0 && filteredRows.every((r) => selected.has(r.id));
  const selectedVisibleIds = filteredRows
    .filter((r) => selected.has(r.id))
    .map((r) => r.id);
  const selectedVisibleCount = selectedVisibleIds.length;

  const toggleSelectAll = useCallback(() => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allVisibleSelected) {
        filteredRows.forEach((r) => next.delete(r.id));
      } else {
        filteredRows.forEach((r) => next.add(r.id));
      }
      return next;
    });
  }, [allVisibleSelected, filteredRows]);

  const toggleRow = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  // ── API calls ──────────────────────────────────────────────────────────────

  async function callBulkUpdate(
    ids: string[],
    payload: { intent?: string; categoryId?: string | null; reviewStatus?: 'reviewed' },
  ): Promise<boolean> {
    const res = await fetch('/api/transactions/bulk-update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transactionIds: ids, ...payload }),
    });
    return res.ok;
  }

  async function applyBulkUpdate() {
    if (selectedVisibleIds.length === 0) return;
    if (!bulkIntent && !bulkCategoryId) return;

    const payload: { intent?: string; categoryId?: string | null } = {};
    if (bulkIntent) payload.intent = bulkIntent;
    if (bulkCategoryId === '__clear__') payload.categoryId = null;
    else if (bulkCategoryId) payload.categoryId = bulkCategoryId;

    setApplying(true);
    const ok = await callBulkUpdate(selectedVisibleIds, payload);
    setApplying(false);

    if (!ok) return;

    setRows((prev) =>
      prev.map((r) => {
        if (!selectedVisibleIds.includes(r.id)) return r;
        const updated = { ...r };
        if (bulkIntent) updated.intent = bulkIntent as TransactionIntent;
        if (bulkCategoryId === '__clear__') {
          updated.categoryId = null;
          updated.categoryName = null;
        } else if (bulkCategoryId) {
          updated.categoryId = bulkCategoryId;
          updated.categoryName = categories.find((c) => c.id === bulkCategoryId)?.name ?? null;
        }
        return updated;
      }),
    );

    setBulkIntent('');
    setBulkCategoryId('');
  }

  async function confirmSelected() {
    if (selectedVisibleIds.length === 0) return;
    setApplying(true);
    const ok = await callBulkUpdate(selectedVisibleIds, { reviewStatus: 'reviewed' });
    setApplying(false);
    if (!ok) return;
    setRows((prev) =>
      prev.map((r) =>
        selectedVisibleIds.includes(r.id) ? { ...r, reviewStatus: 'reviewed' } : r,
      ),
    );
  }

  async function confirmAllPending() {
    const res = await fetch('/api/transactions/confirm-all', {
      method: 'POST',
      redirect: 'manual',
    });
    // 303 redirect = success (the endpoint always redirects)
    if (res.type === 'opaqueredirect' || res.ok || res.status === 303) {
      setRows((prev) =>
        prev.map((r) =>
          r.reviewStatus === 'pending' || r.reviewStatus === 'needs_attention'
            ? { ...r, reviewStatus: 'reviewed' as ReviewStatus }
            : r,
        ),
      );
    }
  }

  async function updateRowIntent(id: string, intent: string) {
    const ok = await callBulkUpdate([id], { intent });
    if (!ok) return;
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, intent: intent as TransactionIntent } : r)),
    );
  }

  async function confirmRow(id: string) {
    const ok = await callBulkUpdate([id], { reviewStatus: 'reviewed' });
    if (!ok) return;
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, reviewStatus: 'reviewed' as ReviewStatus } : r)),
    );
  }

  // ── Derived counts ─────────────────────────────────────────────────────────

  const unreviewedRows = rows.filter(
    (r) => r.reviewStatus === 'pending' || r.reviewStatus === 'needs_attention',
  );
  const unreviewedTotal = unreviewedRows.reduce((sum, r) => sum + Math.abs(r.amount), 0);
  const hasBulkPayload = Boolean(bulkIntent || bulkCategoryId);
  const filterOptions: Array<{ value: TransactionVisibilityFilter; label: string; count: number }> = [
    { value: 'all_active', label: 'All active', count: filterTransactionsForView(rows, 'all_active').length },
    { value: 'manual_only', label: 'Manual only', count: filterTransactionsForView(rows, 'manual_only').length },
    {
      value: 'unmatched_manual',
      label: 'Unmatched manual',
      count: filterTransactionsForView(rows, 'unmatched_manual').length,
    },
    {
      value: 'match_suggested',
      label: 'Match suggested',
      count: filterTransactionsForView(rows, 'match_suggested').length,
    },
    { value: 'matched', label: 'Matched', count: filterTransactionsForView(rows, 'matched').length },
    { value: 'needs_review', label: 'Needs review', count: filterTransactionsForView(rows, 'needs_review').length },
  ];

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {/* ── Header ── */}
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
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 600, color: 'var(--text-primary)' }}>
            Transactions
          </h1>
          <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>
            Latest imported rows · ING + Trading 212
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Link href="/transactions/matches" style={btnStyle('default', 34)}>
            Review matches
          </Link>
          <Link href="/transactions/new" style={btnStyle('primary', 34)}>
            + Add transaction
          </Link>
          <div style={{ ...badgeStyle(unreviewedRows.length > 0 ? 'warning' : 'positive'), minHeight: 28 }}>
            {rows.length} rows
          </div>
        </div>
      </div>

      <div style={{ padding: '24px 32px 48px', display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* ── Unreviewed banner ── */}
        {unreviewedRows.length > 0 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 16px',
              background: 'var(--warning-tint)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 12,
              color: 'var(--warning)',
              fontSize: 13,
              flexWrap: 'wrap',
            }}
          >
            <span
              style={{
                width: 22,
                height: 22,
                borderRadius: 6,
                background: 'var(--surface-1)',
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
              {unreviewedRows.length} transaction{unreviewedRows.length !== 1 ? 's' : ''} need
              {unreviewedRows.length === 1 ? 's' : ''} review
            </span>
            <span style={{ color: 'var(--text-tertiary)' }}>·</span>
            <span style={{ color: 'var(--text-tertiary)' }}>
              safe-to-spend reserve impact {formatEUR(unreviewedTotal)}
            </span>
            <button
              type="button"
              onClick={confirmAllPending}
              style={{ ...btnStyle('default', 32), marginLeft: 'auto' }}
            >
              Confirm all pending
            </button>
          </div>
        )}

        <div
          style={{
            display: 'flex',
            gap: 8,
            overflowX: 'auto',
            paddingBottom: 2,
          }}
        >
          {filterOptions.map((option) => {
            const active = visibilityFilter === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  setVisibilityFilter(option.value);
                  setSelected(new Set());
                }}
                style={{
                  ...btnStyle(active ? 'primary' : 'default', 32),
                  flexShrink: 0,
                }}
              >
                {option.label} · {option.count}
              </button>
            );
          })}
        </div>

        {/* ── Filter chip ── */}
        {filterDesc && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 14px',
              background: 'var(--accent-tint)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 8,
              fontSize: 12,
              color: 'var(--accent-400)',
              fontWeight: 500,
            }}
          >
            <span>Filtered: </span>
            <span style={{ fontWeight: 700 }}>{filterDesc}</span>
            <span style={{ color: 'var(--text-tertiary)', marginLeft: 4 }}>
              · {filteredRows.length} row{filteredRows.length !== 1 ? 's' : ''}
            </span>
            <button
              type="button"
              onClick={() => {
                setFilterDesc(null);
                setSelected(new Set());
              }}
              style={{
                marginLeft: 'auto',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: 13,
                color: 'var(--text-tertiary)',
                padding: '0 4px',
                fontWeight: 600,
              }}
            >
              ✕ Clear filter
            </button>
          </div>
        )}

        {/* ── Bulk action bar (shown when rows selected) ── */}
        {selectedVisibleCount > 0 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 16px',
              background: 'var(--surface-1)',
              border: '1px solid var(--border-default)',
              borderRadius: 10,
              flexWrap: 'wrap',
            }}
          >
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginRight: 4 }}>
              {selectedVisibleCount} selected
            </span>

            <select
              value={bulkIntent}
              onChange={(e) => setBulkIntent(e.target.value)}
              style={selectStyle(156)}
            >
              <option value="">— Set intent —</option>
              {INTENT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            {categories.length > 0 && (
              <select
                value={bulkCategoryId}
                onChange={(e) => setBulkCategoryId(e.target.value)}
                style={selectStyle(148)}
              >
                <option value="">— Set category —</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
                <option value="__clear__">— Clear category —</option>
              </select>
            )}

            <button
              type="button"
              onClick={applyBulkUpdate}
              disabled={applying || !hasBulkPayload}
              style={{
                ...btnStyle('primary'),
                opacity: applying || !hasBulkPayload ? 0.5 : 1,
              }}
            >
              {applying ? 'Applying…' : 'Apply to selected'}
            </button>

            <button
              type="button"
              onClick={confirmSelected}
              disabled={applying}
              style={{ ...btnStyle('default'), opacity: applying ? 0.5 : 1 }}
            >
              Confirm selected
            </button>

            <button
              type="button"
              onClick={() => setSelected(new Set())}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: 12,
                color: 'var(--text-tertiary)',
                padding: '0 4px',
                marginLeft: 'auto',
              }}
            >
              Clear selection
            </button>
          </div>
        )}

        {/* ── Table ── */}
        <div
          style={{
            background: 'var(--surface-1)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 12,
            overflow: 'hidden',
          }}
        >
          {/* Header row */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: GRID,
              gap: 12,
              padding: '10px 20px',
              borderBottom: '1px solid var(--border-subtle)',
              alignItems: 'center',
            }}
          >
            {/* Select-all checkbox */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <input
                type="checkbox"
                checked={allVisibleSelected}
                onChange={toggleSelectAll}
                style={{ cursor: 'pointer', accentColor: 'var(--accent-500)' }}
                title="Select all visible"
              />
            </div>
            {[
              'Date',
              'Account',
              'Description',
              'Amount',
              'Source',
              'Match',
              'Intent',
              'Category',
              'Status',
              'Actions',
            ].map(
              (heading) => (
                <div
                  key={heading}
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: 'var(--text-tertiary)',
                    textAlign: heading === 'Amount' ? 'right' : 'left',
                  }}
                >
                  {heading}
                </div>
              ),
            )}
          </div>

          {filteredRows.length === 0 ? (
            <div style={{ padding: '28px 20px', color: 'var(--text-tertiary)', fontSize: 13 }}>
              {rows.length === 0
                ? 'No imported transactions found for this user yet.'
                : 'No transactions match the current filter.'}
            </div>
          ) : (
            filteredRows.map((row) => {
              const needsReview =
                row.reviewStatus === 'pending' || row.reviewStatus === 'needs_attention';
              const isSelected = selected.has(row.id);

              return (
                <div
                  key={row.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: GRID,
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px 20px',
                    borderTop: '1px solid var(--border-subtle)',
                    background: isSelected
                      ? 'var(--accent-tint)'
                      : needsReview
                        ? 'var(--warning-tint)'
                        : 'transparent',
                    transition: 'background 0.1s',
                  }}
                >
                  {/* Checkbox */}
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleRow(row.id)}
                      style={{ cursor: 'pointer', accentColor: 'var(--accent-500)' }}
                    />
                  </div>

                  {/* Date */}
                  <div
                    style={{
                      fontSize: 12,
                      color: 'var(--text-tertiary)',
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {formatDate(row.occurredAt)}
                  </div>

                  {/* Account */}
                  <div
                    style={{
                      fontSize: 13,
                      color: 'var(--text-secondary)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {row.accountName}
                  </div>

                  {/* Description — clickable to filter; merchant shown below when present */}
                  <div style={{ minWidth: 0 }}>
                    <button
                      type="button"
                      title={`Filter by: ${row.rawDescription}`}
                      onClick={() => {
                        setFilterDesc(row.rawDescription);
                        setSelected(new Set());
                      }}
                      style={{
                        display: 'block',
                        width: '100%',
                        fontSize: 13,
                        color: 'var(--text-primary)',
                        fontWeight: 500,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        cursor: 'pointer',
                        textAlign: 'left',
                        fontFamily: 'var(--font-sans)',
                      }}
                    >
                      {row.rawDescription}
                    </button>
                    {row.merchantName && (
                      <div
                        style={{
                          fontSize: 11,
                          color: 'var(--text-tertiary)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          marginTop: 2,
                        }}
                      >
                        merchant: {row.merchantName}
                      </div>
                    )}
                  </div>

                  {/* Amount */}
                  <div style={{ textAlign: 'right' }}>
                    <Amount amount={row.amount} currency={row.currency} />
                  </div>

                  {/* Intent badge */}
                  <div>
                    <span style={badgeStyle(sourceTone(row.source))}>
                      {sourceLabel(row.source)}
                    </span>
                  </div>

                  {/* Match badge */}
                  <div>
                    <span style={badgeStyle(matchTone(row))}>
                      {matchLabel(row)}
                    </span>
                  </div>

                  {/* Intent badge */}
                  <div>
                    <span style={badgeStyle(intentTone(row.intent))}>
                      {INTENT_LABELS[row.intent]}
                    </span>
                  </div>

                  {/* Category */}
                  <div
                    style={{
                      fontSize: 12,
                      color: row.categoryName ? 'var(--text-secondary)' : 'var(--text-disabled)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {row.categoryName ?? '—'}
                  </div>

                  {/* Status */}
                  <div>
                    <span style={badgeStyle(statusTone(row.reviewStatus))}>
                      {statusLabel(row.reviewStatus)}
                    </span>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    {/* Per-row intent select */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <select
                        defaultValue={row.intent}
                        onChange={(e) => updateRowIntent(row.id, e.target.value)}
                        style={{ ...selectStyle(), maxWidth: 118 }}
                        title="Change intent and save automatically"
                      >
                        {INTENT_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {needsReview && (
                      <button
                        type="button"
                        onClick={() => confirmRow(row.id)}
                        style={btnStyle('default')}
                      >
                        Confirm
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}

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
              {filterDesc
                ? `Showing ${filteredRows.length} of ${visibleRows.length} visible transactions`
                : `Showing ${visibleRows.length} visible transaction${visibleRows.length !== 1 ? 's' : ''}`}
            </span>
            <span style={{ color: 'var(--text-disabled)', fontSize: 11 }}>
              Click any description to filter · Import more via Import CSV in the sidebar
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
