import { GoalType, GoalTypeShape } from './goal-type.model';
import { GoalResponseValues, GoalOverviewListResponse, GoalOverviewItemResponse } from '../../../core/data/goal/goal-response';

// ===========================
// Main Goal Overview wrapper
// ===========================
export interface GoalOverviewShape {
  typeHeader?: GoalTypeShape;
  milestoneTimeframes: MilestoneTimeframeGoalOverviewItemShape[];
  milestoneIndicators: MilestoneIndicatorGoalOverviewItemShape[];
};
export class GoalOverview implements GoalOverviewShape {
  constructor(...shapes: Partial<GoalOverviewShape>[]) {
    Object.assign(this, ...shapes);
  }
  typeHeader?: GoalType;
  milestoneTimeframes: MilestoneTimeframeGoalOverviewItem[];
  milestoneIndicators: MilestoneIndicatorGoalOverviewItem[];
  static createFromResponse(resp: GoalOverviewListResponse, typeHeader?: GoalType): GoalOverview {
    // Note: We are limited to (pre-)parsing only the OverviewItem types which 
    // we know about. Potentially an unrecognised type may be unparsed. This
    // would be intentional i.e. in this method we only return the overview items
    // which we know how to use.. 
    if (resp) {
      var milestoneTimeframes = this.retrieveItemsByType<MilestoneTimeframeGoalOverviewItem>(resp, 'MILESTONE_TIMEFRAMES', MilestoneTimeframeGoalOverviewItem.createFromResponse);
      var milestoneIndicators = this.retrieveItemsByType<MilestoneIndicatorGoalOverviewItem>(resp, 'MILESTONE_INDICATOR', MilestoneIndicatorGoalOverviewItem.createFromResponse);
    }
    let data: GoalOverviewShape = { typeHeader, milestoneTimeframes, milestoneIndicators };
    return new GoalOverview(data);
  }
  private static retrieveItemsByType<T>(resp: GoalOverviewListResponse, type: GoalResponseValues.OverviewItemType, parserFunction: (item: any) => GoalOverviewItemBase): T[] {
    let respMultiArray = resp.items.filter(itemResp => itemResp.type === type).map(itemResp => {
    return Array.isArray(itemResp.content) 
        ? itemResp.content.map(contentItem => parserFunction(contentItem))
        : [ parserFunction(itemResp.content) ];
    });
    return Array.prototype.concat([], ...respMultiArray);
  }
}
// ===========================
// Base class for sub items
// ===========================
export abstract class GoalOverviewItemBase {
  // TBC
}
// =========================
// Milestone Timeframe item
// =========================
export interface MilestoneTimeframeGoalOverviewItemShape {
  index: number;
  texts: {
    index: string;
    timeFrame: string;
    target: string;         // Although it says €200
  };
  current: boolean;
  status: GoalResponseValues.ActionProgress;
  endDate: Date;
  startDate: Date;
}
export class MilestoneTimeframeGoalOverviewItem extends GoalOverviewItemBase implements MilestoneTimeframeGoalOverviewItemShape {
  constructor(...shapes: Partial<MilestoneTimeframeGoalOverviewItemShape>[]) {
    super();
    Object.assign(this, ...shapes);
  }
  index: number;
  texts: {
    index: string;
    timeFrame: string;
    target: string;         // Although it says €200
  };
  current: boolean;
  status: GoalResponseValues.ActionProgress;
  endDate: Date;
  startDate: Date;
  static createFromResponse(itemResp: any): MilestoneTimeframeGoalOverviewItem {
    return {
      index: itemResp.index,
      texts: {
        index: itemResp.texts.index,
        timeFrame: itemResp.texts.timeFrame,
        target: itemResp.texts.target,
      },
      current: itemResp.current,
      status: itemResp.status,
      endDate: new Date(itemResp.endDate),
      startDate: new Date(itemResp.newDate)
    };
  }
}
// =========================
// Milestone Timeframe item
// =========================
export interface MilestoneIndicatorGoalOverviewItemShape {
  index: string;
  timeIntervalProgress: number;      // Map to 'passage'
  timeProgress: number;     // Map to 'precisePassage'
  completionPercentage: number;     // map to 'percentage'
  completionLabel: string;      // map to 'achieved'
  title: string;
  information: string;
  targetTimeframe: string;
  timeframePassage: string;
}
export class MilestoneIndicatorGoalOverviewItem extends GoalOverviewItemBase implements MilestoneIndicatorGoalOverviewItemShape {
  constructor(...shapes: Partial<MilestoneTimeframeGoalOverviewItemShape>[]) {
    super();
    Object.assign(this, ...shapes);
  }
  index: string;
  timeIntervalProgress: number;      // wtf is this
  timeProgress: number;     // wtf is this
  completionPercentage: number;     // map to 'completion'
  completionLabel: string;      // map to 'achieved'
  title: string;
  information: string;
  targetTimeframe: string;
  timeframePassage: string;
  static createFromResponse(respItem: any): MilestoneIndicatorGoalOverviewItem {
    return {
      index: respItem.index,
      title: respItem.title,
      completionPercentage: respItem.completion,
      completionLabel: respItem.achieved,
      information: respItem.information,
      timeIntervalProgress: respItem.passage,
      timeProgress: respItem.precisePassage,
      targetTimeframe: respItem.targetTimeFrame,
      timeframePassage: respItem.timeFramePassage
    };
  }
}