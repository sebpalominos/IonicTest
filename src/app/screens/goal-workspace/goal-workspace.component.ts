import { Component, ViewChild } from '@angular/core';
import { NavParams, NavController, AlertController } from 'ionic-angular';

import { AccountRelatedWorkspaceComponent } from './account-related-workspace/account-related-workspace.component';
import { SavingsRelatedWorkspaceComponent } from './savings-related-workspace/savings-related-workspace.component';
import { GoalAction, GoalActionShape, GoalCallToAction } from '../goal-centre/shared/goal-action.model';

@Component({
  selector: 'scr-goal-workspace',
  templateUrl: 'goal-workspace.component.html',
  host: {
    class: 'goal-workspace'
  }
})

export class GoalWorkspaceComponent {
  @ViewChild('goalWorkspaceNav') nav: NavController;
  workspaceTitle: string;
  workspaceTypeName: 'ACCOUNT' | 'SAVINGS';
  workspacePath: string;          // Exact typing doesn't matter here
  goalTypeIdentifier: string;       // Exact typing doesn't matter here
  showNotLoaded: boolean;
  constructor(
    protected params: NavParams,
    protected alertCtrl: AlertController
  ) {}
  ionViewDidLoad() {
    this.workspaceTitle = '[Workspace]';
    this.loadWorkspace();
  }
  protected loadWorkspace() {
    if (this.params.get('action')) {
      let action: GoalAction = this.params.get('action');
      // Switch based on known
      // Todo: Create a registry of possible action names and resolve workspace component 
      // through registration or perhaps even convention.
      switch (action.name) {
        case 'RD_SAVINGS_POSSIBLE':
          // this.nav.setRoot(SavingsRelatedWorkspaceComponent, { 
          //   workspacePath: action.workspacePath(), 
          //   goalTypeIdentifier: action.goalTypeIdentifier 
          // });
          this.workspaceTitle = 'Your Expenditure';
          this.workspaceTypeName = 'SAVINGS';
          this.workspacePath = action.workspacePath();
          this.goalTypeIdentifier = action.goalTypeIdentifier;
          break;
        case 'RD_SAVINGS_WANTED':
        case 'RD_GET_ORGANISED':
        default:
        //   this.nav.setRoot(AccountRelatedWorkspaceComponent, { 
        //     workspacePath: action.workspacePath(),
        //     goalTypeIdentifier: action.goalTypeIdentifier 
        //   });
          this.workspaceTitle = 'Switch';
          this.workspaceTypeName = 'ACCOUNT';
          this.workspacePath = action.workspacePath();
          this.goalTypeIdentifier = action.goalTypeIdentifier;
          break;
      }
    }
    else {
      let alert = this.alertCtrl.create({ 
        title: 'Not found', 
        message: 'The action you selected doesn\'t have a configured workspace!', 
        buttons: ['OK'] 
      });
      alert.present();
    }
  }
}