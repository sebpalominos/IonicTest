import { GoalTrafficLight } from './goal-misc';
import { GoalAction, GoalActionShape } from './goal-action.model';
import { GoalOverview, GoalOverviewShape } from './goal-overview.model';
import { GoalSummary, GoalSummaryShape } from './goal-summary.model';
import { GoalType, GoalTypeShape } from './goal-type.model';
import { TimeScaleType } from '../../../core/data/shared/constant-types';
import { GoalResponseValues } from '../../../core/data/goal/goal-response'; 

export { GoalResponseValues };

export interface GoalShape {
  id: number;
  name: string;
  typeHeader: GoalTypeShape;
  overview: GoalOverviewShape;
  summary: GoalSummaryShape;
  actions: GoalActionShape[];
  cta?: GoalAction;
}

export abstract class GoalBase implements GoalShape {
  constructor(shapes: Partial<GoalShape>[]){
    Object.assign(this, ...shapes);
  }
  id: number;
  name: string;
  typeHeader: GoalType;
  overview: GoalOverview;
  summary: GoalSummary;
  actions: GoalAction[];
  cta: GoalAction;
  abstract displayName(): string;
  abstract caption(): string;       // Goes under the displayname, if any
}