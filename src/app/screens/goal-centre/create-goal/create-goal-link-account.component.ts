import { Component } from '@angular/core';
import { NavParams, NavController, ActionSheetController, AlertController, LoadingController } from 'ionic-angular';

import { SavingsGoal } from '../shared/savings-goal.model';
import { GoalAction } from '../shared/goal-action.model';
import { CreateGoalScreenFlow } from '../shared/goal-misc';
import { Account } from '../../accounts/shared/account.model';
import { AccountRelatedGoalWorkspace } from '../../goal-workspace/shared/goal-workspace-account.model';
import { AccountResponse } from '../../../core/data/account/account-response';
import { AccountService } from '../../../core/services/account/account.service';
import { WorkspaceSubmissionResponse } from '../../../core/data/goal/goal-response';
import { LinkAccountStateValue } from '../../../core/data/goal/goal-state';
import { GoalService } from '../../../core/services/goal/goal.service';

import { CreateGoalBaseComponent } from './create-goal-base.component';
import { CreateGoalCompleteComponent } from './create-goal-complete.component';

@Component({
  selector: 'scr-create-goal-link-account',
  templateUrl: 'create-goal-link-account.html',
  host: {
    class: 'create-goal create-goal-link-account'
  }
})
export class CreateGoalLinkAccountComponent extends CreateGoalBaseComponent {
  linkAccountState: LinkAccountStateValue;
  selectedAccount: Account;
  accounts: Account[];
  workspace: AccountRelatedGoalWorkspace;
  workspacePath: string;
  constructor(
    protected params: NavParams, 
    protected navCtrl: NavController, 
    protected actionSheetCtrl: ActionSheetController,
    protected loadingCtrl: LoadingController,
    protected alertCtrl: AlertController,
    protected accountService: AccountService,
    protected goalService: GoalService,
  ) {
    super(params, navCtrl, actionSheetCtrl);
  }
  ionViewWillLoad() {
    this.currentScreenFlowStage = CreateGoalScreenFlow.SelectLinkedEntity;
    this.linkAccountState = 'NOT_READY';
    this.accounts = [];
  }
  ionViewDidLoad() {
    this.retrieveAction(true).then(action => {
      if (action) {
        this.loadWorkspace(action, true);
      }
    });
  }
  submit() {
    let loading = this.loadingCtrl.create({ content: 'Linking account' });
    loading.present();
    if (this.selectedAccount && this.workspace) {
      let payload = this.workspace.getPayload('ACCOUNT', this.selectedAccount._accountResponse);
      let successCheck = (resp: WorkspaceSubmissionResponse) => {
        return resp.goal && resp.goal.progress === 'ON_TRACK';
      };
      this.goalService.submitWorkspaceSetting(this.workspacePath, payload, successCheck).then(outcome => {
        loading.dismiss();
        if (outcome.success) {
          this.linkAccountState = 'FINISHED';
          this.next();
        }
        else {
          this.alertCtrl.create({ title: 'Could not save', message: outcome.error, buttons: ['OK'] }).present();
        }
      }).catch(err => {
        console.error(err);
        loading.dismiss();
      });
    }
    else {
      console.warn('Called Submit without any account being selected.');
    }
  }
  next() {
    super.next(CreateGoalCompleteComponent);
  }
  close() {
    super.close();
  }
  private retrieveAction(foreground = false): Promise<GoalAction> {
    // Check that the conditions are right to do an account asssignment. Either: 
    // 1. Assert that the current call to action is the rd_account_missing, or
    // 2. Somewhere in the actions, there is one called RD_SAVINGS_WANTED
    if (foreground) {
      var loading = this.loadingCtrl.create({ content: 'Loading actions' });
      loading.present();
    }
    return this.goalService.getGoalActions(this.goalTypeIdentifier).then(collection => {
      loading && loading.dismiss();
      let condition1 = collection.callToAction && collection.callToAction.identifier === 'rd_account_missing';
      let condition2 = collection.actions.find(action => action.name === 'RD_SAVINGS_WANTED') !== undefined;
      if (condition1 || condition2) {
        return collection.actions.find(action => action.name === 'RD_SAVINGS_WANTED');
      }
      else {
        // Looks like someone's already assigned their accounts. Move on.
        this.linkAccountState = 'FINISHED';
        return null;
      }
    }).catch(err => {
      loading && loading.dismiss();
      console.error(err);
      return null;
    });
  }
  private loadWorkspace(action: GoalAction, foreground = false) {
    this.workspacePath = action.workspacePath();
    // Get workspace based on action. For linking accounts, the workspace 
    // is supposed to be a GET-based workspace. 
    if (foreground) {
      var loading = this.loadingCtrl.create({ content: 'Retrieving accounts' });
      loading.present(); 
    }
    this.goalService.getWorkspace(this.workspacePath).then((workspace: AccountRelatedGoalWorkspace) => {
      this.workspace = workspace;
      this.loadAccounts(workspace.accounts); 
      this.linkAccountState = 'READY';
      loading && loading.dismiss();
    }).catch(err => {
      console.error(err);
      loading && loading.dismiss();
    });
  }
  private loadAccounts(accounts?: Account[]) {
    if (!accounts) {
      // TODO: Load accounts from, say, accountService
    }
    // Assign all known savings accounts
    this.accounts = accounts;
    // Also give the option to provide a new savings account
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