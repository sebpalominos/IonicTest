import { Component } from '@angular/core';
import { NavParams, ModalController, AlertController, Events } from 'ionic-angular';

import { Category, CategoryShape } from '../../categories/shared/category.model';
import { EditTransactionComponent } from '../edit-transaction/edit-transaction.component';
import { Transaction, TransactionShape } from '../shared/transaction.model';
import { TransactionComponentParams } from '../shared/transaction-component-params';
import { TransactionService } from '../../../core/services/transaction/transaction.service';
import { CATEGORY_ICONS } from '../../../core/data/category/category-icons';

@Component({
  selector: 'scr-transaction',
  templateUrl: 'transaction.html',
  host: {
    class: 'transaction-single'
  }
})
export class TransactionComponent {
  transaction: Transaction;
  categoryIcon: { name: string; set: string; };
  errorName: string;
  // screens: { [screenName: string]: any } = {
  //   editTransaction: EditTransactionCategoryComponent
  // };
  constructor(
    public params: NavParams, 
    public events: Events,
    public alertCtrl: AlertController,
    public modalCtrl: ModalController,
    public transactionService: TransactionService, 
  ) {}
  ionViewWillLoad() {
    this.transaction = new Transaction();
    this.categoryIcon = undefined;
    this.retrieveTransaction()
      .then((transaction: Transaction) => {
        this.transaction = transaction;
        if (transaction.category){
          let category = transaction.category;
          // We need to find the icon of the bottom-most category in the tier
          // This might end up being the Tier 1 category icon, if no Tier 2 category icon exists
          let categoryIds = [category.id];
          if (category.parent){
            categoryIds.push(category.parent.id);
          }
          else if (category.parentId){
            categoryIds.push(category.parentId);
          }
          categoryIds.forEach(ctyId => {
            this.categoryIcon = this.categoryIcon || CATEGORY_ICONS.find(icon => icon.id === ctyId );
          });
        }
      })
      .catch(err => {
        console.error(err);
      });
  }
  chooseCategory() {
    // Create the modal, also send the existing category to the modal
    let categoryModal = this.modalCtrl.create(EditTransactionComponent, { 
      transaction: this.transaction,
    });
    categoryModal.onDidDismiss((result: TransactionComponentParams.ApplyCategoryResult) => {
      if (result && result.category) {
        this.transaction.category = new Category(<CategoryShape> result.category);
      }
    });
    categoryModal.present();
  }
  share() {
    this.alertCtrl.create({
      title: 'Testing: Share was pressed',
      buttons: ['Whatever']
    }).present();
  }
  private retrieveTransaction(): Promise<Transaction> {
    if (this.params.get('transaction')){
      return Promise.resolve(new Transaction(<TransactionShape> this.params.get('transaction')));
    }
    // else if (this.params.get('id')){
    //   let transactionId = this.params.get('id');
    //   return this.transactionService.getTransaction(transactionId);
    // }
    else {
      // Display an error screen
      this.errorName = 'loadError';
      return Promise.reject('A transaction must be passed to this component');
    }
  }
}
