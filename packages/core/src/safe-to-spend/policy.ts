import type { PolicyConfig } from '../types/engine';

export function validatePolicy(policy: PolicyConfig): void {
  if (policy.payday_date === null) {
    throw new Error('PAYDAY_NOT_CONFIGURED');
  }
  if (policy.minimum_cash_buffer_cents < 0) {
    throw new Error('INVALID_POLICY: minimum_cash_buffer_cents cannot be negative');
  }
  if (policy.planned_investing_cents < 0) {
    throw new Error('INVALID_POLICY: planned_investing_cents cannot be negative');
  }
}

export function getDefaultPolicy(): PolicyConfig {
  return {
    payday_date: null,
    planned_investing_protected: true,
    accessible_savings_account_ids: [],
    minimum_cash_buffer_cents: 0,
    planned_investing_cents: 0,
  };
}
