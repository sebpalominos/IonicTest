import { Component, ViewChild, SimpleChanges } from '@angular/core';
import { NavController, ActionSheetController, PopoverController, Content } from 'ionic-angular';
import * as moment from 'moment';

import { Category, CategoryShape } from './shared/category.model';
import { CategoryComponent } from './category/category.component';
import { CategoryPopupComponent } from './shared/category-popup/category-popup.component';
import { CategoryListDefaults } from './shared/category-defaults';
import { CategoryParentMap, ColoredCategory, CategoryStats, CategoryBreakdownInfo } from './shared/category-data-maps';
import { SegmentButtonType } from '../misc/types/segment-button-type';
// import { TransactionService } from '../../core/services/transaction/transaction.service';
import { CategoryService } from '../../core/services/category/category.service';
import { VersionService } from '../../core/services/version/version.service';

@Component({
  selector: 'category-list',
  templateUrl: 'categories.component.html',
  host: {
    class: 'category-list'
  }
})
export class CategoriesComponent {
  @ViewChild(Content) content: Content;
  coloredCategories: ColoredCategory[];
  categoryGroups: CategoryParentMap[];
  segmentButtons: SegmentButtonType[];
  selectedFilter: CategoryListDefaults.FilterTransactionType;
  filterDisplayTitle: string;
  activeMonth: Date;
  activeMonthTitle: string;
  numTransactionsPluralMapping: any;
  monthsLoaded: string[] = [];      // A list of already loaded '201704, 201703', etc, which helps decide if to implement a spam filter
  monthLoadDebouncer: number;    // ID handle for setTimeout
  screens = { 
    category: CategoryComponent,
    categoryPopover: CategoryPopupComponent
  };
  showCategoriesLoadingError: boolean = false;
  showInitialLoading: boolean;
  showCategoriesLoading: boolean;
  hideNextMonth: boolean;
  constructor(
    protected navCtrl: NavController, 
    protected popoverCtrl: PopoverController, 
    protected actionSheetCtrl: ActionSheetController,
    protected categoryService: CategoryService,
    protected versionService: VersionService
  ) {}
  ionViewWillLoad() {
    // Assign labels and stuff
    this.segmentButtons = CategoryListDefaults.segmentButtons;
    // Determine which timeview segment is active
    // Fetch a list of all known categories.
    
    // TODO: Read from history as to which timeview segment was active
    this.selectedFilter = CategoryListDefaults.FilterTransactionType.All;
    this.filterDisplayTitle = 'Income and expenses'
    this.showInitialLoading = true;
    this.setCurrentMonth();
    this.loadCategories();
  }
  ionViewDidLoad() {
    this.activeMonthTitle = moment().format('MMM YYYY');
    this.hideNextMonth = true;
    this.refreshLabels();
  }
  ionViewCanEnter(): boolean {
   return this.versionService.isCapabilityEnabled('CAP_BREAKDOWN');
  }
  changeCategoryListView(segmentButton: SegmentButtonType) {
    this.selectedFilter = segmentButton.value as CategoryListDefaults.FilterTransactionType;
    if (this.coloredCategories) {
      this.coloredCategories.forEach(cc => {
        switch (this.selectedFilter) {
          case CategoryListDefaults.FilterTransactionType.Expenses:
            this.filterDisplayTitle = 'Expenses only';
            cc.isHidden = cc.isCredit === true;
            break;
          case CategoryListDefaults.FilterTransactionType.Income:
            this.filterDisplayTitle = 'Income only';
            cc.isHidden = cc.isCredit === false;
            break;
          case CategoryListDefaults.FilterTransactionType.All:
          default:
            this.filterDisplayTitle = 'Income and expenses';
            cc.isHidden = false;
            break;
        }
      });
    }
  }
  loadCategories(isDebounced: boolean = false, refresher?) {
    if (isDebounced) {
      clearTimeout(this.monthLoadDebouncer);
      this.showCategoriesLoading = true;
      this.coloredCategories = [];
      this.monthLoadDebouncer = window.setTimeout(() => {
        this.loadCategories(false, refresher);
      }, 400);
    }
    else {
      let loadedMonth = new Date(this.activeMonth);    // Local copy
      this.showCategoriesLoading = true;      
      this.coloredCategories = [];
      this.categoryService.getTopLevelCategoryListSummary(loadedMonth).then(breakdownItems => {
        this.showInitialLoading = false;
        this.showCategoriesLoading = false;
        this.coloredCategories = breakdownItems;
        this.coloredCategories.forEach(colored => {
          this.categoryService.getCategoryStats(colored.category.id, this.activeMonth).then(stats => {
            colored.stats = stats as CategoryStats;
          });
        });
        this.monthsLoaded.push(moment(loadedMonth).format('YYYYMM'));
        refresher && refresher.complete();
        setTimeout(() => this.content.resize(), 0);
      }).catch(err => {
        console.error(err);
        this.showCategoriesLoading = false;
        this.showInitialLoading = false;
        this.showCategoriesLoadingError = true;
        refresher && refresher.complete();
        setTimeout(() => this.content.resize(), 0);
      });
    }
  }
  displayCategoryPopup(category: Category, stats: CategoryStats) {
    // let title: string = category.longName();
    // let actionSheet = this.actionSheetCtrl.create({ title });
    // actionSheet.addButton({ text: 'Cancel', role: 'cancel' });
    // actionSheet.present();
    let params = { category, stats };
    let opts = { cssClass: 'category-modal-popover' };
    let popover = this.popoverCtrl.create(this.screens['categoryPopover'], params, opts);
    popover.onDidDismiss(shouldNavigate => {
      if (shouldNavigate) {
        this.navCtrl.push(this.screens['category'], { category, filterSpecificMonth: this.activeMonth });
      }
    });
    popover.present();
  }
  categorySelected(categoryInfo: CategoryBreakdownInfo) {
    // this.navCtrl.push(this.screens['category'], { categoryInfo, filterSpecificMonth: this.activeMonth });
    this.navCtrl.push(this.screens['category'], { categoryInfo });
  }
  setNextMonth(monthDiff: number = 1) {
    this.setMonthDiff(1);
  }
  setPrevMonth() {
    this.setMonthDiff(-1);
  }
  private setCurrentMonth() {
    this.activeMonth = moment().startOf('month').toDate();
    this.refreshLabels();
    this.loadCategories();
  }
  private setMonthDiff(monthDiff: number) {
    // Spam filter (people mashing the back button) 
    // Check the monthsLoaded list, for a key which indicates if already loaded
    // Otherwise, debounce.
    this.activeMonth = moment(this.activeMonth).add(monthDiff, 'month').toDate();
    this.refreshLabels();
    let needsDebounce = this.monthsLoaded.indexOf(moment(this.activeMonth).format('YYYYMM')) < 0;
    this.loadCategories(needsDebounce);
  }
  showMonthNavOptions() {
    let buttonCancel = { text: 'Cancel', role: 'cancel' };
    let buttonBackToNow = { text: 'Back to current month', handler: () => {
      this.setCurrentMonth();
    } };
    let actionSheet = this.actionSheetCtrl.create({
      buttons: [ buttonBackToNow, buttonCancel ]
    });
    actionSheet.present();
  }
  showFilterOptions() {
    // Do an actionsheet 
    let actionSheet = this.actionSheetCtrl.create({
      title: 'Sort/Filter options',
      buttons: [{
        text: 'Filter by date',
        handler: () => {}
      }, {
        text: 'Sort amount highest first',
        handler: () => {}
      }, {
        text: 'Sort amount lowest first',
        handler: () => {}
      }, {
        text: 'Cancel',
        role: 'cancel'
      }]
    });
    actionSheet.present();
  }
  private refreshLabels() {
    this.activeMonthTitle = moment(this.activeMonth).format('MMM YYYY');
    this.hideNextMonth = moment(this.activeMonth).startOf('month').isSameOrAfter(moment().startOf('month'));
    this.numTransactionsPluralMapping = {
      '=0': `No transactions in ${this.activeMonthTitle}`,
      '=1': `1 transaction in ${this.activeMonthTitle}`,
      'other': `# transactions in ${this.activeMonthTitle}`
    };
  }
}