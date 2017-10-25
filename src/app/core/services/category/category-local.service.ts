import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import * as moment from 'moment';

import { Category } from '../../../screens/categories/shared/category.model';

const recentlyUsedCategoriesKey = 'transactions.recentlyUsedCategories';

@Injectable()
export class CategoryLocalService {
  constructor(
    public storage: Storage
  ) {}
  /**
   * Get the stack list of recently used category IDs
   * @returns {Promise<number[]>} 
   * @memberof CategoryLocalService
   */
  getRecentlyUsedCategoryIds(limit: number = 10): Promise<number[]> {
    return this.storage.get(recentlyUsedCategoriesKey).then(recently => {
      return (recently as number[] || []).reverse().slice(0, limit);
    });
  }
  /**
   * Pushes a new entry onto the stack of recently used Category IDs
   * @param {number} categoryId 
   * @returns {Promise<boolean>} 
   * @memberof CategoryLocalService
   */
  addRecentlyUsedCategoryId(categoryId: number, dedupe: boolean = true): Promise<boolean> {
    return this.getRecentlyUsedCategoryIds().then(recently => {
      if (dedupe) {
        // Loop and delete any existing instances of that category ID
        while (recently.indexOf(categoryId) >= 0) {
          recently = recently.splice(recently.indexOf(categoryId), 1);
        }
      }
      // Push value to the bottom of the list
      if (dedupe || recently.indexOf(categoryId) < 0) {
        recently.push(categoryId);
      }
      return (this.storage.set(recentlyUsedCategoriesKey, recently) as Promise<number>).then(() => true);
    });
  }
  /**
   * Clear the list of recently used Category IDs
   * @returns {Promise<boolean>} 
   * @memberof CategoryLocalService
   */
  clearRecentlyUsedCategoryIds(): Promise<boolean> {
    return this.storage.remove(recentlyUsedCategoriesKey).then(() => true);
  }
}