import { GoalShape } from '../../goal-centre/shared/goal.model';
import { GoalSummaryShape } from '../../goal-centre/shared/goal-summary.model';

export type NotificationSummary = {
  newCount: number;
  since: Date;
};

export type UserAnnualSummary = {
  netWorth: number;
  annualIncome: number;
  annualExpenses: number;
  averageMonthlyIncome?: number;
  averageMonthlyExpenses?: number;
};

export type UserMonthlySummary = {
  title: string;
  monthlyIncome: number;
  monthlyExpenses: number;
  goalSummary?: GoalSummaryShape;
};