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
