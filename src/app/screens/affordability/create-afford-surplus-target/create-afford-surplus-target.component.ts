import { Component } from '@angular/core';
import { NavParams, NavController, AlertController, LoadingController, ToastController, Events } from 'ionic-angular';

import { CreateAffordabilitySurplusLimitsComponent } from '../create-afford-surplus-limits/create-afford-surplus-limits.component';
import { CreateAffordabilitySurplusDeclineComponent } from '../create-afford-surplus-decline/create-afford-surplus-decline.component';
import { AffordabilityUtils } from '../shared/affordability-utils';
import { AffordabilityCalculation } from '../shared/affordability-calc';
import { GoalAction } from '../../goal-centre/shared/goal-action.model';
import { AffordabilityRelatedGoalWorkspace } from '../../goal-workspace/shared/goal-workspace-afford.model';
import { Property } from '../../property-centre/shared/property.model';
import { GoalService } from '../../../core/services/goal/goal.service';
import { GoalActionCollection } from '../../../core/data/goal/goal-maps';
import { WorkspaceSubmissionResponse } from '../../../core/data/goal/goal-response';

const ACTION_NAME = 'REAL_ESTATE_MONTHLY_SURPLUS';

@Component({
  selector: 'create-afford-surplus-target',
  templateUrl: 'create-afford-surplus-target.component.html',
  host: {
    class: 'create-afford-surplus-target'
  }
})
export class CreateAffordabilitySurplusTargetComponent {
  action: GoalAction;
  workspace: AffordabilityRelatedGoalWorkspace;
  workspacePath: string;          // Exact typing doesn't matter here
  targetProperty: Property;
  timePeriod: 'YEARLY' | 'MONTHLY' | 'WEEKLY';      // Todo: Merge with TimeScaleType
  calculator: AffordabilityCalculation;
  surplusTargetAmountMonthly: number;            // The annual figure
  timeToAffordability: number; 
  sliderRangeLower: number;
  sliderRangeUpper: number;
  sliderStep: number;
  screens = {
    limits: CreateAffordabilitySurplusLimitsComponent,
    decline: CreateAffordabilitySurplusDeclineComponent
  };
  showWorkspaceLoading: boolean;
  showLoadingError: boolean;
  showSliderBased: boolean;
  constructor(
    protected params: NavParams,
    protected navCtrl: NavController,
    protected alertCtrl: AlertController,
    protected loadingCtrl: LoadingController,
    protected toastCtrl: ToastController,
    protected events: Events,
    protected goalService: GoalService
  ) {}
  ionViewWillLoad() {
    this.showSliderBased = true;      // By default, show the slider based way.
    this.timePeriod = 'MONTHLY';
  }
  ionViewDidLoad() {
    this.loadWorkspace(true);
  }
  recalculateSliderLabels() {
    this.sliderStep = 1;  
    this.sliderRangeLower = this.calculator.SLIDER_LOWER_DEFAULT_MONTHS;
    this.sliderRangeUpper = this.calculator.SLIDER_UPPER_DEFAULT_MONTHS;
    // this.sliderRangeLower = this.getSliderRangeLower();
    // this.sliderRangeUpper = this.getSliderRangeUpper();
  }
  recalculateAffordability() {
    // this.timeToAffordability = this.calculator.calculateTimeToAffordability(this.surplusTargetAmountDisplay);
    let calc = this.calculator;
    switch(this.timePeriod) {
      case 'WEEKLY':
        this.surplusTargetAmountMonthly = this.calculator.calculateFromDeposit(this.timeToAffordability / 4.35);
        return;
      case 'MONTHLY':
        this.surplusTargetAmountMonthly = this.calculator.calculateFromDeposit(this.timeToAffordability);
        return;
      case 'YEARLY':
      default:
        this.surplusTargetAmountMonthly = this.calculator.calculateFromDeposit(this.timeToAffordability * 12);
        return;
    }
  }
  submit(foreground = false) {
    this.recalculateSliderLabels();
    let payload = this.workspace.getPayload({
      // actionKeyName: 'REAL_ESTATE_TARGET_YEARLY_SURPLUS',
      actionKeyName: 'REAL_ESTATE_TARGET_MONTHLY_SURPLUS',
      amount: this.surplusTargetAmountMonthly
    });
    if (foreground) {
      var loading = this.loadingCtrl.create({ content: 'Setting surplus target', spinner: 'crescent' });
      loading.present();
    }
    let resultantWorkspace: AffordabilityRelatedGoalWorkspace;
    // let interceptNewWorkspace = (body: WorkspaceSubmissionResponse): boolean => {
    //   return !!this.workspace;
    // };
    this.goalService.submitWorkspaceSetting(this.workspacePath, payload).then(stateChange => {
      if (stateChange.success) {
        this.events.publish('afford:surplusCompleted', resultantWorkspace || this.workspace);
        // Retrieve the new workspace, bind here, and send it forward to Limits screen
        if (stateChange.data && stateChange.data.response) {
          let stateChangeData: WorkspaceSubmissionResponse = stateChange.data.response;
          this.workspace = AffordabilityRelatedGoalWorkspace.createFromResponse(stateChangeData.workspace);
          this.events.publish('afford:surplusUpdated', this.workspace);
        }
        this.next();
        loading && loading.dismiss();
        this.toastCtrl.create({ 
          message: 'Surplus target saved', 
          duration: 2000,
          position: 'top'
        }).present();
      }
      else {
        throw new Error('State change failed');
      }
    }).catch(err => {
      console.error(err);
      loading && loading.dismiss();
      this.toastCtrl.create({ 
        message: 'Failed to save surplus target', 
        showCloseButton: true, 
        position: 'top' 
      }).present();
      // this.alertCtrl.create({ 
      //   title: 'Saving error', 
      //   message: 'Sorry, we could not save your target.',
      //   buttons: [
      //     { text: 'Cancel', role: 'cancel' },
      //     { text: 'Try again', handler: () => console.log('Stub for try again...') }
      //   ] 
      // }).present();
    });
  }
  private next() {
    // let surplusLimitParams: AffordabilityUtils.SurplusLimitParams = { 
    //   surplusTarget: this.surplusTargetAmountMonthly,
    //   surplusActual: this.workspace.spendingLimitCurrentSavings,
    //   surplusRemaining: this.workspace.spendingLimitSavingsRequired
    // };
    this.navCtrl.push(this.screens['limits'], { action: this.action, workspace: this.workspace });
  }
  /** Deprecated */
  private nextIfUnaffordable() {
    this.navCtrl.push(this.screens['decline'], { workspace: this.workspace }, { animate: false });
  }
  /**
   * Returns a lower bound calculated from estimated and targetd monthly surplus.
   * @deprecated
   * @private
   * @returns {number} 
   * @memberof CreateAffordabilitySurplusTargetComponent
   */
  private getSliderRangeLower(): number {
    if (this.calculator) {
      // let estimateBase = this.calculator.calculateDeposit(this.workspace.lastMonthActualSurplus);
      // let estimateMultiplier = 0.4;
      // if (estimateBase < SLIDER_LOWER_MIN_MONTHS) {
        // return SLIDER_LOWER_MIN_MONTHS;
      // }
      switch(this.timePeriod) {
        case 'WEEKLY':
          return this.calculator.SLIDER_LOWER_DEFAULT_MONTHS * 4;
          // return this.calculator.calculateDeposit(estimateBase * estimateMultiplier / 4.35);
        case 'YEARLY':
          return (this.calculator.SLIDER_LOWER_DEFAULT_MONTHS / 12);
          // return this.calculator.calculateDeposit(estimateBase * estimateMultiplier * 12);
        case 'MONTHLY':
        default:
          return this.calculator.SLIDER_LOWER_DEFAULT_MONTHS;
          // return this.calculator.calculateDeposit(estimateBase * estimateMultiplier);
      }
    }
    return 0;    // A sensible default?
  }
  /**
   * Returns an upper bound calculated from estimated and targetd monthly surplus.
   * @deprecated
   * @private
   * @returns {number} 
   * @memberof CreateAffordabilitySurplusTargetComponent
   */
  private getSliderRangeUpper(): number {
    if (this.calculator) {
      // let estimateBase = Math.max(this.workspace.thisMonthProjectedSurplus, this.workspace.lastMonthActualSurplus, 0);
      // let estimateMultiplier = 2.2;
      // if (estimateBase * estimateMultiplier < SLIDER_UPPER_MIN_MONTHS) {
      //   return SLIDER_UPPER_MIN_MONTHS;
      // }
      switch(this.timePeriod) {
        case 'WEEKLY':
          return this.calculator.SLIDER_UPPER_DEFAULT_MONTHS * 4.35;
          // return this.calculator.calculateDeposit(estimateBase * estimateMultiplier / 4.35);
        case 'YEARLY':
          return this.calculator.SLIDER_UPPER_DEFAULT_MONTHS / 12;
          // return this.calculator.calculateDeposit(estimateBase * estimateMultiplier * 12);
        case 'MONTHLY':
        default:
          return this.calculator.SLIDER_UPPER_DEFAULT_MONTHS;
          // return this.calculator.calculateDeposit(estimateBase * estimateMultiplier);
      }
    }
    return 0;    // A sensible default?
  }
  private loadWorkspace(foreground = false): Promise<boolean> {
    this.showLoadingError = false;
    this.showWorkspaceLoading = true;
    /* Note: workspace path doesn't seem to be set from the prev screen. Therefore, always re-retrieve the workspace */
    // let params: AffordabilityUtils.SurplusTargetParams = this.params.get('surplusTargetParams');
    // this.workspacePath = params.workspacePath;
    // let retrieveWorkspace = params.workspace 
    //   ? Promise.resolve(params.workspace)
    //   : this.goalService.getGoalActions('REAL_ESTATE').then(actionCollection => {
    //     this.action = actionCollection.actions.find(ac => ac.name === ACTION_NAME);
    //     // this.loadWorkspace(this.action, foreground);
    //     this.workspacePath = this.action.workspacePath();
    //     let workspaceInitializer = AffordabilityRelatedGoalWorkspace.createFromResponse;
    //     return this.goalService.getWorkspace(this.workspacePath, workspaceInitializer)
    //   });
    return this.goalService.getGoalActions('REAL_ESTATE').then(actionCollection => {
      this.action = actionCollection.actions.find(ac => ac.name === ACTION_NAME);
      // this.loadWorkspace(this.action, foreground);
      this.workspacePath = this.action.workspacePath();
      let workspaceInitializer = AffordabilityRelatedGoalWorkspace.createFromResponse;
      return this.goalService.getWorkspace(this.workspacePath, workspaceInitializer)
    }).then((workspace: AffordabilityRelatedGoalWorkspace) => {
      this.workspace = workspace;
      this.showWorkspaceLoading = false;
      let params: AffordabilityUtils.SurplusTargetParams = this.params.get('surplusTargetParams');
      if (params && params.targetProperty) {
        this.targetProperty = new Property(params.targetProperty);
        this.calculator = new AffordabilityCalculation(this.targetProperty, workspace);
        this.setSliderDefaults();
      }
      else {
        throw new Error('Surplus Target Params not provided');
      }
      return true;
    }).catch(err => {
      console.error(err);
      this.showWorkspaceLoading = false;
      this.showLoadingError = true;
      return false;
    });
  }
  private setSliderDefaults() {
    if (this.workspace) {
      // Max allowable limits are between 2 months
      // They might already have a target monthly surplus
      if (this.workspace.targetMonthlySurplus) {
        this.surplusTargetAmountMonthly = this.workspace.targetMonthlySurplus;
        this.timeToAffordability = this.calculator.calculateFromDeposit(this.surplusTargetAmountMonthly);
      }
      else {
        this.timeToAffordability = (this.calculator.SLIDER_LOWER_DEFAULT_MONTHS + this.calculator.SLIDER_UPPER_DEFAULT_MONTHS) / 2;
      }
      this.recalculateSliderLabels();
      this.recalculateAffordability();
      console.log(`Default calculated TTA is: ${this.timeToAffordability}`);
      console.log(`Default lower is: ${this.calculator.SLIDER_LOWER_DEFAULT_MONTHS}`);
      console.log(`Default upper is: ${this.calculator.SLIDER_UPPER_DEFAULT_MONTHS}`);
    }
  }
}