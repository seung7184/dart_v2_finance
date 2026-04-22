export type AccountType =
  | 'checking'
  | 'savings'
  | 'credit_card'
  | 'brokerage'
  | 'pension'
  | 'cash'
  | 'manual_external';

export interface Account {
  id: string;
  name: string;
  institution: string | null;
  account_type: AccountType;
  currency: string;
  is_accessible_savings: boolean;
  is_active: boolean;
}
