import { AvailableGoalInfo } from '../shared/goal-misc';
import { GoalActionCollection } from '../../../core/data/goal/goal-maps';
import { GoalService } from '../../../core/services/goal/goal.service';

export namespace GoalUtils {
  export class GoalRetrieval {
    // includeSummary: boolean;
    // includeActions: boolean;
    constructor(protected goalService: GoalService, protected includeSummary = true, protected includeActions = true) {}
    retrieveGoalInfo(immediate = false): Promise<AvailableGoalInfo[]> {
      return this.goalService.getAvailableGoals().then(goalTypes => {
        // Map to display object, and load the goal summary for each
        let goals: AvailableGoalInfo[] = goalTypes.map(gt => ({ typeHeader: gt, summary: undefined }));
        let statusPromises = [];
        let actionPromises = [];
        for (let goal of goals.filter(goal => goal.typeHeader.selected)) {
          if (this.includeSummary) {
            statusPromises.push(this.updateStatus(goal));
          }
          if (this.includeActions) {
            actionPromises.push(this.updateActions(goal));
          }
        }
        let megaPromise = Promise.all([ Promise.all(statusPromises), Promise.all(actionPromises) ]).then(() => goals);
        return immediate ? goals : megaPromise;
      });
    }
    updateStatus(goal: AvailableGoalInfo) {
      let goalTypeIdentifier = goal.typeHeader.type;
      this.goalService.getGoalSummary(goalTypeIdentifier).then(summary => {
        if (summary) {
          goal.summary = summary;
          goal.needsAttention = !!(summary.progress && ~['TO_DO', 'MORE_TO_DO'].indexOf(summary.progress));
        }
      }).catch(err => {
        console.error(`Error retrieving goal summary for ${goalTypeIdentifier}:`);
        console.error(err);
      });
    }
    updateActions(goal: AvailableGoalInfo): Promise<GoalActionCollection> {
      let goalTypeIdentifier = goal.typeHeader.type;
      return this.goalService.getGoalActions(goalTypeIdentifier).then(actionCollection => {
        if (actionCollection.actions) {
          goal.callToAction = actionCollection.callToAction || null;
          goal.actions = actionCollection.actions || [];
        }
        return actionCollection;
      }).catch(err => {
        console.error(`Error retrieving goal actions for ${goalTypeIdentifier}:`);
        console.error(err);
      });
    }
  }
}