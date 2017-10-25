import { Component, ViewChild, Input, ElementRef } from '@angular/core';
import { NavController, Events } from 'ionic-angular';

import Chart from 'chart.js';

import { PieChartUtil }  from '../../../../shared/pie-chart/pie-chart-util';
import { UserService } from '../../../../core/services/user/user.service';
import { TransactionService } from '../../../../core/services/transaction/transaction.service';
import { DashboardService } from '../../../../core/services/dashboard/dashboard.service';

type WeatherStatus = {
  id: 'sunny' | 'slightlyCloudy' | 'cloudy' | 'rainy' | 'stormy';
  label: string;
  iconUrl: string;
};

@Component({
  selector: 'home-summary',
  templateUrl: 'home-summary.html'
})
export class HomeSummaryComponent {
  @ViewChild('canvas') canvas: ElementRef;
  @Input() screens: { [screenName: string]: any };
  lastMonthIncome: number;
  lastMonthExpenses: number;
  categorisationRate: number;
  chartTitle: string;
  chartData: PieChartUtil.DatasetInput;
  weatherStatus: WeatherStatus;
  showWeatherStatus: boolean;
  showLoadingCashflowSummaries: boolean;
  showLoadingCashflowSummariesError: boolean;
  constructor(
    protected navCtrl: NavController,
    protected events: Events,
    protected userService: UserService,
    protected transactionService: TransactionService,
    protected dashboardService: DashboardService,
  ) {}
  ngOnInit() {
    // Set some global config. I don't want no tooltips.
    Chart.defaults.global.tooltips.enabled = false;
    Chart.defaults.global.responsiveAnimationDuration = 200;
    this.loadCategorisationRate();
    this.loadCashflowSummaries().then(success => {
      if (success) {
        this.assignWeatherStatus();
      }
    });
    setTimeout(() => {
      this.events.publish('slider:init', ['slider-home-summary']);
    }, 0);
  }
  ngAfterViewInit() {
    // this.renderBarChartDataset();
  }
  cashflowSlideSelected() {
    this.navCtrl.push(this.screens['categoryList']);
  }
  invokeSearch(searchTerm: string) {
    this.navCtrl.setRoot(this.screens['propertyResults'], { presetSearchTerm: searchTerm }, { animate: true, direction: 'forward' });
  }
  private loadCategorisationRate() {
    this.transactionService.getCategorisationMetric().then(metric => {
      this.categorisationRate = metric.percentage;
      if (metric.percentage < 25) {
        var pieChartMainColor = 'rgba(231,76,60,1.0)';        
      }
      else if (metric.percentage < 80) {
        var pieChartMainColor = 'rgba(243,156,18,1.0)';        
      }
      else {
        var pieChartMainColor = 'rgba(46,204,113,1.0)';
      }
      this.chartTitle = `Categorisation rate`;
      this.chartData = <PieChartUtil.DatasetInput>{
        data: [ metric.percentage, 100 - metric.percentage ],
        backgroundColor: [ pieChartMainColor, 'rgba(255,255,255,.2)' ],
      };
    }).catch(err => {
      console.error(err);
    });
    
  }
  private loadCashflowSummaries(): Promise<boolean> {
    // Load numbers
    this.showLoadingCashflowSummaries = true;
    return this.dashboardService.getCashflow().then(cashflowSummaries => {
      this.showLoadingCashflowSummaries = false;
      this.lastMonthIncome = cashflowSummaries.find(cfs => cfs.identifier === 'lastMonthIncome').value;
      this.lastMonthExpenses = cashflowSummaries.find(cfs => cfs.identifier === 'lastMonthExpenditure').value;
      return true;
    }).catch(err => {
      this.showLoadingCashflowSummaries = false;
      this.showLoadingCashflowSummariesError = true;
      console.error(err);
      return false;
    });
  }
  private renderBarChartDataset() {
    let labels = [ 'Average', 'You' ];
    let ctx = this.canvas.nativeElement;
    let myChart = new Chart(ctx, {
      type: 'bar',
      data: { 
        labels: labels,
        datasets: [{
          label: 'stuiff',
          data: [ 4000, 8000 ],
          backgroundColor: [ 'rgba(52,152,219,1)', 'rgba(22,160,133,1)' ],
          borderColor: [ '#d00', '#0d0' ]
        }] 
      },
      options: {
        maintainAspectRatio: false,
        tooltips: {
          enabled: false
        },
        legend: {
          display: false,
          position: 'bottom'
        },
        scales: {
          yAxes: [{ 
            ticks: { beginAtZero: true, display: false, callback: value => `\$${value}` },
            gridLines: { drawBorder: false, display: false },
            pointLabels: { display: true, }
          }],
          xAxes: [{ 
            ticks: { fontColor: 'white', },
            gridLines: { display: false, color: 'rgba(255,255,255,0.2)', zeroLineWidth: 2 } 
          }]
        }
      }
    });
  }
  /**
   * Assigns a weather icon and cues a slide-down ticker to show the weather
   * @desc Must be called AFTER the lastMonthIncome/Expenses has been loaded
   * @private
   * @memberof HomeSummaryComponent
   */
  private assignWeatherStatus() {
    if (!this.lastMonthIncome || !this.lastMonthExpenses) {
      return console.warn('HomeSummaryComponent::AssignWeatherStatus was called but lastMonth values weren\'t set');
    }
    setTimeout(() => {
      setInterval(() => {
        this.showWeatherStatus = !this.showWeatherStatus;
      }, 6000);
    }, 6000);
    let cashflowPercentage = (this.lastMonthIncome - this.lastMonthExpenses) / this.lastMonthIncome;
    // Very positive cashflow is > 20% of income saved
    if (cashflowPercentage > .2) {
      this.weatherStatus = {
        id: 'sunny',
        label: 'Cashflow Health: Good',
        iconUrl: 'assets/icons/squidink/svg32/weather/sun.svg',
      };
    } 
    // Positive cashflow is > 5% of income saved
    else if (cashflowPercentage > .05) {
      this.weatherStatus = {
        id: 'slightlyCloudy',
        label: 'Cashflow Health: OK',
        iconUrl: 'assets/icons/squidink/svg32/weather/sun-with grey cloud.svg',
      };
    }
    // Neutral cashflow is > -5% of income saved
    else if (cashflowPercentage > -.05) {
      this.weatherStatus = {
        id: 'cloudy',
        label: 'Cashflow Health: OK',
        iconUrl: 'assets/icons/squidink/svg32/weather/grey-cloud with small sun.svg',
      };
    }
    // Mild negative cashflow is > -20% of income saved
    else if (cashflowPercentage > -.2) {
      this.weatherStatus = {
        id: 'rainy',
        label: 'Cashflow Health: Negative',
        iconUrl: 'assets/icons/squidink/svg32/weather/grey-cloud shower rain.svg',
      };
    }
    // Heavy negative cashflow is > -5% of income saved
    else if (cashflowPercentage <= -.2) {
      this.weatherStatus = {
        id: 'stormy',
        label: 'Cashflow Health: Negative',
        iconUrl: 'assets/icons/squidink/svg32/weather/grey-cloud lightning.svg',
      };
    }
  }
}