import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavParams, NavController, ActionSheetController, PopoverController, 
         LoadingController, TextInput } from 'ionic-angular';

import { GoalBase, GoalShape, GoalResponseValues } from '../shared/goal.model';
import { GoalSummary, GoalSummaryItemType } from '../shared/goal-summary.model';
import { GoalWorkspaceBase } from '../shared/goal-workspace.model';
import { TimeScaleType } from '../../../core/data/shared/constant-types';
import { GoalService } from '../../../core/services/goal/goal.service';

import { EditGoalPopoverComponent } from './edit-goal-popover.component';

type GoalSummaryItemMap = {
  item: GoalSummaryItemType.Item;
  itemType: GoalResponseValues.SettingType;
  userInput?: string;
  isEditable?: boolean;
  isEditing?: boolean;
  isSaving?: boolean;
};

/**
 * Loads a Workspace and presents settings for editing.
 * @export
 * @class EditGoalComponent
 */
@Component({
  selector: 'scr-edit-goal',
  templateUrl: 'edit-goal.html'
})
export class EditGoalComponent {
  summary: GoalSummary;
  summaryItems: GoalSummaryItemMap[];
  showLoadingError: boolean;
  isDirty: boolean;
  goalTypeIdentifier: GoalResponseValues.Type;
  // timeScaleOptions: TimeScaleOption[] = [
  //   { label: 'Weekly', value: TimeScaleType.Weekly },
  //   { label: 'Fortnightly', value: TimeScaleType.Fortnightly },
  //   { label: 'Monthly', value: TimeScaleType.Monthly },
  //   { label: 'Yearly', value: TimeScaleType.Yearly }
  // ];
  constructor(
    protected params: NavParams, 
    protected navCtrl: NavController, 
    protected actionSheetCtrl: ActionSheetController,
    protected popoverCtrl: PopoverController,
    protected loadingCtrl: LoadingController,
    protected goalService: GoalService) {}
  ionViewWillLoad() {
    // Retrieve goal summary items, display in a list.
    // if summary.editable is false, then disable that item
    // Otherwise let people edit one field at a time. In editing mode, it focuses on the particular field being edited.
    // Recalculate button should feature prominently    
    this.retrieveSummary(true).then(summary => {
      // Munge all of them into summaryItems.
      this.summary = summary;
      this.summaryItems = Array.prototype.concat([], 
        summary.moneySummaries.map(item => (<GoalSummaryItemMap>{ item, itemType: item.type, isEditable: !!item.isEditable })),
        summary.timeSummaries.map(item => (<GoalSummaryItemMap>{ item, itemType: item.type, isEditable: !!item.isEditable })),
        summary.objectSummaries.map(item => (<GoalSummaryItemMap>{ item, itemType: item.type, isEditable: !!item.isEditable }))
      );
      this.summaryItems.sort((a, b) => {
        if (a.item.editOrder > b.item.editOrder) return 1;
        if (a.item.editOrder < b.item.editOrder) return -1;
        return 0;
      });
    });
  }
  ionViewDidEnter() {
    // setTimeout(() => {
    //   this.nameField.setFocus();
    // }, 500);
  }
  setEditing(summary: GoalSummaryItemMap) {
    summary.isEditing = true;
    this.isDirty = true;
  }
  recalculate(item: GoalSummaryItemType.Item) {
    // Todo: Check if dirty value is same as old value; if so, then skip submission.
    this.goalService.submitRecalculateSetting(this.goalTypeIdentifier, 'x', {}).then(newSummary => {
      console.log(newSummary);
    });
  }
  submitSettings() {
    // Approach: Individually send to the endpoint. The documentation only specifies a single setting being 
    // saved at any one time; this should be OK because there aren't that many settings anyway.
    this.summaryItems.filter(item => item.isEditing).forEach(summaryItem => {
      summaryItem.isSaving = true;
      this.goalService.submitSetting(this.goalTypeIdentifier, summaryItem.item.id, summaryItem.userInput).then(stateChange => {
        console.log(stateChange);
        summaryItem.isSaving = false;
        if (stateChange.success) {
          summaryItem.isEditing = false;
        }
      });
    });
  }
  private retrieveSummary(foreground = false): Promise<GoalSummary> {
    if (this.params.get('goal')) {
      let goal: GoalBase = this.params.get('goal');
      return Promise.resolve(goal.summary);
    }
    else if (this.params.get('goalTypeIdentifier')) {
      this.goalTypeIdentifier = this.params.get('goalTypeIdentifier');
      if (foreground) {
        // Start loading cos it gonna take a while
        var loading = this.loadingCtrl.create({ content: 'Loading goal' });
        loading.present();
      }
      return this.goalService.getGoalSummary(this.goalTypeIdentifier).then(summary => {
        loading && loading.dismiss();
        return summary;
      }).catch(err => {
        loading && loading.dismiss();
        this.showLoadingError = true;
      });
    }
  }
}