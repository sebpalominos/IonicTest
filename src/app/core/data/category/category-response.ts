import { CategoryShape } from '../../../screens/categories/shared/category.model';
import { CategoryTotalShape } from '../../../screens/categories/shared/category-total.model';
import { Currency } from '../../data/shared/constant-types';
import { PerspectiveResponse } from '../../data/shared/perspective-response';

/** Appears when categories are explicitly requested */
export interface CategoryListResponse {
  items: Array<{
    level: number;
    custom: boolean;
    category: CategoryResponse;
  }>;
}
/** Appears inline in transaction responses  */
export interface TransactionCategoryListResponse {
  items: Array<{ status: string; category: CategoryResponse; }>;
  primaryCategory?: CategoryResponse;
}
export interface CategoryResponse {
  type: string;   // "basicCategory";
  id: number;   //55;
  parentId?: number;      // Invented by me, but is hackjob filled in category.service
  description: string;    // "Concert",
  flow: string;       //"DEBIT",
  categoryType: string;     //"DISCRETIONARY",
  cashSource: boolean;    // false,
  custom: boolean;      //false,
  level: number;      //2
}
export interface CategoryBreakdownDetail {
  transactionCount: number;
  value: Currency;
  category: string;      // Category name
  categoryId: number;
}
export interface CategoryBreakdownMonthResponse {
  debits: {
    categories: CategoryBreakdownDetail[];
    perspective: any;      // For Category Transactions lookup
    dateRange: {
      startDate: number;
      endDate: number;
    };
  };
  credits: {
    categories: CategoryBreakdownDetail[];
    perspective: any;      // For Category Transactions lookup
    dateRange: {
      startDate: number;
      endDate: number;
    };
  }
}
export interface CategoryBreakdownResponse {
  actualSpecifiedMonth: CategoryBreakdownMonthResponse;
  actualPreviousToSpecifiedMonth: CategoryBreakdownMonthResponse;
  projectedThisMonth: CategoryBreakdownMonthResponse;
  actualThisMonth: CategoryBreakdownMonthResponse;
  lookup: {
    [ index: string ]: {
      actualThisMonth: Currency;
      projectedThisMonth: Currency;
      actualSpecifiedMonth: Currency;
      actualPreviousToSpecifiedMonth: Currency;
    }
  };

}