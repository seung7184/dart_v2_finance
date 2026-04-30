import { mobileApiFetch, type MobileApiResult } from './client';

export type QuickAddPayload = {
  amountCents: number;
  categoryId: string | null;
  notes: string | null;
};

export type CreatedMobileTransaction = {
  id: string;
  amountCents: number;
  categoryId: string | null;
  currency: string;
  importBatchId: string | null;
  occurredAt: string;
  rawDescription: string;
  source: string;
};

type ManualTransactionResponse = {
  transaction: CreatedMobileTransaction;
};

export async function postMobileManualTransaction(
  payload: QuickAddPayload,
): Promise<MobileApiResult<CreatedMobileTransaction>> {
  const result = await mobileApiFetch<ManualTransactionResponse>(
    '/api/mobile/transactions/manual',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
  );

  if (result.status !== 'ok') {
    return result;
  }

  return { status: 'ok', data: result.data.transaction };
}
