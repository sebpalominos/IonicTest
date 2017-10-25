import { Component } from '@angular/core';
import { NavParams, NavController, AlertController, ToastController, Events } from 'ionic-angular';

import { AffordabilityUtils } from '../shared/affordability-utils';
import { AffordabilityGoal } from '../shared/affordability-goal.model';
import { MortgageAccount } from '../shared/mortgage-account.model';
import { PropertyRelatedGoalWorkspace } from '../../goal-workspace/shared/goal-workspace-property.model';
import { Property } from '../../property-centre/shared/property.model';
import { PropertyService } from '../../../core/services/property/property.service';

@Component({
  selector: 'create-afford-set-property-price',
  templateUrl: 'create-afford-set-property-price.component.html',
  host: {
    class: 'create-afford-set-property-price'
  }
})
export class CreateAffordabilitySetPropertyPriceComponent {
  workspace: PropertyRelatedGoalWorkspace;
  workspacePath: string[];
  accounts: MortgageAccount[];
  property: Property;
  priceAmountDisplay: string;
  isFinalScreen: boolean;
  isEditing: boolean;
  showPropertyNotSelectedError: boolean;
  constructor(
    protected params: NavParams,
    protected navCtrl: NavController,
    protected alertCtrl: AlertController,
    protected toastCtrl: ToastController,
    protected events: Events,
    protected propertyService: PropertyService
  ) {}
  ionViewWillLoad() {
    this.isFinalScreen = !!this.params.get('isFinal');
    this.retrieveProperty().then(property => {
      if (property) {
        this.property = property;
        this.property.userDefinedValue = property.currentValue || property.salePrice || 0;
        this.priceAmountDisplay = String(this.property.userDefinedValue);
        this.isEditing = !(property.currentValue || property.salePrice);
      }
      else {
        this.showPropertyNotSelectedError = true;    // i.e. property is null/undefined
      }
    });
  }
  continue() {
    if (this.validate()) {
      /* Publish an event for afford:propertyPriceAdjusted then pop to hub */
      if (this.isFinalScreen) {
        // Go to the hub
        this.events.publish('afford:propertyPriceAdjusted', this.property);
        this.navCtrl.popToRoot({ animate: true, direction: 'forwards' });
      }
      else {
        // Go to the mortgage screen, which got inserted behind this page, so pop forwards
        this.events.publish('afford:propertyPriceAdjusted', this.property);
        this.navCtrl.pop({ direction: 'forward' });
      } 
    }
  }
  private validate(): boolean {
    // TODO.
    return !isNaN(parseFloat(this.priceAmountDisplay)) && isFinite(this.property.userDefinedValue);
  }
  private updatePriceAmountDisplay(value: string) {
    console.log(value);
    this.priceAmountDisplay = value;
    this.property.userDefinedValue = Number(value);
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
}