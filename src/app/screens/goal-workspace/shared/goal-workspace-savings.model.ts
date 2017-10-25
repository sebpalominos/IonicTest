import { ExpenditureGraph, ExpenditureGraphShape, ExpenditureGraphPoint } from './expenditure-graph.model';
import { GoalWorkspaceBase, GoalWorkspaceShape, WorkspaceItems } from './goal-workspace.model';
import { SavingsRelatedPayload } from './goal-workspace-data-maps';
import { GoalResponseValues, GoalWorkspaceResponse, GoalWorkspaceSubItemResponse, GoalWorkspacePerspectiveResponse, GraphDataResponse } from '../../../core/data/goal/goal-response';
import { Link } from '../../../core/data/shared/link';

export namespace SavingsRelated {
  // export interface Graph {
  //   type: string;
  //   trackingLevel: any;
  //   metadata: any;
  //   points: GraphPoint[];
  //   graphPointKinds: Array<'STATED'|'PROJECTED'>;
  //   projectionStatus: string;
  //   projectionInterceptDate: Date;
  // }
  // export interface GraphPoint {
  //   // next: null;
  //   kinds: Array<'STATED'|'PROJECTED'>;
  //   date: Date;     // to be a date
  //   amount: number;     // money
  //   seriesName: string;   // "other";   Guessing that we need to filter on series
  // }
  export interface SpendingArea {
    id: number;
    type: GoalResponseValues.CategoryType;
    label: string;
    link: Link;
    projectedValue: number;
    currentValue: number;
  }
  export interface SpendingLimit {
    id: number;
    type: GoalResponseValues.CategoryType;
    narrative: string;
    description: string;
    limitValue: number;
    originalValue: number;
  }
  export interface SpendingLimitSubmission extends GoalWorkspaceSubItemResponse.TrackingLevelResponse {}
  export interface Perspective extends GoalWorkspacePerspectiveResponse {}
}
// ==============================
// Savings Related Goal Workspace
// ==============================
export interface SavingsRelatedGoalWorkspaceShape extends GoalWorkspaceShape {
  overview: string;
  score: number;
  graph: ExpenditureGraph;
  summaryPerspective: SavingsRelated.Perspective;
  spendingAreas: SavingsRelated.SpendingArea[];
  spendingLimits: SavingsRelated.SpendingLimit[];
}
export class SavingsRelatedGoalWorkspace extends GoalWorkspaceBase implements SavingsRelatedGoalWorkspaceShape {
  constructor(...shapes: Partial<SavingsRelatedGoalWorkspaceShape>[]) {
    super(...shapes);
  }
  overview: string;
  score: number;
  graph: ExpenditureGraph;
  summaryPerspective: SavingsRelated.Perspective;
  spendingAreas: SavingsRelated.SpendingArea[];
  spendingLimits: SavingsRelated.SpendingLimit[];
  getPayload(params: any) {
    let targetSummary: Partial<SavingsRelated.SpendingLimitSubmission> = params.targetSummary;
    let operation: string = 'CREATE';
    let item: string = 'targetSummary';
    return <SavingsRelatedPayload> {
      items: [ item ],
      proposedAction: {
        operation: operation,
        data: Object.assign(<SavingsRelated.SpendingLimitSubmission>{
          type: 'CATEGORY_EXPENDITURE',
          periodicity: 'MONTHLY',
          previousAmount: 0,
          currentAmount: 0,
          originalAmount: 0,
          narrative: '',
          category: 0,
          flow: 'DEBIT',
          categoryTypeString: 'DISCRETIONARY',
          description: '',
          currency: 'AUD'
        }, targetSummary)
      }
    };
  }
  static createFromResponse(resp: GoalWorkspaceResponse, workspacePath?: string): SavingsRelatedGoalWorkspace {
    let worklistKeyContentPair = resp.items.find(item => item.key === 'worklist');
    if (worklistKeyContentPair) {
      var summaryPerspective = worklistKeyContentPair.content.perspective;
      var spendingAreas = worklistKeyContentPair.content.items.map((item: GoalWorkspaceSubItemResponse.WorklistItem) => {
        return <SavingsRelated.SpendingArea> {
          id: item.id,
          type: item.meta.type,      // e.g. DISCRETIONARY
          label: item.text,
          link: item.link,
          // value: item.value.amount
        };
      });
    }
    let targetSummaryKeyContentPair = resp.items.find(item => item.key === 'targetSummary');
    if (targetSummaryKeyContentPair) {
      var spendingLimits = targetSummaryKeyContentPair.content.items.map((item: GoalWorkspaceSubItemResponse.TargetSummaryItem) => {
        return <SavingsRelated.SpendingLimit> {
          id: item.id,
          type: item.type,
          narrative: item.narrative,
          description: item.description,
          limitValue: item.limitValue.amount,
          originalValue: 0,      // How do we retrieve this..?
          projectedSpend: item.projectedValue.amount,
          actualSpend: item.actualValue.amount
        };
      });
    }
    let overviewKeyContentPair = resp.items.find(item => item.key === 'overview');
    if (overviewKeyContentPair) {
      var overview = overviewKeyContentPair.content;
      var graph = ExpenditureGraph.createFromResponse(<GraphDataResponse>overviewKeyContentPair.content);
    }
    return new SavingsRelatedGoalWorkspace(<SavingsRelatedGoalWorkspaceShape> {
      key: resp.key,
      title: resp.title,
      label: resp.callToAction && resp.callToAction.actionLabel,
      description: resp.callToAction && resp.callToAction.description,
      path: workspacePath,
      overview: overview && overview.text,
      score: overview && overview.score,
      graph: graph,
      spendingLimits: spendingLimits,
      spendingAreas: spendingAreas,
      summaryPerspective: summaryPerspective,
      focalPoints: resp.focalPoints.map(fp => {
        let { active, description, focus } = fp;
        let isMain = fp.focus === resp.focus; 
        return <WorkspaceItems.FocalPoint> {
          isMain, active, description, focus
        }
      })
    });
  }
}