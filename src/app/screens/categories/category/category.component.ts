import { Component, ViewChild, ChangeDetectorRef } from '@angular/core';
import { NavParams, NavController, AlertController, ModalController, ActionSheetController, PopoverController, Content } from 'ionic-angular';
import * as moment from 'moment';

import { Category, CategoryShape } from '../shared/category.model';
import { CategoryBreakdownInfo } from '../shared/category-data-maps';
import { CategoryPopupComponent } from '../shared/category-popup/category-popup.component';
import { CategoryService } from '../../../core/services/category/category.service';
import { CreateGoalComponent } from '../../goal-centre/create-goal/create-goal.component';
import { GoalBase, GoalShape } from '../../goal-centre/shared/goal.model';
import { EditCategoryComponent } from '../edit-category/edit-category.component';
import { EditGoalComponent } from '../../goal-centre/edit-goal/edit-goal.component';
import { OpiconParams } from '../../../shared/opc-icon/opc-icon-type';
import { TimeScaleType } from '../../../core/data/shared/constant-types';
import { Transaction } from '../../transactions/shared/transaction.model';
import { TransactionComponent } from '../../transactions/transaction/transaction.component';
import { TransactionService } from '../../../core/services/transaction/transaction.service';

@Component({
  selector: 'scr-category',
  templateUrl: 'category.html',
  host: { class: 'category-single' }
})
export class CategoryComponent {
  @ViewChild(Content) content: Content;
  timeScaleType: any = TimeScaleType;
  category: CategoryShape;
  categoryGoalPercentage: number;
  categoryIcon: OpiconParams;
  transactionLookupPerspective: any;
  transactions: Transaction[];
  filterName: string;
  filterSpecificMonth: Date;
  showNavbar: boolean = true;
  screens = { 
    createGoal: CreateGoalComponent,
    editCategory: EditCategoryComponent,
    editGoal: EditGoalComponent,
    transaction: TransactionComponent,
    categoryPopover: CategoryPopupComponent
  };
  showLoadingTransactions: boolean;
  isFilterable: boolean;
  constructor(
    protected ref: ChangeDetectorRef,
    protected params: NavParams, 
    protected navCtrl: NavController, 
    protected alertCtrl: AlertController, 
    protected modalCtrl: ModalController, 
    protected actionSheetCtrl: ActionSheetController, 
    protected popoverCtrl: PopoverController,
    protected categoryService: CategoryService, 
    protected transactionService: TransactionService 
  ) {}
  ionViewWillLoad() {
    // Get the category object
    this.retrieveCategoryInfo().then((categoryInfo: CategoryBreakdownInfo) => {
      // Perform icon mapping
      // Now have validated categoryId exists. Also get the recent txns + map their categories
      this.category = categoryInfo.category;
      this.categoryIcon = categoryInfo.category.icon();
      this.transactionLookupPerspective = categoryInfo.perspective;
      console.log(this.transactionLookupPerspective);
      if (this.params.get('filterSpecificMonth')) {
        this.isFilterable = true;
        this.filterSpecificMonth = new Date(this.params.get('filterSpecificMonth'));
        this.filterName = moment(this.filterSpecificMonth).format('MMMM YYYY');
        this.loadTransactions(this.filterSpecificMonth);
      }
      else {
        this.loadTransactions();
      }
    }).catch(err => {
      console.error(err);
    });
  }
  displayCategoryPopup() {
    let popover = this.popoverCtrl.create(this.screens['categoryPopover'], { category: this.category }, { cssClass: 'category-modal-popover' });
    popover.present();
  }
  private loadTransactions(monthOf?: Date) {
    if (this.category.id) {
      this.showLoadingTransactions = true;
      if (monthOf) {
        let monthStartOf = moment(monthOf).startOf('month').toDate();
        let monthEndOf = moment(monthOf).endOf('month').toDate();
        var transactionRequest = this.transactionService.getTransactionsForCategory(this.category.id, this.transactionLookupPerspective, monthStartOf, monthEndOf);
      }
      else {
        var transactionRequest = this.transactionService.getTransactionsForCategory(this.category.id, this.transactionLookupPerspective);
      }
      transactionRequest.then((txns: Transaction[]) => {
        this.showLoadingTransactions = false;
        this.transactions = txns;
        // if (this.content) {
        //   // Might not have loaded yet
        //   this.content.scrollToTop();
        // }
      }).catch(err => {
        console.error(err);
        this.showLoadingTransactions = false;
      });
    }
  }
  private changeFilter() {
    if (this.isFilterable) {
      let actionSheet = this.actionSheetCtrl.create({ title: 'Transactions from...' });
      actionSheet.addButton({
        text: 'Cancel',
        role: 'cancel'
      });
      actionSheet.addButton({
        text: 'Show all',
        handler: () => {
          this.filterName = 'All Transactions';
          this.loadTransactions();
        }
      });
      actionSheet.addButton({
        text: moment(this.filterSpecificMonth).format('MMMM YYYY'),
        handler: () => {
          this.filterName = moment(this.filterSpecificMonth).format('MMMM YYYY');
          this.loadTransactions(this.filterSpecificMonth);
        }
      });
      actionSheet.present();
    }
  }
  private setNavbarVisibility(scrollEvent: any) {
    this.showNavbar = scrollEvent.scrollTop < 100;
    this.ref.detectChanges();
  }
  private retrieveCategoryInfo(): Promise<CategoryBreakdownInfo> {
    if (this.params.get('categoryInfo')) {
      return Promise.resolve(this.params.get('categoryInfo'));
    }
    // else if (this.params.get('id')) {
    //   let categoryId = this.params.get('id');
    //   return this.categoryService.getCategory(categoryId);
    // }
    else {
      // return Promise.reject('No category or ID provided in params');
      return Promise.reject('No category breakdown info provided in params');
    }
  }
}
