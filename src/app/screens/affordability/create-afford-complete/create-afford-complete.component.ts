import { Component } from '@angular/core';
import { NavParams, NavController, Events } from 'ionic-angular';

import { AffordabilityUtils } from '../shared/affordability-utils';
import { MortgageAccount } from '../shared/mortgage-account.model';
import { Account } from '../../accounts/shared/account.model';
import { Property } from '../../property-centre/shared/property.model';
import { PropertySearchSummary } from '../../property-centre/shared/property-search.model';

/**
 * The central screen for the affordability goal creation flow.
 * @export
 * @class CreateAffordabilityHubComponent
 */
@Component({
  selector: 'create-afford-complete',
  templateUrl: 'create-afford-complete.component.html',
  host: {
    class: 'create-afford-complete'
  }
})
export class CreateAffordabilityCompleteComponent {
  constructor(
    protected params: NavParams,
    protected navCtrl: NavController,
    protected events: Events
  ) {}
  ionViewWillEnter() {
    this.events.publish('afford:spendingLimitsChanged');
  }
  finish() {
    this.navCtrl.parent.getActive().dismiss();
  }
}