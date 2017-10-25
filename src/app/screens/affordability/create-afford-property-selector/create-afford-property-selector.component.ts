import { Component } from '@angular/core';
import { NavParams, NavController, ModalController, LoadingController, Events } from 'ionic-angular';

import { CreateAffordabilityMortgageComponent } from '../create-afford-mortgage/create-afford-mortgage.component';
import { CreateAffordabilitySetPropertyPriceComponent } from '../create-afford-set-property-price/create-afford-set-property-price.component';
import { AffordabilityUtils } from '../shared/affordability-utils';
import { AffordabilityGoal } from '../shared/affordability-goal.model';
import { PropertyRelatedGoalWorkspace } from '../../goal-workspace/shared/goal-workspace-property.model';
import { PropertySearchComponent } from '../../property-centre/property-search/property-search.component';
import { PropertyEvents } from '../../property-centre/shared/property-events';
import { PropertySearchSummary } from '../../property-centre/shared/property-search.model';
import { Property } from '../../property-centre/shared/property.model';
import { PropertyService } from '../../../core/services/property/property.service';

@Component({
  selector: 'create-afford-property-selector',
  templateUrl: 'create-afford-property-selector.component.html',
  host: {
    class: 'create-afford-property-selector'
  }
})
export class CreateAffordabilityPropertySelectorComponent {
  selectionType: AffordabilityUtils.SelectionType;
  workspace: PropertyRelatedGoalWorkspace;
  results: PropertySearchSummary[];
  property: Property;
  screens: { [screenName: string]: any } = {
    search: PropertySearchComponent,
    mortgage: CreateAffordabilityMortgageComponent,
    confirmPrice: CreateAffordabilitySetPropertyPriceComponent
  };
  constructor(
    protected params: NavParams,
    protected navCtrl: NavController,
    protected modalCtrl: ModalController,
    protected loadingCtrl: LoadingController,
    protected events: Events,
    protected propertyService: PropertyService
  ) {}
  ionViewWillLoad() {
    this.selectionType = this.params.get('selectionType');
    this.workspace = this.params.get('workspace');
  }
  ionViewDidLoad() {
    this.launchSearchModal();
  }
  launchSearchModal() {
    let propertySearchType = Number(this.params.get('propertySearchType'));
    let searchModal = this.modalCtrl.create(this.screens['search'], { propertySearchType });
    searchModal.onDidDismiss((resp: PropertyEvents.PropertySearchResult) => {
      if (!resp) {
        // nothing.
      }
      else if (resp.isUserCancelled) {
        this.navCtrl.pop();
      }
      else {
        let { results, description, isPropertySingleResult, propertySingleResult } = resp;
        if (isPropertySingleResult && propertySingleResult) {
          // Publish event back to the other property screen, then forward and drop self.
          this.property = propertySingleResult;
          this.notifyPropertySelected();
          this.nextConfirmPrice();
        }
        else {
          this.results = results;
        }
      }
    });
    searchModal.present();
  }
  propertySelected(propertySummary: PropertySearchSummary) {
    let loading = this.loadingCtrl.create({ content: `Selecting: ${propertySummary.address.full}` });
    loading.present();
    this.propertyService.getProperty(propertySummary.id).then(property => {
      loading.dismiss();
      this.property = property;
      this.notifyPropertySelected();
      this.nextConfirmPrice();
    });
  }
  private nextConfirmPrice() {
    switch (this.selectionType) {
      case AffordabilityUtils.SelectionType.EXISTING_PROPERTY_MORTGAGE:
        let endIndex = this.navCtrl.last().index + 1;
        return this.navCtrl.insertPages(endIndex, [
          { page: this.screens['mortgage'], params: { property: this.property, workspace: this.workspace } },
          { page: this.screens['confirmPrice'], params: { property: this.property, isFinal: false } }
        ]);
        // return this.navCtrl.push(this.screens['confirmPrice'], { property: this.property, workspace: this.workspace });
        // return this.navCtrl.push(this.screens['mortgage'], { property: this.property, workspace: this.workspace });
      default:
        // return this.navCtrl.pop({ direction: 'forward' });
        // return this.navCtrl.popToRoot({ animate: true, direction: 'forward' });
        return this.navCtrl.push(this.screens['confirmPrice'], { property: this.property, isFinal: true });
    }
  }
  private notifyPropertySelected(property?: Property) {
    property = property || this.property;
    // Publish based on either existing or target
    switch (this.selectionType) {
      case AffordabilityUtils.SelectionType.EXISTING_PROPERTY_MORTGAGE:
      case AffordabilityUtils.SelectionType.EXISTING_PROPERTY_ONLY:
        this.events.publish('afford:interimAnyPropertySelected', property);
        this.events.publish('afford:interimExistingPropertySelected', property);
        break;
      case AffordabilityUtils.SelectionType.TARGET_PROPERTY:
        this.events.publish('afford:interimAnyPropertySelected', property);
        this.events.publish('afford:interimTargetPropertySelected', property);
        break;
      default:
        break;
    }
  }
}