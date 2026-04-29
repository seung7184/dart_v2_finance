import Link from 'next/link';
import { and, eq } from 'drizzle-orm';
import { accounts, categories, db } from '@dart/db';
import { requireAuthenticatedAppUser } from '@/auth/session';
import { getOrCreateSystemCategories } from '@/categories/repository';
import {
  getDatabaseRuntimeErrorMessage,
  getTransactionsRuntimeState,
  withDatabaseRuntimeTimeout,
} from '@/transactions/runtime';
import ManualTransactionForm, {
  type ManualAccountOption,
  type ManualCategoryOption,
} from './ManualTransactionForm';

export const dynamic = 'force-dynamic';

function linkButtonStyle(primary = false): React.CSSProperties {
  return {
    alignItems: 'center',
    background: primary ? 'var(--accent-500)' : 'var(--surface-2)',
    border: primary ? '1px solid transparent' : '1px solid var(--border-default)',
    borderRadius: 8,
    color: primary ? 'var(--text-on-accent)' : 'var(--text-primary)',
    display: 'inline-flex',
    fontSize: 13,
    fontWeight: 600,
    height: 40,
    padding: '0 14px',
    textDecoration: 'none',
  };
}

async function getManualEntryData(userId: string): Promise<{
  accounts: ManualAccountOption[];
  categories: ManualCategoryOption[];
}> {
  const [accountRows, categoryRows] = await Promise.all([
    db
      .select({
        accountType: accounts.accountType,
        id: accounts.id,
        name: accounts.name,
      })
      .from(accounts)
      .where(and(eq(accounts.userId, userId), eq(accounts.isActive, true)))
      .orderBy(accounts.displayOrder, accounts.createdAt),
    getOrCreateSystemCategories(),
  ]);

  return {
    accounts: accountRows.map((account) => ({
      id: account.id,
      label: `${account.name} (${account.accountType.replace('_', ' ')})`,
      type: account.accountType,
    })),
    categories: categoryRows,
  };
}

function EmptyState({ message }: { message?: string | undefined }) {
  return (
    <div style={{ padding: '24px 32px 48px' }}>
      <div
        style={{
          background: 'var(--surface-1)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 12,
          maxWidth: 640,
          padding: 24,
        }}
      >
        <div
          style={{
            color: 'var(--warning)',
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          Setup needed
        </div>
        <h2 style={{ color: 'var(--text-primary)', fontSize: 20, margin: '8px 0' }}>
          Add an account first
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.6, margin: 0 }}>
          {message ?? 'Manual entries need an active account so every transaction stays auditable.'}
        </p>
        <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
          <Link href="/onboarding/accounts" style={linkButtonStyle(true)}>
            Open account setup
          </Link>
          <Link href="/settings" style={linkButtonStyle()}>
            Settings
          </Link>
        </div>
      </div>
    </div>
  );
}

export default async function NewTransactionPage() {
  const userId = await requireAuthenticatedAppUser();
  const runtimeState = getTransactionsRuntimeState(process.env);

  let data: Awaited<ReturnType<typeof getManualEntryData>> | null = null;
  let databaseMessage = runtimeState.message;

  if (runtimeState.databaseConfigured) {
    try {
      data = await withDatabaseRuntimeTimeout(getManualEntryData(userId));
    } catch (error) {
      databaseMessage = getDatabaseRuntimeErrorMessage(error);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div
        style={{
          alignItems: 'center',
          background: 'var(--surface-0)',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          padding: '18px 32px',
        }}
      >
        <div>
          <h1 style={{ color: 'var(--text-primary)', fontSize: 20, fontWeight: 600, margin: 0 }}>
            Add transaction
          </h1>
          <div style={{ color: 'var(--text-tertiary)', fontSize: 12, marginTop: 2 }}>
            Web-first manual entry · reviewed by default
          </div>
        </div>
        <Link href="/transactions" style={linkButtonStyle()}>
          Back to transactions
        </Link>
      </div>

      {!runtimeState.databaseConfigured || !data ? (
        <EmptyState message={databaseMessage ?? undefined} />
      ) : data.accounts.length === 0 ? (
        <EmptyState />
      ) : (
        <div style={{ padding: '24px 32px 48px' }}>
          <ManualTransactionForm accounts={data.accounts} categories={data.categories} />
        </div>
      )}
    </div>
  );
}
