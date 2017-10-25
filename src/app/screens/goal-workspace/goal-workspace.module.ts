import { NgModule } from '@angular/core';
import { DatePipe } from '@angular/common';
import { IonicModule } from 'ionic-angular';
import { SharedModule } from '../../shared/shared.module';

import { GoalWorkspaceComponent } from './goal-workspace.component';
import { EditSpendingCategoryComponent } from './edit-spending-category/edit-spending-category.component';
import { AccountRelatedWorkspaceComponent } from './shared/account-related-workspace/account-related-workspace.component';
import { SavingsRelatedWorkspaceComponent } from './shared/savings-related-workspace/savings-related-workspace.component';
import { AffordabilityRelatedWorkspaceComponent } from './shared/afford-related-workspace/afford-related-workspace.component';

@NgModule({
  declarations: [ 
    GoalWorkspaceComponent,
    EditSpendingCategoryComponent,
    AccountRelatedWorkspaceComponent,
    SavingsRelatedWorkspaceComponent,
    AffordabilityRelatedWorkspaceComponent
  ],
  providers: [
    DatePipe
  ],
  imports: [
    IonicModule,
    SharedModule
  ],
  exports: [ 
    GoalWorkspaceComponent,
    EditSpendingCategoryComponent,
    AccountRelatedWorkspaceComponent,
    SavingsRelatedWorkspaceComponent,
    AffordabilityRelatedWorkspaceComponent
  ],
  entryComponents: [ 
    GoalWorkspaceComponent,
    EditSpendingCategoryComponent,
  ]
})
export class GoalWorkspaceModule {}
