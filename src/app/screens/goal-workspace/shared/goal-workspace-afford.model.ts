import { GoalWorkspaceBase, GoalWorkspaceShape, WorkspaceItems } from './goal-workspace.model';
import { SavingsRelatedPayload, AffordabilityPayloadParams } from './goal-workspace-data-maps';
import { SavingsRelated, SavingsRelatedGoalWorkspace, SavingsRelatedGoalWorkspaceShape } from './goal-workspace-savings.model';
import { GoalResponseValues, GoalWorkspaceResponse, GoalWorkspaceSubItemResponse,
         GoalWorkspacePerspectiveResponse } from '../../../core/data/goal/goal-response';
import { Currency } from '../../../core/data/shared/currency';
import { Link } from '../../../core/data/shared/link';

// ==========================================
// Real Estate Surplus Related Goal Workspace
// ==========================================
export interface AffordabilityRelatedGoalWorkspaceShape extends SavingsRelatedGoalWorkspaceShape {
  thisMonthProjectedIncome: number;
  thisMonthProjectedExpenditure: number;
  thisMonthProjectedSurplus: number;
  lastMonthActualIncome: number;
  lastMonthActualExpenditure: number;
  lastMonthActualSurplus: number;
  targetMonthlySurplus: number;
  spendingLimitSavingsRequired: number;
  spendingLimitCurrentSavings: number;
}
export class AffordabilityRelatedGoalWorkspace extends SavingsRelatedGoalWorkspace implements AffordabilityRelatedGoalWorkspaceShape {
  thisMonthProjectedIncome: number;
  thisMonthProjectedExpenditure: number;
  thisMonthProjectedSurplus: number;
  lastMonthActualIncome: number;
  lastMonthActualExpenditure: number;
  lastMonthActualSurplus: number;
  targetMonthlySurplus: number;
  spendingLimitSavingsRequired: number;
  spendingLimitCurrentSavings: number;
  constructor(...shapes: Partial<AffordabilityRelatedGoalWorkspaceShape>[]) {
    super(...shapes);
  }
  /**
   * A multi-purpose endpoint which accepts both target-setting and limit-setting payloads.
   * There are two possibilities: That this is for setting a category spending limit, or it is for an overall monthly surplus. 
   * Scenario #1: If setting a SPENDING LIMIT then use SavingsRelatedGoalWorkspace's implementation of getPayload
   * Scenario #2: If setting a MONTHLY SURPLUS then use the actionKeyName-style implementation
   * @param {*} params 
   * @returns 
   * @memberof AffordabilityRelatedGoalWorkspace
   */
  getPayload(params: AffordabilityPayloadParams) {
    if (params.targetSummary) {
      // This is Scenario #1
      return super.getPayload(params);
    }
    else if (params.actionKeyName) {
      // This is Scenario #2
      let { actionKeyName, amount, currencyCode } = params;
      currencyCode = currencyCode || 'AUD';
      return <SavingsRelatedPayload> {
        proposedAction: {
          [actionKeyName]: { amount, currencyCode }
        }
      };
    }
  }
  static createFromResponse(resp: GoalWorkspaceResponse, workspacePath?: string): AffordabilityRelatedGoalWorkspace {
    let base = SavingsRelatedGoalWorkspace.createFromResponse(resp);
    let currentValueByLabel = (itemLabelName: string): Currency => {
      let item = resp.summary.items.find(item => item.label === itemLabelName);
      return item.currentValue.value || item.currentValue || {} as Currency;
    };
    let currentValueByName = (itemName: string): Currency => {
      let item = resp.summary.items.find(item => item.name === itemName);
      return item.currentValue.value || item.currentValue || {} as Currency;
    };
    // console.log(resp.summary.items);
    // console.log(resp.summary.items.find(item => item.name === 'thisMonthProjectedIncome'));
    // console.log(resp.summary.items.find(item => item.name === 'thisMonthProjectedExpenditure'));
    // let thisMonthProjectedIncome = currentValueByName('thisMonthProjectedIncome').amount;
    // let thisMonthProjectedExpenditure = currentValueByName('thisMonthProjectedExpenditure').amount;

    let surplus = new AffordabilityRelatedGoalWorkspace(base, {
      // estimatedMonthlySurplus: currentValueByLabel('estimatedMonthlySurplus').amount,
      // targetedMonthlySurplus: currentValueByLabel('targetedMonthlySurplus').amount,
      // targetedYearlySurplus: currentValueByLabel('real_estate_target_yearly_surplus').amount,
      thisMonthProjectedIncome: currentValueByName('thisMonthProjectedIncome').amount,
      thisMonthProjectedExpenditure: currentValueByName('thisMonthProjectedExpenditure').amount,
      thisMonthProjectedSurplus: currentValueByName('thisMonthProjectedSurplus').amount,
      lastMonthActualIncome: currentValueByName('lastMonthActualIncome').amount,
      lastMonthActualExpenditure: currentValueByName('lastMonthActualExpenditure').amount,
      lastMonthActualSurplus: currentValueByName('lastMonthActualSurplus').amount,
      targetMonthlySurplus: currentValueByName('real_estate_target_monthly_surplus').amount,
      spendingLimitCurrentSavings: currentValueByName('currentSaving').amount,
      spendingLimitSavingsRequired: currentValueByName('savingsRequired').amount
    });
    return surplus;
  }
}