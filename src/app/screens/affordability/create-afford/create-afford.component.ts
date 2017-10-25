import { Component, ViewChild } from '@angular/core';
import { NavParams, NavController, LoadingController } from 'ionic-angular';

import { CreateAffordabilityIntroComponent } from '../create-afford-intro/create-afford-intro.component';
import { CreateAffordabilityHubComponent } from '../create-afford-hub/create-afford-hub.component';
import { CreateAffordabilityHubPlaceholderComponent } from '../create-afford-hub-placeholder/create-afford-hub-placeholder.component';
import { AffordabilityGoal } from '../shared/affordability-goal.model';
import { AffordabilityUtils } from '../shared/affordability-utils';
import { Property } from '../../property-centre/shared/property.model';
import { AffordabilityRelatedGoalWorkspace } from '../../goal-workspace/shared/goal-workspace-afford.model';
import { GoalService } from '../../../core/services/goal/goal.service';
import { PropertyService } from '../../../core/services/property/property.service';

@Component({
  selector: 'modal-create-afford',
  template: `
    <ion-nav #createAffordNav></ion-nav>
  `,
  host: {
    class: 'create-afford create-afford-landing'
  }
})
export class CreateAffordabilityComponent {
  @ViewChild('createAffordNav') navCtrl: NavController;
  deepLinkParams: AffordabilityUtils.DeepLinkParams;
  screens = {
    hub: CreateAffordabilityHubComponent,
    placeholder: CreateAffordabilityHubPlaceholderComponent
  };
  constructor(
    protected params: NavParams,
    protected loadingCtrl: LoadingController,
    protected goalService: GoalService,
    protected propertyService: PropertyService
  ) {}
  ngOnInit() {
    this.parsePresets();
    this.loadInitialScreen();
  }
  private parsePresets() {
    this.deepLinkParams = {};
    if (this.params.get('targetProperty')) {
      this.deepLinkParams.targetProperty = this.params.get('targetProperty');
    }
    if (this.params.get('existingProperty')) {
      this.deepLinkParams.existingProperty = this.params.get('existingProperty');
      // This might accompany an existingProperty declaration. If truthy, then 
      // launch into the select mortgage screen after starting. 
      if (this.params.get('withMortgage')) {
        this.deepLinkParams.hasMortgage = !!this.params.get('withMortgage');
      }
    }
  }
  private loadInitialScreen() {
    // Check if this is a resumption or not. If so, then go directly into 
    // the hub screen. Otherwise start at the Start screen.
    if (this.params.get('resume')) {
      if (this.loadResume()) {
        // Set to blank hub screen, while resume is taking place.
        this.navCtrl.setRoot(this.screens['placeholder']);
      }
    }
    else {
      this.deepLinkParams.isInitial = !(this.deepLinkParams.existingProperty || this.deepLinkParams.targetProperty);
      this.navCtrl.setRoot(this.screens['hub'], { deepLinkParams: this.deepLinkParams });
    }
  }
  /**
   * Load info required to resume the goal
   * @private
   * @returns {boolean} - If load was initiated or not.
   * @memberof CreateAffordabilityComponent
   */
  private loadResume(foreground = false): boolean {
    if (foreground) {
      var loading = this.loadingCtrl.create({ content: 'Resuming your goal', spinner: 'crescent', dismissOnPageChange: false });
      loading.present();
    }
    if (this.params.get('goal')) {
      let goal: AffordabilityGoal = this.params.get('goal');
      // Get property owned & target
      // TBC: Data returned in summary is not good enough yet.
      // let existingProperties = goal.summary.objectSummaries.find(summary => summary.label === 'real_estate_owned').existingProperties;
      // let targetProperty = goal.summary.objectSummaries.find(summary => summary.label === 'real_estate_targeted').targetProperty;
      // Get surplus
      let findGoalAction = actionName => goal.actions.find(action => action.completionRate !== 0 && action.name === actionName);
      let initializer = AffordabilityRelatedGoalWorkspace.createFromResponse; 
      // Existing properties
      let retrieveExistingProperties = goal.existingPropertyIds ? Promise.all(goal.existingPropertyIds.map(id => {
        return this.propertyService.getProperty(id);
      })) : Promise.resolve(null);
      // Target property
      let retrieveTargetProperty = goal.targetPropertyId ? this.propertyService.getProperty(goal.targetPropertyId) : Promise.resolve(null);
      // Mortgage accounts... flatten into one list
      let retrieveMortgageAccounts = Promise.resolve(Array.prototype.concat.apply([], goal.mortgageAccounts));
      // Surplus target
      let surplusTargetAction = findGoalAction('REAL_ESTATE_MONTHLY_SURPLUS');
      let retrieveSurplusTarget = surplusTargetAction ? this.goalService.getWorkspace(surplusTargetAction.workspacePath(), initializer) : Promise.resolve(null);
      Promise.all([
        retrieveExistingProperties,
        retrieveMortgageAccounts,
        retrieveTargetProperty,
        retrieveSurplusTarget,
      ]).then(responses => {
        let [ existingProperties, existingMortgages, targetProperty, surplusWorkspace ] = responses;
        let deepLinkParams = <AffordabilityUtils.DeepLinkParams>{ 
          existingProperty: existingProperties && existingProperties.length > 0 ? existingProperties[0] : null,      // TBC
          existingMortgage: existingMortgages && existingMortgages.length > 0 ?  existingMortgages[0] : null,
          targetProperty: targetProperty,      // TBC
          surplusTarget: surplusWorkspace
        };
        this.navCtrl.setRoot(this.screens['hub'], { deepLinkParams } );
        loading && loading.dismiss();
      }).catch(err => {
        console.error(err);
        loading && loading.dismiss();
      });
      return true;
    }
    else {
      return false;
    }      
  }
}