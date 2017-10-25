import { History, HistoryDataPoint } from '../../screens/misc/shapes/history';

export namespace LineChartUtil {
  export type ChartColor = string;
  export interface DatasetInput {
    label?: string;
    data: number[]|{ x: number; y: number }[];
    xAxisID?: string;
    yAxisID?: string;
    fill?: boolean;
    lineTension?: number;
    cubicInterpolationMode?: string;
    backgroundColor?: ChartColor;
    borderColor?: ChartColor;
    borderWidth?: number;
    borderCapStyle?: 'butt'|'round'|'square';
    borderDash?: number[];
    borderDashOffset?: number;
    borderJoinStyle?: 'round'|'bevel'|'miter';
    pointBorderColor?: ChartColor|ChartColor[];
    pointBackgroundColor?: ChartColor|ChartColor[];
    pointBorderWidth?: number|number[];
    pointRadius?: number|number[];
    pointHoverRadius?: number|number[];
    pointHitRadius?: number|number[];
    pointHoverBackgroundColor?: ChartColor|ChartColor[];
    pointHoverBorderColor?: ChartColor|ChartColor[];
    pointHoverBorderWidth?: number|number[];
    pointStyle?: string|string[];
    showLine?: boolean;
    spanGaps?: boolean;
    steppedLine?: boolean;
  }
  export interface OptionsInput {
    scales: {
      xAxes?: [any];
      yAxes?: [any];
    };
    tooltips?: any;
    legend?: {
      display?: boolean;      // default true
      position?: string;      // default top
      fullWidth?: boolean;
      reverse?: boolean;
      labels?: { 
        boxWidth?: number;
        fontSize?: number;
        fontStyle?: string;
        fontColor?: ChartColor;
        fontFamily?: string;
        padding?: number;
        usePointStyle?: boolean;
        filter?: (item, chart) => any;
        generateLabels?: (chart) => string;
      };
      onClick?: (event, legendItem) => void;
      onHover?: (event, legendItem) => void;
    };
  }
  export function calculateYAxisTicks(dataPoints: HistoryDataPoint[], includeValueTarget: boolean = false){
    if (includeValueTarget){
      // Find the biggest datapoint in the entire chart
      var maxY: number = dataPoints.reduce((prev, dataPoint) => {
        let largerPoint = Math.max(dataPoint.valueActual, dataPoint.valueTarget);
        if (isNaN(prev)) return largerPoint;
        return largerPoint > prev ? largerPoint: prev;
      }, NaN);
      // Find the smallest datapoint in the entire chart
      var minY: number = dataPoints.reduce((prev, dataPoint) => {
        let smallerPoint = Math.min(dataPoint.valueActual, dataPoint.valueTarget);
        if (isNaN(prev)) return smallerPoint;
        return smallerPoint < prev ? smallerPoint : prev;
      }, NaN);
    }
    else {
      // Find the biggest datapoint in the entire chart
      var maxY: number = dataPoints.reduce((prev, dataPoint) => {
        if (isNaN(prev)) return dataPoint.valueActual;
        return dataPoint.valueActual > prev ? dataPoint.valueActual: prev;
      }, NaN);
      // Find the smallest datapoint in the entire chart
      var minY: number = dataPoints.reduce((prev, dataPoint) => {
        if (isNaN(prev)) return dataPoint.valueActual;
        return dataPoint.valueActual < prev ? dataPoint.valueActual : prev;
      }, NaN);
    }
    // Use this to calculate some padding we'd want around the max and min values
    // Let's have 20% the difference as padding
    let minMaxDiff = maxY - minY;
    let stepSizeInitial = Math.round(minMaxDiff/5);     // Lose some precision on purpose.
    let stepFactor = Math.pow(10, Math.floor(Math.log(stepSizeInitial) / Math.LN10));
    let stepSize = Math.ceil(stepSizeInitial/stepFactor) * stepFactor;      // To the nearest pow 10
    let upperLowerPad = stepSize;     // for now just use this stepsize
    return {
      min: Math.floor(minY - upperLowerPad),
      max: Math.ceil(maxY + upperLowerPad),
      stepSize
    };
  }
}