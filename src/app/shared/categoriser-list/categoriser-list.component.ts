import { Component, Input, Output, EventEmitter, SimpleChanges, ViewChild } from '@angular/core';
import { NavParams, NavController, Searchbar } from "ionic-angular";
import { Keyboard } from '@ionic-native/keyboard';

import { TransactionShape, Transaction } from '../../screens/transactions/shared/transaction.model';
import { Category, CategoryShape } from '../../screens/categories/shared/category.model';
import { SearchListCategory } from '../../screens/categories/shared/category-data-maps';
import { CategoryService } from '../../core/services/category/category.service';
import { CategoryLocalService } from '../../core/services/category/category-local.service';
import { CategoryResponse, CategoryListResponse } from '../../core/services/category/category-response';

const numShowRecent = 3;
const numLoadRecent = 20;

@Component({
  selector: 'categoriser-list',
  templateUrl: 'categoriser-list.component.html',
  host: {
    class: 'categoriser-list'
  }
})
export class CategoriserListComponent {
  @ViewChild(Searchbar) searchbar: Searchbar;
  recentCategories: SearchListCategory[];
  availableCategories: SearchListCategory[];
  subcategories: SearchListCategory[];
  sortDirection: number;    // 1 (asc) or -1 (desc) 
  @Input() transaction: Transaction;
  @Output() categoriesLoaded = new EventEmitter();
  @Output() categoryUpdated = new EventEmitter();
  @Output() categorySelected = new EventEmitter();
  isSearchActive: boolean;
  isShowMoreRecent: boolean;
  showLoadingCategories: boolean;
  searchResultsWrapperStyles: any;
  constructor(
    private keyboard: Keyboard,
    protected navCtrl: NavController,
    protected categoryService: CategoryService,
    protected categoryLocalService: CategoryLocalService
  ) {}
  ngOnInit() {
    this.setupKeyboard();
    this.loadCategories().then(() => {
      this.toggleShowMoreRecent(false);    // Force isShowMoreRecent to false
    });
    setTimeout(() => {
      this.searchbar.value = '';
      this.searchbar.setFocus();
    }, 1200);
  }
  ngOnDestroy() {
    // Todo: how to force blur the searchbar?
    this.keyboard.close();
  }
  filterItems(event: any) {
    let filterKeyword: string = event.target.value;
    if (!filterKeyword || filterKeyword.trim() === '') {
      this.clearFilter();
    }
    else {
      this.isSearchActive = true;
      let determineIfHidden: (searchListCategory: SearchListCategory) => boolean = searchListCategory => {
        if (filterKeyword === '' || filterKeyword === null || filterKeyword === undefined) return false;
        let categoryNameLower = searchListCategory.category.name.toLowerCase();
        return categoryNameLower.includes(filterKeyword.toLowerCase()) === false;
      };
      this.subcategories.forEach(searchListCategory => {
        searchListCategory.isHidden = determineIfHidden(searchListCategory);
      });
    }
  }
  clearFilter() {
    this.isSearchActive = false;
    this.subcategories.forEach(searchListCategory => {
      searchListCategory.isHidden = false;
    });
  }
  submit(category: Category) {
    this.categorySelected.emit(category);
  }
  private hasShowMoreRecent(): boolean {
    return this.recentCategories && this.recentCategories.length > numShowRecent;
  }
  private toggleShowMoreRecent(overrideShowMoreRecent?: boolean) {
    if (this.hasShowMoreRecent()) {
      this.isShowMoreRecent = overrideShowMoreRecent != null ? overrideShowMoreRecent : !this.isShowMoreRecent;
      let counter = 0;   // Do not trust the recentCategories array index!
      this.recentCategories.forEach(recent => {
        counter += 1;
        recent.isHidden = !(this.isShowMoreRecent || (counter <= numShowRecent));
      });
    }
  }
  private toggleSortDirection() {
    this.sortDirection = this.sortDirection * -1;
    this.sortSubcategories();
  }
  /**
   * Sort the subcategories list
   * @private
   * @param {number} direction 1 for asc, -1 for desc
   * @memberof CategoryListComponent
   */
  private sortSubcategories(overrideSortDirection?: number) {
    let sortDir = overrideSortDirection || this.sortDirection;
    let sign = Math.sign(sortDir);
    if (sign !== 0) {
      try {
        this.subcategories = this.subcategories.sort((a, b) => {
          if (a.category.name.toLocaleLowerCase() > b.category.name.toLocaleLowerCase()) {
            return 1 * sign;
          }
          if (a.category.name.toLocaleLowerCase() < b.category.name.toLocaleLowerCase()) {
            return -1 * sign;
          }
          return 0;
        });
      }
      catch (err) {
        console.error('Failed to sort subcategory list in Categoriser List Component');
        console.error(err);
      }
    }
    else {
      console.warn('Sort subcategories received a direction of 0; no sorting will take place.');
    }
  }
  private loadCategories(): Promise<boolean> {
    this.recentCategories = [];
    this.availableCategories = [];
    this.subcategories = [];
    this.sortDirection = 1;
    this.showLoadingCategories = true;
    return this.categoryService.getAvailableCategories().then((categories: Category[]) => {
      this.availableCategories = categories.map(category => ({ category }));
      this.subcategories = categories.map(category => ({ category })).filter(cty => cty.category.parentId != null);
      this.sortSubcategories();
      return this.categoryLocalService.getRecentlyUsedCategoryIds(numLoadRecent);
    }).then(recentCategoryIds => {
      this.recentCategories = recentCategoryIds.map(recent => {
        let found = this.availableCategories.find(av => av.category.id === recent);
        return found ? { category: found.category } : null;
      }).filter(recent => recent != null);
    }).then(() => {
      this.categoriesLoaded.emit(true);
      this.showLoadingCategories = false;
      return true;
    }).catch(err => {
      console.error('Could not load recent/available categories into Categoriser List Component');
      this.showLoadingCategories = false;      
      this.categoriesLoaded.emit(false);
      return false;
    });
  }
  private setupKeyboard() {
    this.keyboard.hideKeyboardAccessoryBar(true);
    this.keyboard.onKeyboardShow().subscribe(event => {
      console.log(event);
      this.searchResultsWrapperStyles = { 'margin-bottom': `${event.keyboardHeight}px` };
    });
    this.keyboard.onKeyboardHide().subscribe(() => {
      this.searchResultsWrapperStyles = {};
    });
  }
}