import { Component } from '@angular/core';
import { NavParams, NavController, AlertController } from 'ionic-angular';

import { CreateAffordabilitySurplusHelpComponent } from '../create-afford-surplus-help/create-afford-surplus-help.component';
import { GoalAction } from '../../goal-centre/shared/goal-action.model';
import { AffordabilityRelatedGoalWorkspace } from '../../goal-workspace/shared/goal-workspace-afford.model';
import { AffordabilityUtils } from '../shared/affordability-utils';
import { GoalService } from '../../../core/services/goal/goal.service';
import { GoalActionCollection } from '../../../core/data/goal/goal-maps';

const ACTION_NAME = 'REAL_ESTATE_YEARLY_SURPLUS';

@Component({
  selector: 'create-afford-surplus-limits',
  templateUrl: 'create-afford-surplus-limits.component.html',
  host: {
    class: 'create-afford create-afford-surplus-limits'
  }
})
export class CreateAffordabilitySurplusLimitsComponent {
  workspace: AffordabilityRelatedGoalWorkspace;
  workspacePath: string;          // Exact typing doesn't matter here
  goalTypeIdentifier: string;       // Exact typing doesn't matter here
  savingsActual: number;      // What kind of surplus they're on now. i.e. CurrentSavings from API
  savingsRequired: number;     // Savings required   
  surplusTarget: number;      // What you said in the last screen...
  progressPercent: number;    // out of 100
  showWorkspaceLoaded: boolean;
  screens = {
    help: CreateAffordabilitySurplusHelpComponent
  };
  // displayAmounts: { [] };
  constructor(
    protected params: NavParams,
    protected navCtrl: NavController,
    protected goalService: GoalService
  ) {}
  ionViewWillLoad() {
    this.progressPercent = 0;
    this.loadParams();
    this.loadAll().then(() => {
      this.refreshSurplusDisplay();
    });
  }
  continue() {
    this.navCtrl.popToRoot({ direction: 'forward', animate: true });
  }
  skip() {
    this.navCtrl.popToRoot({ direction: 'forward', animate: true });
  }
  refreshSurplusDisplay(workspace?: AffordabilityRelatedGoalWorkspace) {
    this.workspace = workspace || this.workspace;
    if (this.workspace) {
      // Refresh all values from loaded workspace
      this.surplusTarget = this.workspace.targetMonthlySurplus;
      this.savingsActual = this.workspace.spendingLimitCurrentSavings;
      this.savingsRequired = this.workspace.spendingLimitSavingsRequired;
      // console.log(this.workspace);
      this.progressPercent = Math.min(Math.ceil(this.savingsActual / this.savingsRequired * 100), 100);
      // console.log(`Progress percent ${this.progressPercent}`);
    }
  }
  hasReachedSurplusTarget(): boolean {
    return this.savingsActual >= this.savingsRequired;
  }
  private progressStatusColor() {
    return AffordabilityUtils.getStatusNameByCompletion(this.savingsActual / this.savingsRequired);
  }
  private loadAll(): Promise<boolean> {
    return this.retrieveAction().then(action => {
      let workspacePath = action.workspacePath();
      this.goalTypeIdentifier = action.goalTypeIdentifier;
      this.workspacePath = workspacePath;
      return this.retrieveWorkspace(workspacePath);
    }).then(workspace => {
      this.workspace = workspace;
      this.showWorkspaceLoaded = true;
      return true;
    }).catch(err => {
      return false;
    });
  }
  private retrieveAction(): Promise<GoalAction> {
    if (this.params.get('action')) {
      return Promise.resolve(this.params.get('action'));
    }
    return this.goalService.getGoalActions('REAL_ESTATE').then(actionCollection => {
      return actionCollection.actions.find(ac => ac.name === ACTION_NAME);
    });
  }
  private retrieveWorkspace(workspacePath?: string): Promise<AffordabilityRelatedGoalWorkspace> {
    if (this.params.get('workspace')) {
      return Promise.resolve(this.params.get('workspace'));
    }
    let workspaceInitializer = AffordabilityRelatedGoalWorkspace.createFromResponse;
    return this.goalService.getWorkspace(this.workspacePath, workspaceInitializer);
  }
  private loadParams() {
    let params: AffordabilityUtils.SurplusLimitParams = this.params.get('surplusLimitParams');
    if (params) {
      this.surplusTarget = params.surplusTarget;
      // this.surplusActual = params.surplusActual;
      // this.surplusRemaining = params.surplusRemaining;
    }
    else {
      console.warn('Surplus Limits: param for surplus target was not set');
    }
  }
}