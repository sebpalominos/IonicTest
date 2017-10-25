import { GoalWorkspaceBase, GoalWorkspaceShape, WorkspaceItems } from './goal-workspace.model';
import { MortgageAccount, MortgageAccountShape } from '../../affordability/shared/mortgage-account.model';
import { PropertyAssociationPayload } from '../../property-centre/shared/property.model';
import { MortgageAccountResponse } from '../../../core/data/account/account-response';
import { GoalWorkspaceResponse, GoalWorkspaceSubItemResponse } from '../../../core/data/goal/goal-response';

// ================================
// Property Related Goal Workspace
// ================================
export interface PropertyRelatedGoalWorkspaceShape extends GoalWorkspaceShape {
  mortgageAccountList: MortgageAccountShape[];
}
export class PropertyRelatedGoalWorkspace extends GoalWorkspaceBase implements PropertyRelatedGoalWorkspaceShape {
  mortgageAccountList: MortgageAccount[];
  constructor(...shapes: Partial<PropertyRelatedGoalWorkspaceShape>[]) {
    super(...shapes);
  }
  /**
   * Retrieve the payload object for a Real Estate association action
   * @todo Implement multiple property association, each with multiple possible mortgages
   * @param {...any[]} payloadArgs 
   * @returns 
   * @memberof PropertyRelatedGoalWorkspace
   */
  getPayload(realEstate: PropertyAssociationPayload, mortgage?: MortgageAccountResponse) {
    if (!realEstate) {
      throw new Error('RealEstate association payload must be non-null');
    }
    let realEstateItem = mortgage ? Object.assign(realEstate, { mortgageAccounts: [ mortgage ] }) : realEstate;
    // let realEstateItem = Object.assign(realEstate, { mortgageAccounts: mortgage ? [ mortgage ] : [] });
    return { 
      operation: 'PUT',
      proposedAction: { 
        realEstate: [ realEstateItem ]
      }
    };
  }
  static createFromResponse(resp: GoalWorkspaceResponse, workspacePath?: string): PropertyRelatedGoalWorkspace {
    // If this is an account related workspace, then there should be accounts in
    // the items field. Let's go digging ⛏
    let keyContentPair = resp.items.find(item => item.key === 'mortgageAccountList');
    if (keyContentPair) {
      let content = keyContentPair.content;
      var mortgageAccountList = content.items.map((item: MortgageAccountResponse) => MortgageAccount.createFromResponse(item));
    }
    return new PropertyRelatedGoalWorkspace(<PropertyRelatedGoalWorkspaceShape> {
      key: resp.key,
      title: resp.title,
      focalPoints: resp.focalPoints,
      items: resp.items,
      description: resp.callToAction && resp.callToAction.description,
      label: resp.callToAction && resp.callToAction.actionLabel,
      path: workspacePath,
      mortgageAccountList: mortgageAccountList
    });
  }
}