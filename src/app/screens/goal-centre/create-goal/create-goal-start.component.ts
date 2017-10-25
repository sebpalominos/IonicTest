import { Component } from '@angular/core';
import { NavParams, NavController, ViewController, ActionSheetController } from 'ionic-angular';

import { GoalShape, GoalBase } from '../shared/goal.model';
import { CreateGoalScreenFlow } from '../shared/goal-misc';

// Components
import { CreateGoalBaseComponent } from './create-goal-base.component';
import { CreateGoalTypeComponent } from './create-goal-type.component';
import { CreateGoalCompleteComponent } from './create-goal-complete.component';
import { CreateGoalLinkAccountComponent } from './create-goal-link-account.component';
import { CreateGoalLinkCategoryComponent } from './create-goal-link-category.component';

@Component({
  selector: 'scr-create-goal-start',
  templateUrl: 'create-goal-start.html'
})
export class CreateGoalStartComponent extends CreateGoalBaseComponent {
  constructor(
    protected params: NavParams, 
    protected navCtrl: NavController, 
    protected viewCtrl: ViewController,
    protected actionSheetCtrl: ActionSheetController
  ) { super(params, navCtrl, actionSheetCtrl) }
  ngOnInit(){
    // this.viewCtrl.showBackButton(false);
    this.currentScreenFlowStage = CreateGoalScreenFlow.SelectGoalType;
  }
  next(){
    if (this.goalTypeIdentifier === 'GENERIC_SAVINGS'){
      super.next(CreateGoalLinkAccountComponent);
    }
  }
  skipToEnd(){
    super.next(CreateGoalCompleteComponent);
  }
}