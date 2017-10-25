import { MortgageAccount } from './mortgage-account.model';
import { Account } from '../../accounts/shared/account.model';
import { GoalShape, GoalBase } from '../../goal-centre/shared/goal.model';
import { GoalAction } from '../../goal-centre/shared/goal-action.model';
import { GoalType } from '../../goal-centre/shared/goal-type.model';
import { GoalOverviewShape } from '../../goal-centre/shared/goal-overview.model';
import { GoalSummary } from '../../goal-centre/shared/goal-summary.model';
// import { AccountShape, Account } from '../../accounts/shared/account.model';
import { Property, PropertyShape } from '../../property-centre/shared/property.model';
import { TimeScaleType, Currency } from '../../../core/data/shared/constant-types'
import { GoalListResponse, GoalResponse, GoalOverviewItemResponse, GoalWorkspacePerspectiveResponse } from '../../../core/data/goal/goal-response';
import { ProgressLevelContentResponse, AnomalyType } from '../../../core/data/goal/goal-afford-response';

export interface AffordabilitySurplusHistoryItem {
  surplus: number;
  dateLabel?: string;
  relativeDateLabel: string;
}
export interface AffordabilitySurplusTrackingItem {
  dateLabel?: string;
  relativeDateLabel: string;
  projectedSurplus: number;
  targetSurplus: number;
  proportionOfIncome: number;
}
export interface AffordabilitySnapshot {
  targetAssetValue: number;
  existingAssetValue: number;
  maxAmountBorrowable: number;
  equity: number;
  amountUntilAffordable: number;
  intervalsUntilAffordable: number;
  snapshotDate: Date;
  snapshotTimeframe?: number;
  snapshotTimeframePeriodicity?: TimeScaleType;
}
export interface AffordabilityTrackingLevel {
  description: string;
  expectedCurrentValue: number;
  actualValue: number;
  limitValue: number;
  perspective: GoalWorkspacePerspectiveResponse;
}
export interface AffordabilityAnomalyCategory {
  id: number;    // pluck first if any
  description: string;    // pluck first if any
  ids: number[];      // all in order
  descriptions: string[];      // all in order
  type: AnomalyType;
  expectedValue: number;
  actualValue: number;
}
export interface AffordabilityGoalOverviewShape extends GoalOverviewShape {
  mortgageDefaulted: boolean;
  mortgageStartDate?: Date;
  mortgageInterestRate?: number;
  mortgageContractTermMonths?: number;
  mortgageContractCompletionDate?: Date;
  currentDaySnapshot?: AffordabilitySnapshot;
  surplusBasedSnapshot?: AffordabilitySnapshot;
  currentSurplus?: AffordabilitySurplusTrackingItem;
  historicalSurplus?: AffordabilitySurplusHistoryItem[];
  trackingLevels?: AffordabilityTrackingLevel[];
  anomalies?: AffordabilityAnomalyCategory[];
}
export interface AffordabilityGoalShape {
  overview: AffordabilityGoalOverviewShape;
  targetPropertyId: number;
  existingPropertyIds: number[];
  targetPropertyName: string;  
  existingPropertyNames: string[];
  existingPropertyUserValuedPrices: number[];
  existingPropertySalePrices: number[];
  mortgageAccounts: number[];      // indices correspond to existingProperties
}
export class AffordabilityGoal extends GoalBase implements AffordabilityGoalShape {
  overview: AffordabilityGoalOverviewShape;
  targetPropertyId: number;
  existingPropertyIds: number[];
  targetProperty: Property;  
  existingProperties: Property[];  
  existingPropertyUserValuedPrices: number[];
  existingPropertySalePrices: number[];
  targetPropertyName: string;
  existingPropertyNames: string[];
  mortgageAccounts: number[];
  constructor(...shapes: Partial<GoalShape|AffordabilityGoalShape>[]){
    super(shapes);
  }
  /**
   * @todo 
   * @returns {string} 
   * @memberof AffordabilityGoal
   */
  displayName() : string {
    return 'Affordability Goal';
  }
  /**
   * @todo 
   * @returns {string} 
   * @memberof AffordabilityGoal
   */
  caption() : string {
    return null; 
  }  
  /** Creates a list of category goals, from given response */
  static createListFromResponse(resp: GoalListResponse): AffordabilityGoal[] {
    return resp.items.map(goal => this.createFromResponse(goal));
  }
  /** Create Category object from ICategory object */
  static createFromResponse(resp: GoalResponse): AffordabilityGoal {
    let matchedGoalActionResponse = GoalAction.matchCallToAction(resp.callToAction, resp.actions);
    let goalBaseInformation: GoalShape = {
      id: null,   // TODO
      name: resp.header.title,
      typeHeader: GoalType.createFromResponse(resp.header),
      overview: <GoalOverviewShape>null,    // Is parsed later and snapped in.
      summary: null,    // Our real estate parser is better for this.
      actions: GoalAction.createListFromResponse(resp.actions, resp.header),
      cta: GoalAction.createFromResponse(matchedGoalActionResponse)
    };
    // Consider: Overview may be unavailable because RE goal is still in 'DEFINED' state.
    if (resp.summary) {
      let targetPropertyResponseItem = resp.summary.items.find(item => item.name === 'realEstateTarget');
      let targetPropertyResponse = targetPropertyResponseItem && targetPropertyResponseItem.currentValue;
      let targetPropertyId = targetPropertyResponse && targetPropertyResponse.externalId;
      let existingPropertyResponsesItem = resp.summary.items.find(item => item.name === 'realEstateOwned');
      let existingPropertyResponses = existingPropertyResponsesItem && existingPropertyResponsesItem.currentValue;      // This is an array
      let existingPropertyIds = existingPropertyResponses.map(existingPropertyResponse => existingPropertyResponse.externalId);
      let existingPropertyUserValuedPrices = existingPropertyResponses.map(existingPropertyResponse => existingPropertyResponse.userValuedPrice);
      let existingPropertySalePrices = existingPropertyResponses.map(existingPropertyResponse => existingPropertyResponse.salePrice);
      let mortgageAccounts = existingPropertyResponses.map(existingPropertyResp => {
        return existingPropertyResp.mortgages.items.map(mortgageResp => MortgageAccount.createFromResponse(mortgageResp));
      });
      var goalSummaryInformation: Partial<AffordabilityGoalShape> = {
        existingPropertyIds: existingPropertyIds,
        existingPropertyNames: existingPropertyResponses && existingPropertyResponses.map(resp => resp.singleLineAddress),
        existingPropertySalePrices: existingPropertySalePrices,
        existingPropertyUserValuedPrices: existingPropertyUserValuedPrices,
        targetPropertyId: targetPropertyId,
        targetPropertyName: targetPropertyResponse && targetPropertyResponse.singleLineAddress,
        mortgageAccounts: mortgageAccounts
      };
    }
    // let targetMortgageResponseItem = resp.overview.items.find(item => item.type === 'TIME_TO_MORTGAGE_COMPLETION');
    // let targetMortgageResponse = targetMortgageResponseItem && targetMortgageResponseItem.content;
    // if (existingPropertyResponses) {
    //   // Be mindful that an existing property might have multiple mortgages?
    //   let mortgagesPerPropertyResponses = existingPropertyResponses.map(epr => epr.mortgages);
    //   var mortgages = mortgagesPerPropertyResponses.map(mortgagesPerPropertyResponse => {
    //     // TBA Insto. Wait for a better solution from backend.
    //     return mortgagesPerPropertyResponse 
    //       ? mortgagesPerPropertyResponse.map(mortgageResp => Account.createFromResponse(mortgageResp, null))
    //       : [];
    //   });
    // }
    if (resp.overview) {
      let findOverviewItem: (typeName: string, identifier?: string) => GoalOverviewItemResponse = (typeName, identifierName) => {
        return resp.overview.items.find(item => item.type === typeName && (!identifierName || item.identifier === identifierName));
      };
      /* type === TIME_TO_AFFORDABILITY (CURRENT REPAYMENTS) */
      let affordabilityResponseItem = findOverviewItem('TIME_TO_AFFORDABILITY', 'timeToAffordability');
      if (affordabilityResponseItem) {
        let affordabilityResponse = affordabilityResponseItem && affordabilityResponseItem.content;
        let affordabilitySnapshot = affordabilityResponse.affordabilitySnapshot;
        var currentDaySnapshot: AffordabilitySnapshot = {
          targetAssetValue: affordabilitySnapshot.targetAssetValue.amount,
          existingAssetValue: affordabilitySnapshot.ownedAssetValue.amount,
          maxAmountBorrowable: affordabilitySnapshot.maxAmountBorrowable.amount,
          equity: affordabilitySnapshot.equity.amount,
          amountUntilAffordable: affordabilitySnapshot.monetaryAmountUntilAffordable.amount,
          intervalsUntilAffordable: affordabilitySnapshot.intervalsUntilAffordable,
          snapshotDate: new Date(affordabilitySnapshot.snapshotDate),
        }
      }
      /* type === TIME_TO_AFFORDABILITY (SURPLUS) */
      let affordabilitySurplusResponseItem = findOverviewItem('TIME_TO_AFFORDABILITY', 'timeToAffordabilitySurplus');
      if (affordabilitySurplusResponseItem) {
        let affordabilitySurplusResponse = affordabilitySurplusResponseItem && affordabilitySurplusResponseItem.content;
        let affordabilitySurplusSnapshot = affordabilitySurplusResponse.affordabilitySnapshot;
        var surplusBasedSnapshot: AffordabilitySnapshot = {
          targetAssetValue: affordabilitySurplusSnapshot.targetAssetValue.amount,
          existingAssetValue: affordabilitySurplusSnapshot.ownedAssetValue.amount,
          maxAmountBorrowable: affordabilitySurplusSnapshot.maxAmountBorrowable.amount,
          equity: affordabilitySurplusSnapshot.equity.amount,
          amountUntilAffordable: affordabilitySurplusSnapshot.monetaryAmountUntilAffordable.amount,
          intervalsUntilAffordable: affordabilitySurplusSnapshot.intervalsUntilAffordable,
          snapshotDate: new Date(affordabilitySurplusSnapshot.snapshotDate),
        }
      }
      /* type === TIME_TO_MORTGAGE_COMPLETION */
      let mortgageCompletionResponseItem = findOverviewItem('TIME_TO_MORTGAGE_COMPLETION');
      let mortgageCompletionResponse = mortgageCompletionResponseItem && mortgageCompletionResponseItem.content;
      let mortgageSummary = mortgageCompletionResponse.mortgageTermsSummary;
      // let mortgageInterestRate = mortgageSummary.interestRate;      // Note that rate is whole number / 100
      // let mortgageStartDate = new Date(mortgageSummary.startDate);
      // let mortgageContractTermMonths = mortgageCompletionResponse.mortgageTermsSummary.termMonths;      // Will be defaulted unless actual mortgage
      // let mortgageContractCompletionDate = new Date(mortgageCompletionResponse.timeToZeroDate);
      // let mortgageContractCompletionTime = mortgageCompletionResponse.timeFrame.number;
      // let mortgageContractCompletionTimeScale = TimeScaleType.Monthly;      // targetMortgageCompletionResponse.timeFrame.periodicity === 'MONTHLY'
      /* type === MTM_HISTORY */
      let historyResponseItem = findOverviewItem('MTM_HISTORY');
      if (historyResponseItem) {
        let historyResponse = historyResponseItem && historyResponseItem.content;
        var historyItems = historyResponse.items.map(itemResp => (<AffordabilitySurplusHistoryItem>{
          surplus: itemResp.surplus.amount,
          dateLabel: itemResp.date,
          relativeDateLabel: itemResp.month
        })); 
      }
      /* type === MTM_CURRENT */
      let trackingResponseItem = findOverviewItem('MTM_CURRENT');
      if (trackingResponseItem) {
        let trackingResponse = trackingResponseItem && trackingResponseItem.content;
        var trackingItem = <AffordabilitySurplusTrackingItem>{
          relativeDateLabel: trackingResponse.daysLeft,
          projectedSurplus: trackingResponse.projectedSurplus.amount,
          targetSurplus: trackingResponse.targetSurplus.amount,
          proportionOfIncome: trackingResponse.proportionOfIncome 
        };
      }
      /* type === PROGRESS_REPORT */
      let progressReportResponseItem = findOverviewItem('PROGRESS_REPORT', 'progressReport');
      if (progressReportResponseItem) {
        let progressReportResponse: ProgressLevelContentResponse = progressReportResponseItem && progressReportResponseItem.content;
        if (progressReportResponse.trackingLevelReport) {
          var trackingLevels = progressReportResponse.trackingLevelReport.items.map(item => (<AffordabilityTrackingLevel>{
            description: item.description,
            expectedCurrentValue: item.expectedCurrentValue.amount,
            actualValue: item.actualValue.amount,
            limitValue: item.limitValue.amount,
            perspective: item.perspective
          }));
        }
        if (progressReportResponse.anomalies) {
          // .filter(item => item.content.key.collectedSettings.items[0].type === 'CATEGORY')
          // Just assume they are all category types.
          var anomalies = progressReportResponse.anomalies.items.map(item => {
            let first = item.content.key.collectedSettings.items[0].items[0];
            return <AffordabilityAnomalyCategory>{
              type: item.type,
              id: first.id,
              description: first.description,
              ids: Array.prototype.concat([], item.content.key.collectedSettings.items.map(collectedItem => collectedItem.items.map(categoryItem => categoryItem.id))),
              descriptions: Array.prototype.concat([], item.content.key.collectedSettings.items.map(collectedItem => collectedItem.items.map(categoryItem => categoryItem.description))),
              actualValue: item.content.actualValue.amount,
              expectedValue: item.content.expectedValue.amount
            };
          });
        }
      }
      /* Bundle it all up nicely */
      var goalOverviewInformation: AffordabilityGoalOverviewShape = {
        typeHeader: null,
        milestoneIndicators: null,
        milestoneTimeframes: null,
        currentDaySnapshot: currentDaySnapshot,
        surplusBasedSnapshot: surplusBasedSnapshot,
        mortgageDefaulted: mortgageSummary.defaultedTerms,
        mortgageStartDate: new Date(mortgageSummary.startDate),
        mortgageInterestRate: mortgageSummary.interestRate,
        mortgageContractTermMonths: mortgageCompletionResponse.mortgageTermsSummary.termMonths,
        mortgageContractCompletionDate: new Date(mortgageCompletionResponse.timeToZeroDate),
        historicalSurplus: historyItems,
        currentSurplus: trackingItem,
        trackingLevels: trackingLevels,
        anomalies: anomalies
      };
    }
    return new AffordabilityGoal(goalBaseInformation, goalSummaryInformation, { overview: goalOverviewInformation });      
  }
}