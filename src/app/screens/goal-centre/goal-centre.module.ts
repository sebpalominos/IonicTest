import { NgModule } from '@angular/core';
import { DatePipe } from '@angular/common';
import { IonicModule } from 'ionic-angular';
import { SharedModule } from '../../shared/shared.module';

import { CreateGoalComponent } from './create-goal/create-goal.component';
import { CreateGoalStartComponent } from './create-goal/create-goal-start.component';
import { CreateGoalTypeComponent } from './create-goal/create-goal-type.component';
import { CreateGoalLinkAccountComponent } from './create-goal/create-goal-link-account.component';
import { CreateGoalProseComponent } from './create-goal/create-goal-prose.component';
import { CreateGoalDurationComponent } from './create-goal/create-goal-duration.component';
import { CreateGoalCompleteComponent } from './create-goal/create-goal-complete.component';
import { EditGoalComponent } from './edit-goal/edit-goal.component';
import { GoalComponent } from './goal/goal.component';
import { GoalActionItemsComponent } from './goal-action-items/goal-action-items.component';
import { GoalCentreComponent } from './goal-centre.component';
import { GoalListComponent } from './goal-list/goal-list.component';
import { FilterActiveGoalsPipe } from './shared/filter-active-goals.pipe';
import { GoalSummaryComponent } from './shared/goal-summary/goal-summary.component';

@NgModule({
  declarations: [ 
    GoalComponent, 
    GoalCentreComponent,
    GoalSummaryComponent,
    GoalActionItemsComponent,
    GoalListComponent,
    CreateGoalComponent,
    CreateGoalStartComponent,
    CreateGoalTypeComponent,
    CreateGoalLinkAccountComponent,
    CreateGoalProseComponent,
    CreateGoalDurationComponent,
    CreateGoalCompleteComponent,
    EditGoalComponent,
    FilterActiveGoalsPipe
  ],
  providers: [
    DatePipe
  ],
  imports: [
    IonicModule,
    SharedModule
  ],
  exports: [ 
    GoalComponent, 
    GoalCentreComponent, 
    GoalSummaryComponent,
    GoalActionItemsComponent,
    GoalListComponent,
    CreateGoalComponent,
    CreateGoalStartComponent,
    CreateGoalTypeComponent,
    CreateGoalLinkAccountComponent,
    CreateGoalProseComponent,
    CreateGoalDurationComponent,
    CreateGoalCompleteComponent,
    EditGoalComponent,
    FilterActiveGoalsPipe
  ],
  entryComponents: [ 
    GoalComponent, 
    GoalCentreComponent, 
    GoalActionItemsComponent,
    GoalListComponent,
    CreateGoalComponent,
    CreateGoalStartComponent,
    CreateGoalTypeComponent,
    CreateGoalLinkAccountComponent,
    CreateGoalProseComponent,
    CreateGoalDurationComponent,
    CreateGoalCompleteComponent,
    EditGoalComponent,
  ]
})
export class GoalsModule {}
