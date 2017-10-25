import { Category, CategoryShape } from '../../../screens/categories/shared/category.model';
import { CategoryTotalShape } from '../../../screens/categories/shared/category-total.model';
import { TimeScaleType } from '../../../core/data/shared/constant-types';
// import { CATEGORY_GOAL_HDP } from '../goal/mock-goal-summary';

let parentLivingExpenses = <CategoryShape>{ id: 7, name: 'Living' };
let parentFixedBills = <CategoryShape>{ id: 3, name: 'Fixed bills' };
let parentBanking = <CategoryShape>{ id: 6, name: 'Banking' };
let parentHousehold = <CategoryShape>{ id: 8, name: 'Household' };
let parentEntertainment = <CategoryShape>{ id: 5, name: 'Entertainment' };

export const MOCK_PARENT_CATEGORIES: CategoryShape[] = [ parentLivingExpenses, parentFixedBills, parentBanking, parentHousehold, parentEntertainment ];

export const MOCK_CATEGORIES: CategoryShape[] = [
  { id: 20, name: 'Rent', description: 'Payments made for rent', parentId: parentFixedBills.id },
  { id: 22, name: 'School and education', description: 'School fees, uniforms, materials', parentId: parentFixedBills.id },
  { id: 23, name: 'Vehicle maintenance', description: 'Personal vehicle fuel, mechanic and repair costs', parentId: parentFixedBills.id },
  { id: 56, name: 'Fast Food', description: 'Food for thought', parentId: parentEntertainment.id },
  { id: 47, name: 'Transport', description: 'Gotta get moving', parentId: parentLivingExpenses.id },
  { id: 92, name: 'Groceries', description: 'Supermarkets etc', parentId: parentLivingExpenses.id },
  { id: 40, name: 'Outgoing bank transfers', parentId: parentBanking.id },
  { id: 38, name: 'Interest', parentId: parentBanking.id },
  { id: 91, name: 'Mortgage repayment', credit: true, description: 'Regular and additional payments towards a mortgage/home loan', parentId: parentHousehold.id },
  { id: 96, name: 'Home renovation', description: 'Renovation work on a home or property', parentId: parentHousehold.id },
  { id: 98, name: 'Rent', description: 'Payments made for rental residency', parentId: parentHousehold.id },
];

export const MOCK_CATEGORY_TOTALS_WEEKLY: CategoryTotalShape[] = [];
// export const MOCK_CATEGORY_TOTALS_WEEKLY: ICategoryTotal[] = [
//   { categoryId: 20, totalSpend: 700, timeScale: TimeScaleType.Weekly, goalActivity: CATEGORY_GOAL_HDP[20] },
//   { categoryId: 22, totalSpend: 0, timeScale: TimeScaleType.Weekly, goalActivity: CATEGORY_GOAL_HDP[22] },
//   { categoryId: 23, totalSpend: 0, timeScale: TimeScaleType.Weekly, goalActivity: CATEGORY_GOAL_HDP[23] },
//   { categoryId: 56, totalSpend: 42.00, timeScale: TimeScaleType.Weekly },
//   { categoryId: 47, totalSpend: 15.60, timeScale: TimeScaleType.Weekly, goalActivity: CATEGORY_GOAL_HDP[47] },
//   { categoryId: 92, totalSpend: 80.96, timeScale: TimeScaleType.Weekly },
//   { categoryId: 40, totalSpend: 0, timeScale: TimeScaleType.Weekly }
// ];

export const MOCK_CATEGORY_TOTALS_MONTHTODATE: CategoryTotalShape[] = [];
// export const MOCK_CATEGORY_TOTALS_MONTHTODATE: ICategoryTotal[] = [
//   { categoryId: 20, totalSpend: 2600, timeScale: TimeScaleType.MonthToDate, goalActivity: CATEGORY_GOAL_HDP[200] },
//   { categoryId: 22, totalSpend: 230, timeScale: TimeScaleType.MonthToDate, goalActivity: CATEGORY_GOAL_HDP[220] },
//   { categoryId: 23, totalSpend: 423.10, timeScale: TimeScaleType.MonthToDate, goalActivity: CATEGORY_GOAL_HDP[230] },
//   { categoryId: 56, totalSpend: 198.10, timeScale: TimeScaleType.MonthToDate },
//   { categoryId: 47, totalSpend: 60.50, timeScale: TimeScaleType.MonthToDate, goalActivity: CATEGORY_GOAL_HDP[470] },
//   { categoryId: 92, totalSpend: 380.00, timeScale: TimeScaleType.MonthToDate },
//   { categoryId: 40, totalSpend: 45.00, timeScale: TimeScaleType.MonthToDate }
// ];

export const MOCK_CATEGORY_TOTALS_YEARTODATE: CategoryTotalShape[] = [];
// export const MOCK_CATEGORY_TOTALS_YEARTODATE: ICategoryTotal[] = [
//   { categoryId: 20, totalSpend: 4300, timeScale: TimeScaleType.YearToDate, goalActivity: CATEGORY_GOAL_HDP[2000] },
//   { categoryId: 22, totalSpend: 240, timeScale: TimeScaleType.YearToDate, goalActivity: CATEGORY_GOAL_HDP[2200] },
//   { categoryId: 23, totalSpend: 960.10, timeScale: TimeScaleType.YearToDate, goalActivity: CATEGORY_GOAL_HDP[2300] },
//   { categoryId: 56, totalSpend: 210.10, timeScale: TimeScaleType.YearToDate },
//   { categoryId: 47, totalSpend: 100.00, timeScale: TimeScaleType.YearToDate, goalActivity: CATEGORY_GOAL_HDP[4700] },
//   { categoryId: 92, totalSpend: 392.20, timeScale: TimeScaleType.YearToDate },
//   { categoryId: 40, totalSpend: 112.12, timeScale: TimeScaleType.YearToDate }
// ];