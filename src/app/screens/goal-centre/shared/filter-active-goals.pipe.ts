import { Pipe, PipeTransform } from '@angular/core';

import { AvailableGoalInfo } from './goal-misc';
import { GoalResponseValues } from '../../../core/data/goal/goal-response';

type ShowStatusArg = GoalResponseValues.Status | GoalResponseValues.Status[];

@Pipe({
  name: 'filterActiveGoals',
  pure: false
})
export class FilterActiveGoalsPipe implements PipeTransform {
  transform(items: AvailableGoalInfo[], showSelected: boolean, showStatus: ShowStatusArg = null): AvailableGoalInfo[] {
    let filteredBySelectionState = items.filter(item => showSelected == item.typeHeader.selected);
    if (showStatus) {
      return filteredBySelectionState.filter(item => {
        return Array.isArray(showStatus)
          ? ~showStatus.indexOf(item.typeHeader.status)
          : showStatus === item.typeHeader.status;
      });
    }
    return filteredBySelectionState;
  }
}