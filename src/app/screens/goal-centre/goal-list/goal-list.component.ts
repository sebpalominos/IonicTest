import { Component, ViewChildren, QueryList, ChangeDetectionStrategy } from '@angular/core';
import { NavController, ViewController, LoadingController, ToastController, 
         ActionSheetController, ModalController, Events, Searchbar, List } from 'ionic-angular';

import { GoalComponent } from '../goal/goal.component';
import { CreateGoalComponent } from '../create-goal/create-goal.component';
import { GoalWorkspaceComponent } from '../../goal-workspace/goal-workspace.component';
import { SavingsGoal, SavingsGoalShape } from '../shared/savings-goal.model';
import { AvailableGoalInfo } from '../shared/goal-misc';
import { GoalSummary } from '../shared/goal-summary.model';
import { GoalType } from '../shared/goal-type.model';
import { GoalUtils } from '../shared/goal-utils';
import { GoalAction, GoalCallToAction } from '../shared/goal-action.model';
import { GoalService } from '../../../core/services/goal/goal.service';

@Component({
  selector: 'goal-list',
  templateUrl: 'goal-list.html',
  changeDetection: ChangeDetectionStrategy.Default,
  host: {
    class: 'goal-list'
  }
})
export class GoalListComponent {
  @ViewChildren(List) listQuery: QueryList<List>;   // Adopted a query due to *ngIfs vs template vars
  showLoadingError: boolean;
  goals: AvailableGoalInfo[];
  completedActions: GoalAction[];
  goalRetrievalUtil: GoalUtils.GoalRetrieval;
  screens: { [screenName: string]: any } = { 
    createGoal: CreateGoalComponent,
    goal: GoalComponent,
    workspace: GoalWorkspaceComponent,
  };
  constructor(
    protected events: Events,
    protected navCtrl: NavController, 
    protected viewCtrl: ViewController,     // Used by template
    protected loadingCtrl: LoadingController,
    protected toastCtrl: ToastController,
    protected actionSheetCtrl: ActionSheetController,
    protected modalCtrl: ModalController,
    protected goalService: GoalService
  ) { 
    this.goalRetrievalUtil = new GoalUtils.GoalRetrieval(goalService);
  }
  ionViewWillLoad() {
    this.loadGoalSummary(true);
    this.events.subscribe('goal:setupComplete', () => {
      this.loadGoalSummary();
    });
  }
  addGoal(goal: AvailableGoalInfo) {
    let goalTypeIdentifier = goal.typeHeader.type;
    let goalInfoIndex = this.goals.findIndex(goal => goalTypeIdentifier === goal.typeHeader.type);
    if (goalInfoIndex >= 0) {
      let [popped] = this.goals.splice(goalInfoIndex, 1);
      let loading = this.loadingCtrl.create({ content: 'Adding goal' });
      loading.present();
      this.goalService.activateGoal(goalTypeIdentifier).then(stateChange => {
        if (stateChange.success) {
          popped.typeHeader.selected = true;
          this.goalRetrievalUtil.updateStatus(popped);
          this.goals.push(popped);
          this.navCtrl.push(this.screens['createGoal'], { goalTypeIdentifier }).then(() => {
            loading.dismiss();
          });
        }
        else {
          throw 'Goal was not successfully added';
        }
      }).catch(err => {
        this.toastCtrl.create({ message: 'Error – could not add goal', showCloseButton: true }).present();
        this.goals.push(popped);
      });
    }
  }
  removeGoal(goal: AvailableGoalInfo) {
    // Hide the goal temporarily from display, then when it has been 
    // deselected, add it back to the 'add new' pile
    let goalTypeIdentifier = goal.typeHeader.type;
    let goalInfoIndex = this.goals.findIndex(goal => goalTypeIdentifier === goal.typeHeader.type);
    if (goalInfoIndex >= 0) {
      let [popped] = this.goals.splice(goalInfoIndex, 1);
      this.goalService.deleteGoal(goalTypeIdentifier).then(stateChange => {
        console.log(`Deselect goal result was ${stateChange.success}`);
        if (stateChange.success) {
          this.toastCtrl.create({ message: 'Removed goal', duration: 3000 }).present();
          popped.typeHeader.selected = false;
          this.goals.push(popped);
          this.listQuery.forEach(list => {
            list.closeSlidingItems();
          });
          this.events.publish('goal:unselected');
        }
        else {
          throw 'Goal was not successfully removed';        
        }
      }).catch(err => {
        this.toastCtrl.create({ message: 'Error – could not remove goal', showCloseButton: true }).present();
        this.goals.push(popped);
        this.listQuery.forEach(list => {
          list.closeSlidingItems();
        });
      });
    }
  }
  selectGoal(goal: AvailableGoalInfo) {
    if (goal.needsAttention) {
      let modal = this.modalCtrl.create(this.screens['createGoal'], { goalTypeIdentifier: goal.typeHeader.type });
      modal.present();
    }
    else {
      this.navCtrl.push(this.screens['goal'], { goalTypeIdentifier: goal.typeHeader.type });
    }
  }
  showOptions() {
    let actionSheet = this.actionSheetCtrl.create({ 
      buttons: [{
        text: 'Cancel',
        role: 'cancel'
      }, {
        text: 'Example destructive',
        role: 'destructive'
      }] 
    });
    actionSheet.present();
  }
  private loadGoalSummary(foreground = false) {
    this.showLoadingError = false;
    if (foreground) {
      var loading = this.loadingCtrl.create({ content: 'Loading goals' });
      loading.present();
    }
    this.goalRetrievalUtil.retrieveGoalInfo().then(goals => {
      this.goals = goals;
      this.processGoalActions(goals);
      loading && loading.dismiss();
    }).catch(err => {
      console.error(`Error retrieving available goals:`);
      console.error(err);
      this.showLoadingError = true;
      loading && loading.dismiss();
    });
  }
  private processGoalActions(goals: AvailableGoalInfo[]) {
    // Mash them into one big list; update the tab parent count
    let allActions: GoalAction[] = Array.prototype.concat.apply([], goals.map(goal => goal.actions));
    this.completedActions = allActions.filter(action => action.status === 'DONE');
  }
}