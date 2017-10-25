import { Component, ViewChild } from '@angular/core';
import { NavParams, NavController } from 'ionic-angular';

import { GoalShape, GoalBase } from '../shared/goal.model';
import { CreateGoalScreenFlow } from '../shared/goal-misc';
import { GoalResponseValues } from '../../../core/data/goal/goal-response';

// Components
import { CreateGoalStartComponent } from './create-goal-start.component';
import { CreateGoalProseComponent } from './create-goal-prose.component';

@Component({
  selector: 'modal-create-goal-landing',
  template: `
    <ion-nav #createGoalNav></ion-nav>
  `,
  host: {
    class: 'create-goal create-goal-landing'
  }
})
export class CreateGoalComponent {
  @ViewChild('createGoalNav') nav: NavController;
  constructor(
    protected params: NavParams,
  ) {}
  ngOnInit() {
    this.loadCreateGoalScreen();
  }
  private loadCreateGoalScreen() {
    // And for some reason, if the goalType is already set (e.g. arriving from deep link):
    if (this.params.get('goalTypeIdentifier')) {
      let goalTypeValue: GoalResponseValues.Type = this.params.get('goalTypeIdentifier');
      switch (goalTypeValue){
        case 'GENERIC_SAVINGS':
        case 'SHORT_TERM_DEBT':
        case 'RAINY_DAY_SAVINGS':
        case 'MONTH_TO_MONTH':
          this.nav.setRoot(CreateGoalProseComponent, { goalTypeIdentifier: goalTypeValue });
          break;
        case 'REAL_ESTATE':
        default:
          this.nav.setRoot(CreateGoalStartComponent);
      }
    }
    else {
      this.nav.setRoot(CreateGoalStartComponent);
    }
  }
}