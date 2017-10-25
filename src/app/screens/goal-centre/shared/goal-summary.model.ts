// import { GoalType } from './goal-type.model';
import { Currency } from '../../../core/data/shared/currency';
import { TimeScaleType } from '../../../core/data/shared/constant-types';
import { GoalResponseValues } from '../../../core/data/goal/goal-response'; 
import { GoalPropertyResponse } from '../../../core/data/goal/goal-afford-response';
import { GoalSummaryListResponse, GoalSummaryResponse } from '../../../core/data/goal/goal-response';

export namespace GoalSummaryItemType {
  export interface Item {
    id: string;     // e.g. rainy_day_fund_current_value
    type: GoalResponseValues.SettingType;
    label: string;
    subLabel: string;
    isEditable?: boolean;
    editOrder?: number;
  }
  export interface MoneyItem extends Item {
    proposedValue: number;
    currentValue: number;
  }
  export interface TimeItem extends Item {
    timeScale: TimeScaleType;
    timeValue: number;
  }
  export interface ObjectItem extends Item {
    savingFor?: string;
    existingProperties: GoalPropertyResponse[];
    targetProperty: GoalPropertyResponse;
  }
}
export interface GoalSummaryShape {
  type: GoalResponseValues.Type;
  progress: GoalResponseValues.OverallProgress;
  moneySummaries: GoalSummaryItemType.MoneyItem[];
  timeSummaries: GoalSummaryItemType.TimeItem[];
  objectSummaries: GoalSummaryItemType.ObjectItem[];
}
export class GoalSummary implements GoalSummaryShape {
  type: GoalResponseValues.Type;
  progress: GoalResponseValues.OverallProgress;
  moneySummaries: GoalSummaryItemType.MoneyItem[];
  timeSummaries: GoalSummaryItemType.TimeItem[];
  objectSummaries: GoalSummaryItemType.ObjectItem[];
  constructor(...shapes: Partial<GoalSummaryShape>[]) {
    Object.assign(this, ...shapes);
  }
  static createFromResponse(respList: GoalSummaryListResponse, type?: GoalResponseValues.Type, progress?: GoalResponseValues.OverallProgress): GoalSummary {
    if (respList) {
      // Assign an order to each item. This allows the frontend to reconstruct
      // the order of display for editing.
      respList.items.forEach((item, index) => item._responseOrder === index);
      let moneySummaries = respList.items.filter(gs => gs.dataType === 'MONEY').map(gs => {
        return <GoalSummaryItemType.MoneyItem> {
          id: gs.name,
          type: gs.dataType,
          label: gs.label,
          subLabel: gs.subLabel,
          currentValue: gs.currentValue && (gs.currentValue as Currency).amount,
          proposedValue: gs.proposedValue && (gs.proposedValue as Currency).amount,
          isEditable: gs.editable,
          editOrder: gs._responseOrder
        };
      });
      let timeSummaries = respList.items.filter(gs => gs.dataType === 'MONTHS').map(gs => {
        switch (gs.dataType) {
          // Todo: add more cases
          case 'MONTHS':
          default:
            var timeScale = TimeScaleType.Monthly;
        }
        return <GoalSummaryItemType.TimeItem> {
          id: gs.name,
          type: gs.dataType,
          label: gs.label,
          subLabel: gs.subLabel,
          timeScale: timeScale,
          timeValue: gs.currentValue,
          isEditable: gs.editable,
          editOrder: gs._responseOrder
        };
      });
      let objectSummaries = respList.items.filter(gs => gs.dataType === 'OBJECT').map(gs => {
        switch (gs.label) {
          case 'real_estate_owned':
            var objectKeyName = 'existingProperties';
            var objectKeyValue = gs.currentValue;
            break;
          case 'real_estate_targeted':
            var objectKeyName = 'targetProperty';
            var objectKeyValue = gs.currentValue;
            break;
          case 'generic_savings_saving_for':
          default:
            var objectKeyName = 'savingFor';
            var objectKeyValue = gs.currentValue && gs.currentValue.savingFor;
            break;
        }
        return <GoalSummaryItemType.ObjectItem> {
          id: gs.name,
          type: gs.dataType,
          label: gs.label,
          subLabel: gs.subLabel,
          [objectKeyName]: objectKeyValue,
          isEditable: gs.editable,
          editOrder: gs._responseOrder
        };
      });
      return new GoalSummary(<GoalSummaryShape> { type, progress, moneySummaries, timeSummaries, objectSummaries });
    }
    return new GoalSummary(<GoalSummaryShape> { type, progress });
  }
}