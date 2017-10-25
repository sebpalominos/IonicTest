import { GoalProseSettingResponse } from '../../../core/data/goal/goal-response';

export interface GoalSettingShape {
  type: string;     // GENERIC_SAVINGS_SAVING_FOR, etc
  explainer: string;
}
export class GoalSetting implements GoalSettingShape {
  type: string;     // GENERIC_SAVINGS_SAVING_FOR, etc
  explainer: string;
  constructor(...shapes: Partial<GoalSettingShape>[]) {
    Object.assign(this, ...shapes);
  }
}