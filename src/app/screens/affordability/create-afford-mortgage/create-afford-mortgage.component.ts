import { Component } from '@angular/core';
import { NavParams, NavController, ViewController, AlertController, ToastController, LoadingController, Events } from 'ionic-angular';

import { AffordabilityUtils } from '../shared/affordability-utils';
import { AffordabilityGoal } from '../shared/affordability-goal.model';
import { MortgageAccount } from '../shared/mortgage-account.model';
import { CreateAffordabilitySetMortgageDetailsComponent } from '../create-afford-set-mortgage-details/create-afford-set-mortgage-details.component';
import { PropertyRelatedGoalWorkspace } from '../../goal-workspace/shared/goal-workspace-property.model';
import { Property } from '../../property-centre/shared/property.model';
import { GoalService } from '../../../core/services/goal/goal.service';
import { PropertyService } from '../../../core/services/property/property.service';

@Component({
  selector: 'create-afford-mortgage',
  templateUrl: 'create-afford-mortgage.component.html',
  host: {
    class: 'create-afford-mortgage'
  }
})
export class CreateAffordabilityMortgageComponent {
  workspace: PropertyRelatedGoalWorkspace;
  workspacePath: string | string[];
  accounts: MortgageAccount[];
  selectedProperty: Property;
  selectedAccount: MortgageAccount;
  screens = {
    setMortgageDetails: CreateAffordabilitySetMortgageDetailsComponent
  };
  showWorkspaceLoading: boolean;
  showPropertyNotSelectedError: boolean;
  constructor(
    protected params: NavParams,
    protected navCtrl: NavController,
    protected viewCtrl: ViewController,
    protected alertCtrl: AlertController,
    protected toastCtrl: ToastController,
    protected loadingCtrl: LoadingController,
    protected events: Events,
    protected goalService: GoalService,
    protected propertyService: PropertyService
  ) {}
  ionViewWillLoad() {
    this.showWorkspaceLoading = true;
    this.retrieveWorkspace().then(workspace => {
      this.workspace = workspace;
      this.workspacePath = workspace.path;
      this.accounts = workspace.mortgageAccountList;
      if (this.accounts.length === 1) {
        this.selectedAccount = this.accounts[0];
      }
      this.showWorkspaceLoading = false;
    });
  }
  continue() {
    if (this.validate()) {
      this.submit();
    }
  }
  validate(): boolean {
    if (this.selectedAccount) {
      let mortgageAssociation = this.selectedAccount && this.selectedAccount._mortgageAccountResponse;
      if (!mortgageAssociation.interestRate || !mortgageAssociation.months) {
        this.navCtrl.push(this.screens['setMortgageDetails'], { mortgageAccount: this.selectedAccount }).then(() => {
          this.listenForMortgageAdjustment();
        });
        return false;
      }
      return true;
    }
    else {
      // Give an option to escape (i.e. skip)
      this.alertCtrl.create({ 
        title: 'No account selected',
        message: 'Select the mortgage account for your property.',
        buttons: [ 
          { text: 'OK' },
          { text: 'Skip', role: 'cancel', handler: this.skip }
        ]
      }).present();
      return false;
    }
  }
  submit(foreground = false) {
    this.events.publish('afford:interimMortgageSelected', this.selectedAccount);
    // this.events.publish('afford:interimExistingPropertySelected', this.selectedProperty);
    // let propertyAssociation = this.selectedProperty._propertyAssociationPayload;
    // let mortgageAssociation = this.selectedAccount && this.selectedAccount._mortgageAccountResponse;

    // BEGIN HACK OP1-220
    // If there was a property selection screen prior, then the price should have been set one way or another.
    // If property price is still null, then hack it to zero.
    // propertyAssociation.salePrice = propertyAssociation.salePrice || this.selectedProperty.currentValue || 0;
    // this.selectedAccount._mortgageAccountResponse.interestRate = 3.9;
    // this.selectedAccount._mortgageAccountResponse.months = 12 * 25;
    // END HACK

    // let payload = this.workspace.getPayload(propertyAssociation, mortgageAssociation);
    // this.goalService.submitWorkspaceSetting(this.workspacePath, payload).then(stateChange => {
    //   if (stateChange.success) {
    //     this.events.publish('afford:mortgageSelected', this.selectedAccount);
    //     this.events.publish('afford:existingPropertySelected', this.selectedProperty);
    //     this.toastCtrl.create({ 
    //       message: `Property and mortgage saved!`, 
    //       duration: 2000,
    //       position: 'top'
    //     }).present();
    //     return;
    //   }
    //   throw new Error('Could not save mortgage for property');
    // }).catch(err => {
    //   console.error(err);
    //   let toast = this.toastCtrl.create({ 
    //     message: `Could not assign mortgage to property`, 
    //     showCloseButton: true, 
    //     closeButtonText: 'Actions', 
    //     position: 'top'
    //   });
    //   toast.present();
    //   toast.onDidDismiss(() => {
    //     this.alertCtrl.create({ 
    //       title: 'Saving error', 
    //       message: `We couldn't assign your mortgage to this property. You could try this action again.`,
    //       buttons: [ 'OK' ]
    //     }).present();
    //   });
    // });
    if (this.navCtrl.isActive(this.viewCtrl)) {
      // Go to hub screen.
      this.navCtrl.popToRoot({ animate: true, direction: 'forward' });
    }
  }
  skip() {
    this.events.publish('afford:mortgageSkipped');
    this.navCtrl.popToRoot({ animate: true, direction: 'forward' });
  }
  private listenForPropertyAdjustment() {
    this.events.subscribe('afford:propertyPriceAdjusted', (property: Property) => {
      this.events.unsubscribe('afford:propertyPriceAdjusted');
      property._propertyAssociationPayload.userValuedPrice = {
        amount: property.userDefinedValue,
        currencyCode: 'AUD'
      };
      this.selectedProperty = property;
      // this.continue();    // Potentially stuck in a validation loop.
      this.submit();
    });
  }
  private listenForMortgageAdjustment() {
    this.events.subscribe('afford:mortgageDetailsAdjusted', (mortgageAccount: MortgageAccount) => {
      this.events.unsubscribe('afford:mortgageDetailsAdjusted');
      // Note: always expect _mortgageAccountResponse to be returned, because we would always provide this into the setMortgageDetails screen.
      mortgageAccount._mortgageAccountResponse.months = mortgageAccount.months;
      mortgageAccount._mortgageAccountResponse.interestRate = mortgageAccount.interestRate;
      this.selectedAccount = mortgageAccount;
      // this.continue();    // Potentially stuck in a validation loop.
      this.submit();
    });
  }
  private retrieveProperty(): Promise<Property> {
    if (this.params.get('property')) {
      return Promise.resolve(this.params.get('property'));
    }
    else if (this.params.get('propertyId')) {
      let id = this.params.get('propertyId');
      return this.propertyService.getProperty(id);
    }
    else {
      return Promise.resolve(undefined);
    }
  }
  private retrieveWorkspace(): Promise<PropertyRelatedGoalWorkspace> {
    if (this.params.get('workspace')) {
      return Promise.resolve(this.params.get('workspace'));
    }
    else {
      let workspacePath = this.params.get('workspacePath') || ['goals', 'workspace', 'REAL_ESTATE', 'REAL_ESTATE_OWNED'];
      let workspaceInitializer = PropertyRelatedGoalWorkspace.createFromResponse;
      return this.goalService.getWorkspace(workspacePath, workspaceInitializer).catch(err => {
        console.error(err);
      });
    }
  }
}