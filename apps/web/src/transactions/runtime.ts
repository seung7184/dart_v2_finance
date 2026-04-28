export type TransactionsRuntimeState = {
  databaseConfigured: boolean;
  message: string | null;
};

function hasConfiguredValue(value: string | undefined): boolean {
  return Boolean(value?.trim());
}

export function getTransactionsRuntimeState(
  env: Record<string, string | undefined>,
): TransactionsRuntimeState {
  if (!hasConfiguredValue(env.DATABASE_URL)) {
    return {
      databaseConfigured: false,
      message: 'DATABASE_URL is required to load imported transactions.',
    };
  }

  return {
    databaseConfigured: true,
    message: null,
  };
}

export function getDatabaseRuntimeErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);

  if (message === 'DATABASE_RUNTIME_TIMEOUT') {
    return 'Database did not respond quickly enough. Check DATABASE_URL and Supabase status, then restart the web server.';
  }

  if (message.includes('ENOTFOUND') || message.includes('getaddrinfo')) {
    return 'Database host could not be resolved. Check DATABASE_URL in .env.local, then restart the web server.';
  }

  return 'Database connection failed. Check DATABASE_URL and Supabase status, then restart the web server.';
}

export async function withDatabaseRuntimeTimeout<T>(
  operation: Promise<T>,
  timeoutMs = 3_000,
): Promise<T> {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  const timeoutPromise = new Promise<T>((_, reject) => {
    timeout = setTimeout(() => {
      reject(new Error('DATABASE_RUNTIME_TIMEOUT'));
    }, timeoutMs);
  });

  try {
    return await Promise.race([operation, timeoutPromise]);
  } finally {
    if (timeout) {
      clearTimeout(timeout);
    }
  }
}
