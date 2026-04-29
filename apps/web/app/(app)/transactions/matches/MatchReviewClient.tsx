'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatEUR } from '@dart/core';

export type MatchReviewRow = {
  confidence: number;
  importedAccountName: string;
  importedAmount: number;
  importedDescription: string;
  importedOccurredAt: Date;
  manualAccountName: string;
  manualAmount: number;
  manualDescription: string;
  manualOccurredAt: Date;
  matchId: string;
  reason: string;
};

function formatDate(value: Date): string {
  return new Intl.DateTimeFormat('en-NL', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(value);
}

function buttonStyle(tone: 'primary' | 'default' | 'warning' = 'default'): React.CSSProperties {
  const tones = {
    default: {
      background: 'var(--surface-2)',
      border: '1px solid var(--border-default)',
      color: 'var(--text-primary)',
    },
    primary: {
      background: 'var(--accent-500)',
      border: '1px solid transparent',
      color: 'var(--text-on-accent)',
    },
    warning: {
      background: 'var(--warning-tint)',
      border: '1px solid transparent',
      color: 'var(--warning)',
    },
  }[tone];

  return {
    alignItems: 'center',
    borderRadius: 8,
    cursor: 'pointer',
    display: 'inline-flex',
    fontFamily: 'var(--font-sans)',
    fontSize: 13,
    fontWeight: 600,
    height: 38,
    justifyContent: 'center',
    padding: '0 12px',
    textDecoration: 'none',
    ...tones,
  };
}

function TransactionSide({
  accountName,
  amount,
  date,
  description,
  label,
}: {
  accountName: string;
  amount: number;
  date: Date;
  description: string;
  label: string;
}) {
  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <div
        style={{
          color: 'var(--text-tertiary)',
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </div>
      <div style={{ color: 'var(--text-primary)', fontSize: 14, fontWeight: 600 }}>
        {description}
      </div>
      <div style={{ color: 'var(--text-tertiary)', fontSize: 12 }}>
        {formatDate(date)} · {accountName}
      </div>
      <div
        style={{
          color: amount > 0 ? 'var(--positive)' : 'var(--text-primary)',
          fontSize: 16,
          fontVariantNumeric: 'tabular-nums',
          fontWeight: 700,
        }}
      >
        {amount > 0 ? '+' : ''}
        {formatEUR(amount)}
      </div>
    </div>
  );
}

export default function MatchReviewClient({ initialRows }: { initialRows: MatchReviewRow[] }) {
  const router = useRouter();
  const [rows, setRows] = useState(initialRows);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function updateMatch(matchId: string, action: 'confirm' | 'reject') {
    setBusyId(matchId);
    const response = await fetch(`/api/transactions/matches/${action}`, {
      body: JSON.stringify({ matchId }),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    });
    setBusyId(null);

    if (!response.ok) {
      return;
    }

    setRows((current) => current.filter((row) => row.matchId !== matchId));
    router.refresh();
  }

  if (rows.length === 0) {
    return (
      <div
        style={{
          background: 'var(--surface-1)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 12,
          maxWidth: 620,
          padding: 24,
        }}
      >
        <div
          style={{
            color: 'var(--positive)',
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          Clear
        </div>
        <h2 style={{ color: 'var(--text-primary)', fontSize: 20, margin: '8px 0' }}>
          No suggested matches to review
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.6, margin: 0 }}>
          Manual rows and imported CSV rows will appear here when Dart finds a likely duplicate.
        </p>
        <Link href="/transactions" style={{ ...buttonStyle('primary'), marginTop: 18 }}>
          Back to transactions
        </Link>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gap: 12, maxWidth: 980 }}>
      {rows.map((row) => (
        <div
          key={row.matchId}
          style={{
            background: 'var(--surface-1)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 12,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              alignItems: 'center',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              gap: 12,
              justifyContent: 'space-between',
              padding: '12px 16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span
                style={{
                  background: 'var(--accent-tint)',
                  borderRadius: 999,
                  color: 'var(--accent-400)',
                  fontSize: 12,
                  fontWeight: 700,
                  padding: '4px 9px',
                }}
              >
                {row.confidence}% confidence
              </span>
              <span style={{ color: 'var(--text-tertiary)', fontSize: 12 }}>{row.reason}</span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                disabled={busyId === row.matchId}
                onClick={() => void updateMatch(row.matchId, 'reject')}
                style={{ ...buttonStyle('warning'), opacity: busyId === row.matchId ? 0.65 : 1 }}
              >
                Reject
              </button>
              <button
                type="button"
                disabled={busyId === row.matchId}
                onClick={() => void updateMatch(row.matchId, 'confirm')}
                style={{ ...buttonStyle('primary'), opacity: busyId === row.matchId ? 0.65 : 1 }}
              >
                Confirm
              </button>
            </div>
          </div>
          <div
            style={{
              display: 'grid',
              gap: 16,
              gridTemplateColumns: '1fr 1fr',
              padding: 16,
            }}
          >
            <TransactionSide
              accountName={row.manualAccountName}
              amount={row.manualAmount}
              date={row.manualOccurredAt}
              description={row.manualDescription}
              label="Manual transaction"
            />
            <TransactionSide
              accountName={row.importedAccountName}
              amount={row.importedAmount}
              date={row.importedOccurredAt}
              description={row.importedDescription}
              label="Imported transaction"
            />
          </div>
        </div>
      ))}
    </div>
  );
}
