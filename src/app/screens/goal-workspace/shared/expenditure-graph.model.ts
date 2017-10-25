import { TimeScaleType } from '../../../core/data/shared/constant-types';
import { GoalResponseValues, GraphDataResponse, GoalWorkspaceSubItemResponse } from '../../../core/data/goal/goal-response';

// ===============
// Graph Types
// ===============
export enum ExpenditureGraphType {
  TransactionTrend
}
export enum ExpenditureGraphPointType {
  None = 0,
  Actual = 1,
  Projected = 2,
  Both = 3
}
// ===============
// Graph objects
// ===============
export interface ExpenditureGraphPoint {
  type: ExpenditureGraphPointType;
  dateTime: Date;
  amount: number;
  seriesName: string;
}
export interface ExpenditureGraphShape {
  description: string;
  timeScale: TimeScaleType;
  points: ExpenditureGraphPoint[];
  categoryId?: number;
  categoryType?: GoalResponseValues.CategoryType;
  previousAmountIntercept?: number;  
  currentAmountIntercept?: number;  
  originalAmountIntercept?: number;
}
abstract class KeepsTrackingLevelResponse {
  _trackingLevelResponse: GoalWorkspaceSubItemResponse.TrackingLevelResponse;
}
export class ExpenditureGraph extends KeepsTrackingLevelResponse implements ExpenditureGraphShape {
  description: string;
  timeScale: TimeScaleType;
  points: ExpenditureGraphPoint[];
  categoryId?: number;
  categoryType?: GoalResponseValues.CategoryType;
  previousAmountIntercept?: number;  
  currentAmountIntercept?: number;  
  originalAmountIntercept?: number;
  constructor(...shapes: Partial<ExpenditureGraphShape & KeepsTrackingLevelResponse>[]) {
    super();
    Object.assign(this, ...shapes);
  }
  static createFromResponse(resp: GraphDataResponse): ExpenditureGraph {
    if (resp) {
      let timescale = TimeScaleType.Monthly;
      let trackingLevel = resp.graph.trackingLevel;    
      let points = resp.graph.data.map(datum => (<ExpenditureGraphPoint>{
        amount: datum.amount,
        dateTime: new Date(datum.date),
        seriesName: datum.series,
        type: datum.kinds.map(kind => {
          if (kind === 'STATED') return ExpenditureGraphPointType.Actual;
          if (kind === 'PROJECTED') return ExpenditureGraphPointType.Projected;
          return ExpenditureGraphPointType.None;
        }).reduce((prev, curr) => curr + prev, ExpenditureGraphPointType.None)
      }));
      return new ExpenditureGraph(<ExpenditureGraphShape>{
        description: resp.text,
        timeScale: timescale, 
        points: points,
        categoryId: trackingLevel.category,
        categoryType: trackingLevel.categoryTypeString,
        originalAmountIntercept: trackingLevel.originalAmount,
        currentAmountIntercept: trackingLevel.currentAmount,
        previousAmountIntercept: trackingLevel.previousAmount,
      }, <KeepsTrackingLevelResponse>{
        _trackingLevelResponse: resp.graph && resp.graph.trackingLevel
      });
    }
    return null;
  }
}