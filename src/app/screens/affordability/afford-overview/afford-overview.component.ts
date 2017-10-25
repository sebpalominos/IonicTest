import { Component, Input } from '@angular/core';
import { NavParams, NavController, ModalController, Events } from 'ionic-angular';

import { AffordabilityGoal } from '../shared/affordability-goal.model';
import { CreateAffordabilityComponent } from '../create-afford/create-afford.component';

@Component({
  selector: 'afford-overview',
  templateUrl: 'afford-overview.component.html',
  host: {
    class: 'afford-overview'
  }
})
export class AffordabilityOverviewComponent {
  goal: AffordabilityGoal;
  constructor(
    protected params: NavParams,
    protected navCtrl: NavController,
    protected modalCtrl: ModalController
  ) {}
  ionViewWillLoad() {
    this.retrieveGoal().then(goal => {
      this.goal = goal;
      console.log(this.goal);
    });
  }
  continueGoal() {
    this.modalCtrl.create(CreateAffordabilityComponent, { resume: true, goal: this.goal }).present();
  }
  private retrieveGoal(): Promise<AffordabilityGoal> {
    if (this.params.get('goal')) {
      return Promise.resolve(this.params.get('goal'));
    }
    return null;
  }
}