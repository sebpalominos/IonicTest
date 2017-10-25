import { AffordabilityGoalShape } from './affordability-goal.model';
import { AffordabilityRelatedGoalWorkspaceShape } from '../../goal-workspace/shared/goal-workspace-afford.model';
import { PropertyShape } from '../../property-centre/shared/property.model';

export class AffordabilityCalculation {
  readonly INCOME_DISPOSABLE_PERCENTAGE: number = 0.5;
  readonly SLIDER_LOWER_DEFAULT_MONTHS: number = 2;
  readonly SLIDER_UPPER_DEFAULT_MONTHS: number = 48;
  property: PropertyShape;
  // goalInfo: AffordabilityGoalShape;
  workspace: AffordabilityRelatedGoalWorkspaceShape;
  constructor(property: PropertyShape, workspace: AffordabilityRelatedGoalWorkspaceShape) {
    this.property = property;
    this.workspace = workspace;
    let surplusTargetAmountMonthly = this.calculateFromDeposit(workspace.targetMonthlySurplus);
    this.SLIDER_LOWER_DEFAULT_MONTHS = this.calculateFromDeposit(workspace.thisMonthProjectedIncome * this.INCOME_DISPOSABLE_PERCENTAGE);
    this.SLIDER_UPPER_DEFAULT_MONTHS = Math.max(surplusTargetAmountMonthly, 120);
  }
  /**
   * Simple yes/no to as to whether the current scenario is affordable
   * @todo
   * @returns {boolean} 
   * @memberof AffordabilityCalculation
   */
  isAffordable(): boolean {
    // TODO
    // TODO
    // TODO
    // TODO
    // this.workspace.thisMonthProjectedIncome
    if (this.workspace.thisMonthProjectedSurplus < 0) {
      return false;
    }
    let monthMaxThreshold = 60;    // 5 years
    if (this.deposit() / this.workspace.thisMonthProjectedSurplus > monthMaxThreshold) {
      return false;
    }
    return true;
    // Todo: Factor in regular repayment of loan??
  }
  /**
   * Calculate the deposit required for target property
   * @desc Placeholder only
   * @returns {number}
   * @memberof AffordabilityCalculation
   */
  deposit(): number {
    return this.property
      ? (this.property.currentValue || this.property.salePrice) * 0.2
      : undefined;
  }
  /**
   * Returns an estimate of how long to repayment, in relative time results
   * @param {number} targetSurplus 
   * @returns {number} 
   * @memberof AffordabilityCalculation
   */
  calculateFromDeposit(targetSurplus: number): number {
    return this.deposit() / targetSurplus;
    // Todo: Factor in regular repayment of loan??
  }
}