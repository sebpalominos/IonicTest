import { AffordabilityCalculation } from './affordability-calc';
import { AffordabilityGoal } from './affordability-goal.model';
import { MortgageAccount } from './mortgage-account.model';
import { PropertyShape } from '../../property-centre/shared/property.model';
import { PropertySearchSummaryShape } from '../../property-centre/shared/property-search.model';
import { AffordabilityRelatedGoalWorkspace } from '../../goal-workspace/shared/goal-workspace-afford.model';
import { GoalService } from '../../../core/services/goal/goal.service';

export namespace AffordabilityUtils {
  export enum SelectionType {
    NONE,    
    EXISTING_PROPERTY_ONLY,
    EXISTING_PROPERTY_MORTGAGE,
    TARGET_PROPERTY
  }
  export interface SurplusTargetParams {
    targetProperty: PropertyShape;
    workspace?: AffordabilityRelatedGoalWorkspace;
    workspacePath?: string;
    // calc: AffordabilityCalculation;
  }
  export interface SurplusLimitParams {
    surplusTarget: number;
    surplusActual?: number;
    surplusRemaining?: number;
  }
  export interface DeepLinkParams {
    isInitial?: boolean;
    targetPropertySummary?: PropertySearchSummaryShape;
    existingPropertySummary?: PropertySearchSummaryShape;
    targetProperty?: PropertyShape;
    existingProperty?: PropertyShape;
    existingMortgage?: MortgageAccount;
    surplusTarget?: AffordabilityRelatedGoalWorkspace;
    hasMortgage?: boolean;
  }
  export function getActionWorkspace(goalService: GoalService, actionName: string): Promise<AffordabilityRelatedGoalWorkspace> {
    return goalService.getGoalActions('REAL_ESTATE').then(actionCollection => {
      return actionCollection.actions.find(ac => ac.name === actionName);
    }).then(action => {
      let workspacePath = action.workspacePath();
      let workspaceInitializer = AffordabilityRelatedGoalWorkspace.createFromResponse;
      return goalService.getWorkspace(workspacePath, workspaceInitializer);
    }).catch(err => {
      console.error(err);
    });
  }
  /**
   * Return an ngClass-compliant object which represents color state for a given percentage.
   * @export
   * @param {any} completionPercentage 
   * @returns {*} 
   */
  export function getStatusNameByCompletion(completionPercentage): any {
    return {
      // 'red': completionPercentage < 0.5,
      // 'amber': completionPercentage >= 0.5 && completionPercentage < 1,
      // 'green': completionPercentage >= 1
      'red': completionPercentage <= 0.4,
      'amber': completionPercentage > 0.4 && completionPercentage < 1,
      'green': completionPercentage >= 1
    };
  }
  /**
   * Check that you can show the goal overview
   * @export
   * @param {AffordabilityGoal} goal 
   * @returns {boolean} 
   */
  export function isTrackable(goal: AffordabilityGoal): boolean {
    return !!goal.overview;
  }
  /**
   * Check if the goal should be resumed rather than new setup
   * @export
   * @param {AffordabilityGoal} goal 
   * @returns {boolean} 
   */
  export function isResumable(goal: AffordabilityGoal): boolean {
    return !!goal.actions.find(action => action.completionRate !== 0);
  }
}