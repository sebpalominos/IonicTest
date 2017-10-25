import { Injectable } from '@angular/core';
import { InsightsHttpService } from '../insights-http/insights-http.service';
import { Storage } from '@ionic/storage';
import * as moment from 'moment';

import { CategoryResponse, CategoryListResponse, CategoryBreakdownResponse } from '../../data/category/category-response';
import { StateChangeResponse } from '../../data/shared/state-change-response';
import { TransactionKpiListResponse } from '../../data/transaction/transaction-response';
import { Category } from '../../../screens/categories/shared/category.model';
import { CategoryParentMap, CategoryBreakdownInfo, CategoryStats } from '../../../screens/categories/shared/category-data-maps';
import { TransactionMetric, TransactionMetricShape } from '../../../screens/transactions/shared/transaction-metric.model';

@Injectable()
export class CategoryService {
  private availableCategories: Category[];    // Session-based caching
  private hierarchicalCategories: Array<Category[]> = [];
  private categoryBreakdownResponses: { [ monthDiff: string ]: CategoryBreakdownResponse } = {};    // Session-based caching
  constructor(
    protected http: InsightsHttpService,
    protected storage: Storage
  ) {}
  /**
   * Gets whatever categories are available, in a big flat array
   * @returns {Promise<CategoryParentMap[]>} 
   * @memberOf CategoryService
   */
  getAvailableCategories(): Promise<Category[]> {
    if (this.availableCategories) {
      return Promise.resolve(this.availableCategories);
    }
    let endpointDebit = ['categories', 'search', 'DEBIT'];
    let endpointCredit = ['categories', 'search', 'CREDIT'];
    let futures = [
      this.http.get(endpointDebit).toPromise().then(resp => resp.json()),
      this.http.get(endpointCredit).toPromise().then(resp => resp.json())
    ];
    return Promise.all(futures).then((ctyLists: CategoryListResponse[]) => {
      // HACK: Preparse all Level 2's and assign the forerunning Level 1's ID
      let mostRecentTopLevelId: number = 0;
      ctyLists.forEach((ctyList) => {
        ctyList.items.forEach((ctyEntry, index, arr) => {
          if (ctyEntry.level === 1) {
            mostRecentTopLevelId = ctyEntry.category.id;
          }
          if (ctyEntry.level === 2) {
            arr[index].category.parentId = mostRecentTopLevelId;
          }
        });
      });
      // ENDHACK.
      let allCategories: Array<Category[]> = ctyLists.map(ctyList => Category.createCategoryListFromResponse(ctyList));
      let flattenedCategories: Category[] = Array.prototype.concat([], ...allCategories);
      // Map parents into children
      flattenedCategories.forEach(thisCategory => {
        if (thisCategory.parentId != null) {
          thisCategory.parent = flattenedCategories.find(cty => cty.id === thisCategory.parentId);
        }
      });
      this.availableCategories = flattenedCategories;
      return flattenedCategories;
    });
  }
  /**
   * Retrieve all categories for a specific level. 
   * @param {number} [level=1] - The hierarchy level, default to 1 for top level categories
   * @returns {Promise<CategoryParentMap[]>} 
   * @memberOf CategoryService
   */
  getHierarchicalCategories(level: number = 1): Promise<Category[]> {
    if (this.hierarchicalCategories && this.hierarchicalCategories[level]) {
      return Promise.resolve(this.hierarchicalCategories[level]);
    }
    else {
      // Get top level categories (i.e. Level 1)
      let endpoint = ['categories', 'find-in-hierarchy', `${level}`];
      return this.http.get(endpoint).toPromise().then(resp => {
        let body: CategoryListResponse = resp.json();
        // return Category.createCategoryListFromResponse(ctyList);
        let retrievedCategories = body.items.map(parentCty => Category.createCategoryFromResponse(parentCty.category));
        this.hierarchicalCategories[level] = retrievedCategories;
        return retrievedCategories;
      });
    }
  }
  /**
   * Retrieve child categories for a list of parent categories.
   * @param {Category[]} parentCategories - List of parent categories, each will be mapped with child categories if any 
   * @returns 
   * @memberOf CategoryService
   */
  getHierarchicalSubcategories(parentCategories: Category[], shouldProgressivelyLoad: boolean = false): Promise<CategoryParentMap[]> {
    let futures: Promise<CategoryParentMap>[] = [];
    let requestsPerInterval = 5;
    let intervalMillis = 100;
    let parentChildrenMaps = parentCategories.map(parentCty => {
      return <CategoryParentMap> {
        parent: parentCty,
        children: []
      };
    });
    // Map a delayed promise to each parent entry, staggering the API calls per the requestsPerInterval and intervalMillis variables.
    parentChildrenMaps.forEach((pair, index, arr) => {
      let parentCategoryId = pair.parent.id;
      let thisInterval = intervalMillis * Math.floor(index/requestsPerInterval);
      let endpoint = ['categories', `${parentCategoryId}`, 'children'];
      futures.push(new Promise((resolve, reject) => {
        setTimeout(() => {
          this.http.get(endpoint).toPromise().then(resp => {
            let childCtyListResponse: CategoryListResponse = resp.json();
            let childCtyList: Category[] = Category.createCategoryListFromResponse(childCtyListResponse, 2);
            if (shouldProgressivelyLoad) {
              // In this case, mutate the original array as well.
              arr[index].children = childCtyList;
            }
            pair.children = childCtyList;
            resolve(pair);
          }).catch(err => {
            reject(err);
          });
        }, thisInterval);
      }));
    });
    // Either return the map reference straight away - in a progressive loading fashion (i.e. as the promise comes in, assign it)
    // Or buffer up and wait till all children loaded - this technique is better if you have to do something with all the results at once
    return shouldProgressivelyLoad ? Promise.resolve(parentChildrenMaps) : Promise.all(futures);
  }
  /**
   * Get a summary of parent (Level 1) categories. 
   * @desc For example, used in a spending breakdown
   * @returns {CategoryBreakdownInfo[]} 
   * @memberof CategoryService
   */
  getTopLevelCategoryListSummary(monthOf: Date = new Date()): Promise<CategoryBreakdownInfo[]> {
    // Simultaneously get categories and breakdowns
    let monthDiff = moment(monthOf).diff(new Date(), 'months');
    // let endpoint = [ 'dashboard', 'breakdown', 'parents', String(monthDiff) ];
    return Promise.all([ 
      this.getCategoryBreakdown(monthDiff),
      this.getHierarchicalCategories(1)
    ]).then(results => {
      let breakdowns = results[0];
      let categories = results[1];
      let specifiedMonth = breakdowns.actualSpecifiedMonth;
      let breakdownInfos = [ 
        specifiedMonth.credits.categories, 
        specifiedMonth.debits.categories.reverse() 
      ].map((categoryTypeDetails, index) => {
        return categoryTypeDetails.map(breakdownItem => {
          let transactionLookupPerspective = index <= 0      // Credits is #0, Debits is #1
            ? specifiedMonth.credits.perspective
            : specifiedMonth.debits.perspective;
          return {
            isCredit: index <= 0,      // Credits is #0, Debits is #1
            category: categories.find(cty => cty.id === breakdownItem.categoryId),
            count: breakdownItem.transactionCount,
            perspective: transactionLookupPerspective,
            totalValue: breakdownItem.value.amount,
          } as CategoryBreakdownInfo;
        });
      });
      return Array.prototype.concat.apply([], breakdownInfos);
    });
  }
  /**
   * Returns data on a single category
   * @todo Will the API implement a single category lookup?
   * @param {number} categoryId 
   * @returns {Promise<Category>} 
   * @memberof CategoryService
   */
  getCategory(categoryId: number): Promise<Category> {
    // Tactical solution only: Fetch all then filter
    return this.getAvailableCategories().then(categories => categories.find(cty => cty.id === categoryId));
  }
  /**
   * Get preview statistics for a given category 
   * @param {number} categoryId 
   * @param {Date} month 
   * @returns {Promise<CategoryStats>} 
   * @memberof CategoryService
   */
  getCategoryStats(categoryId: number, monthOf: Date): Promise<Partial<CategoryStats>> {
    let monthDiff = moment(monthOf).diff(new Date(), 'months');
    return this.getCategoryBreakdown(monthDiff).then(breakdownResponse => {
      return Category.createStatsFromResponse(categoryId, breakdownResponse);
    });
  } 
  /**
   * Get information on the completion rate of categorisation
   * @desc Use the 'KPIs' endpoint to get stats on what's already categorised
   * @param {number} [categoryId] 
   * @returns {Promise<TransactionMetric>} 
   * 
   * @memberof TransactionService
   */
  getCategorisationMetric(categoryId: number): Promise<TransactionMetric> {
    let endpoint = ['transactions', 'kpis'];
    let payload = {
      CATEGORY: [{ id: categoryId }]
    };
    return this.http.post(endpoint, payload).toPromise().then(resp => {
      let body: TransactionKpiListResponse = resp.json();
      let list = TransactionMetric.createTransactionMetricListFromResponse(body);
      return list.find(metric => metric.identifier === 'CATEGORISATION_RATE_IN_PERSPECTIVE');
    });
  }
  /**
   * Get a list of categories for a monthly breakdown. 
   * @desc Use the response's perspective, for future calls to the transaction endpoint
   * @protected
   * @param {number} monthDiff 
   * @returns {Promise<CategoryBreakdownResponse>} 
   * @memberof CategoryService
   */
  protected getCategoryBreakdown(monthDiff: number): Promise<CategoryBreakdownResponse> {
    if (this.categoryBreakdownResponses.hasOwnProperty(String(monthDiff))) {
      return Promise.resolve(this.categoryBreakdownResponses[String(monthDiff)]);
    }
    else {
      let endpoint = [ 'dashboard', 'breakdown', 'parents', String(monthDiff) ];
      return this.http.get(endpoint).toPromise().then(resp => {
        let breakdownResponse: CategoryBreakdownResponse = resp.json();
        this.categoryBreakdownResponses[String(monthDiff)] = breakdownResponse;
        return breakdownResponse;
      });
    }
  }
}