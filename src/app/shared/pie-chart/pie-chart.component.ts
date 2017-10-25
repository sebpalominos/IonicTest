import { Component, ViewChild, Input, ElementRef, Renderer, SimpleChanges } from '@angular/core';
import Chart from 'chart.js';

import { PieChartUtil }  from './pie-chart-util';

@Component({
  selector: 'pie-chart',
  template: `
    <div class="canvas-holder" [ngClass]="chartType">
      <div class="overlay-center">
        <div><ng-content></ng-content></div>
      </div>
      <canvas #canvas></canvas>
    </div>
    <legend #legend class="graph-legend"></legend>
  `,
  host: {
    class: 'pie-chart'
  }
})
export class PieChartComponent {
  @ViewChild('canvas') canvas: ElementRef;
  @ViewChild('legend') legend: ElementRef;
  @Input('type') chartType: string = 'doughnut';
  @Input('data') chartDataset: PieChartUtil.DatasetInput;
  @Input('options') chartOptions: PieChartUtil.OptionsInput;
  @Input('labels') chartLabels: PieChartUtil.LabelSetInput;
  constructor(
    protected renderer: Renderer
  ) {}
  ngOnInit() {
    // Set some global config. I don't want no tooltips.
    Chart.defaults.global.tooltips.enabled = false;
    Chart.defaults.global.responsiveAnimationDuration = 200;
  }
  ngAfterViewInit() {
    this.renderDataset();
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes['chartDataset'].currentValue) {
      this.renderDataset();
    }
  }
  private renderDataset() {
    if (this.chartDataset){
      let { chartDatasetDefaults, chartOptionsDefaults, chartLabelSetDefaults } = this.getDefaults();
      let { chartType, chartDataset, chartOptions, chartLabels } = this;
      chartDataset = Object.assign(chartDatasetDefaults, chartDataset);
      chartOptions = Object.assign(chartOptionsDefaults, chartOptions);
      // Note: don't apply label defaults, there's no need.
      let ctx = this.canvas.nativeElement;
      let myChart = new Chart(ctx, {
        type: chartType,
        data: { 
          labels: chartLabels,
          datasets: [ chartDataset ] 
        },
        options: chartOptions
      });
      if (Array.isArray(chartLabels) && chartLabels.length) {
        let legendHtml = myChart.generateLegend();
        this.renderer.setElementProperty(this.legend.nativeElement, 'innerHTML', legendHtml);
        // console.log(this.legend.nativeElement);
        // this.legend.nativeElement.innerHTML = legendHtml;
      }
    }
  }
  private getDefaults() {
    // Initialise some defaults
    return {
      chartDatasetDefaults: {
        data: [ 1, 1, 1 ],
        // backgroundColor: [ '#FF6384', '#36A2EB' ],
        backgroundColor: [ '#FF6384', '#36A2EB', '#FFCE56' ],
        borderWidth: [ 0, 0, 0 ]
      },
      chartOptionsDefaults: <PieChartUtil.OptionsInput> {
        legend: {
          display: false
        },
        animation: { animateScale: true },
        cutoutPercentage: this.chartType === 'doughnut' ? 80 : 0,
      },
      chartLabelSetDefaults: ['#1', '#2', '#3']
    };
  }
}