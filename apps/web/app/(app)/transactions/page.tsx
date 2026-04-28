import { desc, eq } from 'drizzle-orm';
import { accounts, categories, db, transactions } from '@dart/db';
import { requireAuthenticatedAppUser } from '@/auth/session';
import { getTransactionsRuntimeState } from '@/transactions/runtime';
import { getOrCreateSystemCategories } from '@/categories/repository';
import TransactionsClient, { type TransactionRow, type CategoryOption } from './TransactionsClient';

export const dynamic = 'force-dynamic';

function badgeStyle(tone: 'neutral' | 'positive' | 'warning' | 'accent'): React.CSSProperties {
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
    whiteSpace: 'nowrap' as const,
  };
}

async function getTransactionsForUser(userId: string): Promise<TransactionRow[]> {
  const rows = await db
    .select({
      id: transactions.id,
      accountName: accounts.name,
      amount: transactions.amount,
      currency: transactions.currency,
      intent: transactions.intent,
      categoryId: transactions.categoryId,
      categoryName: categories.name,
      occurredAt: transactions.occurredAt,
      rawDescription: transactions.rawDescription,
      merchantName: transactions.merchantName,
      reviewStatus: transactions.reviewStatus,
      source: transactions.source,
    })
    .from(transactions)
    .innerJoin(accounts, eq(transactions.accountId, accounts.id))
    .leftJoin(categories, eq(transactions.categoryId, categories.id))
    .where(eq(transactions.userId, userId))
    .orderBy(desc(transactions.occurredAt))
    .limit(200);

  // Map DB types to the client-facing shape
  return rows.map((r) => ({
    id: r.id,
    accountName: r.accountName,
    amount: r.amount,
    currency: r.currency,
    // intentEnum value is always valid; cast to the client type
    intent: r.intent as TransactionRow['intent'],
    categoryId: r.categoryId ?? null,
    categoryName: r.categoryName ?? null,
    occurredAt: r.occurredAt,
    rawDescription: r.rawDescription,
    merchantName: r.merchantName ?? null,
    reviewStatus: r.reviewStatus as TransactionRow['reviewStatus'],
    source: r.source,
  }));
}

export default async function TransactionsPage() {
  const userId = await requireAuthenticatedAppUser();
  const runtimeState = getTransactionsRuntimeState(process.env);

  if (!runtimeState.databaseConfigured) {
    return <TransactionsUnavailable message={runtimeState.message} />;
  }

  const [rows, systemCategories] = await Promise.all([
    getTransactionsForUser(userId),
    getOrCreateSystemCategories(),
  ]);

  // systemCategories from DB have id + name; pass them to the client
  const categoryOptions: CategoryOption[] = systemCategories;

  return <TransactionsClient initialRows={rows} categories={categoryOptions} />;
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
