import { Injectable } from '@angular/core';
import { InsightsHttpService } from '../insights-http/insights-http.service';
import { Storage } from '@ionic/storage';

import { GoalResponseValues, GoalResponse, GoalHeaderListResponse, SingleGoalResponse } from '../../data/goal/goal-response';
import { GoalSummaryListResponse, GoalProseResponse, GoalOverviewListResponse, GoalOverviewItemResponse, } from '../../data/goal/goal-response'; 
import { ExpenditureGraphDataResponse, GoalWorkspacePerspectiveResponse } from '../../data/goal/goal-response';
import { GoalWorkspaceResponse, SingleGoalWorkspaceResponse, WorkspaceSubmissionResponse } from '../../data/goal/goal-response';
import { StateChangeResponse } from '../../data/shared/state-change-response';
import { GoalBase } from '../../../screens/goal-centre/shared/goal.model';
import { GoalAction, GoalCallToAction } from '../../../screens/goal-centre/shared/goal-action.model';
import { GoalProseContinuation, GoalActionCollection } from '../../data/goal/goal-maps';
import { GoalProsePrompt } from '../../../screens/goal-centre/shared/goal-prose-prompt.model';
import { GoalOverview } from '../../../screens/goal-centre/shared/goal-overview.model';
import { GoalSummary } from '../../../screens/goal-centre/shared/goal-summary.model';
import { GoalType } from '../../../screens/goal-centre/shared/goal-type.model';
import { GoalWorkspaceBase } from '../../../screens/goal-workspace/shared/goal-workspace.model';
import { AccountRelatedGoalWorkspace } from '../../../screens/goal-workspace/shared/goal-workspace-account.model';
import { SavingsRelatedGoalWorkspace } from '../../../screens/goal-workspace/shared/goal-workspace-savings.model';
import { ExpenditureGraph } from '../../../screens/goal-workspace/shared/expenditure-graph.model';

import { SavingsGoal } from '../../../screens/goal-centre/shared/savings-goal.model';
import { AffordabilityGoal } from '../../../screens/affordability/shared/affordability-goal.model';

@Injectable()
export class GoalService {
  // goalTypes: GoalType[];
  activeGoalTypes: GoalResponseValues.Type[];   // Used to keep state, as POST /goals relies on state
  constructor(
    protected http: InsightsHttpService
  ) {}
  /**
   * Get the goals that are available for a user to 'select'
   * @param {boolean} [activeOnly=false] - Filter by only goals that are active for the user
   * @returns {Promise<GoalType[]>} 
   * @memberOf GoalService
   */
  getAvailableGoals(activeOnly: boolean = false): Promise<GoalType[]> {
    let endpoint = activeOnly ? ['goals', 'type', 'active'] : ['goals'];
    // Implement a client-side filter for the types of goals to be returned
    let goalTypeFilters = ['GENERIC_SAVINGS', 'REAL_ESTATE'];     // TODO: Remove this hard coded filter
    // let goalTypeFilters = [];
    return this.http.get(endpoint).toPromise().then(resp => {
      if (resp.ok) {
        let body: GoalHeaderListResponse = resp.json();
        // Retrieve the goal types in the desired object structure, then 
        // update the activeGoalList by side effect
        this.activeGoalTypes = body.goalHeaders.filter(gh => gh.selected && goalTypeFilters.indexOf(gh.type) > -1).map(gh => gh.type);
        let goalTypes = GoalType.createListFromResponse(body);
        return goalTypeFilters.length ? goalTypes.filter(gt => goalTypeFilters.indexOf(gt.type) > -1) : goalTypes;
      }
      else {
        throw new Error(resp.statusText);
      }
    });
  }
  /**
   * Summary for a particular goal type, for example, to display on lists.
   * @param {GoalResponseValues.Type} goalTypeIdentifier 
   * @returns {Promise<GoalSummary>} 
   * @memberOf GoalService
   */
  getGoalSummary(goalTypeIdentifier: GoalResponseValues.Type): Promise<GoalSummary> {
    // let endpoint = ['goals', goalTypeIdentifier, 'summary'];
    let endpoint = ['goals', goalTypeIdentifier];
    return this.http.get(endpoint).toPromise().then(resp => {
      if (!resp.ok) {
        throw new Error('Failed to get data for '+goalTypeIdentifier);    // Chrome debugger hates throw + template strings
      }
      // let body: GoalSummaryListResponse = resp.json();
      // return GoalSummary.createFromResponse(body, goalTypeIdentifier);
      let body: GoalResponse = resp.json();
      return GoalSummary.createFromResponse(body.summary, goalTypeIdentifier, body.progress);
    });
  }
  /**
   * Actions for a goal, and the top call-to-action
   * @param {GoalResponseValues.Type} goalTypeIdentifier 
   * @returns {Promise<GoalActionCollection>} 
   * @memberOf GoalService
   */
  getGoalActions(goalTypeIdentifier: GoalResponseValues.Type): Promise<GoalActionCollection> {
    let endpoint = ['goals', goalTypeIdentifier];
    return this.http.get(endpoint).toPromise().then(resp => {
      if (!resp.ok) {
        throw new Error('Failed to get data for '+goalTypeIdentifier);    // Chrome debugger hates throw + template strings
      }
      let body: GoalResponse = resp.json();
      return <GoalActionCollection> {
        progress: body.progress,
        callToAction: GoalCallToAction.createFromResponse(body.callToAction),
        actions: GoalAction.createListFromResponse(body.actions, body.header)
      };
    });
  }
  /**
   * An alias for getGoalDetails
   * @param {GoalResponseValues.Type} goalTypeIdentifier 
   * @returns {Promise<Goal>} 
   * @memberOf GoalService
   */
  getGoal(goalTypeIdentifier: GoalResponseValues.Type): Promise<GoalBase> {
    return this.getGoalDetails(goalTypeIdentifier);
  }
  /**
   * Retrieve all known details for a goal type.
   * @param {GoalResponseValues.Type} goalTypeIdentifier 
   * @returns {Promise<Goal>} 
   * @todo In a future API release, this method will move to Goal ID 
   * based, rather than goalTypeIdentifier based
   * @memberOf GoalService
   */
  getGoalDetails(goalTypeIdentifier: GoalResponseValues.Type): Promise<GoalBase> {
    let endpoint = ['goals', goalTypeIdentifier];
    return this.http.get(endpoint).toPromise().then(resp => {
      if (resp.ok) {
        let body: GoalResponse = resp.json();
        switch (goalTypeIdentifier) {
          case 'REAL_ESTATE':
            return AffordabilityGoal.createFromResponse(body);
          case 'GENERIC_SAVINGS':
          default:
            return SavingsGoal.createFromResponse(body);
        }
      }
      return undefined;
    });
  }
  /**
   * Retrieve the summary and header for a goal type. Useful for displaying as a previews. 
   * @param {GoalResponseValues.Type} goalTypeIdentifier 
   * @returns {Promise<GoalOverview>} 
   * @memberOf GoalService
   */
  getGoalOverview(goalTypeIdentifier: GoalResponseValues.Type): Promise<GoalOverview> {
    let endpoint = ['goals', goalTypeIdentifier];
    return this.http.get(endpoint).toPromise().then(resp => {
      let body: GoalResponse = resp.json();
      return body.overview 
        ? GoalOverview.createFromResponse(body.overview, body.header) 
        : new GoalOverview({ typeHeader: body.header });
    });
  }
  /**
   * Set a goal type as selected
   * @param {GoalResponseValues.Type} goalTypeIdentifier 
   * @returns {Promise<StateChangeResponse>} 
   * @memberOf GoalService
   */
  activateGoal(goalTypeIdentifier: GoalResponseValues.Type): Promise<StateChangeResponse> {
    return this.prefetchActiveGoals().then(() => {
      let endpoint = ['goals'];
      let newActiveGoalTypes = [].concat(this.activeGoalTypes, goalTypeIdentifier);
      let payload = { goals: newActiveGoalTypes };
      return this.http.post(endpoint, payload).toPromise().then(resp => {
        let body: GoalHeaderListResponse = resp.json();
        // Update the activeGoalTypes list, and return 
        // true if the requested goalTypeIdentifier is now 'selected'
        this.activeGoalTypes = body.goalHeaders.filter(gh => gh.selected).map(gh => gh.type);
        return { success: !!this.activeGoalTypes.find(gt => gt === goalTypeIdentifier) };
      });
    }).catch(err => {
      console.error(err);
    });
  }
  /**
   * Set a goal type as 'unselected'. 
   * @param {GoalResponseValues.Type} goalTypeIdentifier 
   * @returns {Promise<StateChangeResponse>} 
   * @todo New endpoint to actually wipe the goal, rather than simply unselecting
   * @memberOf GoalService
   */
  deleteGoal(goalTypeIdentifier: GoalResponseValues.Type): Promise<StateChangeResponse> {
    return this.prefetchActiveGoals().then(() => {
      let endpoint = ['goals'];
      let newActiveGoalTypes = this.activeGoalTypes.slice();
      let removalGoalTypeIndex = this.activeGoalTypes.findIndex(gt => gt === goalTypeIdentifier);
      if (removalGoalTypeIndex >= 0) {
        newActiveGoalTypes.splice(removalGoalTypeIndex, 1);
      }
      let payload = { goals: newActiveGoalTypes };
      return this.http.post(endpoint, payload).toPromise().then(resp => {
        let body: GoalHeaderListResponse = resp.json();
        // Update the activeGoalTypes list, and return 
        // true if the requested goalTypeIdentifier is now 'selected'
        this.activeGoalTypes = body.goalHeaders.filter(gh => gh.selected).map(gh => gh.type);
        return { success: !this.activeGoalTypes.find(gt => gt === goalTypeIdentifier) };
      });
    });
  };
  /**
   * Get next prose; this is the 'kickoff' request. Subsequent handling should be done 
   * through submitGoalProseResponse()
   * @param {GoalResponseValues.Type} goalTypeIdentifier 
   * @returns {Promise<GoalProsePrompt>}  
   * @memberOf GoalService
   */
  getNextGoalProse(goalTypeIdentifier: GoalResponseValues.Type): Promise<GoalProseContinuation> {
    let endpoint = ['goals', 'prose', goalTypeIdentifier];
    return this.http.get(endpoint).toPromise().then(resp => {
      let body: GoalProseResponse = resp.json();
      let goalProsePrompt = GoalProsePrompt.createFromResponse(body);
      return <GoalProseContinuation> {
        next: goalProsePrompt,
        complete: body.complete
      };
    });
  }
  /**
   * Get all goal prose to date, possibly as a summary.
   * @param {GoalResponseValues.Type} goalTypeIdentifier 
   * @returns {Promise<GoalProsePrompt[]>} 
   * @memberOf GoalService
   */
  getExistingGoalProse(goalTypeIdentifier: GoalResponseValues.Type): Promise<GoalProsePrompt[]> {
    let endpoint = ['goals', 'prose', goalTypeIdentifier];
    return this.http.get(endpoint).toPromise().then(resp => {
      let body: GoalProseResponse = resp.json();
      return GoalProsePrompt.createListFromResponse(body, false);
    });
  }
  /**
   * Send a response to the previous prose, and fetch next if applicable. 
   * Each subsequent prose request should use this. 
   * @param {GoalResponseValues.Type} goalTypeIdentifier 
   * @param {*} proseResponse 
   * @returns {Promise<GoalProseContinuation>}  * @todo Strongly typed proseResponse argument
   * @memberOf GoalService
   */
  submitGoalProseResponse(goalTypeIdentifier: GoalResponseValues.Type, proseResponse: any): Promise<GoalProseContinuation> {
    let endpoint = ['goals', 'prose', goalTypeIdentifier];
    let payload = proseResponse || {};
    return this.http.post(endpoint, payload).toPromise().then(resp => {
      let body: GoalProseResponse = resp.json();
      let goalProsePrompt = GoalProsePrompt.createFromResponse(body);
      return <GoalProseContinuation> {
        next: goalProsePrompt,
        complete: body.complete
      };
    });
  }
  /**
   * Submit a goal summary item for recalculation, and return the updated summary. 
   * @param {GoalResponseValues.Type} goalTypeIdentifier 
   * @param {string} summaryItemIdentifier 
   * @param {*} summaryItemValue 
   * @returns {Promise<GoalSummary>} 
   * @memberof GoalService
   */
  submitRecalculateSetting(goalTypeIdentifier: GoalResponseValues.Type, summaryItemIdentifier: string, summaryItemValue: any): Promise<GoalSummary> {
    let endpoint = ['goals', goalTypeIdentifier, 'settings', 'recalculate'];
    let payload = { [summaryItemIdentifier]: summaryItemValue };
    return this.http.post(endpoint, payload).toPromise().then(resp => {
      let body: GoalResponse = resp.json();
      return GoalSummary.createFromResponse(body.summary, goalTypeIdentifier, body.progress);
    });
  }
  /**
   * Submit a summary item change. 
   * @param {GoalResponseValues.Type} goalTypeIdentifier 
   * @param {string} summaryItemIdentifier 
   * @param {*} summaryItemValue 
   * @returns {Promise<StateChangeResponse>} 
   * @memberof GoalService
   */
  submitSetting(goalTypeIdentifier: GoalResponseValues.Type, summaryItemIdentifier: string, summaryItemValue: any): Promise<StateChangeResponse> {
    let endpoint = ['goals', goalTypeIdentifier, 'settings'];
    let payload = { [summaryItemIdentifier]: summaryItemValue };
    return this.http.post(endpoint, payload).toPromise().then(resp => {
      let body: GoalResponse = resp.json();
      if (body.summary) {
        return <StateChangeResponse> { success: true, id: body.header.type };
      }
      return <StateChangeResponse> { success: false };
    });
  }
  /**
   * Retrieve Workspace, based on inputs coming out of a GoalAction object. 
   * @param {(string|string[])} workspacePath - Path to workspace, retrieved from a GoalAction object.
   * @param {string} [method='GET'] - Whether to use GET or POST, retrieved from a GoalAction object.
   * @param {*} [payload={}] - Required payload for a POST, retrieved from a GoalAction object.
   * @returns {Promise<GoalWorkspaceResponse>} 
   * @memberOf GoalService
   */
  getWorkspace(workspacePath: string|string[], workspaceInitializer: (resp: GoalWorkspaceResponse, path?: string) => GoalWorkspaceBase = null, 
    method: string = 'GET', payload: any = {}): Promise<GoalWorkspaceBase> {
    let request = (method === 'POST') 
      ? this.http.post(workspacePath, payload) 
      : this.http.get(workspacePath);
    return request.toPromise().then(resp => {
      let body: GoalWorkspaceResponse = resp.json();
      if (workspaceInitializer) {
        let workspacePathAsString = Array.isArray(workspacePath) ? workspacePath.join('/') : workspacePath;
        return workspaceInitializer(body, workspacePathAsString);
      }
      else {
        // TO BE DEPRECATED.
        // Now we have to start guessing what kind of workspace it is. All our workspaces are 
        // somewhat specific implementations; the base workspace is abstract on purpose, so that
        // we can pre-parse useful data for each implementation. E.g. Account/Product data gets
        // pre-parsed for AccountRelatedGoalWorkspace.
        switch (body.key) {
          case 'GENERIC_SAVINGS.RD_SAVINGS_POSSIBLE.EXPENDITURE':
            return SavingsRelatedGoalWorkspace.createFromResponse(body);
          case 'GENERIC_SAVINGS.RD_SAVINGS_WANTED.IRRELEVANT':
          case 'GENERIC_SAVINGS.RD_GET_ORGANISED.IRRELEVANT':
          default:
            return AccountRelatedGoalWorkspace.createFromResponse(body);
        }
      }
    });
  }
  /**
   * Save a workspace setting, providing a workspace POST path and specific payload. 
   * @param {(string|string[])} workspacePath 
   * @param {*} payload 
   * @param {(body: WorkspaceSubmissionResponse) => boolean} successCondition - A callback that determines 
   * @returns {Promise<StateChangeResponse>} - TRUE 
   * @memberOf GoalService
   */
  submitWorkspaceSetting(workspacePath: string | string[], payload: any, successCondition?: (body: WorkspaceSubmissionResponse) => boolean): Promise<StateChangeResponse> {
    // A simple sanity check
    let arrayPathLikeWorkspace = Array.isArray(workspacePath) && !!workspacePath.find(seg => seg.includes('workspace'));
    let pathLikeWorkspace = typeof workspacePath === 'string' && workspacePath.includes('workspace');
    if (!arrayPathLikeWorkspace && !pathLikeWorkspace) {
      console.warn('Path does not appear to be a workspace');
      return Promise.resolve(<StateChangeResponse>{ success: false, error: 'Path does not appear to be a workspace' });
    }
    return this.http.post(workspacePath, payload).toPromise().then(resp => {
      let body: WorkspaceSubmissionResponse = resp.json();
      let data = { response: body };
      // Specifically, we are looking for a sign that the goal is now "ON_TRACK"
      return <StateChangeResponse>{ success: successCondition ? successCondition(body) : true, data };
    }).catch(err => {
      console.error(err);
      return { success: false, error: err };
    });
  }
  /**
   * A summary of expenditure (spending categories)
   * @param {GoalResponseValues.Type} goalTypeIdentifier 
   * @param {string} workspaceKey 
   * @param {Partial<GoalWorkspacePerspectiveResponse>} perspective 
   * @returns {Promise<GoalSummary>} 
   * @memberof GoalService
   */
  getExpenditureSummary(goalTypeIdentifier: GoalResponseValues.Type, workspaceKey: string, perspective: Partial<GoalWorkspacePerspectiveResponse>): Promise<GoalSummary> {
    let endpoint = ['goals', 'worklist', 'info', goalTypeIdentifier, workspaceKey, 'EXPENDITURE'];
    return this.http.post(endpoint, perspective).toPromise().then(resp => {
      let body: GoalSummaryListResponse = resp.json();
      return GoalSummary.createFromResponse(body);
    });
  }
  /**
   * Retrieves data points needed to produce a graph. This should come from a 'worklist item' i.e. expenditure area.
   * @param {string|string[]} graphDataPath - The path depending on if saving goal or real estate goal 
   * @param {Partial<GoalWorkspacePerspectiveResponse>} perspective 
   * @returns {Promise<ExpenditureGraph>} 
   * @memberof GoalService
   */
  getExpenditureGraphData(graphDataPath: string|string[], perspective: Partial<GoalWorkspacePerspectiveResponse>): Promise<ExpenditureGraph> {
    return this.http.post(graphDataPath, perspective).toPromise().then(resp => {
      let body: ExpenditureGraphDataResponse = resp.json();
      return ExpenditureGraph.createFromResponse(body.commentary);
    });
  }
  /**
   * Ensures that active goal state is available for downstream usage. 
   * @private
   * @returns {Promise<boolean>} 
   * @memberOf GoalService
   */
  private prefetchActiveGoals(): Promise<boolean> {
    if (Array.isArray(this.activeGoalTypes)) {
      return Promise.resolve(true);
    }
    else {
      return this.getAvailableGoals().then(() => {
        if (!this.activeGoalTypes) {
          throw new Error('Active goals are not being detected even though endpoint is called. Check for an underlying data issue.');
        }
        return true;
      });
    }
  }
}