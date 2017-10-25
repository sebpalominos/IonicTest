import { Component } from '@angular/core';
import { NavParams, NavController, ActionSheetController } from 'ionic-angular';

import { GoalBase, GoalShape } from '../shared/goal.model';
import { CreateGoalScreenFlow, TimeScaleOption } from '../shared/goal-misc';
import { SavingsGoal } from '../shared/savings-goal.model';
import { TimeScaleType } from '../../../core/data/shared/constant-types';
import { GoalResponseValues } from '../../../core/data/goal/goal-response';

// @Component({})
export abstract class CreateGoalBaseComponent {
  goalTypeIdentifier: GoalResponseValues.Type;
  goal: GoalBase;
  protected currentScreenFlowStage: CreateGoalScreenFlow;
  constructor(
    protected params: NavParams, 
    protected navCtrl: NavController,
    protected actionSheetCtrl: ActionSheetController
  ) {
    if (this.params.get('goal')) {
      // Check the goal type, complain if it's not an actual goal
      if (this.goal instanceof GoalBase) {
        this.goal = this.params.get('goal');
        this.goalTypeIdentifier = this.goal.typeHeader.type;
      }
      else {
        throw new Error('NavParam goal is not a valid Goal subclass.');
      }
    }
    else {
      // This one's hard to check, we'll have to trust that it's 
      // a valid goal type...
      let goalTypeIdentifier = this.params.get('goalType') || this.params.get('goalTypeIdentifier');
      if (goalTypeIdentifier) {
        this.goalTypeIdentifier = goalTypeIdentifier;
      }
      else {
        console.warn('Warning: No goalType was set');
      }
    }
  }
  next(nextScreen: any){
    // Figure out the next screenflow stage
    // Serialize own object. Will this work...?
    // this.navCtrl.push(nextScreen || this.getNextScreenFlowStage(), this);
    this.navCtrl.push(nextScreen, { goalTypeIdentifier: this.goalTypeIdentifier, goal: this.goal });
  }
  close() {
    // Display actionsheet to close before saving etc
    let actionSheet = this.actionSheetCtrl.create({ 
      buttons: [
        { text: 'Cancel', role: 'cancel' }, 
        { text: 'Save and close', handler: () => { 
          actionSheet.dismiss().then(() => {
            // Dismisses the underlying Modal viewcontroller
            this.navCtrl.parent.getActive().dismiss();
          });
          return false;
        }
      }]
    });
    actionSheet.present();
  }
  closeAll() {
    this.navCtrl.parent.getActive().dismiss();
  }
}