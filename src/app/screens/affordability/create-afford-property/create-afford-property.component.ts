import { Component } from '@angular/core';
import { NavParams, NavController, ViewController, ToastController, AlertController, LoadingController, Events } from 'ionic-angular';

import { CreateAffordabilityHubComponent } from '../create-afford-hub/create-afford-hub.component';
import { CreateAffordabilityMortgageComponent } from '../create-afford-mortgage/create-afford-mortgage.component';
import { CreateAffordabilityPropertySelectorComponent } from '../create-afford-property-selector/create-afford-property-selector.component';
import { CreateAffordabilitySetPropertyPriceComponent } from '../create-afford-set-property-price/create-afford-set-property-price.component';
import { AffordabilityUtils } from '../shared/affordability-utils';
import { AffordabilityGoal } from '../shared/affordability-goal.model';
import { MortgageAccount } from '../shared/mortgage-account.model';
import { PropertyRelatedGoalWorkspace } from '../../goal-workspace/shared/goal-workspace-property.model';
import { PropertyFavourite, FavouriteItemInfo } from '../../property-centre/shared/property-data-maps';
import { Property } from '../../property-centre/shared/property.model';
import { PropertySearchSummary } from '../../property-centre/shared/property-search.model';
import { GoalService } from '../../../core/services/goal/goal.service';
import { PropertyService } from '../../../core/services/property/property.service';

@Component({
  selector: 'create-afford-property',
  templateUrl: 'create-afford-property.component.html',
  host: {
    class: 'create-afford-property'
  }
})
export class CreateAffordabilityPropertyComponent {
  whichPropertyDescriptor: string;
  selectionType: AffordabilityUtils.SelectionType;
  workspace: PropertyRelatedGoalWorkspace;
  workspacePath: string[];
  existingProperty: Property;
  selectedProperty: Property;
  selectedAccount: MortgageAccount;
  // selectedAccount: MortgageAccount;
  favourites: FavouriteItemInfo[];
  showLoadingFavourites: boolean;
  workspaceRetrievalPromise: Promise<boolean>;
  screens: { [screenName: string]: any } = {
    hub: CreateAffordabilityHubComponent,
    mortgage: CreateAffordabilityMortgageComponent,
    selector: CreateAffordabilityPropertySelectorComponent,
    confirmPrice: CreateAffordabilitySetPropertyPriceComponent
  }; 
  showLoadingError: boolean;
  constructor(
    protected params: NavParams,
    protected navCtrl: NavController,
    protected viewCtrl: ViewController,
    protected toastCtrl: ToastController,
    protected alertCtrl: AlertController, 
    protected loadingCtrl: LoadingController,
    protected events: Events,
    protected goalService: GoalService,
    protected propertyService: PropertyService
  ) {}
  ionViewWillLoad() {
    this.existingProperty = this.params.get('existingProperty');
    this.selectionType = this.params.get('selectionType');
    switch (this.selectionType) {
      case AffordabilityUtils.SelectionType.EXISTING_PROPERTY_MORTGAGE:
      case AffordabilityUtils.SelectionType.EXISTING_PROPERTY_ONLY:
        this.whichPropertyDescriptor = 'existing';
        this.workspacePath = ['goals', 'workspace', 'REAL_ESTATE', 'REAL_ESTATE_OWNED'];
        break;
      case AffordabilityUtils.SelectionType.TARGET_PROPERTY:
      default:
        this.whichPropertyDescriptor = 'target';
        this.workspacePath = ['goals', 'workspace', 'REAL_ESTATE', 'REAL_ESTATE_TARGETED'];
        break;
    }
  }
  ionViewDidLoad() {
    this.workspaceRetrievalPromise = this.retrieveWorkspace().then((workspace: PropertyRelatedGoalWorkspace) => {
      this.workspace = workspace;
      /* if (this.workspace.mortgageAccountList) {
        // TESTING
        // Deliberately sabotage the accounts
        this.workspace.mortgageAccountList.map(account => {
          account.interestRate = null;
          account._mortgageAccountResponse.interestRate = null;
          return account;
        });
        // END TESTING
      } */
      return true;
    });
    this.loadFavourites(true);
  }
  invokePropertySearch() {
    switch (this.selectionType) {
      case AffordabilityUtils.SelectionType.EXISTING_PROPERTY_MORTGAGE:
        this.subscribeToMortgageAccountSelection();
    }
    this.subscribeToPropertySelection();    
    this.listenForPropertyAdjustment();
    this.navCtrl.push(this.screens['selector'], { selectionType: this.selectionType, workspace: this.workspace });
  }
  private selectProperty(property: Property) {
    this.selectedProperty = property;
    this.notifyPropertySelected(property, true);
    this.continue();
  }
  private continue() {
    if (this.validate()) {
      this.listenForPropertyAdjustment();
      this.workspaceRetrievalPromise.then(() => {
        switch (this.selectionType) {
          case AffordabilityUtils.SelectionType.EXISTING_PROPERTY_MORTGAGE:
            this.subscribeToMortgageAccountSelection();
            let endIndex = this.navCtrl.last().index + 1;
            return this.navCtrl.insertPages(endIndex, [
              { page: this.screens['mortgage'], params: { property: this.selectedProperty, workspace: this.workspace } },
              { page: this.screens['confirmPrice'], params: { property: this.selectedProperty, isFinal: false } }
            ]);
            // return this.navCtrl.push(this.screens['confirmPrice'], { property: this.property, workspace: this.workspace });
            // return this.navCtrl.push(this.screens['mortgage'], { property: this.property, workspace: this.workspace });
          default:
            // return this.navCtrl.pop({ direction: 'forward' });
            // return this.navCtrl.popToRoot({ animate: true, direction: 'forward' });
            return this.navCtrl.push(this.screens['confirmPrice'], { property: this.selectedProperty, isFinal: true });
        }
      });
    }
  }
  private nextSelectMortgage() {
    // Only advance if this is the active screen. Otherwise this could have 
    // been summoned as part of an event callback, in which case the event 
    // source component will deal with navigation.
    // this.subscribeToMortgageAccountSelection();
    if (this.navCtrl.isActive(this.viewCtrl)) {
      this.workspaceRetrievalPromise.then(() => {
        this.navCtrl.push(this.screens['mortgage'], { workspace: this.workspace, property: this.selectedProperty });
      });
    }
  }
  private validate(): boolean {
    if (!this.selectedProperty) {
      console.error('Affordability Property error: Submitted without any selected property.');
      return false;
    }
    let propertyAssociation = this.selectedProperty._propertyAssociationPayload;
    // let mortgageAssociation = this.selectedAccount && this.selectedAccount._mortgageAccountResponse;
    // this.events.publish('afford:interimExistingPropertySelected', this.selectedProperty);
    // this.notifyPropertySelected(this.selectedProperty, true);
    return true;
  }
  private submit(foreground = false) {
    let propertyAssociation = this.selectedProperty._propertyAssociationPayload;
    let mortgageAssociation = this.selectedAccount && this.selectedAccount._mortgageAccountResponse;
    // BEGIN HACK: If interestRate and/or months is null, then patch these with some kind of number
    // Issue OP1-220 
    // propertyAssociation.salePrice = propertyAssociation.salePrice || this.selectedProperty.currentValue || 0;
    // END HACK

    // Ensure that the workspace got loaded before submitting. 
    this.workspaceRetrievalPromise.then(() => {
      if (foreground) {
        // var loading = this.loadingCtrl.create({ content: 'Saving' });
        // loading.present();
      }
      // let payload = this.workspace.getPayload(propertyAssociation, mortgageAssociation);
      
      let payload = this.workspace.getPayload(propertyAssociation);
      if (mortgageAssociation) {
        payload = this.workspace.getPayload(propertyAssociation, mortgageAssociation);
      }
      this.goalService.submitWorkspaceSetting(this.workspacePath, payload).then(stateChange => {
        if (stateChange.success) {
          this.notifyPropertySelected(this.selectedProperty);
          if (mortgageAssociation) {
            this.events.publish('afford:mortgageSelected', this.selectedAccount);
          }
          this.toastCtrl.create({ 
            message: `Saved property selection`, 
            duration: 2000, 
            position: 'top'
          }).present();
          return;
        }
        throw new Error('Failed to save property');
      }).catch(err => {
        console.error(err);
        // loading && loading.dismiss();
        switch (this.selectionType) {
          case AffordabilityUtils.SelectionType.TARGET_PROPERTY:
            this.events.publish('afford:targetPropertySelectNone');
            break;
          case AffordabilityUtils.SelectionType.EXISTING_PROPERTY_MORTGAGE:
          case AffordabilityUtils.SelectionType.EXISTING_PROPERTY_ONLY:
          default:
            this.events.publish('afford:existingPropertySelectNone');
            break;
        }
        let toast = this.toastCtrl.create({ 
          message: `Failed to save selected property`, 
          showCloseButton: true, 
          closeButtonText: 'Actions', 
          position: 'top'
        });
        toast.present();
        toast.onDidDismiss(() => {
          this.alertCtrl.create({ 
            title: 'Saving error', 
            message: `We couldn't save your selected property.`,
            buttons: [
              { text: 'Ignore', role: 'cancel' },
              { text: 'Try again', handler: data => console.log('Try affordability property submission again: TBC') }
            ]
          }).present();
        });
      });
    });
    if (foreground) {
      // Only move page if foregrounded.
      this.navCtrl.popToRoot({ animate: true, direction: 'forward' });
    }
  }
  /**
   * @desc A subsequent property selector screen might be used to find the property; subscribe to that event
   * @memberof CreateAffordabilityPropertyComponent
   */
  private subscribeToPropertySelection() {
    this.events.subscribe('afford:interimAnyPropertySelected', (property: Property) => {
      this.unsubscribeFromPropertySelection();
      this.selectedProperty = property;
      // this.nextConfirmPrice();
    });
  }
  private unsubscribeFromPropertySelection() {
    this.events.unsubscribe('afford:interimAnyPropertySelected');
  }
  private subscribeToMortgageAccountSelection() {
    this.events.subscribe('afford:interimMortgageSelected', (account: MortgageAccount) => {
      this.unsubscribeFromMortgageAccountSelection();
      this.selectedAccount = account;
      // this.events.publish('afford:mortgageSelected', account);
      this.submit();
    });
    this.events.subscribe('afford:mortgageSkipped', () => {
      this.unsubscribeFromMortgageAccountSelection();
      this.submit();
    });
  }
  private unsubscribeFromMortgageAccountSelection() {
    this.events.unsubscribe('afford:interimMortgageSelected');
  }
  private notifyPropertySelected(property: Property, isInterim?: boolean) {
    // Publish based on either existing or target
    switch (this.selectionType) {
      case AffordabilityUtils.SelectionType.EXISTING_PROPERTY_MORTGAGE:
      case AffordabilityUtils.SelectionType.EXISTING_PROPERTY_ONLY:
        this.events.publish(isInterim ? 'afford:interimExistingPropertySelected' : 'afford:existingPropertySelected', property);
        break;
      case AffordabilityUtils.SelectionType.TARGET_PROPERTY:
        this.events.publish(isInterim ? 'afford:interimTargetPropertySelected' : 'afford:targetPropertySelected', property);
        break;
      default:
        break;
    }
  }
  private retrieveWorkspace(): Promise<PropertyRelatedGoalWorkspace> {
    let workspaceInitializer = PropertyRelatedGoalWorkspace.createFromResponse;
    return this.goalService.getWorkspace(this.workspacePath, workspaceInitializer);
  }
  /**
   * @desc Directly copied from PropertyShortlistComponent. Please remember to manually update... 
   * @private
   * @returns {boolean} - Whether or not any favourites exist
   * @memberof CreateAffordabilityPropertyComponent
   */
  private loadFavourites(foreground = false): Promise<boolean> {
    this.showLoadingFavourites = true;
    return this.propertyService.getFavourites().then((favourites: PropertyFavourite[]) => {
      if (favourites) {
        this.favourites = favourites.filter(fav => fav.propertyId).map(favourite => ({ 
          favourite: favourite,
          property: undefined, 
          summary: undefined 
        }));
        let loadingFavourites: Promise<any>[] = [];
        this.favourites.forEach((favInfo, index, arr) => {
          let loadingFavourite = this.propertyService.getProperty(favInfo.favourite.propertyId).then(property => {
            arr[index].property = property;
            arr[index].summary = PropertySearchSummary.createFromProperty(property);
          }).catch(err => console.error(err));
          loadingFavourites.push(loadingFavourite);
        });
        Promise.all(loadingFavourites).then(() => {
          this.showLoadingFavourites = false;
        });
        return true;
      }
      else {
        this.showLoadingFavourites = false;
        return false;
      }
    }).catch(err => {
      this.showLoadingFavourites = false;
      console.error(err);
      return false;
    });
  }
  private listenForPropertyAdjustment() {
    this.events.subscribe('afford:propertyPriceAdjusted', (property: Property) => {
      console.log('PRICE ADJUSTMENT RECEIVED');
      console.log(property);
      this.events.unsubscribe('afford:propertyPriceAdjusted');
      property._propertyAssociationPayload.userValuedPrice = {
        amount: Number(property.userDefinedValue),
        currencyCode: 'AUD'
      };
      this.selectedProperty = property;
      // Don't submit if we expect a mortgage later on as well
      switch (this.selectionType) {
        case AffordabilityUtils.SelectionType.EXISTING_PROPERTY_MORTGAGE:
          break;
        default:
          this.submit();
          break;
      }
    });
  }
}