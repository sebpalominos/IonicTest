import { Component, Input, ViewChild, SimpleChanges } from '@angular/core';
import { NavController, ModalController, List } from 'ionic-angular';

import { Account } from '../../shared/account.model';
import { Category, CategoryShape } from '../../../categories/shared/category.model';
import { Transaction, TransactionShape } from '../../../transactions/shared/transaction.model';
import { TransactionComponentParams } from '../../../transactions/shared/transaction-component-params';
import { TransactionMap } from '../../../transactions/shared/transaction-data-maps';
import { TransactionComponent } from '../../../transactions/transaction/transaction.component';
import { TransactionsComponent } from '../../../transactions/transactions.component';
import { EditTransactionComponent } from '../../../transactions/edit-transaction/edit-transaction.component';
import { TransactionService } from '../../../../core/services/transaction/transaction.service';

@Component({
  selector: 'account-top-transactions',
  templateUrl: 'account-top-transactions.html',
  host: {
    class: 'account-top-transactions transaction-list'
  }
})
export class AccountTopTransactionsComponent {
  @ViewChild(List) list: List;
  @Input() account: Account;
  @Input() accountId: number;
  @Input('display') numTxnDisplayed: number = 5;
  transactions: TransactionMap[];
  screens: { [screenName: string]: any } = { 
    transaction: TransactionComponent,
    transactionList: TransactionsComponent
  };
  showLoading: boolean;
  constructor(
    protected modalCtrl: ModalController,
    protected txnService: TransactionService
  ) {}
  ngOnInit() {
    if (this.account || this.accountId) {
      // Note: accountId is used in template's navParams
      this.accountId = this.account ? this.account.id : this.accountId;
      this.loadTransactions(this.accountId);
    }
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes['account'] && changes['account'].currentValue) {
      let account: Account = changes['account'].currentValue;
      this.loadTransactions(account.id);
    }
  }
  filterItems(event: any){
    let filterKeyword = event.target.value;
    this.transactions.forEach(item => {
      item.visible = (()=>{
        if (filterKeyword === '' || filterKeyword === null || filterKeyword === undefined) return false;
        let searchString = `${item.tx.displayName()} ${item.tx.description}`.toLowerCase();
        return searchString.includes(filterKeyword.toLowerCase());
      })();
    });
  }
  editCategory(transaction: Transaction) {
    // Create the modal, also send the existing category to the modal
    let categoryModal = this.modalCtrl.create(EditTransactionComponent, { transaction });
    categoryModal.onDidDismiss((result: TransactionComponentParams.ApplyCategoryResult) => {
      if (result && result.category) {
        transaction.category = new Category(<CategoryShape> result.category);
        if (result.similarTransactions) {
          result.similarTransactions.forEach(similarTx => {
            let correspondingTx = this.transactions.find(txMap => txMap.tx.id === similarTx.id);
            if (correspondingTx) {
              correspondingTx.tx.category = new Category(result.category);
            }
          });
        }
      }
    });
    this.list.closeSlidingItems();
    categoryModal.present();
  }
  private loadTransactions(accountId) {
    // Figure out dates of stuff
    this.showLoading = true;
    let dateFrom: Date = new Date();
    let dateTo: Date = new Date();
    dateFrom.setDate(dateFrom.getDate() - 7);      // ONE WEEK
    this.txnService.getTransactionsForAccount(accountId, dateFrom, dateTo).then((transactions: Transaction[]) => {
      transactions.sort((a,b) => b.amount - a.amount);
      this.transactions = transactions.slice(0, this.numTxnDisplayed).map(txn => ({
        visible: true,
        tx: new Transaction(txn)
      }));
      this.showLoading = false;      
    }).catch(err => {
      console.error(err);
      this.showLoading = false;
    });
  }
}