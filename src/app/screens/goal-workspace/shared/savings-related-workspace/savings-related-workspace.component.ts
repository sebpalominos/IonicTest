import { Component, Input, Output, EventEmitter } from '@angular/core';
import { NavController, ActionSheetController, PopoverController,
         LoadingController, AlertController, Events, TextInput } from 'ionic-angular';

import { GoalWorkspaceBase } from '../goal-workspace.model';
import { SpendingCategoryInfo } from '../goal-workspace-data-maps';
import { SavingsRelatedGoalWorkspace } from '../goal-workspace-savings.model';
import { GoalWorkspaceUtils } from '../goal-workspace-utils';
import { EditSpendingCategoryComponent } from '../../edit-spending-category/edit-spending-category.component';
import { Account } from '../../../accounts/shared/account.model';
import { GoalSummary, GoalSummaryItemType } from '../../../goal-centre/shared/goal-summary.model';
import { AccountResponse } from '../../../../core/data/account/account-response';
import { WorkspaceSubmissionResponse, GoalResponseValues } from '../../../../core/data/goal/goal-response';
import { LinkAccountStateValue } from '../../../../core/data/goal/goal-state';
import { GoalService } from '../../../../core/services/goal/goal.service';
import { PieChartUtil }  from '../../../../shared/pie-chart/pie-chart-util';

/**
 * Edit the account linked to a Savings Goal
 * @export
 * @class EditGoalComponent
 */
@Component({
  selector: 'savings-related-workspace',
  templateUrl: 'savings-related-workspace.html'
})
export class SavingsRelatedWorkspaceComponent {
  // linkAccountState: LinkAccountStateValue;
  @Input('id') goalTypeIdentifier: GoalResponseValues.Type;
  @Input() workspacePath: string;
  // @Input() appearance: GoalWorkspaceUtils.WorkspaceAppearanceType = 'default';
  @Output() limitChanged = new EventEmitter();
  workspace: SavingsRelatedGoalWorkspace;
  overallSummary: GoalSummary;
  overallSummaryGraphData: PieChartUtil.DatasetInput;
  overallSummaryGraphOptions: PieChartUtil.OptionsInput;
  overallSummaryGraphLabels: PieChartUtil.LabelSetInput;
  totalSpend: GoalSummaryItemType.MoneyItem;
  discretionarySpend: GoalSummaryItemType.MoneyItem;
  subSpends: GoalSummaryItemType.MoneyItem[];
  spendingCategories: SpendingCategoryInfo[];      // Whatever we've cached
  screens: { [screenName: string]: any } = {
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
    this.retrieveWorkspace(true).then((workspace: SavingsRelatedGoalWorkspace) => {
      this.workspace = workspace;
      this.loadOverallSummaries();
    });
  }
  editSpendingCategory(spendingCategory: SpendingCategoryInfo) {
    // Note: Recommended to hardcode focus to EXPENDITURE; this will be deprecated in the API later.
    // https://opicagroup.atlassian.net/wiki/display/SPEC/GENERIC_SAVINGS+Deepdive#GENERIC_SAVINGSDeepdive-POSTgoals/worklist/info/GENERIC_SAVINGS/RD_SAVINGS_POSSIBLE/EXPENDITURE
    let workspace = this.workspace;
    let workspacePath = [this.workspace.path, 'EXPENDITURE']; 
    this.navCtrl.push(this.screens['edit'], { spendingCategory, workspace, workspacePath });
  }
  private retrieveWorkspace(foreground = false): Promise<GoalWorkspaceBase> {
    if (this.workspacePath) {
      if (foreground) {
        var loading = this.loadingCtrl.create({ content: 'Loading' });
        loading.present();
      }
      let initializer = SavingsRelatedGoalWorkspace.createFromResponse;
      return this.goalService.getWorkspace(this.workspacePath, initializer).then(workspace => {
        loading && loading.dismiss();
        return workspace;
      }).catch(err => {
        loading && loading.dismiss();
        console.error(err);
        return null;
      });
    }
  }
  private loadOverallSummaries() {
    if (!this.goalTypeIdentifier) {
      throw new Error('NavParam goalTypeIdentifier was expected, but not present.');
    }
    // overall expenditure summary
    let overallPayload = this.workspace.summaryPerspective;
    delete overallPayload.category_type;
    this.goalService.getExpenditureSummary(this.goalTypeIdentifier, 'RD_SAVINGS_POSSIBLE', overallPayload).then(summary => {
      this.overallSummary = summary;
      // Separate money summaries into total or subspend
      this.totalSpend = this.overallSummary.moneySummaries.find(smy => smy.label.toLowerCase().includes('total'));      // Todo: de-hardcode the label matching
      this.discretionarySpend = this.overallSummary.moneySummaries.find(smy => smy.label.toLowerCase().includes('discretionary'));      // Todo: de-hardcode the label matching
      this.subSpends = this.overallSummary.moneySummaries.filter(smy => !smy.label.toLowerCase().includes('total'));      // Todo: de-hardcode the label matching
      // Render graphs
      let graphColours = ['#2ecc71', '#e67e22', '#f1c40f', '#3498db'];
      this.overallSummaryGraphLabels = this.subSpends.map(sub => `${sub.label}`);
      this.overallSummaryGraphData = <PieChartUtil.DatasetInput> {
        label: 'Expenditure',
        data: this.subSpends.map(sub => sub.currentValue),
        borderWidth: this.subSpends.map(sub => 2),    // 4px border width
        borderColor: this.subSpends.map(sub => 'transparent'),
        hoverBorderWidth: this.subSpends.map(sub => 6),    // 4px border width
        hoverBorderColor: this.subSpends.map(sub => 'white'),
        backgroundColor: this.subSpends.map((sub, index) => graphColours[index]),    // Expect no more than 4 subspends
      };
      this.overallSummaryGraphOptions = <PieChartUtil.OptionsInput> {
        // legend: {
        //   display: true,
        //   position: 'right'
        // }
      };
    });
    // Load per category expenditure summary
    this.spendingCategories = this.workspace.spendingAreas.map(sa => (<SpendingCategoryInfo>{
      id: sa.id, 
      spendingArea: sa,
      spendingLimit: this.workspace.spendingLimits.find(sl => sl.id === sa.id),
      isDirty: false
    }));
    this.spendingCategories.forEach(sc => this.loadSpendingCategorySummary(sc.id));
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
    if (!spendingCategory) {
      console.warn(`Category ID ${categoryId} was not found in the spending category list.`);
    }
    else {
      spendingCategory.spendingLimit.limitValue = newSpendLimit;
      spendingCategory.spendingLimit.narrative = newNarrative;
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
      this.limitChanged.emit();      // E.g. Trigger affordability spend limit calculator.
    });
    this.events.subscribe('goal:setSpendingLimitStarted', (categoryId) => {
      this.setBusyActivity(categoryId, true);
    });
    this.events.subscribe('goal:setSpendingLimitFailed', (categoryId) => {
      this.setBusyActivity(categoryId, false);
    });
  }
}