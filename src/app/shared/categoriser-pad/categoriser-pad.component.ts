import { Component, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { NavParams, NavController } from "ionic-angular";

import { TransactionShape, Transaction } from '../../screens/transactions/shared/transaction.model';
import { CategoryShape, Category } from '../../screens/categories/shared/category.model';
import { CategoryParentMap } from '../../screens/categories/shared/category-data-maps';
import { CategoryService } from '../../core/services/category/category.service';
import { CategoryResponse, CategoryListResponse } from '../../core/services/category/category-response';

type CategoryPadItem = {
  id: number;
  category: Category;
  subcategories?: Category[];
  categoryMap?: CategoryParentMap;
  icon: { set: string, name: string };
  // active?: boolean;
};

@Component({
  selector: 'categoriser-pad',
  templateUrl: 'categoriser-pad.component.html',
  host: {
    class: 'categoriser-pad'
  }
})
export class CategoriserPadComponent {
  activeTopCategory: Category;
  availableCategories: Category[];
  availableCategoriesInflow: Category[];
  availableCategoriesOutflow: Category[];
  categoryPadInflowItems: CategoryPadItem[];
  categoryPadOutflowItems: CategoryPadItem[];
  subcategories: Category[];
  existingCategoryIds: number[];
  selectedSubcategory: Category;
  displayCategoryType: 'income' | 'expenditure' = 'expenditure';
  @Input() transaction: Transaction;
  @Output() categoriesLoaded = new EventEmitter();
  @Output() categoryUpdated = new EventEmitter();
  @Output() categorySelected = new EventEmitter();
  showLoadingCategories: boolean;
  constructor(
    public navCtrl: NavController,
    public categoryService: CategoryService
  ) {}
  ngOnInit() {
    this.existingCategoryIds = [];
    this.categoryPadInflowItems = [];
    this.categoryPadOutflowItems = [];
    // Get all categories
    this.showLoadingCategories = true;
    this.categoryService.getAvailableCategories().then((categories: Category[]) => {
      this.showLoadingCategories = false;
      // Separate into inflows and outflows
      this.availableCategories = categories;
      this.availableCategoriesInflow = categories.filter(cty => cty.credit);
      this.availableCategoriesOutflow = categories.filter(cty => !cty.credit);
      // Assign main categories into the numpad
      let categoryPadMapper = (category: Category): CategoryPadItem => {
        let icon = category.icon();
        let subcategories = categories.filter(subcty => subcty.parentId === category.id);
        return <CategoryPadItem> { id: category.id, category, icon, subcategories };
      };
      this.categoryPadInflowItems = this.availableCategoriesInflow.filter(cty => cty.level === 1).map(cty => categoryPadMapper(cty));
      this.categoryPadOutflowItems = this.availableCategoriesOutflow.filter(cty => cty.level === 1).map(cty => categoryPadMapper(cty));
      this.categoriesLoaded.emit(true);
    }).catch(err => {
      this.showLoadingCategories = false;
      this.categoriesLoaded.emit(false);
    });
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes['transaction']){
      // Try to guess if parent component's transaction has a category
      if (this.transaction){
        if (this.transaction.category) {
          this.existingCategoryIds.push(this.transaction.category.id);
          if (this.transaction.category.parentId) this.existingCategoryIds.push(this.transaction.category.parentId);
        }
      }
    }
  }
  setTopCategory(item: CategoryPadItem) {
    this.activeTopCategory = item.category;
    this.subcategories = item.subcategories;
    // this.subcategories = this.availableCategories.filter(cty => cty.parentId === item.);
    // item.active = true;
  }
  isExistingCategory(category: Category|number): boolean {
    return !!this.existingCategoryIds.find(existing => {
      return existing === ( category instanceof Category ? category.id : category );
    });
  }
  clearActive() {
    this.activeTopCategory = null;
    this.selectedSubcategory = null;
  }
  updateSelected(subcategory: Category) {
    this.selectedSubcategory = subcategory;
    this.categoryUpdated.emit(subcategory);
  }
  submitSelected() {
    this.categorySelected.emit(this.selectedSubcategory);
  }
  /**
   * Alternative approach for retrieving categories, based on hierarchical interrogation
   * @deprecated
   * @private
   * @memberOf CategoryPadComponent
   */
  private retrieveCategoriesUsingHierarchy() {
    this.categoryService.getHierarchicalCategories().then(parentCategories => {
      return this.categoryService.getHierarchicalSubcategories(parentCategories, false);
    }).then((ctyMaps: CategoryParentMap[]) => {
      // Load all subcats into a single array  
      // this.subcategories = Array.prototype.concat.apply([], ctyMaps.filter(ctyMap => ctyMap.children));
      // Load subcategories straight into the pad type
      /*
      this.categoryPadItems = ctyMaps.map(ctyMap => ({
        id: ctyMap.parent.id,
        category: ctyMap.parent,
        icon: ctyMap.parent.icon(),
        subcategories: ctyMap.children
      }));
      */
      this.categoriesLoaded.emit(true);
    }).catch((error: any) => {
      console.error(error);
      this.categoriesLoaded.emit(false);
    });
  }
}