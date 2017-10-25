import { Component } from '@angular/core';
import { NavParams, NavController, AlertController, ToastController, Events } from 'ionic-angular';

import { SavingsRelatedGoalWorkspace } from '../shared/goal-workspace-savings.model';
import { SpendingCategoryInfo } from '../shared/goal-workspace-data-maps';
import { WorkspaceSubmissionResponse } from '../../../core/data/goal/goal-response';
import { GoalService } from '../../../core/services/goal/goal.service';

@Component({
  selector: 'scr-edit-spending-category',
  templateUrl: 'edit-spending-category.component.html'
})
export class EditSpendingCategoryComponent {
  workspace: SavingsRelatedGoalWorkspace;
  workspacePath: string|string[];
  spendingCategory: SpendingCategoryInfo;
  targetSummaryResponse: any;
  sliderRangeLower: number;
  sliderRangeUpper: number;
  showSliderBased: boolean;
  showLoading: boolean;
  constructor(
    protected params: NavParams,
    protected navCtrl: NavController,
    protected alertCtrl: AlertController,
    protected toastCtrl: ToastController,
    protected events: Events,
    protected goalService: GoalService
  ) {}
  ionViewWillLoad() {
    this.loadWorkspace();
    this.loadSpendingCategory();
  }
  setSpendLimit() {
    if (!this.workspacePath) {
      console.error('Cannot submit – workspace path is not available.');
      return displayErrorMessages.call(this);
    }
    // Check for the existence of a category ID within targetSummaryResponse; this has been found to 
    // severely annoy the API endpoint.
    if (!(this.targetSummaryResponse && this.targetSummaryResponse.category)) {
      console.error('Cannot submit – workspace path is not available.');      
      return displayErrorMessages.call(this);
    }
    let sc = this.spendingCategory;
    // let originalLimit = sc.spendingLimit;    // Need to null check
    let newSpendLimit = sc.limit; // || originalLimit.limitValue;
    let previousSpendLimit = this.spendingCategory.initialLimit || 0;
    let newNarrative = sc.narrative;    // || originalLimit.narrative;
    let targetSummary = Object.assign({}, this.targetSummaryResponse, {
      // category: sc.id,
      // categoryTypeString: sc.spendingArea.type,
      previousAmount: previousSpendLimit,
      currentAmount: newSpendLimit,
      narrative: newNarrative
      // originalAmount: 0,      // I have no idea how to retrieve this from current information
    });
    let payload = this.workspace.getPayload({ targetSummary });
    this.events.publish('goal:setSpendingLimitStarted', this.spendingCategory.id, newSpendLimit, newNarrative);
    this.navCtrl.pop();
    this.goalService.submitWorkspaceSetting(this.workspacePath, payload).then(stateChange => {
      if (stateChange.success) {
        this.events.publish('goal:setSpendingLimitSuccess', this.spendingCategory.id, newSpendLimit, newNarrative);
        if (stateChange.data && stateChange.data.response) {
          // let stateChangeData: WorkspaceSubmissionResponse = stateChange.data.response;
          this.events.publish('goal:setSpendingLimitResponse', stateChange.data.response);
        }
        this.toastCtrl.create({ 
          message: 'Spending limit created', 
          duration: 2000,
          position: 'top'
        }).present();
      }
      else {
        this.events.publish('goal:setSpendingLimitFailed', this.spendingCategory.id, newSpendLimit, newNarrative);
        displayErrorMessages.call(this);
      }
    }).catch(err => {
      console.error(err);
      displayErrorMessages.call(this);
    });
    function displayErrorMessages() {
      let toast = this.toastCtrl.create({ 
        message: 'Spending limit failed', 
        showCloseButton: true,
        closeButtonText: 'Choose action',
        position: 'top'
      });
      toast.present();
      toast.onDidDismiss(() => {
        this.alertCtrl.create({ 
          title: 'Could not save', 
          message: 'An error occurred and we could not save your limit. (Work in progress - selecting OK will give you an option to go to the page again and retry)', 
          buttons: [ 'Cancel', 'OK' ] 
        }).present();
      });
    }
  }
  private setupSlider(isSliderByDefault = true) {
    this.showSliderBased = isSliderByDefault;
    let current = this.spendingCategory.spendingArea.currentValue;
    let projected = this.spendingCategory.spendingArea.projectedValue;
    if (this.spendingCategory.spendingLimit) {
      // Prefill with existing field values
      // this.spendingCategory.limit = this.spendingCategory.spendingLimit.limitValue || this.spendingCategory.spendingArea.projectedValue;
      let limit = this.spendingCategory.spendingLimit.limitValue || projected;
      this.spendingCategory.limit = limit;
      this.spendingCategory.initialLimit = limit;
      this.spendingCategory.narrative = this.spendingCategory.spendingLimit.narrative;
    }
    else {
      // For now let's expect current & projected to be fully populated
      this.spendingCategory.limit = projected;
      this.spendingCategory.initialLimit = projected;
    }
    this.sliderRangeLower = 0;
    this.sliderRangeUpper = projected * 1.6;      // Arbitrary multiplier. Todo: rethink
  }
  private loadWorkspace() {
    // Require that a workspace and workspacePath are provided
    if (this.params.get('workspace')) {
      this.workspace = this.params.get('workspace');
      this.workspacePath = this.params.get('workspacePath') || this.workspace.path;
      if (!this.workspacePath) {
        console.warn('Path not provided within workspace; will not be able to submit.');
      }
    }
    else {
      throw new Error('Workspace not found in params. A workspace must be provided.');
    }
  }
  private loadSpendingCategory() {
    if (this.params.get('spendingCategory')) {
      this.spendingCategory = this.params.get('spendingCategory');
      this.setupSlider();
      this.spendingCategory.isEditing = true;
      // Need to load `trackingLevel` object from the EXPENDITURE/flowcommentator endpoint
      this.showLoading = true;
      let path = this.spendingCategory.spendingArea.link.name;
      let payload = this.spendingCategory.spendingArea.link.body;
      this.goalService.getExpenditureGraphData(path, payload).then(graphData => {
        this.targetSummaryResponse = graphData && graphData._trackingLevelResponse;
        this.showLoading = false;
      }).catch(err => {
        this.showLoading = false;
        this.spendingCategory.isEditing = false;
        console.error(err);
      });
    }
    else {
      throw new Error('Spending Category not found in params. A spending category must be provided.');
    }
  }
}