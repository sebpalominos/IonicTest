import { Component, Input } from '@angular/core';
import { ModalController, Events } from 'ionic-angular';

import { AffordabilityGoal } from '../affordability-goal.model';
import { CreateAffordabilityComponent } from '../../create-afford/create-afford.component';

@Component({
  selector: 'afford-begin',
  templateUrl: 'afford-begin.component.html',
  host: {
    class: 'afford-begin'
  }
})
export class AffordabilityBeginComponent {
  @Input() goal: AffordabilityGoal;
  isInProgress: boolean;
  showLoadingContinue: boolean;
  screens = {
    create: CreateAffordabilityComponent
  };
  constructor(
    protected modalCtrl: ModalController
  ) {}
  ngOnInit() {
    if (this.goal) {
      // Check if it happens to have any completed actions. Preload those. 
      let hasCompletedAction = !!this.goal.actions.find(action => action.completionRate !== 0);
      this.isInProgress = hasCompletedAction;
    }
  }
  beginGoal() {
    this.modalCtrl.create(this.screens['create'], { resume: this.isInProgress }).present();
  }
}