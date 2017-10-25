import { Component } from '@angular/core';
import { NavParams, NavController, AlertController, ToastController, Events } from 'ionic-angular';

import { MortgageAccount } from '../shared/mortgage-account.model';
import { Property } from '../../property-centre/shared/property.model';

@Component({
  selector: 'create-afford-set-mortgage-details',
  templateUrl: 'create-afford-set-mortgage-details.component.html',
  host: {
    class: 'create-afford-set-mortgage-details'
  }
})
export class CreateAffordabilitySetMortgageDetailsComponent {
  account: MortgageAccount;
  constructor(
    protected params: NavParams,
    protected navCtrl: NavController,
    protected alertCtrl: AlertController,
    protected toastCtrl: ToastController,
    protected events: Events
  ) {}
  ionViewWillLoad() {
    this.retrieveMortgageAccount().then(account => {
      // Create a new shell if no mortgage account was provided.
      this.account = account || new MortgageAccount(); 
    });
  }
  continue() {
    /* Publish an event for afford:mortgageDetailsAdjusted. then pop to root */
    this.events.publish('afford:mortgageDetailsAdjusted', this.account);
    this.navCtrl.popToRoot({ direction: 'forwards' });
  }
  private retrieveMortgageAccount(): Promise<MortgageAccount> {
    if (this.params.get('mortgageAccount')) {
      return Promise.resolve(this.params.get('mortgageAccount'));
    }
    else if (this.params.get('mortgageAccountId')) { 
      // Todo: How do we grab a mortgage account by ID???
      console.warn('Getting mortgage account by ID is a todo');
      return Promise.resolve(undefined);
    }
    else {
      return Promise.resolve(undefined);
    }
  }
}