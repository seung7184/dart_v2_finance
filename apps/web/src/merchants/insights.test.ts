import { describe, expect, it } from 'vitest';
import { summarizeMerchantInsightRows } from './insights';

describe('summarizeMerchantInsightRows', () => {
  it('groups merchant spend by persisted normalized merchant name', () => {
    const result = summarizeMerchantInsightRows({
      merchantRows: [
        {
          amountCents: 1704,
          merchantName: 'DIRK VDBROEK FIL4103',
          normalizedMerchantName: 'dirk vdbroek',
          occurredAt: new Date('2026-04-03T12:00:00.000Z'),
        },
        {
          amountCents: 329,
          merchantName: 'Dirk v/d Broek',
          normalizedMerchantName: 'dirk vdbroek',
          occurredAt: new Date('2026-04-08T12:00:00.000Z'),
        },
        {
          amountCents: 1250,
          merchantName: 'Synthetic Cafe',
          normalizedMerchantName: 'synthetic cafe',
          occurredAt: new Date('2026-04-09T12:00:00.000Z'),
        },
        {
          amountCents: 999,
          merchantName: null,
          normalizedMerchantName: null,
          occurredAt: new Date('2026-04-10T12:00:00.000Z'),
        },
      ],
      rollingRows: [
        {
          merchantName: 'DIRK VDBROEK FIL4103',
          normalizedMerchantName: 'dirk vdbroek',
          occurredAt: new Date('2026-02-03T12:00:00.000Z'),
        },
        {
          merchantName: 'Dirk v/d Broek',
          normalizedMerchantName: 'dirk vdbroek',
          occurredAt: new Date('2026-04-08T12:00:00.000Z'),
        },
      ],
    });

    expect(result.totalSpendCents).toBe(4282);
    expect(result.topMerchants[0]).toEqual({
      amountCents: 2033,
      concentrationPct: 47,
      merchantName: 'DIRK VDBROEK FIL4103',
      transactionCount: 2,
    });
    expect(result.recurringMerchants).toEqual(['DIRK VDBROEK FIL4103']);
  });
});
