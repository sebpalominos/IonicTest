import { Injectable } from '@angular/core';
import { InsightsHttpService } from '../insights-http/insights-http.service';
import { Storage } from '@ionic/storage';1

import { CategoryLocalService } from '../category/category-local.service';
import { Category } from '../../../screens/categories/shared/category.model';
import { StateChangeResponse } from '../../data/shared/state-change-response';
import { Transaction, TransactionShape } from '../../../screens/transactions/shared/transaction.model';
import { TransactionMetric, TransactionMetricShape } from '../../../screens/transactions/shared/transaction-metric.model';
import { TransactionCategorisationResultInfo, TransactionRuleInformerResponse } from '../../../screens/transactions/shared/transaction-data-maps';
import { TransactionComponentParams } from '../../../screens/transactions/shared/transaction-component-params';
import { TransactionResponse, TransactionListResponse, TransactionUpdateCategoryResponse, TransactionKpiListResponse } from '../../data/transaction/transaction-response';

@Injectable()
export class TransactionService {
  constructor(
    protected http: InsightsHttpService,
    protected storage: Storage,
    protected categoryLocalService: CategoryLocalService
  ) {}
  /**
   * Get as many transactions as possible. Warning: Big.
   * @returns {Promise<Transaction[]>} 
   * @memberOf TransactionService
   */
  getTransactions(): Promise<Transaction[]> {
    let endpoint = ['transactions', 'find-all'];
    return this.http.get(endpoint).toPromise().then(resp => {
      return resp.json();
    }).then((transactionListData: TransactionListResponse) => {
      return Transaction.createTransactionListFromResponse(transactionListData);
    });
  }
  /**
   * Get transactions specifically from an account. 
   * @param {number} accountId 
   * @param {Date} [dateFrom=null] - Starting from this date. 
   * @param {Date} [dateUntil=null] - If omitted, then only transactions from this dateFrom will be returned.
   * @returns {Promise<Transaction[]>} 
   * @memberOf TransactionService
   */
  getTransactionsForAccount(accountId: number, dateFrom: Date = null, dateUntil: Date = null): Promise<Transaction[]> {
    if (!accountId) {
      throw 'TransactionService.getTransactionsForAccount() -- Parameter accountId must be non-zero';
    }
    let endpoint = ['transactions', 'find'];
    let payload: any = {
      ACCOUNT: [ { id: accountId } ]
    };
    if (dateFrom && dateUntil) {
      payload.DATE_RANGE = [{ startDate: +dateFrom, endDate: +dateUntil }];
    }
    else if (dateFrom) {
      payload.DATE = [{ date: +dateFrom }];
    }
    return this.http.post(endpoint, payload).toPromise().then(resp => {
      return resp.json();
    }).then((transactionListData: TransactionListResponse) => {
      return Transaction.createTransactionListFromResponse(transactionListData);
    });
  }
  /**
   * Get transactions based on a category ID
   * @param {number} categoryId 
   * @returns {Promise<Transaction[]>} 
   * 
   * @memberof TransactionService
   */
  getTransactionsForCategory(categoryId: number, perspective: any, dateFrom: Date = null, dateUntil: Date = null): Promise<Transaction[]> {
    if (!categoryId) {
      throw 'Get transactions for category -- Parameter accountId must be non-zero';
    }
    // Must add category ID to the perspective payload, as per comment in OP1-275
    perspective = perspective || {};
    perspective.CATEGORY = [ { id: categoryId } ];
    if (dateFrom && dateUntil) {
      perspective.DATE_RANGE = [{ startDate: +dateFrom, endDate: +dateUntil }];
    }
    else if (dateFrom) {
      perspective.DATE = [{ date: +dateFrom }];
    }
    // Send POST request
    let endpoint = ['transactions', 'find'];
    let payload = perspective;
    return this.http.post(endpoint, payload).toPromise().then(resp => {
      return resp.json();
    }).then((transactionListData: TransactionListResponse) => {
      return Transaction.createTransactionListFromResponse(transactionListData);
    });
  }

  /**
   * (Stage 1) Assign a new category to a transaction. 
   * @param {Transaction} transaction 
   * @param {Category} category 
   * @returns {Promise<TransactionCategorisationResultInfo>} 
   * @see {@link https://opicagroup.atlassian.net/wiki/pages/viewpage.action?pageId=1384363#id-/transactions-categorizePOST/transactions/categorise|API Doc for categorise transactions}
   * @memberof TransactionService
   */
  updateTransactionCategory(transaction: Transaction, category: Category): Promise<TransactionCategorisationResultInfo> {
    return this.updateTransactionCategories([transaction], category);
  }
  /**
   * (Stage 1) Assign a new category to a list of transactions
   * @param {Transaction[]} transactions 
   * @param {Category} category 
   * @returns {Promise<TransactionCategorisationResultInfo>} 
   * @memberof TransactionService
   */
  updateTransactionCategories(transactions: Transaction[], category: Category): Promise<TransactionCategorisationResultInfo> {
    // Requires the original transaction response object, so we should grab that from the transaction 
    // Prepare to fail, if the provided transaction or category has no original _response field.
    for (let txn of transactions) {
      if (!txn._transactionResponse) {
        return Promise.reject('Transaction response _transactionResponse was not found on the provided category.');
      }
    }
    if (!category._categoryResponse) {
      return Promise.reject('Category response _categoryResponse was not found on the provided category.');
    }
    let categorisations = {
      items: [{ category: category._categoryResponse }],
      primaryCategory: category._categoryResponse
    };
    let payload = {
      items: transactions.map(txn => {
        return Object.assign({}, txn._transactionResponse, { categorisations });
      })
    };
    let endpoint = ['transactions', 'categorise'];
    return this.http.post(endpoint, payload).toPromise().then(resp => {
      if (resp.status !== 200) {
        return { success: false, done: false };
      }
      let body: TransactionUpdateCategoryResponse = resp.json();
      if (body.done || body.saveAsRuleInformer.empty) {
        this.categoryLocalService.addRecentlyUsedCategoryId(category.id);
        // This is a 'simple response' which was saved, and no other similar transactions were found
        return { 
          success: true, 
          done: body.done
        } as TransactionCategorisationResultInfo;
      }
      else {
        // This is a 'complex response' used in case of a stage 2 "save-as-rule" scenario
        return { 
          success: true, 
          done: body.done, 
          supersedingGroups: body.saveAsRuleInformer.items.map(item => {
            return { 
              superseding: Transaction.createTransactionFromRuleResponse(item.supersedingTransaction),
              superseded: item.supersededTransactions.map(superseded => Transaction.createTransactionFromRuleResponse(superseded))
            } as TransactionComponentParams.SupersedingGroupResult;
          }),
          _ruleInformerResponse: body.saveAsRuleInformer
        } as TransactionCategorisationResultInfo;
      }
    });
    // return Promise.resolve({success: true, id: id});
  }
  /**
   * (Stage 2) Assign a new category to a transaction. Follow up stage, if any similar transactions were identified
   * (and bundled into a rule)
   * @param {TransactionRuleInformerResponse} rules 
   * @returns {Promise<StateChangeResponse>} 
   * 
   * @memberOf TransactionService
   */
  updateTransactionCategoryAsRule(rules: TransactionRuleInformerResponse): Promise<StateChangeResponse> {
    let endpoint = ['transactions', 'save-as-rule'];
    let payload = rules;
    return this.http.post(endpoint, payload).toPromise().then(resp => {
      if (resp.ok) {
        let categoryId = payload.items[0].supersedingTransaction.categoryId;
        this.categoryLocalService.addRecentlyUsedCategoryId(categoryId);
        let body: TransactionUpdateCategoryResponse = resp.json();
        let numChanged = body.transactions && body.transactions.items.length;
        return { success: !!body.transactions, numChanged };
      }
      else {
        return { success: false };
      }
    });
  }
  /**
   * Uses a perspective filter to retrieve a certain category ID
   * @param {number} categoryId 
   * @returns {Promise<Transaction[]>} 
   * @memberof TransactionService
   */
  getTransactionsByCategory(categoryId: number, dateFrom: Date = null, dateUntil: Date = null): Promise<Transaction[]> {
    let endpoint = ['transactions', 'find'];
    let payload: any = {
      CATEGORY: [{ id: categoryId }]
    };
    if (dateFrom && dateUntil) {
      payload.DATE_RANGE = [{ startDate: +dateFrom, endDate: +dateUntil }];
    }
    else if (dateFrom) {
      payload.DATE = [{ date: +dateFrom }];
    }
    return this.http.post(endpoint, payload).toPromise().then(resp => {
      return resp.json();
    }).then((transactionListData: TransactionListResponse) => {
      return Transaction.createTransactionListFromResponse(transactionListData);
    });
  }
  /**
   * A preset perspective filter to category id = null
   * @returns {Promise<Transaction[]>} 
   * @memberof TransactionService
   */
  getUncategorisedTransactions(dateFrom: Date = null, dateUntil: Date = null): Promise<Transaction[]> {
    return this.getTransactionsByCategory(null, dateFrom, dateUntil);
  }
  /**
   * Get information on the completion rate of categorisation
   * @desc Use the 'KPIs' endpoint to get stats on what's already categorised
   * @returns {Promise<TransactionMetric>} 
   * 
   * @memberof TransactionService
   */
  getCategorisationMetric(): Promise<TransactionMetric> {
    let endpoint = ['transactions', 'kpis-all'];
    return this.http.get(endpoint).toPromise().then(resp => {
      let body: TransactionKpiListResponse = resp.json();
      let list = TransactionMetric.createTransactionMetricListFromResponse(body);
      return list.find(metric => metric.identifier === 'CATEGORISATION_RATE_OVERALL');
    });
  }
}