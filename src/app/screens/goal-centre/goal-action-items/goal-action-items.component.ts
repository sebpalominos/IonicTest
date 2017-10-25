import { Component, ViewChildren, QueryList, ChangeDetectionStrategy } from '@angular/core';
import { NavController, ViewController, LoadingController, ModalController, ToastController, ActionSheetController, Events, Searchbar, List } from 'ionic-angular';

import { GoalComponent } from '../goal/goal.component';
import { CreateGoalComponent } from '../create-goal/create-goal.component';
import { EditGoalComponent } from '../edit-goal/edit-goal.component';
import { SavingsGoal, SavingsGoalShape } from '../shared/savings-goal.model';
import { AvailableGoalInfo } from '../shared/goal-misc';
import { GoalAction, GoalActionShape, GoalCallToAction } from '../shared/goal-action.model';
import { GoalSummary } from '../shared/goal-summary.model';
import { GoalType } from '../shared/goal-type.model';
import { GoalUtils } from '../shared/goal-utils';
import { AffordabilityComponent } from '../../affordability/affordability.component';
import { GoalWorkspaceComponent } from '../../goal-workspace/goal-workspace.component';
import { GoalService } from '../../../core/services/goal/goal.service';
import { VersionService } from '../../../core/services/version/version.service';
import { GoalActionCollection } from '../../../core/data/goal/goal-maps';

@Component({
  selector: 'goal-action-items',
  templateUrl: 'goal-action-items.html',
  changeDetection: ChangeDetectionStrategy.Default,
  host: {
    class: 'goal-action-items-list'
  }
})
export class GoalActionItemsComponent {
  @ViewChildren(List) listQuery: QueryList<List>;   // Adopted a query due to *ngIfs vs template vars
  goals: AvailableGoalInfo[];
  goalActions: GoalAction[];
  goalRetrievalUtil: GoalUtils.GoalRetrieval;
  screens: { [screenName: string]: any } = { 
    createGoal: CreateGoalComponent,
    editGoal: EditGoalComponent,
    goal: GoalComponent,
    workspace: GoalWorkspaceComponent,
  };
  showGoalLoading: boolean;
  showLoadingError: boolean;
  showSearch: boolean;
  constructor(
    protected events: Events,
    protected navCtrl: NavController, 
    protected viewCtrl: ViewController,     // Used by template
    protected loadingCtrl: LoadingController,
    protected modalCtrl: ModalController,
    protected toastCtrl: ToastController,
    protected actionSheetCtrl: ActionSheetController,
    protected goalService: GoalService,
    protected versionService: VersionService,
  ) {
    this.goalRetrievalUtil = new GoalUtils.GoalRetrieval(goalService);
  }
  ionViewWillLoad() {
    this.loadGoalActions(true);
    this.events.subscribe('goal:setupComplete', () => {
      this.loadGoalActions();
    });
    this.events.subscribe('goal:unselected', () => {
      this.loadGoalActions();
    });
  }
  ionViewDidLoad() {
    this.showSearch = this.versionService.isCapabilityEnabled('CAP_UNIVSEARCH');
  }
  selectGoal(goal: AvailableGoalInfo) {
    let goalTypeIdentifier = goal.typeHeader.type;
    let goalInfoIndex = this.goals.findIndex(goal => goalTypeIdentifier === goal.typeHeader.type);
    if (goalInfoIndex >= 0) {
      let [popped] = this.goals.splice(goalInfoIndex, 1);
      let loading = this.loadingCtrl.create({ content: 'Adding goal' });
      loading.present();
      this.goalService.activateGoal(goalTypeIdentifier).then(stateChange => {
        if (stateChange.success) {
          popped.typeHeader.selected = true;
          this.goalRetrievalUtil.updateActions(popped);
          this.goals.push(popped);
          let modal = this.modalCtrl.create(this.screens['createGoal'], { goalTypeIdentifier });
          modal.present().then(() => {
            loading.dismiss();
          });
        }
        else {
          this.toastCtrl.create({ message: 'Error – could not add goal', showCloseButton: true }).present();
        }
      }).catch(err => {
        this.toastCtrl.create({ message: 'Error – could not add goal', showCloseButton: true }).present();
        loading.dismiss();
        this.goals.push(popped);
      });
    }
  }
  goalSelected(goalType: GoalType) {
    this.navCtrl.push(this.screens['goal'], { goalTypeIdentifier: goalType.type });
  }
  goalEditSummary(goalType: GoalType) {
    this.navCtrl.push(this.screens['editGoal'], { goalTypeIdentifier: goalType.type });
  }
  showGoalOptions(goalType: GoalType) {
    let actionSheet = this.actionSheetCtrl.create({ 
      buttons: [{
        text: 'Cancel',
        role: 'cancel'
      }, {
        text: 'Open Goal Details',
        handler: () => {
          actionSheet.dismiss().then(() => this.goalSelected(goalType));
          return false;
        }
      }, {
        text: 'Edit Summary',
        handler: () => {
          actionSheet.dismiss().then(() => this.goalEditSummary(goalType));
          return false;
        }
      }] 
    });
    actionSheet.present();
  }
  invokeGoalCallToAction(action: GoalAction) {
    if (action.isSetup) {
      let modal = this.modalCtrl.create(this.screens['createGoal'], { goalTypeIdentifier: action.goalTypeIdentifier });
      modal.present();
    }
    else {
      this.navCtrl.push(this.screens['workspace'], { action });
    }
  }
  private loadGoalActions(foreground = false) {
    this.showGoalLoading = true;
    this.showLoadingError = false;
    this.goalRetrievalUtil.retrieveGoalInfo().then(goals => {
      if (goals) {
        this.goals = goals;
        this.processGoalActions(goals);
      }
      this.showGoalLoading = false;
    }).catch(err => {
      console.error(`Error retrieving available goals:`);
      console.error(err);
      this.showLoadingError = true;
      this.showGoalLoading = false;
    });
  }
  // private processGoalActions(actionCollections: GoalActionCollection[]) {
  private processGoalActions(goals: AvailableGoalInfo[]) {
    // Mash them into one big list; update the tab parent count
    let allActions: GoalAction[] = Array.prototype.concat.apply([], goals.map(goal => goal.actions));
    // Remove any DONE goals
    allActions = allActions.filter(action => action.status !== 'DONE');
    // let primaryActions: GoalAction[] = [];
    let setupActions: GoalAction[] = [];
    for (let goal of goals) {
      // if CTA is in severity ERROR, it likely has setup remaining. Show a Setup "action"
      if (goal.callToAction.severity === 'ERROR') {
        // Create a custom GoalAction to represent a goal setup action.
        setupActions.push(new GoalAction(<GoalActionShape> {
          shortDescription: 'Complete goal setup',
          longDescription: 'Complete goal setup',
          status: 'TO_DO',
          goalLabel: goal.typeHeader.title,
          goalTypeIdentifier: goal.typeHeader.type,
          isSetup: true
        }));
      }
      // else {
      //   // Get any goal main CTA's and drag them to the top. 
      //   let foundActionIndex = allActions.findIndex(ga => ga.callToAction.identifier === goal.callToAction.identifier);
      //   if (foundActionIndex >= 0) {
      //     let [popped] = allActions.splice(foundActionIndex, 1);
      //     primaryActions.unshift(popped);
      //   }
      // }
    }
    this.goalActions = Array.prototype.concat([], setupActions, allActions);
    this.events.publish('goal:actionCountChange', this.goalActions.length);
  }
}