// import { GoalOverviewItemResponse } from './goal-response';
import { GoalWorkspacePerspectiveResponse } from './goal-response';
import { Currency } from '../shared/constant-types';
import { AccountResponse } from '../../data/account/account-response';
import { PropertyResponse } from '../../data/property/property-response';

// ======================
// Affordability/Property
// ======================
export type AnomalyType = 'UNDERSPEND' | 'OVERSPEND' | 'UNDEREARN' | 'OVEREARN';
export type GoalPropertyResponse = PropertyResponse & { mortgages?: AccountResponse[] };
export interface ProgressLevelContentResponse {
  trackingLevelReport: {
    items: TrackingLevelReportResponse[];
  };
  anomalies: {
   items: AnomalyResponse[]; 
  };
}
export interface TrackingLevelReportResponse {
  id: number;
  description: string;
  severity: string;
  narrative: string;
  expectedCurrentValue: Currency;
  actualValue: Currency;
  limitValue: Currency;
  type: any;
  perspective: GoalWorkspacePerspectiveResponse;
}
export interface AnomalyResponse {
  type: AnomalyType;
  content: {
    expectedValue: Currency;
    actualValue: Currency;
    description: string;
    parameters: [ string, Currency, Currency ];
    key: {
      collectedSettings: {
        items: Array<{
          type: string;
          active: boolean;
          items: Array<{
           id: number;
           description: string; 
          }>;
        }>;
      };
      includingTransfers: boolean;
    };
  };
}