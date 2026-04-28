import { and, eq } from 'drizzle-orm';
import { accounts, db } from '@dart/db';
import { requireAuthenticatedAppUser } from '@/auth/session';
import {
  getDatabaseRuntimeErrorMessage,
  getTransactionsRuntimeState,
  withDatabaseRuntimeTimeout,
} from '@/transactions/runtime';
import ImportForm, { type AccountOption } from './ImportForm';

export const dynamic = 'force-dynamic';

async function resolveAccountsForUser(userId: string): Promise<{
  ingAccount: AccountOption | null;
  t212Account: AccountOption | null;
}> {
  const userAccounts = await db
    .select({ id: accounts.id, name: accounts.name, institution: accounts.institution })
    .from(accounts)
    .where(and(eq(accounts.userId, userId), eq(accounts.isActive, true)));

  const ingAccount =
    userAccounts.find(
      (a) =>
        a.institution?.toLowerCase() === 'ing' ||
        a.name?.toLowerCase().includes('ing'),
    ) ?? null;

  const t212Account =
    userAccounts.find(
      (a) =>
        a.institution?.toLowerCase() === 'trading 212' ||
        a.name?.toLowerCase().includes('trading 212') ||
        a.name?.toLowerCase().includes('t212'),
    ) ?? null;

  return {
    ingAccount: ingAccount ? { id: ingAccount.id, name: ingAccount.name } : null,
    t212Account: t212Account ? { id: t212Account.id, name: t212Account.name } : null,
  };
}

export default async function ImportPage() {
  const userId = await requireAuthenticatedAppUser();
  const runtimeState = getTransactionsRuntimeState(process.env);

  let ingAccount: AccountOption | null = null;
  let t212Account: AccountOption | null = null;
  let databaseMessage = runtimeState.message;

  if (runtimeState.databaseConfigured) {
    try {
      ({ ingAccount, t212Account } = await withDatabaseRuntimeTimeout(resolveAccountsForUser(userId)));
    } catch (error) {
      databaseMessage = getDatabaseRuntimeErrorMessage(error);
    }
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
            Import CSV
          </h1>
          <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>
            ING + Trading 212 · reviewed before committing
          </div>
        </div>
      </div>

      {databaseMessage ? (
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
                color: 'var(--warning)',
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              Database not connected
            </div>
            <h2
              style={{
                color: 'var(--text-primary)',
                fontSize: 18,
                fontWeight: 600,
                margin: '10px 0 8px',
              }}
            >
              CSV import needs the live database.
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.6, margin: 0 }}>
              {databaseMessage}
            </p>
          </div>
        </div>
      ) : (
        <ImportForm ingAccount={ingAccount} t212Account={t212Account} />
      )}
    </div>
  );
}
