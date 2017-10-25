import { Component, ViewChild } from '@angular/core';
import { NavParams, NavController, LoadingController, ModalController, ActionSheetController } from 'ionic-angular';
import { List, Searchbar } from 'ionic-angular';
import * as moment from 'moment';

import { Account } from '../accounts/shared/account.model';
import { Transaction, TransactionShape } from './shared/transaction.model';
import { Category, CategoryShape } from '../categories/shared/category.model';
import { TransactionComponent } from './transaction/transaction.component';
import { EditTransactionComponent } from './edit-transaction/edit-transaction.component';
import { TransactionComponentParams } from './shared/transaction-component-params';
import { TransactionMap } from './shared/transaction-data-maps';
import { TransactionService } from '../../core/services/transaction/transaction.service';
// import { MONTH_THREE_LETTERS } from '../../core/data/shared/constant-types';

@Component({
  selector: 'scr-transaction-list',
  templateUrl: 'transactions.component.html',
  host: {
    class: 'transaction-list'
  }
})
export class TransactionsComponent {
  @ViewChild(List) list: List;
  @ViewChild(Searchbar) searchbar: Searchbar;
  account: Account;
  transactions: TransactionMap[];
  transactionsByMonth: { [monthKey: string]: TransactionMap[] };
  perspectiveTitle: string;
  displayMonth: Date;
  dateRangeUpper: Date = new Date();
  dateRangeLower: Date = new Date();
  screens = { 
    transaction: TransactionComponent,
    editTransaction: EditTransactionComponent
  };
  showTransactionsLoading: boolean;
  showFilter: boolean;
  hideNextMonth: boolean;
  constructor(
    protected params: NavParams, 
    protected navCtrl: NavController, 
    protected loadingCtrl: LoadingController,
    protected modalCtrl: ModalController,
    protected actionSheetCtrl: ActionSheetController,
    protected txnService: TransactionService
  ) {}
  ionViewWillLoad() {
    this.transactionsByMonth = {};
    if (this.params.get('account')){
      this.account = this.params.get('account');  
    }
  }
  ionViewDidLoad() {
    // Default to the start of this month.
    let now = new Date();
    this.reloadMonth(now);
    // this.displayMonth = now;
    // this.perspectiveTitle = moment().format('MMM YYYY');
    // this.dateRangeLower = moment().startOf('month').toDate();
    // this.dateRangeUpper = moment().endOf('month').toDate();
    // this.loadTransactions(true);
  }
  reloadMonth(newDisplayMonth?: Date) {
    // console.log(newDisplayMonth);
    this.displayMonth = newDisplayMonth || this.displayMonth;
    this.perspectiveTitle = moment(this.displayMonth).format('MMM YYYY');
    this.dateRangeLower = moment(this.displayMonth).startOf('month').toDate();
    this.dateRangeUpper = moment(this.displayMonth).endOf('month').toDate();
    this.hideNextMonth = moment().startOf('month').isSameOrBefore(this.dateRangeLower);
    this.loadTransactions(true);
  }
  nextMonth() {
    this.displayMonth = moment(this.displayMonth).add(1, 'M').startOf('month').toDate();
    this.reloadMonth();
  }
  prevMonth() {
    this.displayMonth = moment(this.displayMonth).subtract(1, 'M').startOf('month').toDate();
    this.reloadMonth();
  }
  filterItems(event: any){
    let filterKeyword = event.target.value;
    let determineIfHidden: (item: TransactionMap) => boolean = item => {
      if (filterKeyword === '' || filterKeyword === null || filterKeyword === undefined) return false;
      let searchString = `${item.tx.displayName()} ${item.tx.description}`.toLowerCase();
      return searchString.includes(filterKeyword.toLowerCase()) === false;
    };
    this.transactions.forEach(item => {
      item.visible = !determineIfHidden(item);
    });
  }
  editCategory(transaction: Transaction) {
    // Create the modal, also send the existing category to the modal
    let categoryModal = this.modalCtrl.create(this.screens['editTransaction'], { transaction });
    categoryModal.onDidDismiss((result: TransactionComponentParams.ApplyCategoryResult) => {
      if (result && result.category) {
        transaction.category = new Category(result.category);
        if (result.similarTransactions) {
          // Lookup all those transactions and whack on the new category as well
          result.similarTransactions.forEach(similarTx => {
            let correspondingTx = this.transactions.find(txMap => txMap.tx.id === similarTx.id);
            if (correspondingTx) {
              correspondingTx.tx.category = new Category(result.category);
            }
          });
        }
      }
    });
    categoryModal.present();
    setTimeout(() => {
      this.list.closeSlidingItems();
    }, 0);
  }
  toggleFilter(filterOverride?: boolean) {
    let isFilterOverride = filterOverride !== undefined;
    if (this.showFilter || (isFilterOverride && !filterOverride)) {
      // Then hide the filter. Unhide all transactions
      this.showFilter = false;
      this.transactions.forEach(item => item.visible = true);
    }
    else {
      // Then show it. Reset the filter value
      this.showFilter = true;
      this.searchbar.value = '';    // set to empty
    }
  }
  showMonthNavOptions() {
    let buttonCancel = { text: 'Cancel', role: 'cancel' };
    let buttonBackToNow = { text: 'Back to current month', handler: () => {
      let now = new Date();
      this.reloadMonth(now);
    } };
    let actionSheet = this.actionSheetCtrl.create({
      buttons: [ buttonBackToNow, buttonCancel ]
    });
    actionSheet.present();
  }
  private loadTransactions(foreground = true, refresher?): Promise<boolean> {
    this.showTransactionsLoading = true;
    this.transactions = [];
    let accountId: number = this.params.get('accountId') || this.account.id;
    let monthKey = moment(this.dateRangeLower).format('MMYYYY');
    // Check if transactions were pre-loaded for this session already. If so, retrieve from memory.
    // If refresher triggered, then always skip this and try reloading from remote.
    if (!refresher && this.transactionsByMonth.hasOwnProperty(monthKey)) {
      if (Array.isArray(this.transactionsByMonth[monthKey]) && this.transactionsByMonth[monthKey].length > 0) {
        this.transactions = this.transactionsByMonth[monthKey];
        this.showTransactionsLoading = false;
        return Promise.resolve(true);
      }
    }
    return this.txnService.getTransactionsForAccount(accountId, this.dateRangeLower, this.dateRangeUpper)
      .then((transactions: Transaction[]) => {
        let mappedTransactions = transactions.map(txn => ({
          visible: true,
          tx: new Transaction(txn)
        }));
        this.transactions = mappedTransactions;
        this.transactionsByMonth[monthKey] = mappedTransactions;
        refresher && refresher.complete();
        this.showTransactionsLoading = false;
        return true;
      })
      .catch(err => {
        console.error(err);
        refresher && refresher.complete();
        this.showTransactionsLoading = false;
        return false;
      });
  }
}
