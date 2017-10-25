import { Link } from '../../../core/data/shared/link';
import { GoalType } from './goal-type.model';
import { GoalResponseValues, GoalResponse, GoalCallToActionResponse, GoalActionResponse } from '../../../core/data/goal/goal-response';

// Note: 1-to-1 mapping with GoalCallToActionResponse
export interface GoalCallToActionShape {
  severity: GoalResponseValues.CallToActionSeverity;
  identifier: string;
  data: any;
  description: string;
  actionLabel: string;
}
export class GoalCallToAction implements GoalCallToActionShape {
  constructor(...shapes: Partial<GoalActionShape>[]) {
    Object.assign(this, ...shapes);
  }
  severity: GoalResponseValues.CallToActionSeverity;
  identifier: string;
  data: any;
  description: string;
  actionLabel: string;
  static createFromResponse(resp: GoalCallToActionResponse): GoalCallToAction {
    return new GoalCallToAction(<GoalCallToActionShape> resp);
  }
}

// Note: 1-to-1 mapping with GoalActionResponse
export interface GoalActionShape {
  name: string;
  status: GoalResponseValues.ActionProgress;
  callToAction: GoalCallToActionShape;
  followUp: Link;
  completionRate: number;
  enabled: boolean;
  shortDescription: string;
  longDescription: string;
  goalLabel: string;       // Extra display information 
  goalId: number;          // Extra display information 
  goalTypeIdentifier: GoalResponseValues.Type;       // Extra display information 
  isSetup?: boolean;
}
export class GoalAction implements GoalActionShape {
  constructor(...shapes: Partial<GoalActionShape>[]) {
    Object.assign(this, ...shapes);
  }
  name: string;
  status: GoalResponseValues.ActionProgress;
  callToAction: GoalCallToAction;
  followUp: Link;
  completionRate: number;
  enabled: boolean;
  shortDescription: string;
  longDescription: string;
  goalLabel: string;
  goalId: number;
  goalTypeIdentifier: GoalResponseValues.Type;
  isSetup: boolean;
  /** Only works for GET-based workspaces. For POST-based workspaces, manually inspect GoalAction.followUp. */
  workspacePath() {
    let pathLikeWorkspace = this.followUp.name.toLowerCase().includes('workspace');
    if (this.followUp.method === 'GET' && pathLikeWorkspace) {
      return this.followUp.name;
    }
    throw `Action ${this.name} does not appear to be associated with a workspace`;
  }
  static createListFromResponse(resp: GoalActionResponse[], goalTypeHeader?: GoalType): GoalAction[] {
    if (resp) {
      return resp.map(resp => this.createFromResponse(resp, goalTypeHeader));
    }
    return [];
  }
  static createFromResponse(resp: GoalActionResponse, goalTypeHeader?: GoalType): GoalAction {
    if (goalTypeHeader) {
      var goalInfo = {
        goalId: 0,      // TBA
        goalLabel: goalTypeHeader.title,
        goalTypeIdentifier: goalTypeHeader.type
      };
    }
    let callToAction = GoalCallToAction.createFromResponse(resp.callToAction);
    return new GoalAction(<GoalActionShape> resp, goalInfo, { callToAction });
  }
  static matchCallToAction(cta: GoalCallToActionResponse, actions: GoalActionResponse[]): GoalActionResponse {
    return actions.find(action => {
      return action.callToAction && action.callToAction.identifier === cta.identifier;
    }) || <GoalActionResponse> { callToAction: cta };
  }
}