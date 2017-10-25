import { Component, ViewChild } from '@angular/core';
import { NavParams, NavController, ViewController } from 'ionic-angular';

import { TransactionShape, Transaction } from '../shared/transaction.model';
import { CategoryShape } from '../../categories/shared/category.model';
import { TransactionService } from '../../../core/services/transaction/transaction.service';
import { CategoryResponse } from '../../../core/services/category/category-response';
import { EditTransactionCategoryComponent } from '../edit-transaction-category/edit-transaction-category.component';

@Component({
  selector: 'modal-edit-transaction',
  template: `
    <ion-nav #editTransactionNav></ion-nav>
  `
})
export class EditTransactionComponent {
  @ViewChild('editTransactionNav') nav: NavController;
  constructor(
    protected params: NavParams,
    protected viewCtrl: ViewController
  ) {}
  ionViewWillLoad() {
    let transaction = this.params.get('transaction');
    let transactions = this.params.get('transactions');
    if (transactions && transaction) {
      console.warn('Two input parameters were found. This component will use the list parameter.');
    }
    // Prefer transactions, then use transaction, then log a message if it doesn't work still.
    if (transactions) {
      this.nav.setRoot(EditTransactionCategoryComponent, { transactions });
    }
    else if (transaction) {
      this.nav.setRoot(EditTransactionCategoryComponent, { transactions: [ transaction ] });
    }
    else {
      console.error('Transaction input not found');
    }
  }
}
