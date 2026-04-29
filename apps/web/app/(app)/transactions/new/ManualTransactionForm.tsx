'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { CSSProperties } from 'react';

type Direction = 'expense' | 'income';
type Intent =
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

export type ManualAccountOption = {
  id: string;
  label: string;
  type: string;
};

export type ManualCategoryOption = {
  id: string;
  name: string;
};

const INTENT_OPTIONS: Array<{ value: Intent; label: string }> = [
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

function todayValue(): string {
  return new Date().toISOString().slice(0, 10);
}

function fieldStyle(): CSSProperties {
  return {
    display: 'flex',
    flexDirection: 'column',
    gap: 7,
  };
}

function labelStyle(): CSSProperties {
  return {
    color: 'var(--text-tertiary)',
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  };
}

function inputStyle(): CSSProperties {
  return {
    background: 'var(--surface-2)',
    border: '1px solid var(--border-default)',
    borderRadius: 8,
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-sans)',
    fontSize: 14,
    height: 42,
    padding: '0 12px',
  };
}

function buttonStyle(primary = false): CSSProperties {
  return {
    alignItems: 'center',
    background: primary ? 'var(--accent-500)' : 'var(--surface-2)',
    border: primary ? '1px solid transparent' : '1px solid var(--border-default)',
    borderRadius: 8,
    color: primary ? 'var(--text-on-accent)' : 'var(--text-primary)',
    cursor: 'pointer',
    display: 'inline-flex',
    fontFamily: 'var(--font-sans)',
    fontSize: 13,
    fontWeight: 600,
    height: 40,
    justifyContent: 'center',
    padding: '0 14px',
    textDecoration: 'none',
  };
}

export default function ManualTransactionForm({
  accounts,
  categories,
}: {
  accounts: ManualAccountOption[];
  categories: ManualCategoryOption[];
}) {
  const router = useRouter();
  const [direction, setDirection] = useState<Direction>('expense');
  const [intent, setIntent] = useState<Intent>('living_expense');
  const [occurredAt, setOccurredAt] = useState(todayValue);
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? '');
  const [amount, setAmount] = useState('');
  const [rawDescription, setRawDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState(false);

  const selectedAccount = useMemo(
    () => accounts.find((account) => account.id === accountId),
    [accountId, accounts],
  );

  function changeDirection(nextDirection: Direction) {
    setDirection(nextDirection);
    setIntent(nextDirection === 'expense' ? 'living_expense' : 'income_other');
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    const response = await fetch('/api/transactions/manual', {
      body: JSON.stringify({
        accountId,
        amount,
        categoryId: categoryId.length > 0 ? categoryId : null,
        direction,
        intent,
        notes,
        occurredAt,
        rawDescription,
      }),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    });

    setSubmitting(false);

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(payload?.error ?? 'Could not create manual transaction.');
      return;
    }

    setCreated(true);
    router.refresh();
  }

  if (created) {
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
        <div style={{ ...labelStyle(), color: 'var(--positive)' }}>Saved</div>
        <h2 style={{ color: 'var(--text-primary)', fontSize: 20, margin: '8px 0' }}>
          Transaction added
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.6, margin: 0 }}>
          The manual row is reviewed by default and is ready in your transaction list.
        </p>
        <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
          <Link href="/transactions" style={buttonStyle(true)}>
            Back to transactions
          </Link>
          <button
            type="button"
            onClick={() => {
              setAmount('');
              setRawDescription('');
              setNotes('');
              setCategoryId('');
              setCreated(false);
            }}
            style={buttonStyle()}
          >
            Add another
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      style={{
        background: 'var(--surface-1)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 12,
        display: 'grid',
        gap: 18,
        maxWidth: 720,
        padding: 20,
      }}
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <label style={fieldStyle()}>
          <span style={labelStyle()}>Date</span>
          <input
            required
            type="date"
            value={occurredAt}
            onChange={(event) => setOccurredAt(event.target.value)}
            style={inputStyle()}
          />
        </label>
        <label style={fieldStyle()}>
          <span style={labelStyle()}>Account</span>
          <select
            required
            value={accountId}
            onChange={(event) => setAccountId(event.target.value)}
            style={inputStyle()}
          >
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <label style={fieldStyle()}>
          <span style={labelStyle()}>Amount in EUR</span>
          <input
            required
            inputMode="decimal"
            placeholder="24.50"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            style={inputStyle()}
          />
        </label>
        <div style={fieldStyle()}>
          <span style={labelStyle()}>Direction</span>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {(['expense', 'income'] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => changeDirection(option)}
                style={{
                  ...buttonStyle(direction === option),
                  height: 42,
                }}
              >
                {option === 'expense' ? 'Expense' : 'Income'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <label style={fieldStyle()}>
        <span style={labelStyle()}>Description</span>
        <input
          required
          placeholder={direction === 'expense' ? 'Lunch at office' : 'Refund from friend'}
          value={rawDescription}
          onChange={(event) => setRawDescription(event.target.value)}
          style={inputStyle()}
        />
      </label>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <label style={fieldStyle()}>
          <span style={labelStyle()}>Intent</span>
          <select
            value={intent}
            onChange={(event) => setIntent(event.target.value as Intent)}
            style={inputStyle()}
          >
            {INTENT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label style={fieldStyle()}>
          <span style={labelStyle()}>Category</span>
          <select
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}
            style={inputStyle()}
          >
            <option value="">No category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label style={fieldStyle()}>
        <span style={labelStyle()}>Notes</span>
        <textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Optional"
          style={{
            ...inputStyle(),
            height: 84,
            paddingTop: 10,
            resize: 'vertical',
          }}
        />
      </label>

      {error ? (
        <div
          style={{
            background: 'var(--warning-tint)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 8,
            color: 'var(--warning)',
            fontSize: 13,
            padding: '10px 12px',
          }}
        >
          {error}
        </div>
      ) : null}

      <div
        style={{
          alignItems: 'center',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          paddingTop: 16,
        }}
      >
        <div style={{ color: 'var(--text-tertiary)', fontSize: 12 }}>
          {selectedAccount ? `${selectedAccount.label} · reviewed immediately` : 'Reviewed immediately'}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link href="/transactions" style={buttonStyle()}>
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            style={{ ...buttonStyle(true), opacity: submitting ? 0.65 : 1 }}
          >
            {submitting ? 'Saving...' : 'Add transaction'}
          </button>
        </div>
      </div>
    </form>
  );
}
