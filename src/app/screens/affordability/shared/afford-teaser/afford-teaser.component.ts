import { Component } from '@angular/core';
import { ModalController, Events } from 'ionic-angular';

import { AffordabilityGoal } from '../affordability-goal.model';
import { AffordabilityUtils } from '../affordability-utils';
import { AffordabilityComponent } from '../../affordability.component';
import { CreateAffordabilityComponent } from '../../create-afford/create-afford.component';
import { Property } from '../../../property-centre/shared/property.model';
import { GoalResponseValues } from '../../../../core/data/goal/goal-response';
import { GoalService } from '../../../../core/services/goal/goal.service';
import { PropertyService } from '../../../../core/services/property/property.service';
import { UserProfileService } from '../../../../core/services/user/user-profile.service';

@Component({
  selector: 'afford-teaser',
  templateUrl: 'afford-teaser.component.html',
  host: {
    class: 'afford-teaser'
  }
})
export class AffordabilityTeaserComponent {
  goal: AffordabilityGoal;
  preferredName: string;
  isTrackable: boolean;
  isResumable: boolean;
  showAffordLoading: boolean;
  screens = {
    create: CreateAffordabilityComponent,
    afford: AffordabilityComponent
  };
  constructor(
    // protected navCtrl: NavController,
    protected modalCtrl: ModalController,
    protected goalService: GoalService,
    protected propertyService: PropertyService,
    protected profileService: UserProfileService
  ) {}
  ngOnInit() {
    this.loadGoal();
    this.profileService.getLocalProfile().then(profile => {
      this.preferredName = profile.preferredName;
    });
  }
  beginGoal() {
    // console.warn('Todo: Hook up to route into Affordability first, then use a fast-forward param.');
    // this.navCtrl.push(this.screens['afford'])
    // this.modalCtrl.create(this.screens['afford']).present();
  }
  private createPropertyGoal(): Promise<boolean> {
    // Make sure the goal is activated. 
    return this.goalService.activateGoal('REAL_ESTATE').then(stateChange => {
      return stateChange ? stateChange.success : false;
    });
  }
  private retrieveAffordabilityGoal(foreground = false): Promise<AffordabilityGoal> {
    let affordabilityGoalTypeKey: GoalResponseValues.Type = 'REAL_ESTATE';
    return this.goalService.getGoalDetails(affordabilityGoalTypeKey);
  }
  private loadGoal(foreground = false) {
    this.showAffordLoading = true;
    this.createPropertyGoal().then(result => {
      return this.retrieveAffordabilityGoal(true);
    }).then(goal => {
      // The existing affordability goal in all its glory. If undefined, that's fine.
      // Note: DEFINED is a state where there is insufficient data to progress to IN_PROGRESS
      this.goal = goal;
      this.isTrackable = goal && AffordabilityUtils.isTrackable(goal);
      this.isResumable = goal && AffordabilityUtils.isResumable(goal);
      if (goal.targetPropertyId) {
        this.propertyService.getProperty(goal.targetPropertyId).then((targetProperty: Property) => {
          this.goal.targetProperty = targetProperty;
          this.showAffordLoading = false;
        })
      }
      else {
        this.showAffordLoading = false;
      }
      // return goal.targetPropertyId 
      //   ? 
      //   : Promise.resolve(null);
    }).catch(err => {
      console.error('Failed to create (select) real estate goal');
      console.error(err);
      // this.showCreateSplash = true;
      this.showAffordLoading = false;    // This is problematic, if we can't set the RE Goal to 'SELECTED'
    });
  }
}