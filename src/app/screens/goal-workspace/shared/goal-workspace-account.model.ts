import { GoalWorkspaceBase, GoalWorkspaceShape, WorkspaceItems } from './goal-workspace.model';
import { Account } from '../../accounts/shared/account.model';
import { GoalWorkspaceResponse, GoalWorkspaceSubItemResponse } from '../../../core/data/goal/goal-response';

// ==============================
// Account Related Goal Workspace
// ==============================
export interface AccountRelatedGoalWorkspaceShape extends GoalWorkspaceShape {
  accounts: Account[];
  products: any;        // tba Product
  currentAccount: Account;
  currentProduct: any;      // tba Product
}
export class AccountRelatedGoalWorkspace extends GoalWorkspaceBase implements AccountRelatedGoalWorkspaceShape {
  constructor(...shapes: Partial<AccountRelatedGoalWorkspaceShape>[]) {
    super(...shapes);
  }
  accounts: Account[];
  products: any;        // tba Product
  currentAccount: Account;
  currentProduct: any;      // tba Product
  getPayload(forType: 'ACCOUNT'|'PRODUCT', ...payloadArgs: any[]) {
    switch (forType) {
      case 'ACCOUNT':
        return { 
          proposedAction: { account: payloadArgs[0] }
        };
      case 'PRODUCT':
        return { 
          proposedAction: { productId: payloadArgs[0], operation: 'PUT' }
        };
    }
  }
  static createFromResponse(resp: GoalWorkspaceResponse, workspacePath?: string): AccountRelatedGoalWorkspace {
    // If this is an account related workspace, then there should be accounts in
    // the items field. Let's go digging ⛏
    let keyContentPair = resp.items.find(item => item.key === 'accounts');
    if (keyContentPair) {
      let content = keyContentPair.content;
      var accounts = content.accounts.map(account => Account.createFromResponse(account, null));
      var products = content.products;     // TBA, we don't have a product type 
      var currentAccount = content.current ? Account.createFromResponse(content.current, null) : null;
      var currentProduct = content.product || null;
    }
    return new AccountRelatedGoalWorkspace(<AccountRelatedGoalWorkspaceShape> {
      key: resp.key,
      title: resp.title,
      label: resp.callToAction.actionLabel,
      description: resp.callToAction.description,
      path: workspacePath,
      accounts: accounts || [],
      products: products || [],
      currentAccount: currentAccount || null,
      currentProduct: currentProduct || null,
      focalPoints: resp.focalPoints.map(fp => {
        let { active, description, focus } = fp;
        let isMain = fp.focus === resp.focus; 
        return <WorkspaceItems.FocalPoint> {
          isMain, active, description, focus
        }
      })
    });
  }
}