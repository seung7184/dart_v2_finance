/**
 * Safe-to-Spend Engine
 *
 * STATUS: PLACEHOLDER — DO NOT IMPLEMENT YET
 *
 * Implementation checklist:
 * [ ] Read docs/23_Safe_To_Spend_Engine_Spec.md fully
 * [ ] Confirm test files exist in __tests__/
 * [ ] Run tests (expect failures — TDD)
 * [ ] Implement to make tests pass one group at a time
 * [ ] Final: pnpm test passes all 50 cases
 */

import type { SafeToSpendResult, PolicyConfig } from '../types/engine';

export interface ComputeContext {
  policy: PolicyConfig;
  accounts: Array<{
    id: string;
    type: string;
    balance_cents: number;
    is_accessible_savings: boolean;
  }>;
  transactions: Array<{
    amount: number;
    intent: string;
    review_status: string;
    occurred_at: Date;
    account_type: string;
  }>;
  recurring_series: Array<{
    amount: number;
    next_expected_at: Date;
    intent: string;
  }>;
  sinking_funds: Array<{
    monthly_allocation_cents: number;
    is_active: boolean;
  }>;
  last_import_at: Date | null;
  today: Date;
}

export function computeSafeToSpend(_ctx: ComputeContext): SafeToSpendResult {
  throw new Error(
    'NOT_IMPLEMENTED: Read docs/23_Safe_To_Spend_Engine_Spec.md and write tests first.\n' +
    'Test file: packages/core/src/safe-to-spend/__tests__/',
  );
}
