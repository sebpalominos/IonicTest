import { Component } from '@angular/core';
import { NavParams, NavController, ViewController, ActionSheetController, AlertController, 
         LoadingController, Events } from 'ionic-angular';

import { CreateAffordabilityCompleteComponent } from '../create-afford-complete/create-afford-complete.component';
import { CreateAffordabilityIntroComponent } from '../create-afford-intro/create-afford-intro.component';
import { CreateAffordabilityPropertyComponent } from '../create-afford-property/create-afford-property.component';
import { CreateAffordabilityMortgageComponent } from '../create-afford-mortgage/create-afford-mortgage.component';
import { CreateAffordabilitySurplusTargetComponent } from '../create-afford-surplus-target/create-afford-surplus-target.component';
import { AffordabilityUtils } from '../shared/affordability-utils';
import { MortgageAccount } from '../shared/mortgage-account.model';
import { AffordabilityCalculation } from '../shared/affordability-calc';
import { Account } from '../../accounts/shared/account.model';
import { AffordabilityRelatedGoalWorkspace } from '../../goal-workspace/shared/goal-workspace-afford.model';
import { Property } from '../../property-centre/shared/property.model';
import { PropertySearchSummary } from '../../property-centre/shared/property-search.model';
import { AccountService } from '../../../core/services/account/account.service';
import { PropertyService } from '../../../core/services/property/property.service';
import { GoalService } from '../../../core/services/goal/goal.service';

type AffordabilityActionStatus = {
  label: string;
  checkComplete: () => boolean;
}

/**
 * The central screen for the affordability goal creation flow.
 * @export
 * @class CreateAffordabilityHubComponent
 */
@Component({
  selector: 'create-afford-hub',
  templateUrl: 'create-afford-hub.component.html',
  host: {
    class: 'create-afford create-afford-hub'
  }
})
export class CreateAffordabilityHubComponent {
  existingPropertySummary: PropertySearchSummary;
  targetPropertySummary: PropertySearchSummary;
  targetProperty?: Property;
  existingProperty?: Property;
  mortgage: MortgageAccount;
  interimExistingProperty: PropertySearchSummary;
  interimTargetProperty: PropertySearchSummary;
  interimMortgage: MortgageAccount;
  surplus: AffordabilityRelatedGoalWorkspace;
  submitButtonText: string;
  statuses: AffordabilityActionStatus[];
  calculator: AffordabilityCalculation;
  isExistingPropertyFolded: boolean;      // Folded=true when Target property only.
  screens = {
    existing: CreateAffordabilityIntroComponent,
    property: CreateAffordabilityPropertyComponent,
    mortgage: CreateAffordabilityMortgageComponent,
    surplus: CreateAffordabilitySurplusTargetComponent,
    complete: CreateAffordabilityCompleteComponent
  };
  constructor(
    protected params: NavParams,
    protected navCtrl: NavController,
    protected viewCtrl: ViewController,
    protected actionSheetCtrl: ActionSheetController,
    protected loadingCtrl: LoadingController,
    protected alertCtrl: AlertController,
    protected events: Events,
    protected accountService: AccountService,
    protected goalService: GoalService,
    protected propertyService: PropertyService
  ) {}
  ionViewWillLoad() {
    this.subscribeToEvents();
    this.statuses = [
      { label: 'Existing property', checkComplete: () => !!this.existingPropertySummary },
      { label: 'Target property', checkComplete: () => !!this.targetPropertySummary },
      { label: 'Surplus Target', checkComplete: () => !!this.surplus },
    ];
  }
  ionViewDidLoad() {
    this.loadParams();
    this.routeInitialScreen();
  }
  close() {
    // Display actionsheet to close before saving etc
    let actionSheet = this.actionSheetCtrl.create({ 
      buttons: [
        { text: 'Cancel', role: 'cancel' }, 
        { text: 'Discard', role: 'destructive', handler: () => {
          actionSheet.dismiss().then(() => {
            this.navCtrl.parent.getActive().dismiss();
          });
          return false;
        }}, 
        { text: 'Save and close', handler: () => { 
          actionSheet.dismiss().then(() => {
            this.navCtrl.parent.getActive().dismiss();
          });
          return false;
        }}
      ]
    });
    actionSheet.present();
  }
  checkAffordabilitySetupComplete(): boolean {
    return !!(this.targetPropertySummary && this.surplus);
  }
  continue() {
    this.navCtrl.push(this.screens['complete']);
  }
  changeExistingProperty() {
    // If changing existing property, let the user select based on an actionsheet
    let actionSheet = this.actionSheetCtrl.create({ title: 'Existing property actions' });
    if (!this.isExistingPropertyFolded) {
      actionSheet.addButton({
        text: 'Remove existing property',
        role: 'destructive',
        handler: () => {
          this.events.publish('afford:existingPropertySelectNone');
        }
      });
    }
    actionSheet.addButton({
      text: 'Without mortgage',
      handler: () => {
        actionSheet.dismiss().then(() => {
          this.navCtrl.push(this.screens['property'], { selectionType: AffordabilityUtils.SelectionType.EXISTING_PROPERTY_ONLY });
        });
        return false;
      }
    });
    actionSheet.addButton({
      text: 'With mortgage',
      handler: () => {
        actionSheet.dismiss().then(() => {
          this.navCtrl.push(this.screens['property'], { selectionType: AffordabilityUtils.SelectionType.EXISTING_PROPERTY_MORTGAGE });
        });
        return false;
      }
    });
    actionSheet.addButton({
      text: 'Cancel',
      role: 'cancel'
    });
    actionSheet.present();
    // this.navCtrl.push(this.screens['existing'], { existingProperty: this.existingPropertySummary });
  }
  changeTargetProperty() {
    this.navCtrl.push(this.screens['property'], { selectionType: AffordabilityUtils.SelectionType.TARGET_PROPERTY });
  }
  changeSurplus() {
    // Check that target property has been set first, if not, then don't.
    if (this.targetPropertySummary) {
      // Always retrieve a full targetProperty to send into surplus screen. We need the price...     
      if (this.targetProperty) {
        let surplusTargetParams: AffordabilityUtils.SurplusTargetParams = {
          workspace: this.surplus,
          targetProperty: this.targetProperty
        };
        this.navCtrl.push(this.screens['surplus'], { surplusTargetParams });
      }
      else {
        this.alertCtrl.create({
          title: 'Target property error',
          message: `We couldn't load information for your target property.`,
          buttons: [ 'OK' ]
        }).present();
      }
    }
    else {
      this.alertCtrl.create({
        title: 'Requires a target property',
        message: `Please set a target property before setting your affordability plan.`,
        buttons: [ 'OK' ]
      }).present();
    }
  }
  private routeInitialScreen() {
    if (this.params.get('deepLinkParams')) {
      let deepLinkParams: AffordabilityUtils.DeepLinkParams = this.params.get('deepLinkParams');
      // This flag prompts Hub to fast-forward to the Select Existing screen
      if (deepLinkParams.isInitial) {
        this.navCtrl.push(this.screens['existing'], { isInitial: true }, { animate: false });
      }
      else if (deepLinkParams.hasMortgage && deepLinkParams.isInitial && this.existingPropertySummary) {
        // Note: You must have already run loadPresets() in order to set this.existingProperty
        this.navCtrl.push(this.screens['mortgage'], { propertyId: this.existingPropertySummary.id }, { animate: false });
      }
    }
  }
  private loadParams() {
    if (this.params.get('deepLinkParams')) {
      let deepLinkParams: AffordabilityUtils.DeepLinkParams = this.params.get('deepLinkParams');
      // Load preset Target Property summary or from full
      if (deepLinkParams.targetPropertySummary) {
        this.targetPropertySummary = new PropertySearchSummary(deepLinkParams.targetProperty);
        this.propertyService.getProperty(this.targetPropertySummary.id).then(property => {
          this.targetProperty = property;
        });
      }
      else if (deepLinkParams.targetProperty) {
        let fullProperty = new Property(deepLinkParams.targetProperty);
        this.targetProperty = fullProperty;
        this.targetPropertySummary = PropertySearchSummary.createFromProperty(fullProperty);
      }
      // Load preset Existing Property summary or from full
      if (deepLinkParams.existingPropertySummary) {
        this.existingPropertySummary = new PropertySearchSummary(deepLinkParams.existingPropertySummary);
        this.propertyService.getProperty(this.existingPropertySummary.id).then(property => {
          this.existingProperty = property;
        });
      }
      else if (deepLinkParams.existingProperty) {
        let fullProperty = new Property(deepLinkParams.existingProperty);
        this.existingProperty = fullProperty;
        this.existingPropertySummary = PropertySearchSummary.createFromProperty(fullProperty);
      }
      else if (deepLinkParams.targetPropertySummary || deepLinkParams.targetProperty) {
        // This is a scenario that had no existing property but had a target property
        // Fold the existing property bar
        this.isExistingPropertyFolded = true;
      }
      // Load surplus info 
      if (deepLinkParams.surplusTarget) {
        this.surplus = deepLinkParams.surplusTarget;
      }
    }
  }
  private subscribeToEvents() {
    // Subscribe to the following things happening: 
    // 1) Mortgage selected
    // 2) Existing property selected
    // 3) Target property selected
    // 4) Surplus nominated
    this.events.subscribe('afford:mortgageSelected', (account: MortgageAccount) => {
      this.mortgage = account;
      this.interimMortgage = null;
    });
    this.events.subscribe('afford:existingPropertySelected', (property: Property) => {
      this.existingProperty = property;
      this.existingPropertySummary = PropertySearchSummary.createFromProperty(property);
      this.interimExistingProperty = null;
    });
    this.events.subscribe('afford:existingPropertySelectNone', () => {
      this.existingProperty = null;
      this.existingPropertySummary = null;
      this.mortgage = null;
      this.interimExistingProperty = null;
      this.interimMortgage = null;
      this.isExistingPropertyFolded = true;
    });
    this.events.subscribe('afford:targetPropertySelected', (property: Property) => {
      this.targetProperty = property;
      this.targetPropertySummary = PropertySearchSummary.createFromProperty(property);
      this.interimTargetProperty = null;
    });
    this.events.subscribe('afford:targetPropertySelectNone', () => {
      this.targetProperty = null;
      this.targetPropertySummary = null;
      this.interimTargetProperty = null;
    });
    this.events.subscribe('afford:surplusCompleted', (surplus: AffordabilityRelatedGoalWorkspace) => {
      this.surplus = surplus;
    });
    this.events.subscribe('afford:interimExistingPropertySelected', (property: Property) => {
      this.interimExistingProperty = PropertySearchSummary.createFromProperty(property);
      this.interimMortgage = null;
    });
    this.events.subscribe('afford:interimTargetPropertySelected', (property: Property) => {
      this.interimTargetProperty = PropertySearchSummary.createFromProperty(property);
    });
    this.events.subscribe('afford:interimMortgageSelected', (account: MortgageAccount) => {
      this.interimMortgage = account;
    });
    this.events.subscribe('afford:surplusUpdated', (workspace: AffordabilityRelatedGoalWorkspace) => {
      this.surplus = workspace;
    });
  }
  /**
   * Returns the ratio of current savings versus the required savings. Current savings 
   * are calculated from the gains of spending limits.
   * @private
   * @returns {number}
   * @memberof CreateAffordabilityHubComponent
   */
  private getSavingsProgressRatio(): number {
    return this.surplus ? this.surplus.spendingLimitCurrentSavings / this.surplus.spendingLimitSavingsRequired : null;
  }
  /**
   * Return a color classname that represents the current savings progress
   * @private
   * @returns {string} 
   * @memberof CreateAffordabilityHubComponent
   */
  private getSavingsProgressColor(): string {
    return this.surplus ? AffordabilityUtils.getStatusNameByCompletion(this.getSavingsProgressRatio()) : 'gray';
  }
}