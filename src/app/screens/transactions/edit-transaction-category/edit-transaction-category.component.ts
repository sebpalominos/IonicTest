import { Component } from '@angular/core';
import { NavParams, NavController, LoadingController, AlertController, Loading } from 'ionic-angular';

import { Category } from '../../categories/shared/category.model';
import { SimilarCategoryComponent } from '../similar-category/similar-category.component';
import { Transaction } from '../shared/transaction.model';
import { TransactionComponentParams } from '../shared/transaction-component-params';
import { TransactionCategorisationResultInfo } from '../shared/transaction-data-maps';
import { TransactionService } from '../../../core/services/transaction/transaction.service';
// import { CategoryService } from '../../../core/services/category/category.service';

@Component({
  selector: 'modal-edit-transaction-category',
  templateUrl: 'edit-transaction-category.html'
})
export class EditTransactionCategoryComponent {
  transactions: Transaction[];
  selectedCategory: Category;
  checkSimilarTransactions: boolean;
  visualDisplayMode: 'icon' | 'list';
  showLoading: boolean;
  showCategoriserLoadingError: boolean;
  screens = {
    editTransactionCategory: EditTransactionCategoryComponent,
    similarCategory: SimilarCategoryComponent
  };
  constructor(
    protected params: NavParams, 
    protected navCtrl: NavController,
    protected loadingCtrl: LoadingController,
    protected alertCtrl: AlertController,
    protected transactionService: TransactionService
  ) {}
  ionViewWillLoad() {
    this.visualDisplayMode = this.params.get('visualDisplayMode') || 'icon';
    this.showLoading = true;
    this.retrieveTransactionList().then((txns: Transaction[]) => {
      this.transactions = txns;
    }).catch(err => {
      console.error(err);
      this.showLoading = false;
    });
  }
  handleCategoriesLoaded(success: boolean) {
    this.showLoading = false;
    if (!success) {
      this.showCategoriserLoadingError = true;
    }
  }
  handleCategoryUpdated(category: Category) {
    // Update the category mapping, of course
    this.selectedCategory = category;
  }
  handleCategorySelected(category: Category) {
    this.selectedCategory = category || this.selectedCategory;
    if (this.selectedCategory) {
      this.submit();
    }
    else {
      console.warn('A category was reported as selected, but data was not found.');
    }
  }
  /**
   * Submit category selection for a transaction. 
   * @desc If necessary, send it over to the similar category screen. Otherwise, assuming we're a modal, dismiss from here
   * @desc CLARIFYING: The only scenario where the user is taken directly back to the txn screen
   * is where it is a BRAND NEW categorisation, and no similar transactions were detected
   * In both the other cases - i.e. existing cty is being overridden, or similar was detected,
   * then send onwards to checkSimilar screen
   * @memberOf EditTransactionCategoryComponent
   */
  submit() {
    let loading = this.loadingCtrl.create({ content: 'Assigning category', spinner: 'crescent' });
    loading.present();
    // Return this update action as a promise, so that it is chainable by downstream
    // let updateRequests = this.transactions.map(txn => {
    //   return this.transactionService.updateTransactionCategory(txn, this.selectedCategory);
    // });
    // Promise.all(updateRequests).then(updateResults => {
    this.transactionService.updateTransactionCategories(this.transactions, this.selectedCategory).then(updateResults => {
      // let allResultsSuccessful = updateResults.reduce((prev, curr) => prev && curr.success, true);
      // let allResultsDone = updateResults.reduce((prev, curr) => prev && curr.done, true);
      if (updateResults.success) {
        if (updateResults.done) {
          // Return to transaction screen
          this.navCtrl.parent.getActive().dismiss({ 
            numSelectedTransactions: this.transactions.length,
            category: this.selectedCategory
          } as TransactionComponentParams.ApplyCategoryResult);
        }
        else {
          // Go to stage 2 - confirm rule
          // Some of the results may have been done already - ignore these - 
          // we only need to deal with results that require a confirmation
          this.navCtrl.push(SimilarCategoryComponent, { 
            category: this.selectedCategory,
            supersedingGroups: updateResults.supersedingGroups,
            ruleResult: updateResults._ruleInformerResponse
          } as TransactionComponentParams.SimilarCategoryComponentParams);
        }
      }
      // Remove loading; pass on the response down the line
      loading.dismiss();
    }).catch(err => {
      loading.dismiss();
      console.error(err);
      return { success: false, done: false };
    });
  }
  recentCategories() {
    console.log('Going to recent categories');
  }
  searchCategories() {
    console.log('Going to search categories');
  }
  cancel() {
    // Goodbye - kill the parent modal container
    this.navCtrl.parent.getActive().dismiss();
  }
  private retrieveTransactionList(): Promise<Transaction[]> {
    if (this.params.get('transactions')){
      return Promise.resolve(this.params.get('transactions'));
    }
    else {
      return Promise.reject('A transaction must be passed as a parameter to this category');
    }
    // else if (this.params.get('id')){
    //   return this.transactionService.getTransaction(this.params.get('id'));
    // }
  }
}
