export interface AssumptionEntry {
  key: string;
  label: string;
  value: number | boolean | string;
  unit?: 'cents' | 'days' | 'boolean';
}

export interface Warning {
  code: string;
  severity: 'info' | 'warning' | 'error';
  message: string;
}

export interface ProtectedObligations {
  upcoming_bills_cents: number;
  sinking_fund_cents: number;
  min_buffer_cents: number;
  investing_cents: number;
  anomaly_reserve_cents: number;
  total_cents: number;
}

export interface SafeToSpendResult {
  value_cents: number;
  computed_at: Date;
  days_until_payday: number;
  available_cash_cents: number;
  protected_obligations: ProtectedObligations;
  spendable_pool_cents: number;
  investing_cents: number;
  sinking_fund_cents: number;
  min_buffer_cents: number;
  anomaly_reserve_cents: number;
  investing_protected: boolean;
  assumption_trail: AssumptionEntry[];
  warnings: Warning[];
}

export interface PolicyConfig {
  payday_date: Date | null;
  planned_investing_protected: boolean;
  accessible_savings_account_ids: string[];
  minimum_cash_buffer_cents: number;
  planned_investing_cents: number;
}
