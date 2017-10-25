import { Category } from './category.model';

/* USed as data transfer object */
export interface CategoryBreakdownInfo {
  category: Category;
  count: number;
  totalValue: number;
  perspective: any;
  isCredit?: boolean;
}
/* Used by Categories rainbow UI */
export interface ColoredCategory extends CategoryBreakdownInfo {
  colorClass?: string;
  backgroundColor?: string;
  isHidden?: boolean;
  stats?: CategoryStats;
};
/* Used by the Categoriser list component */
export interface SearchListCategory {
  category: Category;
  isHidden?: boolean;
}
/* Used to generate arrays of hierarchically mapped categories */
export type CategoryParentMap = {
  parent: Category;
  children?: Category[];
};
/* Used by category popup */
export interface CategoryStats {
  isCurrentMonth: boolean;    // If the target month happens to be the current month
  currentMonthName: string;
  previousMonthName: string;
  activeMonthName: string;
  previousMonthSpend: number;
  activeMonthSpend: number;
  currentMonthSpend: number;
  projectedCurrentMonthSpend: number;
  previousMonthDeltaPercent: number;      // values range from 0-100
  previousMonthDeltaTrend: number;      // -1, 0, 1
  currentMonthDeltaPercent: number;      // values range from 0-100
  currentMonthDeltaTrend: number;      // -1, 0, 1
  currentMonthProjectedDeltaPercent: number;
  currentMonthProjectedDeltaTrend: number;
  totalLifetimeSpend: number;
}