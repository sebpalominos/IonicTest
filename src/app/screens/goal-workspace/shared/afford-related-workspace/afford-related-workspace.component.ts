import { Component, Input, Output, EventEmitter } from '@angular/core';
import { NavController, ActionSheetController, PopoverController,
         LoadingController, AlertController, Events, TextInput } from 'ionic-angular';

import { GoalWorkspaceBase } from '../goal-workspace.model';
import { SpendingCategoryInfo } from '../goal-workspace-data-maps';
import { AffordabilityRelatedGoalWorkspace, AffordabilityRelatedGoalWorkspaceShape } from '../goal-workspace-afford.model';
import { SavingsRelated } from '../goal-workspace-savings.model';
import { GoalWorkspaceUtils } from '../goal-workspace-utils';
import { EditSpendingCategoryComponent } from '../../edit-spending-category/edit-spending-category.component';
import { Account } from '../../../accounts/shared/account.model';
import { GoalSummary, GoalSummaryItemType } from '../../../goal-centre/shared/goal-summary.model';
import { AccountResponse } from '../../../../core/data/account/account-response';
import { WorkspaceSubmissionResponse, GoalResponseValues } from '../../../../core/data/goal/goal-response';
import { LinkAccountStateValue } from '../../../../core/data/goal/goal-state';
import { GoalService } from '../../../../core/services/goal/goal.service';

/**
 * Edit the account linked to a Savings Goal
 * @export
 * @class EditGoalComponent
 */
@Component({
  selector: 'afford-related-workspace',
  templateUrl: 'afford-related-workspace.component.html'
})
export class AffordabilityRelatedWorkspaceComponent {
  // linkAccountState: LinkAccountStateValue;
  @Input('id') goalTypeIdentifier: GoalResponseValues.Type;
  @Input() workspacePath: string;
  @Input() workspace: AffordabilityRelatedGoalWorkspace;
  @Input() appearance: GoalWorkspaceUtils.WorkspaceAppearanceType = 'default';
  @Output() workspaceChanged = new EventEmitter<AffordabilityRelatedGoalWorkspace>();
  @Output() limitChanged = new EventEmitter<number>();      // Emits the category ID
  overallSummary: GoalSummary;
  totalSpend: GoalSummaryItemType.MoneyItem;
  discretionarySpend: GoalSummaryItemType.MoneyItem;
  subSpends: GoalSummaryItemType.MoneyItem[];
  spendingCategories: SpendingCategoryInfo[];      // Whatever we've cached
  screens = {
    edit: EditSpendingCategoryComponent
  };
  constructor(
    protected navCtrl: NavController,
    protected actionSheetCtrl: ActionSheetController,
    protected popoverCtrl: PopoverController,
    protected loadingCtrl: LoadingController,
    protected alertCtrl: AlertController,
    protected events: Events,
    protected goalService: GoalService
  ) {}
  ngOnInit() {
    this.subscribeEvents();
    this.retrieveWorkspace(true).then((workspace: AffordabilityRelatedGoalWorkspace) => {
      this.workspace = workspace;
        // Load per category expenditure summary
      this.spendingCategories = this.workspace.spendingAreas.map(sa => (<SpendingCategoryInfo>{
        id: sa.id, 
        spendingArea: sa,
        spendingLimit: this.workspace.spendingLimits.find(sl => sl.id === sa.id),
        isDirty: false
      }));
      this.spendingCategories.forEach(sc => this.loadSpendingCategorySummary(sc.id));
    });
  }
  editSpendingCategory(spendingCategory: SpendingCategoryInfo) {
    let workspace = this.workspace;
    let workspacePath = this.workspacePath;
    this.navCtrl.push(this.screens['edit'], { spendingCategory, workspace, workspacePath });
  }
  private retrieveWorkspace(foreground = false): Promise<GoalWorkspaceBase> {
    if (this.workspace) {
      return Promise.resolve(this.workspace);
    }
    else if (this.workspacePath) {
      if (foreground) {
        var loading = this.loadingCtrl.create({ content: 'Loading' });
        loading.present();
      }
      let initializer = AffordabilityRelatedGoalWorkspace.createFromResponse;
      return this.goalService.getWorkspace(this.workspacePath, initializer).then(workspace => {
        loading && loading.dismiss();
        return workspace;
      }).catch(err => {
        console.error(err);
        loading && loading.dismiss();
        return null;
      });
    }
    else {
      console.warn('Workspace path not set for Affordability workspace');
    }
  }
  /**
   * Loads summary for a category ID, if that category was preloaded into the 
   * internal list of spending categories.
   * @private
   * @param {number} categoryId 
   * @memberof SavingsRelatedWorkspaceComponent
   */
  private loadSpendingCategorySummary(categoryId: number) {
    let spendingCategory: SpendingCategoryInfo = (this.spendingCategories.find(sc => sc.id === categoryId));
    if (!spendingCategory) {
      return console.warn(`Category ID ${categoryId} was not found in the spending category list.`);
    }
    this.setBusyActivity(categoryId, true);    // Turn off spinner
    let payload = spendingCategory.spendingArea.link.body;      // This is the perspective required for loading that category
    this.goalService.getExpenditureSummary(this.goalTypeIdentifier, 'RD_SAVINGS_POSSIBLE', payload).then(summary => {
      // Add the whole summary object, but also try to extract projected
      // and current, then bind to the spendingCategoryInfo object directly.
      // Todo: This is pretty shite way of doing it, so API improvements requested.
      spendingCategory.spendingSummary = summary;
      summary.moneySummaries.forEach(ms => {
        if (ms.label.toLowerCase().includes('current')) {
          let current = ms.currentValue || ms.proposedValue;
          spendingCategory.spendingArea.currentValue = current;
        }
        if (ms.label.toLowerCase().includes('expected')) {
          let expected = ms.currentValue || ms.proposedValue;
          spendingCategory.spendingArea.projectedValue = expected;
        }
      });
      this.setBusyActivity(categoryId, false);    // Turn off spinner
    });
  }
  private updateEditedSpendingLimit(categoryId: number, newSpendLimit: number, newNarrative: string = '') {
    let spendingCategory: SpendingCategoryInfo = (this.spendingCategories.find(sc => sc.id === categoryId));
    if (spendingCategory) {
      spendingCategory.spendingLimit = spendingCategory.spendingLimit || <SavingsRelated.SpendingLimit>{};
      spendingCategory.spendingLimit.limitValue = newSpendLimit;
      spendingCategory.spendingLimit.narrative = newNarrative;
    }
    else {
      console.warn(`Category ID ${categoryId} was not found in the spending category list.`);
    }
  }
  private setBusyActivity(categoryId: number, isBusy: boolean = true) {
    let spendingCategory: SpendingCategoryInfo = (this.spendingCategories.find(sc => sc.id === categoryId));
    if (!spendingCategory) {
      console.warn(`Category ID ${categoryId} was not found in the spending category list.`);
    }
    else {
      spendingCategory.isLoading = isBusy;
    }
  }
  private subscribeEvents() {
    // Known events are setSpendingLimitStarted, setSpendingLimitSuccess, setSpendingLimitFailed
    this.events.subscribe('goal:setSpendingLimitSuccess', (categoryId, newSpendLimit, newNarrative) => {
      /* Reloading summary won't do shit, because the only thing that changes is 
       the spending limit, i.e. which came from the the workspace targetSummary list. 
       It's not worth it to reload the workspace. */
      // this.loadSpendingCategorySummary(categoryId);
      this.updateEditedSpendingLimit(categoryId, newSpendLimit, newNarrative);
      this.setBusyActivity(categoryId, false);
      this.limitChanged.emit(categoryId);      // E.g. Trigger affordability spend limit calculator.
    });
    this.events.subscribe('goal:setSpendingLimitStarted', categoryId => {
      this.setBusyActivity(categoryId, true);
    });
    this.events.subscribe('goal:setSpendingLimitFailed', categoryId => {
      this.setBusyActivity(categoryId, false);
    });
    this.events.subscribe('goal:setSpendingLimitResponse', (response: WorkspaceSubmissionResponse) => {
      let receivedWorkspace = AffordabilityRelatedGoalWorkspace.createFromResponse(response.workspace);
      this.workspace = Object.assign(this.workspace, receivedWorkspace);
      // Note that the response workspace only contains targetSummary items.
      // We assign the summary info and the targetSummaries, both of which changed. The other response keys are non-existent 
      // which may present issues?
      // this.workspace = Object.assign(this.workspace, {
      //   thisMonthProjectedIncome: receivedWorkspace.thisMonthProjectedIncome,
      //   thisMonthProjectedExpenditure: receivedWorkspace.thisMonthProjectedExpenditure,
      //   thisMonthProjectedSurplus: receivedWorkspace.thisMonthProjectedSurplus,
      //   lastMonthActualIncome: receivedWorkspace.lastMonthActualIncome,
      //   lastMonthActualExpenditure: receivedWorkspace.lastMonthActualExpenditure,
      //   lastMonthActualSurplus: receivedWorkspace.lastMonthActualSurplus,
      //   targetMonthlySurplus: receivedWorkspace.targetMonthlySurplus,
      //   spendingLimitSavingsRequired: receivedWorkspace.spendingLimitSavingsRequired,
      //   spendingLimitCurrentSavings: receivedWorkspace.spendingLimitCurrentSavings
      // }, { spendingLimits: receivedWorkspace.spendingLimits });
      // this.workspace.thisMonthProjectedIncome = receivedWorkspace.thisMonthProjectedIncome;
      // this.workspace.spendingLimits = receivedWorkspace.spendingLimits;
      this.workspaceChanged.emit(this.workspace);
    });
  }
}