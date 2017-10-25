import { Component } from '@angular/core';
import { DatePipe } from '@angular/common';
import { NavParams, NavController, LoadingController } from 'ionic-angular';

import { LineChartUtil }  from '../../../shared/line-chart/line-chart-util';
import { EditGoalComponent } from '../edit-goal/edit-goal.component';
import { SavingsGoal } from '../shared/savings-goal.model';
import { GoalBase, GoalShape } from '../shared/goal.model';
import { GoalAction } from '../shared/goal-action.model';
import { ExpenditureGraphPointType } from '../../goal-workspace/shared/expenditure-graph.model';
import { GoalWorkspaceComponent } from '../../goal-workspace/goal-workspace.component';
import { SavingsRelatedGoalWorkspace } from '../../goal-workspace/shared/goal-workspace-savings.model';
import { GoalService } from '../../../core/services/goal/goal.service';
import { History, HistoryDataPoint } from '../../misc/shapes/history';
import { TimeScaleType, MONTH_SINGLE_LETTERS } from '../../../core/data/shared/constant-types';

type HistoryDetail = {
  dataPoint: HistoryDataPoint;
  progressBarClassName: string;      // Used to influence the display background color
};

@Component({
  selector: 'scr-goal',
  templateUrl: 'goal.html',
  host: {
    class: 'goal-single'
  }
})
export class GoalComponent {
  goal: GoalBase;
  primaryAction: GoalAction;
  chartLabels: Array<string|string[]>;
  chartLines: LineChartUtil.DatasetInput[];
  chartOptions: LineChartUtil.OptionsInput;
  timeScaleTypeValues = TimeScaleType;
  showLoadingError: boolean;
  screens: { [name: string]: any } = {
    editGoal: EditGoalComponent,
    workspace: GoalWorkspaceComponent
  };
  constructor(
    protected params: NavParams, 
    protected navCtrl: NavController,
    protected loadingCtrl: LoadingController,
    private datePipe: DatePipe,
    protected goalService: GoalService
  ) {}
  ionViewWillLoad() {
    this.retrieveGoal(true).then(goal => {
      this.goal = goal;
      this.loadExpenditureGraph();
      this.loadPrimaryCallToAction();
    });
  }
  openWorkspace(action: GoalAction) {
    if (action.enabled) {
      this.navCtrl.push(this.screens['workspace'], { action });
    }
    else {
      console.warn(`Action '${action.name}' was selected, but is disabled.`);
    }
  }
  editGoal() {
    // Anything else?
    this.navCtrl.push(this.screens['editGoal'], { goalTypeIdentifier: this.goal.typeHeader.type });
  }
  private retrieveGoal(foreground = false): Promise<GoalBase> {
    this.showLoadingError = false;
    if (this.params.get('goal')) {
      return Promise.resolve(this.params.get('goal'));
    }
    else if (this.params.get('goalTypeIdentifier')) {
      let goalTypeIdentifier = this.params.get('goalTypeIdentifier');
      if (foreground) {
        // Start loading cos it gonna take a while
        var loading = this.loadingCtrl.create({ content: 'Loading goal' });
        loading.present();
      }
      return this.goalService.getGoalDetails(goalTypeIdentifier).then(goal => {
        loading && loading.dismiss();
        return goal;
      }).catch(err => {
        loading && loading.dismiss();
        this.showLoadingError = true;
      });
    }
    else if (this.params.get('id')) {
      // Future use case with multiple goals of a single type..
    }
  }
  private loadExpenditureGraph() {
    if (!this.goal) {
      return console.warn('Cannot load expenditure graph when');
    }
    // Get overview graph data from the expenditure overview.
    // Look for an action called 'RD_SAVINGS_POSSIBLE', then if it exists, load the workspace.
    let graphDataActionKeyName = 'RD_SAVINGS_POSSIBLE';
    let graphDataWorkspaceInitializer = SavingsRelatedGoalWorkspace.createFromResponse;
    let graphDataAction = this.goal && this.goal.actions.find(action => action.name === 'RD_SAVINGS_POSSIBLE');
    if (graphDataAction) {
      this.goalService.getWorkspace(graphDataAction.workspacePath(), graphDataWorkspaceInitializer).then((workspace: SavingsRelatedGoalWorkspace) => {
        let graph = workspace.graph;
        this.chartLabels = graph.points.map(point => MONTH_SINGLE_LETTERS[point.dateTime.getMonth()]);
        let chartDataActual = <LineChartUtil.DatasetInput> {
            label: graph.description,
            data: graph.points.map(point => point.amount),
            borderColor: '#7a0026',
            backgroundColor: 'rgba(122, 0, 38, 0.1)',
            pointBorderColor: graph.points.map(point => {
              return point.type === ExpenditureGraphPointType.Actual
                ? '#FFB6C1'      // actual
                : '#f39c12';        // projected
            }),
            pointBackgroundColor: graph.points.map(point => {
              return point.type === ExpenditureGraphPointType.Actual
                ? '#7a0026'      // actual
                : '#ffffff';        // projected
            }),
            pointRadius: graph.points.map(point => {
              return point.type === ExpenditureGraphPointType.Actual ? 0 : 4;
            }),
            borderCapStyle: 'round',
            pointHitRadius: 10,
          };
        this.chartLines = [ chartDataActual ];
        this.chartOptions = {
          legend: { display: false },
          scales: {
            yAxes: [{
              ticks: { display: false },
              gridLines: { display: false },
            }],
            xAxes: [{
              gridLines: { display: false },
            }]
          },
          // tooltips: {
          //   // callbacks: {
          //   //   label: (tooltipItem, data) => tooltipItem.y
          //   // }
          // }
        }
      });
    }
  }
  private loadPrimaryCallToAction() {
    // This is a bit sneaky... but if RD_SAVINGS_POSSIBLE exists, always show 
    // it as the Call To Action
    let savingsPossibleActionExists = this.goal.actions.findIndex(action => action.name === 'RD_SAVINGS_POSSIBLE') >= 0;
    this.primaryAction = savingsPossibleActionExists ? this.goal.actions.find(action => action.name === 'RD_SAVINGS_POSSIBLE') : this.goal.cta;
  }
}
