'use client';

import { useState } from 'react';
import { Badge, Button, Card } from '@dart/ui';
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
  amount: string;
  intent: Intent;
  reviewStatus: ReviewStatus;
};

const INITIAL_ROWS: TransactionRow[] = [
  {
    id: 'tx-1',
    date: '2026-04-20',
    description: 'ING to Trading 212 deposit',
    amount: '-800.00',
    intent: 'transfer',
    reviewStatus: 'pending',
  },
  {
    id: 'tx-2',
    date: '2026-04-19',
    description: 'Albert Heijn',
    amount: '-46.20',
    intent: 'living_expense',
    reviewStatus: 'reviewed',
  },
  {
    id: 'tx-3',
    date: '2026-04-18',
    description: 'Rent',
    amount: '-1200.00',
    intent: 'recurring_bill',
    reviewStatus: 'reviewed',
  },
  {
    id: 'tx-4',
    date: '2026-04-17',
    description: 'Dividend received',
    amount: '12.84',
    intent: 'income_refund',
    reviewStatus: 'needs_attention',
  },
];

function badgeVariant(reviewStatus: ReviewStatus) {
  if (reviewStatus === 'reviewed') {
    return 'protected';
  }

  if (reviewStatus === 'needs_attention') {
    return 'warning';
  }

  return 'transfer';
}

export default function TransactionsPage() {
  const [rows, setRows] = useState<TransactionRow[]>(INITIAL_ROWS);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [needsAttentionOnly, setNeedsAttentionOnly] = useState(false);

  const visibleRows = needsAttentionOnly
    ? rows.filter((row) => row.reviewStatus === 'needs_attention')
    : rows;
  const hasUnreviewed = rows.some((row) => row.reviewStatus !== 'reviewed');

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
      trackEvent('transaction_reviewed', {
        changedCount,
        nextStatus,
        source: 'bulk_review',
      });
    }
    setSelectedIds([]);
  }

  return (
    <div style={{ padding: '32px', display: 'grid', gap: '20px' }}>
      <div style={{ display: 'grid', gap: '8px' }}>
        <h1 style={{ fontSize: 'var(--text-3xl)' }}>Transactions review</h1>
        <p style={{ color: 'var(--color-text-muted)' }}>
          Review imported transactions, edit intent, and clear the queue before trusting the
          number.
        </p>
      </div>

      {hasUnreviewed ? (
        <div
          style={{
            border: '1px solid var(--color-warning)',
            background: 'var(--color-surface)',
            color: 'var(--color-warning)',
            borderRadius: '14px',
            padding: '16px 18px',
          }}
        >
          Unreviewed transactions exist. Safe-to-spend will keep a reserve until you clear them.
        </div>
      ) : null}

      <Card style={{ display: 'grid', gap: '16px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: '12px',
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              color: 'var(--color-text-muted)',
            }}
          >
            <input
              type="checkbox"
              checked={needsAttentionOnly}
              onChange={(event) => setNeedsAttentionOnly(event.target.checked)}
            />
            Needs attention only
          </label>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <Button
              type="button"
              variant="secondary"
              onClick={() => applyBulkStatus('reviewed')}
              disabled={selectedIds.length === 0}
            >
              Mark reviewed
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={() => applyBulkStatus('needs_attention')}
              disabled={selectedIds.length === 0}
            >
              Mark needs attention
            </Button>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['', 'Date', 'Description', 'Amount', 'Intent', 'Review status'].map(
                  (heading) => (
                    <th
                      key={heading}
                      style={{
                        textAlign: 'left',
                        padding: '12px 10px',
                        borderBottom: '1px solid var(--color-border)',
                        color: 'var(--color-text-muted)',
                        fontSize: 'var(--text-sm)',
                      }}
                    >
                      {heading}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((row) => (
                <tr key={row.id}>
                  <td style={{ padding: '12px 10px', borderBottom: '1px solid var(--color-border)' }}>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(row.id)}
                      onChange={() => toggleSelected(row.id)}
                    />
                  </td>
                  <td style={{ padding: '12px 10px', borderBottom: '1px solid var(--color-border)' }}>
                    {row.date}
                  </td>
                  <td style={{ padding: '12px 10px', borderBottom: '1px solid var(--color-border)' }}>
                    {row.description}
                  </td>
                  <td style={{ padding: '12px 10px', borderBottom: '1px solid var(--color-border)' }}>
                    {row.amount}
                  </td>
                  <td style={{ padding: '12px 10px', borderBottom: '1px solid var(--color-border)' }}>
                    <select
                      value={row.intent}
                      onChange={(event) => {
                        const nextIntent = event.target.value as Intent;
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
                        background: 'var(--color-surface)',
                        color: 'var(--color-text)',
                        border: '1px solid var(--color-border)',
                        borderRadius: '10px',
                        padding: '8px 10px',
                      }}
                    >
                      <option value="living_expense">living_expense</option>
                      <option value="recurring_bill">recurring_bill</option>
                      <option value="transfer">transfer</option>
                      <option value="investment_contribution">investment_contribution</option>
                      <option value="income_refund">income_refund</option>
                    </select>
                  </td>
                  <td style={{ padding: '12px 10px', borderBottom: '1px solid var(--color-border)' }}>
                    <Badge variant={badgeVariant(row.reviewStatus)}>{row.reviewStatus}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
