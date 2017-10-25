import { GoalOverview } from './goal-overview.model';
import { GoalSummary } from './goal-summary.model';
import { GoalType } from './goal-type.model';
import { GoalAction, GoalCallToAction } from './goal-action.model';
import { TimeScaleType } from '../../../core/data/shared/constant-types';
import { StateChangeResponse } from '../../../core/data/shared/state-change-response';
import { PieChartUtil }  from '../../../shared/pie-chart/pie-chart-util';

// =========================
// Transitory data mappings
// =========================
export type AvailableGoalInfo = {
  typeHeader: GoalType;
  summary?: GoalSummary;
  callToAction?: GoalCallToAction;
  actions?: GoalAction[]; 
  needsAttention?: boolean;
};
export type GoalOverviewInfo = {
  hasOverview: boolean;
  typeHeader: GoalType;
  overview: GoalOverview;
  percentage: number;
  percentageCaption: string;
  chartData: PieChartUtil.DatasetInput;
  chartOptions: { [option: string]: any };
};
// ==========
// Enums etc 
// ==========
export type TimeScaleOption = {
  label: string;
  value: TimeScaleType;
}; 
export enum GoalTrafficLight {
  Red,
  Amber,
  Green
};
export enum CreateGoalScreenFlow {
  None = 0,
  Landing,
  SelectGoalType, 
  SelectLinkedEntity,
  Prose,
  SetDuration,
  Complete
};