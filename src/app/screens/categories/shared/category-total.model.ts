import { TimeScaleType } from '../../../core/data/shared/constant-types';
import { HistoryDataPoint } from '../../misc/shapes/history';

/** Simplified set set of values needed for Category List */
export interface CategoryTotalShape {
  name?: string;
  categoryId: number;
  totalSpend: number;
  timeScale: TimeScaleType;
  goalActivity?: HistoryDataPoint;        // May not have a goal
}
export class CategoryTotal {
  constructor(...props: any[]){
    Object.assign(this, ...props);
  }
  name: string;
  categoryId: number;
  totalSpend: number;
  timeScale: TimeScaleType = TimeScaleType.Monthly;
  goalActivity?: HistoryDataPoint;        // May not have a goal
  /** Return goal target value based on default timeview */
  valueTarget(): number {
    return this.goalActivity ? this.goalActivity.valueTarget : 100;
  }
  /** Return goal current value based on default timeview */
  valueActual(): number {
    return this.goalActivity ? this.goalActivity.valueActual : 0;
  }
  /** If overspent i.e. valueActual > valueTarget */
  overspent(): boolean {
    return this.valueActual() > this.valueTarget();
  }
}

/** More detailed statistics for this category */
export interface ICategorySummary extends CategoryTotalShape {
  averageSpend: number;
  projectedSpend: number;
}

export class CategorySummary extends CategoryTotal {
  
}