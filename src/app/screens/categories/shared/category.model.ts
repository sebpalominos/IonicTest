import * as moment from 'moment';

// import { CategoryResponse, CategoryListResponse } from '../../../core/data/category/category-response';
import { CategoryResponse, CategoryListResponse, CategoryBreakdownResponse, TransactionCategoryListResponse } from '../../../core/data/category/category-response';
import { CategoryTotal, CategoryTotalShape } from './category-total.model';
import { OpiconParams, OpiconSize } from '../../../shared/opc-icon/opc-icon-type';
import { TimeScaleType } from '../../../core/data/shared/constant-types';
import { CategoryStats } from './category-data-maps';
import { CATEGORY_ICONS } from '../../../core/data/category/category-icons';

// Data transfer objects
export interface CategoryShape {
  id: number;
  name: string;
  description?: string;
  parentId?: number;
  level?: number;
  numTransactions?: number;
  credit?: boolean;
  anzsic?: string;
}

// For recreating POST API payloads
export abstract class KeepsCategoryResponse {
  _categoryResponse: CategoryResponse;
}

// Concretify in order to do shit with a Category class
export class Category extends KeepsCategoryResponse implements CategoryShape {
  id: number;
  name: string;
  description?: string;
  parentId?: number;
  parent?: Category;
  level?: number;
  credit?: boolean;
  anzsic?: string;
  numTransactions?: number;
  totals?: CategoryTotal[];
  isPrimary?: boolean;
  activeTotal: CategoryTotal;
  activeTimeView: TimeScaleType = TimeScaleType.Monthly;  
  constructor(...props: any[]){
    super();
    Object.assign(this, ...props);
  }
  /** Name including immediate parent (if any) */
  longName(sep: string = '›'): string {
    return (this.parent ? `${this.parent.name} ${sep} ` : '') + this.name;
  }
  /** Retrieve the OPICON for this category (if any) */
  icon(): OpiconParams {
    let icon = CATEGORY_ICONS.find(icon => icon.id === this.id);
    if (this.parent){
      // This can keep going up the parent chain :)
      return icon || this.parent.icon();
    }
    else if (this.parentId){
      return icon || CATEGORY_ICONS.find(icon => icon.id === this.parentId);
    }
    return icon;
  }
  /** Create Category object array from Transaction Category list */
  static createTransactionCategoryListFromResponse(resp: TransactionCategoryListResponse): Category[] {
    let primaryCategoryId: number = resp.primaryCategory && resp.primaryCategory.id;
    return resp.items.map(ctyMap => {
      for (let ctyKey in Object.keys(ctyMap)) {
        if (ctyKey === 'category') {
          let isPrimary = ctyMap[ctyKey].id === primaryCategoryId;
          return this.createCategoryFromResponse(ctyMap[ctyKey]);
        }
      }
    });
  }
  /** Create Category object array from Category list */
  static createCategoryListFromResponse(resp: CategoryListResponse, minLevel: number = 0) {
    return resp.items
      .filter(ctyMap => ctyMap.level >= minLevel)
      .map(ctyMap => this.createCategoryFromResponse(ctyMap.category));
  }
  /** 
   * Create Category object from CategoryResponse object 
   * TODO: Include instantiation of category parent
   */
  static createCategoryFromResponse(ctyResp: CategoryResponse, isPrimary: boolean = false): Category {
    let categoryShape: CategoryShape = {
      id: ctyResp.id,
      parentId: ctyResp.parentId,
      description: ctyResp.description,
      name: ctyResp.description,
      credit: ctyResp.flow === 'CREDIT',    // Majority case will be debits
      level: ctyResp.level
    };
    let _categoryResponse = ctyResp;
    return new Category(categoryShape, { isPrimary, _categoryResponse });
  }
  /**
   * Parse and return category stats for a given category
   * @static
   * @param {CategoryBreakdownResponse} statsResp 
   * @returns {CategoryStats} 
   * @memberof Category
   */
  static createStatsFromResponse(id: number, statsResp: CategoryBreakdownResponse): Partial<CategoryStats> {
    // Find the specified category in lookup
    if (statsResp.lookup.hasOwnProperty(String(id))) {
      try {
        var activeMonth = statsResp.actualSpecifiedMonth.debits.dateRange.startDate;      // Could be either debits or credits, doesn't matter
        var previousActiveMonth = statsResp.actualPreviousToSpecifiedMonth.debits.dateRange.startDate;      // Could be either debits or credits, doesn't matter
        var currentMonth = statsResp.projectedThisMonth.debits.dateRange.startDate;      // Could be either debits or credits, doesn't matter
      }
      catch(err) {
        var activeMonth = undefined as number;
        var previousActiveMonth = undefined as number;
        var currentMonth = undefined as number;
      }
      let stats = statsResp.lookup[String(id)];
      let currentMonthDeltaPercent, currentMonthProjectedDeltaPercent, previousMonthDeltaPercent;
      if (stats.actualSpecifiedMonth) {
        currentMonthDeltaPercent = stats.actualThisMonth 
          ? percentageDeltaBetween(stats.actualThisMonth.amount, stats.actualSpecifiedMonth.amount)
          : null;
        currentMonthProjectedDeltaPercent = stats.projectedThisMonth
          ? percentageDeltaBetween(stats.projectedThisMonth.amount, stats.actualSpecifiedMonth.amount)
          : null;
        previousMonthDeltaPercent = stats.actualPreviousToSpecifiedMonth
          ? percentageDeltaBetween(stats.actualSpecifiedMonth.amount, stats.actualPreviousToSpecifiedMonth.amount)
          : null;
      }
      else {
        currentMonthDeltaPercent = null;
        previousMonthDeltaPercent = null;
      }
      return { 
        isCurrentMonth: moment().isSame(new Date(activeMonth), 'month'),
        activeMonthName: moment(activeMonth).format('MMMM YYYY'),
        previousMonthName: moment(previousActiveMonth).format('MMMM YYYY'),
        currentMonthName: moment(currentMonth).format('MMMM YYYY'),
        activeMonthSpend: stats.actualSpecifiedMonth ? stats.actualSpecifiedMonth.amount : 0,
        previousMonthSpend: stats.actualPreviousToSpecifiedMonth ? stats.actualPreviousToSpecifiedMonth.amount : 0,
        currentMonthSpend: stats.actualThisMonth ? stats.actualThisMonth.amount : 0,
        projectedCurrentMonthSpend: stats.projectedThisMonth ? stats.projectedThisMonth.amount : 0,
        currentMonthDeltaPercent: Math.abs(currentMonthDeltaPercent),
        currentMonthDeltaTrend: Math.sign(currentMonthDeltaPercent),
        currentMonthProjectedDeltaPercent: Math.abs(currentMonthProjectedDeltaPercent),
        currentMonthProjectedDeltaTrend: Math.sign(currentMonthProjectedDeltaPercent),
        previousMonthDeltaPercent: Math.abs(previousMonthDeltaPercent),
        previousMonthDeltaTrend: Math.sign(previousMonthDeltaPercent),
        totalLifetimeSpend: 2000 + Math.floor(Math.random() * 6000)
      } as CategoryStats;
    }
    return undefined;
    function percentageDeltaBetween(current: number, previous: number): number {
      return Math.round((current - previous) / previous * 100);
    }
    // return Promise.resolve(<CategoryStats>{ 
    //   isCurrentMonth: false,
    //   currentMonthName: 'this month',
    //   previousMonthName: 'last month',
    //   targetMonthName: 'July 2017',
    //   previousMonthDeltaPercent: Math.floor(Math.random() * 14),
    //   previousMonthDeltaTrend: Math.random() >= 0.5 ? 1 : -1,
    //   currentMonthDeltaPercent:  Math.floor(Math.random() * 11),
    //   currentMonthDeltaTrend: Math.random() >= 0.5 ? 1 : -1,
    //   totalLifetimeSpend: 2000 + Math.floor(Math.random() * 6000)
    // });

  }
}