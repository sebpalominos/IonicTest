import { SavingsRelated } from './goal-workspace-savings.model';
import { GoalSummary } from '../../goal-centre/shared/goal-summary.model';
import { Currency } from '../../../core/data/shared/currency';

export interface SpendingCategoryInfo {
  id: number;      // Mirror of SpendingLimit.id
  spendingArea: SavingsRelated.SpendingArea;
  spendingLimit: SavingsRelated.SpendingLimit;
  spendingSummary: GoalSummary;
  limit: number;
  initialLimit: number;
  narrative: string;
  isEditing: boolean;
  isDirty: boolean;
  isLoading: boolean;
};

// export interface SurplusTargetSummary {
//   estimatedMonthlySurplus: number;
//   targetedMonthlySurplus: number;
//   targetedYearlySurplus: number;
//   monthlySavingsRequired: number;
//   currentSavings: number;
// };

export type SavingsRelatedPayload = Partial<{
  items?: string[];
  proposedAction: {
    operation?: string|'CREATE'|'UPDATE'|'DELETE';     // Only 'CREATE' is known; the others are guessed
    data?: SavingsRelated.SpendingLimitSubmission;
    REAL_ESTATE_TARGET_YEARLY_SURPLUS?: Currency;      // Deprec, do not use.
    REAL_ESTATE_TARGET_MONTHLY_SURPLUS?: Currency;
  };
}>;

export interface AffordabilityPayloadParams {
  actionKeyName?: string;
  amount?: number;
  currencyCode?: string;
  targetSummary?: any;
}