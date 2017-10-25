import { Currency } from '../shared/currency';
import { Link } from '../shared/link';
import { AccountResponse } from '../../data/account/account-response';
import { GoalShape } from '../../../screens/goal-centre/shared/goal.model';
import { GoalSummaryShape } from '../../../screens/goal-centre/shared/goal-summary.model';

export namespace GoalResponseValues {
  // export type Type = 'GENERIC_SAVINGS' | 'REAL_ESTATE';
  export type Type = 'GENERIC_SAVINGS' | 'REAL_ESTATE' | 'RAINY_DAY_SAVINGS' | 'MONTH_TO_MONTH' | 'SHORT_TERM_DEBT';
  export type Status = 'SELECTED' | 'DEFINED' | 'IN_PROGRESS' | 'AVAILABLE';
  export type OverallProgress = 'TO_DO' | 'MORE_TO_DO' | 'ON_TRACK' | 'EXCEEDING' | 'DONE';
  export type ActionProgress = 'TO_DO' | 'UNDERWAY' | 'DONE';
  export type OverviewItemType = 'MILESTONE_TIMEFRAMES' | 'MILESTONE_INDICATOR' | 'TIME_TO_TARGET' | 'TIME_TO_MORTGAGE_COMPLETION' | 'TIME_TO_AFFORDABILITY';
  export type SettingType = 'MONEY' | 'OBJECT' | 'TIME' | 'DAYS' | 'MONTHS';
  // MONEY, TIME, AGE, IMPACT, BOOLEAN, STRING, DAYS, MONTHS, DEBT_CATEGORY, DEBT_STRATEGY, PERCENTAGE, TIME_FRAME, IDENTIFIER, IDENTIFIERS, DATE, OBJECT, BALANCE
  export type ProseStatus = 'INPUT_BY_USER' | 'DEFAULTED' | 'NON_EXISTENT';
  export type CallToActionSeverity = 'ERROR' | 'WARNING' | 'INFO';
  export type CategoryType = 'CORE' | 'DISCRETIONARY' | 'SAVINGS_AND_INVESTMENTS' | 'ONE_OFF' | 'CREDIT' | 'INVESTMENT' | 'PRIMARY' | 'SECONDARY' | 'UNCATEGORISED';
}

// ===========================
// Goal Response
// (GoalListResponse is currently hypothetical)
// ===========================
export type GoalListResponse = {
  items: GoalResponse[];
};
export type SingleGoalResponse = {
  goal: GoalResponse;
};
export interface GoalResponse {
  header: GoalHeaderResponse;
  progress: GoalResponseValues.OverallProgress;
  callToAction: GoalCallToActionResponse;
  summary: GoalSummaryListResponse;
  overview: GoalOverviewListResponse;
  actions: GoalActionResponse[];
}
// =======
// Header
// =======
export type GoalHeaderListResponse = {
  goalHeaders: GoalHeaderResponse[];
}
export interface GoalHeaderResponse {
  type: GoalResponseValues.Type;
  status: GoalResponseValues.Status;
  title: string;
  description: string;
  selected: boolean;
}
// ========
// Summary 
// ========
export type GoalSummaryListResponse = {
  items: GoalSummaryResponse[];
};
export interface GoalSummaryResponse {
  editable: boolean;
  name: string;
  proposedValue: any;   // Currency|{ savingFor: string; };
  currentValue: any;    // Currency|{ savingFor: string; }|number;
  dataType: GoalResponseValues.SettingType;
  label: string;
  subLabel: string;
  _responseOrder?: number;
}
// ===========================
// Actions and Call To Action 
// ===========================
export interface GoalCallToActionResponse {
  severity: GoalResponseValues.CallToActionSeverity;
  identifier: string;
  data: any;
  description: string;
  actionLabel: string;
}
export interface GoalActionResponse {
  name: string;
  status: GoalResponseValues.ActionProgress;
  callToAction: GoalCallToActionResponse;
  followUp: Link;
  completionRate: number;
  enabled: boolean;
  shortDescription: string;
  longDescription: string;
}
// =================================
// Goal overview (of milestones etc)
// ==================================
export type GoalOverviewListResponse = {
  items: GoalOverviewItemResponse[];
};
export interface GoalOverviewItemResponse {
  title: string;
  identifier?: string;
  type: GoalResponseValues.OverviewItemType;
  content: any|any[];     // The converter needs to know how to parse this. 
};
// ======
// Prose 
// ======
export interface GoalProseResponse {
  settings: GoalProseSettingResponse[];
  errorMessages: any[];     // TBA - find out what these look like
  goalHeader: GoalHeaderResponse;
  complete: boolean;
  blocks: GoalProseBlockResponse[];
}
export interface GoalProseBlockResponse {
  preText: string;    // "I am saving for a ",
  postText: string;   // ".",
  questionText: string;     // TBA for future
  lineBreakAtStart: boolean;    // false,
}
export interface GoalProseSelectableValueResponse {
  value: string;
  status: string;
  description: string;
  explainer: string;
}
export interface GoalProseSettingResponse extends GoalProseBlockResponse {
  selectableValues: GoalProseSelectableValueResponse[];     // best guess
  value: {
    savingFor?: string;     // "car",
    currencyCode?: string;   // "EUR",
    amount?: number;      // 0,
    value?: number;     // 12 (for time like months)
    // TBA what does Months use
    status: GoalResponseValues.ProseStatus;   //  "INPUT_BY_USER",
    description: string;
    explainer: string;
  },
  type: string;     // "GENERIC_SAVINGS_SAVING_FOR",
  editable: boolean;      // true,
  validations: any;     // {},
  inputRequired: boolean; 
  explainer: string;
  dataType: GoalResponseValues.SettingType;
}
// ==========
// Workspace
// ==========
export type WorkspaceSubmissionResponse = SingleGoalResponse & SingleGoalWorkspaceResponse;
export type SingleGoalWorkspaceResponse = {
  workspace: GoalWorkspaceResponse;
};
export interface GoalWorkspacePerspectiveResponse {
  date_range: Array<{ 
    startDate: number;
    endDate: number;
  }>;
  product_type: Array<{ value: string; }>,
  includingTransfers: boolean;
  transaction_filter: Array<{
    statedIncluded: boolean;
    transfersIncluded: boolean;
    splitIncluded: boolean;
    cashIncluded: boolean;
    futureIncluded: boolean;
    smoothingIncluded: boolean;
  }>;
  periodicity: Array<{ value: string; }>;
  category_type: Array<{ value: string; }>;
  currency: Array<{ value: string; }>;
  category: Array<{ id: number; description: string }>;
  transaction_flow: Array<{ value: string; }>;
  collectedSettings: {
    items: Array<{
      type: string;
      active: boolean;
      items: any[];
    }>;
  };
}
export interface GoalWorkspaceResponse {
  key: string;
  callToAction: GoalCallToActionResponse;
  summary: GoalSummaryListResponse;
  focus: string;
  title: string;
  focalPoints: Array<{
    focus: string;
    active: boolean;
    description: string;
  }>;
  items: GoalWorkspaceItemResponse[];
}
export interface GoalWorkspaceItemResponse {
  key: string;
  content: Partial<{
    accounts: AccountResponse[];    
    current: AccountResponse;       // Would be the current product
    products: any[];      // This looks like a specific product structure; response mapping TBA
    product: any;
    prose: any;      // I suppose this would in prose response object format?
    id: number;
    value: Currency;
    link: Link;
    meta: any;
    text: string;
    score: number;
    items: any[];
    graph: GoalWorkspaceSubItemResponse.Graph;
    perspective: Partial<GoalWorkspacePerspectiveResponse>;
    speculative: boolean;
    kpis: any[];
    commentator: string;
  }>;
}
export namespace GoalWorkspaceSubItemResponse {
  export interface Graph {
    type: string;
    trackingLevel: TrackingLevelResponse;
    metadata: any;
    data: GraphPoint[];
    projection: {
      intercept: {
        value: number;
      };
      kinds: Array<'STATED'|'PROJECTED'>;   // I think this denotes the possible kinds?
      status: string;     // STATED, et alii
    };
  }
  export interface GraphPoint {
    next: null;
    kinds: Array<'STATED'|'PROJECTED'>;
    date: number;     // to be a date
    amount: number;     // money
    series: string;   // "other";   Guessing that we need to filter on series
  }
  export interface WorklistItem {
    id: number;
    text: string;     // Label for what it is
    value: Currency;
    link: Link;
    meta: { type: string; };
  }
  export interface TargetSummaryItem {
    id: number;
    type: GoalResponseValues.CategoryType;
    narrative: string;
    expectedCurrentValue: Currency;
    actualValue: Currency;
    limitValue: Currency;
    projectedValue: Currency;
    severity: string;      // INFO
    description: string;      // "Travel";     
    perspective: Partial<GoalWorkspacePerspectiveResponse>;
  }
  export interface TrackingLevelResponse {        // Used for Spending limit SUBMISSIONS, etc
    type: string;     // 'CATEGORY_EXPENDITURE',
    periodicity: 'MONTHLY';   // 'MONTHLY',    // Seems to be the only useful value at present.
    previousAmount: number;     // 86,
    currentAmount: number;     //"11",
    originalAmount: number;     // 213.33, 
    narrative: string;      // 'Less trips to the ATM',
    category: number;     // 123,
    flow: 'DEBIT'|'CREDIT';
    categoryTypeString: GoalResponseValues.CategoryType;      //"", e.g. DISCRETIONARY
    description: string;      //'Cash Withdrawal',
    currency: string;     // 'EUR'
  }
}
// =========================
// Expenditure graphing data
// =========================
export type ExpenditureGraphDataResponse = {
  commentary: GraphDataResponse;
  impact: any;      // null?
}
export interface GraphDataResponse {
  text: string;
  score: number;
  graph: GoalWorkspaceSubItemResponse.Graph;
  speculative: boolean;
  perspective: Partial<GoalWorkspacePerspectiveResponse>;
  kpis: any[];
  commentator: string;
};