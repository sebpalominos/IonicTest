import { Component, SimpleChanges } from '@angular/core';
import { NavParams, NavController, ViewController, ActionSheetController } from 'ionic-angular';

import { GoalShape, GoalBase } from '../shared/goal.model';
import { CreateGoalScreenFlow, TimeScaleOption } from '../shared/goal-misc';
import { TimeScaleType } from '../../../core/data/shared/constant-types';
import { GoalService } from '../../../core/services/goal/goal.service';

import { CreateGoalBaseComponent } from './create-goal-base.component';
import { CreateGoalCompleteComponent } from './create-goal-complete.component';

@Component({
  selector: 'scr-create-goal-duration',
  template: `
    <ion-header>
      <ion-navbar>
      </ion-navbar>
    </ion-header>
    <ion-content>
      <div padding>
        <h2>Set duration</h2>
      </div>
      <ion-list radio-group [(ngModel)]="goal.timeScale">
        <ion-list-header>
          Repeat duration
        </ion-list-header>
        <ion-item *ngFor="let opt of timeScaleOptions">
          <ion-label>{{opt.label}}</ion-label>
          <ion-radio [value]="opt.value"></ion-radio>
        </ion-item>
      </ion-list>
      <ion-list>
        <ion-item>
          <ion-label>Goal repeats?</ion-label>
          <ion-toggle [(ngModel)]="durationRepeats"></ion-toggle>
        </ion-item>
        <ion-item *ngIf="durationRepeats">
          <ion-label>Expire on</ion-label>
          <ion-datetime displayFormat="DD MMM YYYY" pickerFormat="DD MMM YYYY" [min]="todayDate" [(ngModel)]="goal.dateExpireOn"></ion-datetime>
        </ion-item>
      </ion-list>
      <div padding *ngIf="!durationRepeats">
        <p>This goal expires on {{goal.dateExpireOn | date:'medium'}}</p>
      </div>
    </ion-content>
    <ion-footer>
      <button ion-button block large (click)="createGoal()">Create my goal</button>
    </ion-footer>
  `
})
export class CreateGoalDurationComponent extends CreateGoalBaseComponent {
  durationRepeats: boolean;
  timeScaleOptions: TimeScaleOption[] = [
    { label: 'Weekly', value: TimeScaleType.Weekly },
    { label: 'Fortnightly', value: TimeScaleType.Fortnightly },
    { label: 'Monthly', value: TimeScaleType.Monthly },
    { label: 'Yearly', value: TimeScaleType.Yearly }
  ];
  todayDateIso8601: string;
  constructor(
    protected params: NavParams, 
    protected navCtrl: NavController, 
    protected actionSheetCtrl: ActionSheetController,
    protected goalService: GoalService
  ) {
    super(params, navCtrl, actionSheetCtrl);
    this.currentScreenFlowStage = CreateGoalScreenFlow.SetDuration;
    this.durationRepeats = false;
  }
  ngOnInit(){
    this.todayDateIso8601 = new Date().toISOString();
  }
  createGoal(){
    if (this.goalTypeIdentifier){
      console.log('Goal to be created', this.goal);
      // this.goalService.createAccountGoal(<IAccountGoal> this.goal).then(resp => {
      //   console.log('created', resp);
      //   this.navCtrl.pop();
      // });
    }
   
    // Upon promise resolve:
    super.next(CreateGoalCompleteComponent);
  }
}