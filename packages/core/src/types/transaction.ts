export type Intent =
  | 'living_expense'
  | 'recurring_bill'
  | 'income_salary'
  | 'income_dividend'
  | 'income_refund'
  | 'income_other'
  | 'transfer'
  | 'reimbursement_out'
  | 'reimbursement_in'
  | 'investment_contribution'
  | 'investment_buy'
  | 'investment_sell'
  | 'fee'
  | 'tax'
  | 'adjustment'
  | 'unclassified';

export type ReviewStatus = 'pending' | 'reviewed' | 'needs_attention' | 'auto_approved';

export interface Transaction {
  id: string;
  account_id: string;
  account_type: string;
  amount: number;
  currency: string;
  intent: Intent;
  review_status: ReviewStatus;
  occurred_at: Date;
  raw_description: string;
}
