import { Component, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { NavParams, NavController, ModalController, LoadingController, Events, Content } from 'ionic-angular';

import { CreateAffordabilityComponent } from './create-afford/create-afford.component';
import { AffordabilityGoal, AffordabilityTrackingLevel } from './shared/affordability-goal.model';
import { AffordabilityUtils } from './shared/affordability-utils';
import { GoalResponseValues } from '../../core/data/goal/goal-response';
import { ProgressLevelContentResponse } from '../../core/data/goal/goal-afford-response';
import { GoalService } from '../../core/services/goal/goal.service';
import { VersionService } from '../../core/services/version/version.service';

@Component({
  selector: 'affordability',
  templateUrl: 'affordability.component.html',
  // changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'affordability' }
})
export class AffordabilityComponent {
  @ViewChild(Content) content: Content;
  goal: AffordabilityGoal;
  screens = {
    create: CreateAffordabilityComponent
  };
  hasCreateModalLaunched: boolean;
  showCreate: boolean;
  showLoading: boolean;
  showLoadingError: boolean;
  showNavbar: boolean = true;
  constructor(
    protected ref: ChangeDetectorRef,
    protected params: NavParams,
    protected navCtrl: NavController,      // used by template
    protected modalCtrl: ModalController,
    protected loadingCtrl: LoadingController,
    protected events: Events,
    protected goalService: GoalService,
    protected versionService: VersionService
  ) {}
  ionViewWillLoad() {
    // Depending on whether an affordability goal(s) exists or not, display 
    // a list of the goals, or an inspirational splash screen that features a 'create now'
    this.loadGoal();
  }
  ionViewCanEnter(): boolean {
   return this.versionService.isCapabilityEnabled('CAP_AFFORDABILITY');
  }
  ionViewDidEnter() {
    if (this.content.scrollTop < 100 !== this.showNavbar) {
      this.showNavbar = this.content.scrollTop < 100;
      this.ref.detectChanges();
    }
  }
  editGoal() {
    this.modalCtrl.create(CreateAffordabilityComponent, { resume: true, goal: this.goal }).present();
  }
  private setNavbarVisibility(scrollEvent: any) {
    if (scrollEvent.scrollTop < 100 !== this.showNavbar) {
      this.showNavbar = scrollEvent.scrollTop < 100;
      this.ref.detectChanges();
    }
  }
  private subscribeEvents() {
    this.events.subscribe('afford:changed', () => {
      this.loadGoal();
    });
  }
  private createPropertyGoal(): Promise<boolean> {
    // Make sure the goal is activated. 
    return this.goalService.activateGoal('REAL_ESTATE').then(stateChange => {
      return stateChange.success;
    });
  }
  private retrieveAffordabilityGoal(foreground = false): Promise<AffordabilityGoal> {
    if (this.params.get('goal')) {
      return Promise.resolve(this.params.get('goal'));
    }
    else {
      let affordabilityGoalTypeKey: GoalResponseValues.Type = 'REAL_ESTATE';
      return this.goalService.getGoalDetails(affordabilityGoalTypeKey);
    }
  }
  private loadGoal(foreground = false): Promise<boolean> {
    this.showLoading = true;
    return this.createPropertyGoal().then(result => {
      this.showLoadingError = !result;
      return this.retrieveAffordabilityGoal(true);
    }).then(goal => {
      // The existing affordability goal in all its glory. If undefined, that's fine.
      // Note: DEFINED is a state where there is insufficient data to progress to IN_PROGRESS
      this.goal = goal;
      console.log(goal);
      this.showCreate = goal ? goal.typeHeader.status === 'DEFINED' : true;          
      this.subscribeEvents();
      // Check if half completed, and if so, launch directly into the Hub.
      if (AffordabilityUtils.isTrackable(goal)) {
        this.showLoading = false;        
        return true;
      }
      else {
        // Always launch the create modal, if not overview-able
        let resume = AffordabilityUtils.isResumable(goal);
        if (!this.hasCreateModalLaunched) {
          let modal = this.modalCtrl.create(this.screens['create'], { goal, resume });
          modal.present().then(() => {
            this.showLoading = false;
          });
          modal.onDidDismiss(() => {
            this.hasCreateModalLaunched = false;
          })
        }
        return true;
      }
    }).catch(err => {
      console.error('Failed to create (select) real estate goal');
      console.error(err);
      // this.showCreateSplash = true;
      this.showLoadingError = true;    // This is problematic, if we can't set the RE Goal to 'SELECTED'
    });
  }
}