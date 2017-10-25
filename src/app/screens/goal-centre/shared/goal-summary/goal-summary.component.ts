import { Component, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { Events } from 'ionic-angular';

import { GoalOverview } from '../goal-overview.model';
import { AvailableGoalInfo, GoalOverviewInfo } from '../goal-misc';
import { GoalType } from '../goal-type.model';
import { TimeScaleType } from '../../../../core/data/shared/constant-types';
import { GoalService } from '../../../../core/services/goal/goal.service';
import { PieChartUtil }  from '../../../../shared/pie-chart/pie-chart-util';

@Component({
  selector: 'opc-goal-summary',
  templateUrl: 'goal-summary.html',
  host: {
    class: 'goal-summary'
  }
})
export class GoalSummaryComponent {
  @Input('goals') goalTypes: AvailableGoalInfo[];
  @Output() goalTapped = new EventEmitter<GoalType>();
  @Output() goalPressed = new EventEmitter<GoalType>();
  goals: GoalOverviewInfo[];
  showLoading: boolean;
  showError: boolean;
  showCreateGoal: boolean;
  // @Input('uid') sliderUid: string;
  // goalSummaryMap: GoalSummaryChartData[];
  constructor(
    protected events: Events,
    protected goalService: GoalService
  ) {}
  ngOnChanges(changes: SimpleChanges) {
    // You could say, there are a couple of conditions...
    if (changes['goalTypes']) {
      let change = changes['goalTypes'];
      if (!change.previousValue && change.currentValue && Array.isArray(change.currentValue) && change.currentValue.length) {
        this.loadGoalSummary();
      } 
    }
  }
  ngAfterViewInit(){
    // Normally, init the slider here, but the goal load is delayed, so defer.
  }
  private loadGoalSummary() {
    this.showError = false;
    this.showLoading = true;
    let retrieveOverviews = this.goalTypes.map(goalInfo => {
      let goalTypeIdentifier = goalInfo.typeHeader.type;
      return this.goalService.getGoalOverview(goalTypeIdentifier).then(overview => {
        // Go through Milestone timeframes:
        // 1. Find the milestone which is current == true, note the text index
        // 2. Match that up to milestone indicator with that text index
        let { typeHeader, milestoneTimeframes, milestoneIndicators } = overview;
        try {
          let currentMilestoneTextIndex = milestoneTimeframes.find(mtf => mtf.current).texts.index;
          let currentMilestone = milestoneIndicators.find(mi => mi.index === currentMilestoneTextIndex);
          let percentage = currentMilestone.completionPercentage;
          let percentageCaption = currentMilestone.completionLabel;
          let chartData = this.createChartDataPercentage(currentMilestone.completionPercentage, currentMilestone.completionLabel);
          return <GoalOverviewInfo> { hasOverview: true, overview, typeHeader, percentage, percentageCaption, chartData };
        }
        catch (err) {
          console.warn(`Progress information couldn't be determined for ${overview.typeHeader.type}.`);
          return <GoalOverviewInfo> { hasOverview: false, typeHeader };
        }
      }).catch(err => {
        console.error(err);
        return <GoalOverviewInfo> { hasOverview: false };
      });
    });
    return Promise.all(retrieveOverviews).then(overviewInfos => {
      // Show Create Goal if no overviews at all are available
      this.showCreateGoal = overviewInfos.filter(info => info.hasOverview).length <= 0;
      // Add cards to list
      this.goals = overviewInfos.filter(info => info.hasOverview);
      // Init the card slider
      setTimeout(() => {
        this.events.publish('slider:init', [`slider-goal-summary`]);
      }, 0);
      this.showLoading = false;
      return true;
    }).catch(err => {
      this.showLoading = false;
    });
  }
  private createChartDataPercentage(percentage: number, headline: string): PieChartUtil.DatasetInput {
      return <PieChartUtil.DatasetInput> {
        label: headline,
        data: [ percentage, 100-percentage ],   // actual + remaining = 100
        backgroundColor: [ 'rgba(255,255,255,.8)', 'rgba(255,255,255,.1)' ]
      }
  }
  /*
  private getTimeLeft(summary: GoalSummary, timeScale: TimeScaleType = TimeScaleType.Daily): number {
    // let timeSecondsLeft = summary.data.timeTotal - summary.data.timeElapsed;
    // if (timeSecondsLeft >= 0){
    //   if (timeScale = TimeScaleType.Daily){
    //     return Math.round(timeSecondsLeft / (60 * 60 * 24));
    //   }
    // }
    return 0;
  }
  private getCompletionPercentage(summary: GoalSummary): number {
    // return Math.round(summary.data.valueActualTotal / summary.data.valueTargetTotal * 100);
    return 0;
  }
  */
}