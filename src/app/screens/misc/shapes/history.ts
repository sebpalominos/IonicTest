import { TimeScaleType } from '../../../core/data/shared/constant-types';

export interface History {
  timeScale: TimeScaleType;
  dataPoints: HistoryDataPoint[];
  title?: string;
  subtitle?: string;
  actionComponent?: any;              // The component for which this HistoryDataPoint represents a point of data
  actionData?: any;                   // If we want to go to that component
};

export interface HistoryDataPoint {
  valueActual: number;    // Y-axis, actual value reached 
  valueTarget?: number;    // Y-axis, limit or goal etc
  date: Date;       // X-axis
  label?: string;
};