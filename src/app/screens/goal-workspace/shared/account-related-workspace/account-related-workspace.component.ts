import { Component, Input } from '@angular/core';
import { NavController, ActionSheetController, PopoverController, 
         LoadingController, AlertController, TextInput } from 'ionic-angular';

import { GoalWorkspaceBase } from '../goal-workspace.model';
import { AccountRelatedGoalWorkspace } from '../goal-workspace-account.model';
import { Account } from '../../../accounts/shared/account.model';
import { TimeScaleType } from '../../../../core/data/shared/constant-types';
import { AccountResponse } from '../../../../core/data/account/account-response';
import { WorkspaceSubmissionResponse, GoalResponseValues } from '../../../../core/data/goal/goal-response';
import { LinkAccountStateValue } from '../../../../core/data/goal/goal-state';
import { GoalService } from '../../../../core/services/goal/goal.service';

/**
 * Edit the account linked to an Account Goal
 * @export
 * @class EditGoalComponent
 */
@Component({
  selector: 'account-related-workspace',
  templateUrl: 'account-related-workspace.html'
})
export class AccountRelatedWorkspaceComponent {
  @Input('id') goalTypeIdentifier: GoalResponseValues.Type;
  @Input() workspacePath: string;
  selectedAccount: Account;
  selectedProduct: any;
  accounts: Account[];
  products: any[];
  workspace: AccountRelatedGoalWorkspace;
  constructor(
    protected navCtrl: NavController, 
    protected actionSheetCtrl: ActionSheetController,
    protected popoverCtrl: PopoverController,
    protected loadingCtrl: LoadingController,
    protected alertCtrl: AlertController,
    protected goalService: GoalService
  ) {}
  ngOnInit() {
    this.retrieveWorkspace(true).then((workspace: AccountRelatedGoalWorkspace) => {
      this.workspace = workspace;
      if (workspace.accounts) {
        this.loadAccounts(workspace.accounts);
      }
      // TBA
      // if (workspace.products) {
      //   this.loadProducts(workspace.products);
      // }
    });
  }
  submitAccount() {
    let loading = this.loadingCtrl.create({ content: 'Linking account' });
    loading.present();
    if (this.selectedAccount && this.workspace) {
      let payload = this.workspace.getPayload('ACCOUNT', this.selectedAccount._accountResponse);
      let successCheck = (resp: WorkspaceSubmissionResponse) => {
        return !!resp.goal;
      };
      this.goalService.submitWorkspaceSetting(this.workspacePath, payload, successCheck).then(outcome => {
        loading.dismiss();
        if (outcome.success) {
          this.navCtrl.pop();
        }
        else {
          this.alertCtrl.create({ title: 'Could not save', message: outcome.error, buttons: ['OK'] }).present();
        }
      }).catch(err => {
        loading.dismiss();
        console.error(err);
      });
    }
    else {
      console.warn('Called Submit without any account being selected.');
    }
  }
  submitProduct() {
    console.warn('To be implemented');
  }
  private retrieveWorkspace(foreground = false): Promise<GoalWorkspaceBase> {
    if (foreground) {
      var loading = this.loadingCtrl.create({ content: 'Loading Setting' });
      loading.present();
    }
    if (this.workspacePath) {
      let initializer = AccountRelatedGoalWorkspace.createFromResponse;
      return this.goalService.getWorkspace(this.workspacePath, initializer).then(workspace => {
        loading && loading.dismiss();
        return workspace;
      }).catch(err => {
        loading && loading.dismiss();
        console.error(err);
        return null;
      });
    }
  }
  private loadProducts(products?: any[]) {
    throw new Error('To be implemented');
  }
  private loadAccounts(accounts?: Account[]) {
    if (!accounts) {
      // TODO: Load accounts from, say, accountService
    }
    // Assign all known savings accounts
    // Also give the option to provide a new savings account
    this.accounts = accounts;
    this.accounts.push(Account.createFromResponse(<AccountResponse>{
      classIdentifier: 'ba',
      id: null,
      productType: 'SAVINGS',
      productId: null,
      providerId: null,
      providerName: null,
      name: '(Create a separate account)',
      currency: null,
      balance: null,
      refreshedTo: null,
      projectedLowTilEndOfMonth: null,
      projectedEndOfMonthBalance: null,
      connected: 'NO'
    }, null));  
    this.selectedAccount = this.accounts[0];
  }
}