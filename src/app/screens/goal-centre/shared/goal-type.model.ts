import { GoalResponseValues } from '../../../core/data/goal/goal-response';
import { GoalHeaderListResponse, GoalHeaderResponse } from '../../../core/data/goal/goal-response';

// Note: We'll simply re-use the status and type definitions as verbatim from the API response.
// Todo: Consider whether these need to be mapped to an internal enum

export interface GoalTypeShape {
  type: GoalResponseValues.Type;
  status: GoalResponseValues.Status;
  title: string;
  description: string;
  selected: boolean;
}
export class GoalType {
  constructor(...shapes: Partial<GoalTypeShape>[]) {
    Object.assign(this, ...shapes);
  }
  type: GoalResponseValues.Type;
  status: GoalResponseValues.Status;
  title: string;
  description: string;
  selected: boolean;
  static createListFromResponse(respList: GoalHeaderListResponse): GoalType[] {
    return respList.goalHeaders.map(gh => this.createFromResponse(gh));
  }
  static createFromResponse(resp: GoalHeaderResponse): GoalType {
    return new GoalType(<GoalTypeShape> {
      type: resp.type,
      status: resp.status,
      description: resp.description,
      selected: resp.selected,
      title: resp.title
    });
  }
}