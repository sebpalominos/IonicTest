import { Component, Input } from '@angular/core';
import { ModalController, Events } from 'ionic-angular';

import { AffordabilityGoal, AffordabilityTrackingLevel } from '../affordability-goal.model';
import { ExpenditureGraph, ExpenditureGraphPointType } from '../../../goal-workspace/shared/expenditure-graph.model';
import { CreateAffordabilityComponent } from '../../create-afford/create-afford.component';
import { LineChartUtil } from '../../../../shared/line-chart/line-chart-util';
import { PropertyUtils } from '../../../property-centre/shared/property-utils';
import { MONTH_SINGLE_LETTERS } from '../../../../core/data/shared/constant-types';
import { GoalService } from '../../../../core/services/goal/goal.service';

type TrackingLevelGraph = {
  trackingLevel: AffordabilityTrackingLevel;
  graphData?: ExpenditureGraph;
  chartLines?: LineChartUtil.DatasetInput[];
  chartLabels?: Array<string|string[]>;
  chartOptions?: LineChartUtil.OptionsInput;
  longDescription?: string;
};

@Component({
  selector: 'afford-tracking',
  templateUrl: 'afford-tracking.component.html',
  host: {
    class: 'afford-tracking'
  }
})
export class AffordabilityTrackingComponent {
  @Input() goal: AffordabilityGoal;
  trackingLevelGraphs: TrackingLevelGraph[];
  constructor(
    protected modalCtrl: ModalController,
    protected events: Events,
    protected goalService: GoalService
  ) {}
  ngOnInit() {
    this.loadGraphData();
    setTimeout(() => {
      this.events.publish('slider:init', ['slider-afford-tracking']);
    }, 0);
  }
  private loadGraphData() {
    if (this.goal.overview && this.goal.overview.trackingLevels) {
       this.trackingLevelGraphs = this.goal.overview.trackingLevels.map(trackingLevel => { 
        let trackingLevelGraph: TrackingLevelGraph = { trackingLevel };
        return trackingLevelGraph;
      });
      let retriveExpenditureGraphs = this.trackingLevelGraphs.map(trackingLevelGraph => {
        let path = [ 'goals', 'workslistItemContent', 'REAL_ESTATE', 'REAL_ESTATE_MONTHLY_SURPLUS', 'EXPENDITURE', 'flowCommentator' ];      // Hardcoded for real estate
        let payload = trackingLevelGraph.trackingLevel.perspective;
        return this.goalService.getExpenditureGraphData(path, payload).then(graphData => {
          if (graphData) {
            // trackingLevelGraph.graphData = graphData;
            this.initGraph(trackingLevelGraph, graphData);
          }
          else {
            console.warn(`No line graph data retrieved for affordability tracking levels`);
          }
        });
      });
      Promise.all(retriveExpenditureGraphs).then(() => {
        // Not used.
      });
    }
    else {
      console.warn('Could not load expenditure graph - retrieval info not available');
    }
  }
  private initGraph(graph: TrackingLevelGraph, graphData?: ExpenditureGraph) {
    if (graphData) {
      graph.graphData = graphData;
    }
    else if (!graph.graphData) {
      return console.warn('Spending limit graph: Skipping graph init, no graph data loaded yet.');
    }
    let isThisMonth = (timestamp: Date) => `${timestamp.getFullYear()}${timestamp.getMonth()}` === `${new Date().getFullYear()}${new Date().getMonth()}`;
    graph.longDescription = graphData.description;
    graph.chartLabels = graph.graphData.points.map(point => MONTH_SINGLE_LETTERS[point.dateTime.getMonth()]);
    graph.chartLines = [<LineChartUtil.DatasetInput>{
      label: graph.graphData.description,
      data: graph.graphData.points.map(point => point.amount),
      borderColor: 'dodgerblue',
      backgroundColor: 'rgba(122, 0, 38, 0.1)',
      pointBorderColor: graph.graphData.points.map(point => isThisMonth(point.dateTime) ? 'yellow' : 'white'),
      pointBackgroundColor: graph.graphData.points.map(point => 'transparent'),
      pointRadius: graph.graphData.points.map(point => isThisMonth(point.dateTime) ? 4 : 0),
      borderCapStyle: 'butt',
      pointHitRadius: 10,
    }];
    graph.chartOptions = {
      legend: { display: false },
      scales: {
        yAxes: [{
          type: 'linear',
          gridLines: { display: false },
        }],
        xAxes: [{
          gridLines: { display: false },
        }]
      },
    }
  }
}