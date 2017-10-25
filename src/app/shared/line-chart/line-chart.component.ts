import { Component, ViewChild, Input, ElementRef } from '@angular/core';

import { LineChartUtil } from './line-chart-util';

// Implemented using chart.js
import Chart from 'chart.js';

@Component({
  selector: 'line-chart',
  template: `
    <div class="canvas-holder" [ngClass]="chartType">
      <canvas #canvas></canvas>
    </div>
  `,
  host: {
    class: 'line-chart'
  }
})
export class LineChartComponent {
  @ViewChild('canvas') canvas: ElementRef;
  @Input('title') string: string;
  @Input('type') chartType: string = 'line';
  @Input('labels') chartLabels: Array<string|string[]>;
  @Input('lines') chartLines: LineChartUtil.DatasetInput[];
  @Input('options') chartOptions: { [option: string]: any };
  protected chartLineDefaults: LineChartUtil.DatasetInput;
  protected chartOptionsDefaults: { [option: string]: any };
  ngOnInit() {
    Chart.defaults.global.defaultFontSize = 10;
  }
  ngAfterViewInit() {
    if (this.chartLines){
      // chartType is used in case this graph has variants e.g. pie/doughnut although line graph wouldn't
      let { chartType, chartLabels, chartLines, chartOptions } = this;
      let { chartLineDefaults, chartOptionsDefaults } = this.getDefaults();
      chartLines = chartLines.map(line => Object.assign({}, chartLineDefaults, line));
      chartOptions = Object.assign(chartOptionsDefaults, chartOptions);
      let ctx = this.canvas.nativeElement;
      let myChart = new Chart(ctx, {
        type: chartType,
        data: { 
          labels: chartLabels,
          datasets: chartLines 
        },
        options: chartOptions
      });
    }
  }
  private getDefaults() {
    return {
      chartLineDefaults: {
        data: [ 0 ],
        fill: false,
      },
      chartOptionsDefaults: {
        responsiveAnimationDuration: 200,
        tooltips: {
          enabled: true,
          displayColors: true
        },
        legend: {
          display: false,
          position: 'bottom'
        },
        // elements: {
        //   line: { fill: false }
        // },
        options: {
          scales: {
            xAxes: [{ gridLines: { display: false } }]
          }
        }
      }
    };
  }
}