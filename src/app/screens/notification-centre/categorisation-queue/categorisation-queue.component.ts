import { Component, ViewChild } from '@angular/core';
import { NavParams, NavController, LoadingController, ModalController, ActionSheetController, AlertController } from 'ionic-angular';
import { List, Searchbar, InfiniteScroll } from 'ionic-angular';
import * as moment from 'moment';

import { Category } from '../../categories/shared/category.model';
import { Transaction } from '../../transactions/shared/transaction.model';
import { TransactionMap, MonthlyTransactionMap } from '../../transactions/shared/transaction-data-maps';
import { TransactionComponentParams } from '../../transactions/shared/transaction-component-params';
import { TransactionComponent } from '../../transactions/transaction/transaction.component';
import { EditTransactionComponent } from '../../transactions/edit-transaction/edit-transaction.component';
import { NotificationShape, NotificationStateShape } from '../../../screens/notification-centre/shared/notification.model';
import { NotificationType, NotificationStateType } from '../../../screens/notification-centre/shared/notification-type';
import { TransactionService } from '../../../core/services/transaction/transaction.service';
import { TransactionLocalService } from '../../../core/services/transaction/transaction-local.service';
import { NotificationService } from '../../../core/services/notification/notification.service';

const transactionsDisplayedStep = 50;

@Component({
  selector: 'categorisation-queue',
  templateUrl: 'categorisation-queue.component.html',
  host: {
    class: 'categorisation-queue transaction-list'
  }
})
export class CategorisationQueueComponent {
  @ViewChild(List) list: List;
  @ViewChild(Searchbar) searchbar: Searchbar;
  @ViewChild(InfiniteScroll) infiniteScroll: InfiniteScroll;
  // transactions: TransactionMap[];
  transactionsByMonth: MonthlyTransactionMap[];
  monthFrom: Date;
  monthUntil: Date;
  monthSpanPerLoad: number = 3;      // Load 3 months worth of data every time
  transactionsDisplayedPointer: number = 0;      // Pointer that shows where the current reveal position is
  isExhausted: boolean;      // Whether the list of uncategorised transactions is exhaused
  numDone: number;
  numQueued: number;
  numQueuedPluralMapping: any;
  numDonePluralMapping: any;
  screens = { 
    transaction: TransactionComponent,
    editTransaction: EditTransactionComponent
  };
  isSelectMultipleMode: boolean;
  showTransactionsLoading: boolean;
  showMoreTransactionsLoading: boolean;
  showFilter: boolean;
  get numSelected(): number {
    return this.transactionsByMonth.reduce((prev, curr) => {
      return prev + curr.transactions.filter(tx => tx.selected).length;
    }, 0);
  }
  constructor(
    protected navCtrl: NavController,    // for template
    protected modalCtrl: ModalController,
    protected actionSheetCtrl: ActionSheetController,
    protected alertCtrl: AlertController,
    protected transactionService: TransactionService,
    protected transactionLocalInfoService: TransactionLocalService,
    protected notificationService: NotificationService
  ) {}
  ionViewWillLoad() {
    this.transactionsByMonth = [];
    this.monthUntil = moment().endOf('month').toDate();
    this.monthFrom = moment().subtract(this.monthSpanPerLoad - 1, 'months').startOf('month').toDate();
    this.loadTransactions();
    this.numDone = 0;
    this.numQueuedPluralMapping = {
      '=0': 'Nothing in your queue!',
      '=1': 'Just 1 remaining!',
      'other': '# remaining'
    };
    this.numDonePluralMapping = {
      '=0': '0 done',
      '=1': '1 done',
      'other': '# done'
    };
  }
  showOptions() {
    let confirmRevealActionSheet = this.actionSheetCtrl.create({
      title: 'Reveal all ignored transactions?'
    });
    confirmRevealActionSheet.addButton({
      text: 'Cancel'     // DO NOT ADD ROLE=CANCEL
    });
    confirmRevealActionSheet.addButton({
      text: 'Reveal',
      handler: () => {
        this.transactionLocalInfoService.clearCategoryIgnoredTransactions().then(() => {
          this.loadTransactionsThroughPointer(0);    // Don't move the pointer but reveal any previously ignored transactions
        });
      }
    });
    let primaryActionSheet = this.actionSheetCtrl.create();
    primaryActionSheet.addButton({
      text: 'Select multiple...',
      handler: () => {
        this.isSelectMultipleMode = true;
      }
    });
    primaryActionSheet.addButton({
      text: 'Reveal all ignored',
      role: 'destructive',
      handler: () => {
        primaryActionSheet.dismiss().then(() => {
          confirmRevealActionSheet.present();
        });
        return false;
      }
    });
    primaryActionSheet.addButton({
      text: 'Cancel',
      role: 'cancel'
    });
    primaryActionSheet.present();
  }
  cancelSelectMultipleMode() {
    // Unselect anything that might have been marked as selected
    this.transactionsByMonth.forEach(month => {
      month.transactions.forEach(txMap => txMap.selected = false);
    });
    this.isSelectMultipleMode = false;
  }
  toggleFilter(filterOverride?: boolean) {
    let isFilterOverride = filterOverride !== undefined;
    if (this.showFilter || (isFilterOverride && !filterOverride)) {
      // Then hide the filter. Unhide all transactions
      this.showFilter = false;
      this.transactionsByMonth.forEach(month => {
        month.transactions.forEach(item => item.visible = false);
      });
    }
    else {
      // Then show it. Reset the filter value
      this.showFilter = true;
      setTimeout(() => {
        this.searchbar.value = '';    // set to empty
      }, 0);
    }
  }
  filterItems(event: any) {
    let filterKeyword = event.target.value;
    let determineIfHidden: (item: TransactionMap) => boolean = item => {
      if (filterKeyword === '' || filterKeyword === null || filterKeyword === undefined) return false;
      let searchString = `${item.tx.displayName()} ${item.tx.description}`.toLowerCase();
      return searchString.includes(filterKeyword.toLowerCase()) === false;
    };
    this.transactionsByMonth.forEach(month => {
      month.transactions.forEach(item => {
        item.visible = !determineIfHidden(item);
      });
    });
  }
  transactionSelected(txMap: TransactionMap) {
    if (this.isSelectMultipleMode) {
      txMap.selected = !txMap.selected;
    }
    else {
      this.editCategory([txMap.tx]);
    }
  }
  editCategoryMultiple() {
    let selectedTransactions: Transaction[] = this.transactionsByMonth.map(month => {
      return month.transactions.filter(txMap => txMap.selected).map(txMap => txMap.tx);
    }).reduce((prev, curr) => prev.concat(curr), []);
    this.editCategory(selectedTransactions);
  }
  editCategory(transactions: Transaction[]) {
    // Create the modal, also send the existing category to the modal
    let categoryModal = this.modalCtrl.create(this.screens['editTransaction'], { transactions });
    categoryModal.onDidDismiss((result: TransactionComponentParams.ApplyCategoryResult) => {
      this.cancelSelectMultipleMode();
      if (result && result.category) {
        let numJustDone = result.numSelectedTransactions || 0;
        transactions.forEach(transaction => transaction.category = new Category(result.category));
        // Reduce the queue count by however many were just categorised
        if (result.similarTransactions) {
          // Lookup all those transactions and whack on the new category as well
          result.similarTransactions.forEach(similarTx => {
            // let correspondingTx = this.transactions.find(txMap => txMap.tx.id === similarTx.id);
            this.transactionsByMonth.forEach(month => {
              let correspondingTx = month.transactions.find(txMap => txMap.tx.id === similarTx.id);
              if (correspondingTx) {
                correspondingTx.tx.category = new Category(result.category);
              }
            });
          });
          // Reduce the queue count by however many were just categorised
          numJustDone += result.similarTransactions.length;
        }
        this.numDone += numJustDone;
      }
    });
    // this.list.closeSlidingItems();
    categoryModal.present();
  }
  ignoreTransaction(txMap: TransactionMap) {
    this.transactionLocalInfoService.setCategoryIgnoredTransaction(txMap.tx).then(() => {
      this.numQueued = this.transactionsByMonth.reduce((prev, curr) => prev + curr.transactions.filter(txMap => !txMap.ignored).length, 0);
      this.list.closeSlidingItems();
      setTimeout(() => {
        txMap.ignored = true;    
        txMap.visible = false;
      }, 400);
    });
  }
  loadMoreTransactions() {
    // this.alertCtrl.create({ title: 'Detected infinite scroll trigger', buttons: ['OK'] }).present();
    this.loadTransactions(false);
  }
  private loadTransactions(isInitial = true): Promise<boolean> {
    if (!this.isExhausted) {
      if (isInitial) {
        this.showTransactionsLoading = true;
        this.infiniteScroll.enable(false);
        return this.loadTransactionsFromRemote().then(success => {
          // Switch off loading state
          this.showTransactionsLoading = false;
          this.loadTransactionsThroughPointer();
          this.infiniteScroll.enable(true);
          return success;
        }).catch(err => {
          console.error(err);
          this.infiniteScroll.enable(true);
          this.showTransactionsLoading = false;
          return false;
        });
      }
      else {
        this.showMoreTransactionsLoading = true;
        // There are two reasons we might want to load transactions
        // 1. The pointer position in the list (e.g. 50/100) means that we have some hidden transactions
        // 2. The pointer is exhausted and we legitimately want to go and load more transactions
        let nextPointerPosition = this.transactionsDisplayedPointer + transactionsDisplayedStep;
        if (nextPointerPosition > this.numQueued) {
          // Therefore we have exhausted the limit
          return this.loadTransactionsFromRemote().then(success => {
            // Switch off loading state
            this.showTransactionsLoading = false;
            this.showMoreTransactionsLoading = false;
            return this.loadTransactionsThroughPointer();
          }).then(success => {
            this.infiniteScroll.complete();
            return success;
          }).catch(err => {
            console.error(err);
            this.showTransactionsLoading = false;
            this.showMoreTransactionsLoading = false;
            return false;
          });
        }
        else {
          return this.loadTransactionsThroughPointer().then(() => {
            this.infiniteScroll.complete();
            return true;
          });
        }
      }
    }      
  }
  /**
   * Determines whether transactions were ignored, and shifts the location of the 
   * reveal pointer.
   * @private
   * @param {number} [increaseStep=transactionsDisplayedStep] How many units to shift the pointer by. Warning: not tested if you shift negatively...
   * @returns {Promise<boolean>} 
   * @memberof CategorisationQueueComponent
   */
  private loadTransactionsThroughPointer(increaseStep: number = transactionsDisplayedStep): Promise<boolean> {
    return this.transactionLocalInfoService.getCategoryIgnoredTransactions().then(ignoredTransactions => {
      // Increment the pointer by the step
      this.transactionsDisplayedPointer += increaseStep;
      let counter = 0;
      let pointer = this.transactionsDisplayedPointer;
      this.transactionsByMonth.forEach(month => {
        month.visible = (counter <= pointer);
        month.transactions.forEach(txMap => {
          if (ignoredTransactions.indexOf(txMap.tx.id as number) < 0) {
            // Not within the ignored list
            counter += 1;
            txMap.visible = (counter <= pointer);
          }
          else {
            // Is within the ignored list
            txMap.ignored = true;
            txMap.visible = false;
          }
        });
      });
      return true;
    });
  }
  private loadTransactionsFromRemote(): Promise<boolean> {
    return this.transactionService.getUncategorisedTransactions(this.monthFrom, this.monthUntil).then((transactions: Transaction[]) => {
      // monthIdentifiers is an extracted list of year/month identifiers, based on the returned transaction list.
      // This is used further down, to segment the transaction list into months
      // this.transactions = mappedTransactions;
      if (transactions.length > 0) {
        let monthMappedTransactions: MonthlyTransactionMap[] = transactions.reduce((transactionsByMonthList: MonthlyTransactionMap[], curr: Transaction) => {
          let monthAsMoment = moment(curr.dateTransacted);
          let identifier = monthAsMoment.format('YYYYMM');
          let name = monthAsMoment.format('MMMM YYYY');
          if ((transactionsByMonthList as MonthlyTransactionMap[]).findIndex(map => map.identifier === identifier) < 0) {
            // Doesn't exist in the list yet, so let's add it in
            transactionsByMonthList.push({ identifier, name, visible: false, transactions: [] });
          }
          return transactionsByMonthList;
        }, []).map(month => {
          month.transactions = transactions.filter(txn => {
            return moment(txn.dateTransacted).format('YYYYMM') === month.identifier;
          }).map(txn => ({ 
            visible: false,
            tx: new Transaction(txn)
          }));
          return month;
        });
        // Deduplicate monthly blocks - in the unlikely event that the new/old lists overlap.
        monthMappedTransactions.forEach(newMonth => {
          let existingMonthIndex = this.transactionsByMonth.findIndex(existingMonth => existingMonth.identifier === newMonth.identifier);
          if (existingMonthIndex >= 0) {
            // This month already exists in the existing list. Overwrite with newer - do not bother trying to deduplicate individual transactions.
            this.transactionsByMonth.splice(existingMonthIndex, 1, newMonth);
          }
          else {
            // Doesn't exist, just push.
            this.transactionsByMonth.push(newMonth);
          }
        });
        this.numQueued = this.transactionsByMonth.reduce((prev, curr) => prev + curr.transactions.filter(txMap => !txMap.ignored).length, 0);
        // Assign next bunch of search parameters
        this.monthUntil = moment(this.monthFrom).subtract(1, 'months').endOf('month').toDate();
        this.monthFrom = moment(this.monthUntil).subtract(this.monthSpanPerLoad - 1, 'months').startOf('month').toDate();
      }
      else {
        // If the service returns no entries, we can assume that the list is exhausted, and not to bother loading anymore
        this.infiniteScroll.enable(false);
        this.isExhausted = true;
      }
      return true;
    });
  }
}