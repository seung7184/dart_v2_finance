import Link from 'next/link';
import { and, eq } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { accounts, db, transactionMatches, transactions } from '@dart/db';
import { requireAuthenticatedAppUser } from '@/auth/session';
import {
  getDatabaseRuntimeErrorMessage,
  getTransactionsRuntimeState,
  withDatabaseRuntimeTimeout,
} from '@/transactions/runtime';
import MatchReviewClient, { type MatchReviewRow } from './MatchReviewClient';

export const dynamic = 'force-dynamic';

const manualTransactions = alias(transactions, 'manual_transactions');
const importedTransactions = alias(transactions, 'imported_transactions');
const manualAccounts = alias(accounts, 'manual_accounts');
const importedAccounts = alias(accounts, 'imported_accounts');

function linkButtonStyle(): React.CSSProperties {
  return {
    alignItems: 'center',
    background: 'var(--surface-2)',
    border: '1px solid var(--border-default)',
    borderRadius: 8,
    color: 'var(--text-primary)',
    display: 'inline-flex',
    fontSize: 13,
    fontWeight: 600,
    height: 40,
    padding: '0 14px',
    textDecoration: 'none',
  };
}

async function loadSuggestedMatches(userId: string): Promise<MatchReviewRow[]> {
  const rows = await db
    .select({
      confidence: transactionMatches.matchConfidence,
      importedAccountName: importedAccounts.name,
      importedAmount: importedTransactions.amount,
      importedDescription: importedTransactions.rawDescription,
      importedOccurredAt: importedTransactions.occurredAt,
      manualAccountName: manualAccounts.name,
      manualAmount: manualTransactions.amount,
      manualDescription: manualTransactions.rawDescription,
      manualOccurredAt: manualTransactions.occurredAt,
      matchId: transactionMatches.id,
      reason: transactionMatches.matchReason,
    })
    .from(transactionMatches)
    .innerJoin(manualTransactions, eq(transactionMatches.manualTransactionId, manualTransactions.id))
    .innerJoin(importedTransactions, eq(transactionMatches.importedTransactionId, importedTransactions.id))
    .innerJoin(manualAccounts, eq(manualTransactions.accountId, manualAccounts.id))
    .innerJoin(importedAccounts, eq(importedTransactions.accountId, importedAccounts.id))
    .where(and(eq(transactionMatches.userId, userId), eq(transactionMatches.matchStatus, 'suggested')));

  return rows;
}

function DatabaseUnavailable({ message }: { message: string | null }) {
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
        <h2 style={{ color: 'var(--text-primary)', fontSize: 20, margin: '0 0 8px' }}>
          Match review needs the live database
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.6, margin: 0 }}>
          {message ?? 'Configure DATABASE_URL, then restart the web server.'}
        </p>
      </div>
    </div>
  );
}

export default async function TransactionMatchesPage() {
  const userId = await requireAuthenticatedAppUser();
  const runtimeState = getTransactionsRuntimeState(process.env);
  let rows: MatchReviewRow[] = [];
  let databaseMessage = runtimeState.message;

  if (runtimeState.databaseConfigured) {
    try {
      rows = await withDatabaseRuntimeTimeout(loadSuggestedMatches(userId));
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
            Match review
          </h1>
          <div style={{ color: 'var(--text-tertiary)', fontSize: 12, marginTop: 2 }}>
            Suggested CSV/manual duplicates · user-confirmed only
          </div>
        </div>
        <Link href="/transactions" style={linkButtonStyle()}>
          Back to transactions
        </Link>
      </div>

      {!runtimeState.databaseConfigured || databaseMessage ? (
        <DatabaseUnavailable message={databaseMessage} />
      ) : (
        <div style={{ padding: '24px 32px 48px' }}>
          <MatchReviewClient initialRows={rows} />
        </div>
      )}
    </div>
  );
}
