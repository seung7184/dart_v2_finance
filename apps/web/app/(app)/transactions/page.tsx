import type { CSSProperties } from 'react';
import { desc, eq } from 'drizzle-orm';
import { formatEUR } from '@dart/core';
import { accounts, db, transactions } from '@dart/db';
import { requireAuthenticatedAppUser } from '@/auth/session';
import { getTransactionsRuntimeState } from '@/transactions/runtime';

export const dynamic = 'force-dynamic';

type ReviewStatus = 'pending' | 'reviewed' | 'needs_attention' | 'auto_approved';

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

type TransactionRow = {
  id: string;
  accountName: string;
  amount: number;
  currency: string;
  intent: TransactionIntent;
  occurredAt: Date;
  rawDescription: string;
  reviewStatus: ReviewStatus;
  source: string;
};

const GRID = '104px minmax(132px, 0.8fr) minmax(220px, 1.3fr) 124px 136px 124px 140px';

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

// Ordered intent options for the edit select
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
  { value: 'investment_contribution', label: 'Investment contribution' },
  { value: 'investment_buy', label: 'Buy' },
  { value: 'investment_sell', label: 'Sell' },
  { value: 'fee', label: 'Fee' },
  { value: 'tax', label: 'Tax' },
  { value: 'adjustment', label: 'Adjustment' },
  { value: 'unclassified', label: 'Unclassified' },
];

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
  ) {
    return 'accent';
  }

  if (
    intent === 'income_salary' ||
    intent === 'income_dividend' ||
    intent === 'income_refund' ||
    intent === 'income_other' ||
    intent === 'reimbursement_in'
  ) {
    return 'positive';
  }

  if (intent === 'recurring_bill' || intent === 'fee' || intent === 'tax') {
    return 'warning';
  }

  return 'neutral';
}

function statusTone(reviewStatus: ReviewStatus): 'neutral' | 'positive' | 'warning' | 'accent' {
  if (reviewStatus === 'reviewed' || reviewStatus === 'auto_approved') {
    return 'positive';
  }

  if (reviewStatus === 'needs_attention') {
    return 'warning';
  }

  return 'accent';
}

function statusLabel(reviewStatus: ReviewStatus): string {
  if (reviewStatus === 'pending') {
    return 'Ready to confirm';
  }

  if (reviewStatus === 'needs_attention') {
    return 'Needs review';
  }

  if (reviewStatus === 'auto_approved') {
    return 'Auto approved';
  }

  return reviewStatus.charAt(0).toUpperCase() + reviewStatus.slice(1);
}

function ConfirmReviewButton({ transactionId }: { transactionId: string }) {
  return (
    <form action="/api/transactions/confirm" method="post">
      <input type="hidden" name="transactionId" value={transactionId} />
      <button
        type="submit"
        style={{
          height: 30,
          padding: '0 10px',
          borderRadius: 6,
          border: '1px solid var(--border-default)',
          background: 'var(--surface-2)',
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-sans)',
          fontSize: 12,
          fontWeight: 600,
          cursor: 'pointer',
          whiteSpace: 'nowrap',
        }}
      >
        Confirm
      </button>
    </form>
  );
}

function EditIntentForm({
  transactionId,
  currentIntent,
}: {
  transactionId: string;
  currentIntent: TransactionIntent;
}) {
  return (
    <form
      action="/api/transactions/update-intent"
      method="post"
      style={{ display: 'flex', alignItems: 'center', gap: 6 }}
    >
      <input type="hidden" name="transactionId" value={transactionId} />
      <select
        name="intent"
        defaultValue={currentIntent}
        style={{
          height: 30,
          padding: '0 6px',
          borderRadius: 6,
          border: '1px solid var(--border-default)',
          background: 'var(--surface-2)',
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-sans)',
          fontSize: 12,
          cursor: 'pointer',
          maxWidth: 128,
        }}
      >
        {INTENT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <button
        type="submit"
        style={{
          height: 30,
          padding: '0 8px',
          borderRadius: 6,
          border: '1px solid var(--border-default)',
          background: 'var(--accent-tint)',
          color: 'var(--accent-400)',
          fontFamily: 'var(--font-sans)',
          fontSize: 12,
          fontWeight: 600,
          cursor: 'pointer',
          whiteSpace: 'nowrap',
        }}
      >
        Save
      </button>
    </form>
  );
}

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

async function getTransactionsForUser(userId: string): Promise<TransactionRow[]> {
  return db
    .select({
      id: transactions.id,
      accountName: accounts.name,
      amount: transactions.amount,
      currency: transactions.currency,
      intent: transactions.intent,
      occurredAt: transactions.occurredAt,
      rawDescription: transactions.rawDescription,
      reviewStatus: transactions.reviewStatus,
      source: transactions.source,
    })
    .from(transactions)
    .innerJoin(accounts, eq(transactions.accountId, accounts.id))
    .where(eq(transactions.userId, userId))
    .orderBy(desc(transactions.occurredAt))
    .limit(100);
}

export default async function TransactionsPage() {
  const userId = await requireAuthenticatedAppUser();
  const runtimeState = getTransactionsRuntimeState(process.env);

  if (!runtimeState.databaseConfigured) {
    return <TransactionsUnavailable message={runtimeState.message} />;
  }

  const rows = await getTransactionsForUser(userId);
  const unreviewedRows = rows.filter(
    (row) => row.reviewStatus === 'pending' || row.reviewStatus === 'needs_attention',
  );
  const unreviewedTotal = unreviewedRows.reduce((sum, row) => sum + Math.abs(row.amount), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
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
            }}
          >
            Transactions
          </h1>
          <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>
            Latest imported rows · ING + Trading 212
          </div>
        </div>
        <div style={{ ...badgeStyle(unreviewedRows.length > 0 ? 'warning' : 'positive'), minHeight: 28 }}>
          {rows.length} rows
        </div>
      </div>

      <div style={{ padding: '24px 32px 48px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {unreviewedRows.length > 0 ? (
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
            <form action="/api/transactions/confirm-all" method="post" style={{ marginLeft: 'auto' }}>
              <button
                type="submit"
                style={{
                  height: 32,
                  padding: '0 14px',
                  borderRadius: 8,
                  border: '1px solid var(--border-default)',
                  background: 'var(--surface-1)',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-sans)',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                Confirm all pending
              </button>
            </form>
          </div>
        ) : null}

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
              display: 'grid',
              gridTemplateColumns: GRID,
              gap: 16,
              padding: '10px 20px',
              borderBottom: '1px solid var(--border-subtle)',
            }}
          >
            {['Date', 'Account', 'Description', 'Amount', 'Intent', 'Status', 'Actions'].map((heading) => (
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
            ))}
          </div>

          {rows.length === 0 ? (
            <div
              style={{
                padding: '28px 20px',
                color: 'var(--text-tertiary)',
                fontSize: 13,
              }}
            >
              No imported transactions found for this user yet.
            </div>
          ) : (
            rows.map((row) => {
              const needsReview =
                row.reviewStatus === 'pending' || row.reviewStatus === 'needs_attention';

              return (
                <div
                  key={row.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: GRID,
                    alignItems: 'center',
                    gap: 16,
                    padding: '12px 20px',
                    borderTop: '1px solid var(--border-subtle)',
                    background: needsReview ? 'var(--warning-tint)' : 'transparent',
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      color: 'var(--text-tertiary)',
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {formatDate(row.occurredAt)}
                  </div>
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
                  <div
                    style={{
                      minWidth: 0,
                      fontSize: 13,
                      color: 'var(--text-primary)',
                      fontWeight: 500,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {row.rawDescription}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <Amount amount={row.amount} currency={row.currency} />
                  </div>
                  <div>
                    <span style={badgeStyle(intentTone(row.intent))}>{INTENT_LABELS[row.intent]}</span>
                  </div>
                  <div>
                    <span style={badgeStyle(statusTone(row.reviewStatus))}>
                      {statusLabel(row.reviewStatus)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <EditIntentForm transactionId={row.id} currentIntent={row.intent} />
                    {needsReview ? (
                      <ConfirmReviewButton transactionId={row.id} />
                    ) : null}
                  </div>
                </div>
              );
            })
          )}

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
              Showing {rows.length} transaction{rows.length !== 1 ? 's' : ''}
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

function TransactionsUnavailable({ message }: { message: string | null }) {
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
          }}
        >
          Transactions
        </h1>
        <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>
          Latest imported rows · ING + Trading 212
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
          <div style={{ ...badgeStyle('warning'), marginBottom: 14 }}>Database not connected</div>
          <h2
            style={{
              margin: '0 0 8px',
              fontSize: 18,
              fontWeight: 600,
              color: 'var(--text-primary)',
            }}
          >
            Imported transactions need a live database.
          </h2>
          <p
            style={{
              margin: 0,
              color: 'var(--text-secondary)',
              fontSize: 13,
              lineHeight: 1.6,
            }}
          >
            {message ??
              'Configure DATABASE_URL in the approved local environment path, then restart the web server.'}
          </p>
        </div>
      </div>
    </div>
  );
}
