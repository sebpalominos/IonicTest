import { Component } from '@angular/core';
import { NavParams, NavController, ViewController, ActionSheetController, Events } from 'ionic-angular';

import { GoalShape, GoalBase } from '../shared/goal.model';
import { CreateGoalScreenFlow } from '../shared/goal-misc';

import { CreateGoalBaseComponent } from './create-goal-base.component';

@Component({
  selector: 'scr-create-goal-complete',
  templateUrl: 'create-goal-complete.html',
  host: {
    class: 'create-goal create-goal-complete'
  }
})
export class CreateGoalCompleteComponent extends CreateGoalBaseComponent {
  goalName: string;
  constructor(
    protected params: NavParams, 
    protected events: Events,
    protected navCtrl: NavController, 
    protected actionSheetCtrl: ActionSheetController,
    protected viewCtrl: ViewController
  ) { super(params, navCtrl, actionSheetCtrl) }
  ionViewDidLoad() {
    this.currentScreenFlowStage = CreateGoalScreenFlow.Complete;
    this.goalName = '<INSERT GOAL NAME HERE>';
    this.events.publish('goal:setupComplete');
  }
  closeAll() {
    let modalParent = this.navCtrl.parent.getActive().dismiss();
  }
}