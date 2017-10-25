import { Component, ViewChild } from '@angular/core';
import { NavParams, NavController, ViewController, Events, Tabs } from 'ionic-angular';

import { CreateGoalComponent } from './create-goal/create-goal.component';
import { GoalComponent } from './goal/goal.component';
import { GoalListComponent } from './goal-list/goal-list.component';
import { GoalActionItemsComponent } from './goal-action-items/goal-action-items.component';
import { AvailableGoalInfo } from './shared/goal-misc';
import { SearchbarTabParent } from '../misc/searchbar-tab-parent/searchbar-tab-parent';
// import { SearchbarTabParent } from '../shared/searchbar-tab-parent/searchbar-tab-parent';
import { VersionService } from '../../core/services/version/version.service';

@Component({
  selector: 'opc-goal-centre',
  templateUrl: 'goal-centre.html',
  host: {
    class: 'goal-centre'
  }
})
export class GoalCentreComponent extends SearchbarTabParent {
  @ViewChild('goalCentreTabs') tabs: Tabs;
  actionCount: number;
  screens: { [screenName: string]: any } = { 
    createGoal: CreateGoalComponent,
    goalList: GoalListComponent,
    goalActions: GoalActionItemsComponent,
    goal: GoalComponent,
  };
  constructor(
    protected params: NavParams, 
    protected navCtrl: NavController, 
    protected viewCtrl: ViewController,
    protected events: Events,
    protected versionService: VersionService
  ) { super(params) }
  ionViewDidLoad() {
    this.actionCount = 0;
    this.events.subscribe('goal:actionCountChange', newCount => {
      this.actionCount = parseInt(newCount);
    });
  }
  ionViewCanEnter(): boolean {
   return this.versionService.isCapabilityEnabled('CAP_GOAL_CENTRE');
  }
  ionViewDidEnter() {
    super.ionViewDidEnter();
  }
}