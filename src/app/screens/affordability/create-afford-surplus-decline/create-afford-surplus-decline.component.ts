import { Component } from '@angular/core';
import { NavParams, NavController, AlertController, Events } from 'ionic-angular';

@Component({
  selector: 'create-afford-surplus-decline',
  templateUrl: 'create-afford-surplus-decline.component.html',
  host: {
    class: 'create-afford-surplus-decline'
  }
})
export class CreateAffordabilitySurplusDeclineComponent {
  constructor(
    protected navCtrl: NavController,
  ) {}
  finish() {
    this.navCtrl.parent.getActive().dismiss();
  }
}