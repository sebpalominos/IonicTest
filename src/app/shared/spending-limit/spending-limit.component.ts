import { Component, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { ActionSheetController } from 'ionic-angular';

import { ExpenditureGraph, ExpenditureGraphPointType } from '../../screens/goal-workspace/shared/expenditure-graph.model';
import { SpendingCategoryInfo } from '../../screens/goal-workspace/shared/goal-workspace-data-maps';
import { TimeScaleType, MONTH_SINGLE_LETTERS } from '../../core/data/shared/constant-types';
import { GoalService } from '../../core/services/goal/goal.service';
import { LineChartUtil }  from '../../shared/line-chart/line-chart-util';

@Component({
  selector: 'spending-limit',
  templateUrl: 'spending-limit.component.html',
  host: {
    class: 'spending-limit'
  }
})
export class SpendingLimitComponent {
  @Input() spendingCategory: SpendingCategoryInfo;
  @Output('edit') editSelected = new EventEmitter<SpendingCategoryInfo>();
  timeScaleTypeValues = TimeScaleType;
  graphData: ExpenditureGraph;
  chartLabels: Array<string|string[]>;
  chartLines: LineChartUtil.DatasetInput[];
  chartOptions: LineChartUtil.OptionsInput;
  constructor(
    protected goalService: GoalService
  ) {}
  ngOnInit() {
    if (this.spendingCategory) {
      this.loadGraphData();
    }
    // TODO: Update should trigger event to refresh graph for a component
    debugger;
    // END TODO
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes['spendingCategory']) {
      this.initGraph();
    }
  }
  refreshGraph() {
    if (this.spendingCategory) {
      this.loadGraphData();
    }
  }
  private loadGraphData() {
    if (this.spendingCategory.spendingArea.link) {
      let path = this.spendingCategory.spendingArea.link.name;
      let payload = this.spendingCategory.spendingArea.link.body;
      this.goalService.getExpenditureGraphData(path, payload).then(graphData => {
        if (graphData) {
          this.graphData = graphData;
          this.initGraph();
        }
        else {
          console.warn(`No line graph data retrieved for category ID #${this.spendingCategory.id}`);
        }
      }).catch(err => {
        console.error(err);
      });
    }
    else {
      console.warn('Could not load expenditure graph - retrieval info not available');
    }
  }
  private initGraph() {
    if (!this.graphData) {
      return console.warn('Spending limit graph: Skipping graph init, no graph data loaded yet.');
    }
    let graph = this.graphData;
    this.chartLabels = graph.points.map(point => MONTH_SINGLE_LETTERS[point.dateTime.getMonth()]);
    let chartDataTrend = <LineChartUtil.DatasetInput> {
      label: graph.description,
      data: graph.points.map(point => point.amount),
      borderColor: '#7a0026',
      backgroundColor: 'rgba(122, 0, 38, 0.1)',
      pointBorderColor: graph.points.map(point => {
        return '#7a0026';
        // return point.type === ExpenditureGraphPointType.Actual
        //   ? '#7a0026'      // actual
        //   : '#FF1493';        // projected
      }),
      pointBackgroundColor: graph.points.map(point => {
        return '#7a0026';
        // return point.type === ExpenditureGraphPointType.Actual
        //   ? '#7a0026'      // actual
        //   : '#ffffff';        // projected
      }),
      pointRadius: graph.points.map(point => {
        return 0;
        // return point.type === ExpenditureGraphPointType.Actual ? 0 : 1;
      }),
      borderCapStyle: 'butt',
      pointHitRadius: 10,
    };
    if (this.spendingCategory.spendingLimit) {
      let limitValue = this.spendingCategory.spendingLimit.limitValue;
      var chartDataLimit = <LineChartUtil.DatasetInput> {
        label: graph.description,
        data: graph.points.map(point => limitValue),
        borderColor: 'rgba(52, 152, 219, 1)',
        backgroundColor: 'rgba(52, 152, 219, 0.2)',
        borderCapStyle: 'butt',
        pointRadius: 0,
      };
      this.chartLines = [ chartDataTrend, chartDataLimit ];
    }
    else {
      this.chartLines = [ chartDataTrend ];
    }
    this.chartOptions = {
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
      // tooltips: {
      //   // callbacks: {
      //   //   label: (tooltipItem, data) => tooltipItem.y
      //   // }
      // }
    }
  }
}