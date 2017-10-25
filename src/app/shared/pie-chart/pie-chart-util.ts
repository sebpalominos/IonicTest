import { History, HistoryDataPoint } from '../../../screens/misc/shapes/history';

export namespace PieChartUtil {
  export type ChartColor = string;
  export type LabelSetInput = string[];
  export interface DatasetInput {
    label?: string;
    data: number[];
    backgroundColor?: ChartColor[];
    borderColor?: ChartColor[];
    borderWidth?: number[];
    hoverBackgroundColor?: ChartColor[];
    hoverBorderColor?: ChartColor[];
    hoverBorderWidth?: number[];
  }
  export interface OptionsInput {
    cutoutPercentage?: number;
    rotation?: number;
    circumference?: number;
    animation?: {
      animateRotate?: boolean;
      animateScale?: boolean;
    };
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
        filter: (item, chart) => any;
        generateLabels: (chart) => string;
      };
      onClick: (event, legendItem) => void;
      onHover: (event, legendItem) => void;
    };
  }
}