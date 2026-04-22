import { pgEnum } from 'drizzle-orm/pg-core';

export const intentEnum = pgEnum('intent', [
  'living_expense',
  'recurring_bill',
  'income_salary',
  'income_dividend',
  'income_refund',
  'income_other',
  'transfer',
  'reimbursement_out',
  'reimbursement_in',
  'investment_contribution',
  'investment_buy',
  'investment_sell',
  'fee',
  'tax',
  'adjustment',
  'unclassified',
]);

export const reviewStatusEnum = pgEnum('review_status', [
  'pending',
  'reviewed',
  'needs_attention',
  'auto_approved',
]);

export const accountTypeEnum = pgEnum('account_type', [
  'checking',
  'savings',
  'credit_card',
  'brokerage',
  'pension',
  'cash',
  'manual_external',
]);
