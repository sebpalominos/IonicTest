import { Component } from '@angular/core';
import { NavParams, NavController, ViewController, ActionSheetController } from 'ionic-angular';

import { GoalShape, GoalBase } from '../shared/goal.model';
import { CreateGoalScreenFlow } from '../shared/goal-misc';

import { CreateGoalBaseComponent } from './create-goal-base.component';
import { CreateGoalLinkAccountComponent } from './create-goal-link-account.component';
import { CreateGoalLinkCategoryComponent } from './create-goal-link-category.component';

@Component({
  selector: 'scr-create-goal-type',
  template: `
    <ion-header>
      <ion-navbar>
        <ion-buttons end>
          <button ion-button>
            <ion-icon name="info"></ion-icon>
          </button>
        </ion-buttons>
      </ion-navbar>
    </ion-header>
    <ion-content>
      <div padding>
        <h2>Select a goal type</h2>
      </div>
      <ion-list radio-group [(ngModel)]="goalType">
        <ion-item>
          <ion-label>I want to set a saving target</ion-label>
          <ion-radio value="saving"></ion-radio>
        </ion-item>
        <ion-item>
          <ion-label>I want limit my spending on a category</ion-label>
          <ion-radio value="spending"></ion-radio>
        </ion-item>
      </ion-list>
    </ion-content>
    <ion-footer padding>
      <button ion-button block (click)="next()" [disabled]="!goalType">Next</button>
    </ion-footer>
  `
})
export class CreateGoalTypeComponent extends CreateGoalBaseComponent {
  constructor(
    protected params: NavParams, 
    protected navCtrl: NavController, 
    protected viewCtrl: ViewController,
    protected actionSheetCtrl: ActionSheetController
  ) {
    super(params, navCtrl, actionSheetCtrl);
    this.currentScreenFlowStage = CreateGoalScreenFlow.SelectGoalType;
  }
  next(){
    if (this.goalTypeIdentifier === 'GENERIC_SAVINGS'){
      super.next(CreateGoalLinkAccountComponent);
    }
  }
}