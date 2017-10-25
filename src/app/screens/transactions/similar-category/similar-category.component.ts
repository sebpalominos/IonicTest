import { Component } from '@angular/core';
import { NavParams, NavController, ViewController, AlertController, ToastController, LoadingController } from 'ionic-angular';

import { Category, CategoryShape } from '../../categories/shared/category.model';
import { OpiconParams } from '../../../shared/opc-icon/opc-icon-type';
import { Transaction, TransactionShape } from '../shared/transaction.model';
import { TransactionComponentParams } from '../shared/transaction-component-params';
import { TransactionRuleInformerResponse } from '../shared/transaction-data-maps';
import { TransactionService } from '../../../core/services/transaction/transaction.service';

interface SupersedingGroup extends TransactionComponentParams.SupersedingGroupResult {
  selected?: boolean;
}

@Component({
  selector: 'scr-similar-category',
  templateUrl: 'similar-category.html',
  host: {
    class: 'category-matcher'
  }
})
export class SimilarCategoryComponent {
  category: Category;
  categoryIcon: OpiconParams;
  transactions: Transaction[];
  firstTransaction: Transaction;
  firstTransactionCategoryIcon: OpiconParams;
  supersedingGroups: SupersedingGroup[];       // An adulterated version of the response (already converted into Transaction etc)
  ruleResult: TransactionRuleInformerResponse;    // The original version of the response
  constructor(
    protected params: NavParams, 
    protected navCtrl: NavController, 
    protected viewCtrl: ViewController, 
    protected alertCtrl: AlertController,
    protected toastCtrl: ToastController,
    protected loadingCtrl: LoadingController,
    protected transactionService: TransactionService
  ) {}
  ionViewWillLoad() {
    // A category will have been selected for a transaction from the previous screen.
    // Load that category and that transaction
    // Load uncategorised transactions that could be the in the same category 
    this.category = this.params.get('category');
    this.categoryIcon = this.category.icon();
    let supersedingGroups = this.params.get('supersedingGroups');
    this.supersedingGroups = supersedingGroups;
    this.transactions = supersedingGroups.map(group => new Transaction(group.superseding));
    this.firstTransaction = this.transactions[0];
    this.firstTransactionCategoryIcon = this.firstTransaction.category && this.firstTransaction.category.icon();
    this.ruleResult = this.params.get('ruleResult');
  }
  /**
   * Using the previous TransactionRuleInformerResponse, submit rules for categorisation. 
   * Note: Rules are generate as the output of a previous edit transaction category request. 
   * @memberOf SimilarCategoryComponent
   */
  submit() {
    let loading = this.loadingCtrl.create({ content: 'Assigning category', spinner: 'crescent' });
    // loading.present();
    this.transactionService.updateTransactionCategoryAsRule(this.ruleResult).then(resp => {
      // loading.dismiss(); 
      // let applyCategoryResultToast = this.toastCtrl.create({
      //   message: 'Category saved',
      //   duration: 3000,
      //   position: 'top'
      // });
      // applyCategoryResultToast.present();
      // return this.navCtrl.parent.getActive().dismiss({ 
      //   numSelectedTransactions: this.transactions.length,
      //   category: this.category,
      //   similarTransactions: this.supersedingGroups[0].superseded as TransactionShape[]
      // } as TransactionComponentParams.ApplyCategoryResult);
    }).catch(err => {
      // loading.dismiss();
      console.error(err);
    });
    /* 02/08/2017 - On advice from Cormac, we should just iommediately return the categorisation result, because it is a fire + forget */
    return this.navCtrl.parent.getActive().dismiss({ 
      numSelectedTransactions: this.transactions.length,
      category: this.category,
      similarTransactions: this.supersedingGroups[0].superseded as TransactionShape[]
    } as TransactionComponentParams.ApplyCategoryResult);
  }
  /** 
   * Don't persist the matching info and return to transaction.
   * @deprecated - They must either commit to all the categorisations, or cancel.
   */
  skip() {
    let modalParent = this.navCtrl.parent.getActive().dismiss();
  }
  cancel() {
    let cancelAlert = this.alertCtrl.create({ 
      title: 'Discard categorisation', 
      message: 'None of your new categories will be saved.', 
      buttons: [{
        text: 'Discard',
        role: 'destructive',
        handler: () => {
          this.navCtrl.parent.getActive().dismiss(<TransactionComponentParams.ApplyCategoryResult> { 
            cancelled: true
          });      // No data needs to be sent back in this instance, but it could be.
        }
      }, {
        text: 'Stay',
        role: 'cancel'
      }] 
    });
    cancelAlert.present();
  }
}