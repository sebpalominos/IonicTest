import { GoalBase, GoalShape } from './goal.model';
import { GoalAction } from './goal-action.model';
import { GoalType } from './goal-type.model';
import { GoalOverview } from './goal-overview.model';
import { GoalSummary } from './goal-summary.model';
import { Account, AccountShape } from '../../accounts/shared/account.model';
import { TimeScaleType } from '../../../../core/data/shared/constant-types'
import { GoalListResponse, GoalResponse } from '../../../core/data/goal/goal-response';

export interface SavingsGoalShape extends GoalShape {
  accountId?: number;
  account?: AccountShape;
  debt?: boolean;
}

export class SavingsGoal extends GoalBase implements SavingsGoalShape {
  accountId?: number;
  account?: Account;
  debt: boolean;
  constructor(...shapes: Partial<SavingsGoalShape>[]){
    super(shapes);
  }
  /** Very roundabout way of saying: goal nickname, then account names, else 'Saving target' */
  displayName(): string {
    return this.name ? this.name : (this.account ? (this.account.nickname || this.account.name) : 'Saving target');
  }
  /** Show account name, if wasn't already shown as display name */
  caption(): string {
    return (this.name && this.account) ? (this.account.nickname || this.account.name) : null;
  }
  saveAmount(): number {
    let currentTimeframeItem = this.overview.milestoneTimeframes.find(mtf => mtf.current);
    let currentTimeframeAmount = Number(currentTimeframeItem.texts.target.replace(/\D/g, ''));
    return currentTimeframeAmount;
  }
  saveTarget(): number {
    let lastTimeframeItem = this.overview.milestoneTimeframes.slice(-1).pop();
    let lastTimeframeAmount = Number(lastTimeframeItem.texts.target.replace(/\D/g, ''));
    return lastTimeframeAmount;
  }
  percentage(): number {
    return this.saveAmount() / this.saveTarget() * 100;
  }
  /** Create a list of savings goals, from a given response */
  static createListFromResponse(resp: GoalListResponse): SavingsGoal[] {
    return resp.items.map(goal => this.createFromResponse(goal));     // Convert into AccountGoal objects
  }
  /** Create a savings goal, from a given response */
  static createFromResponse(resp: GoalResponse): SavingsGoal {
    let matchedGoalActionResponse = GoalAction.matchCallToAction(resp.callToAction, resp.actions);
    return new SavingsGoal(<GoalShape&SavingsGoalShape> {
      id: null,   // TODO
      name: resp.header.title,
      typeHeader: GoalType.createFromResponse(resp.header),
      overview: GoalOverview.createFromResponse(resp.overview),
      summary: GoalSummary.createFromResponse(resp.summary),
      actions: GoalAction.createListFromResponse(resp.actions, resp.header),
      cta: GoalAction.createFromResponse(matchedGoalActionResponse)
    });
  }
}