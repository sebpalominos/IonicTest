import { TransactionType } from './transaction-data-maps';
import { Account, AccountShape } from '../../accounts/shared/account.model';
import { Category, CategoryShape } from '../../categories/shared/category.model';
import { CategoryService } from '../../../core/services/category/category.service';
import { TransactionListResponse, TransactionResponse, TransactionRuleResponse } from '../../../core/data/transaction/transaction-response';

export interface TransactionShape {
  id: string|number;             // Expect it is a guid or similar
  title?: string;         // Something calculated server-side
  description: string;    // whatever the bank statement said
  amount: number;   // which in TS can be a decimal
  type: TransactionType;
  dateTransacted: Date;
  parsedBusinessName?: string;
  parsedBusinessLocation?: string;
  categoryId?: number;
  category?: CategoryShape;
  otherCategoryIds?: number[];
  isManual?: boolean;
  accountId?: number;              // Optional for cases where tx's are listed, say, by category 
  account?: AccountShape;
}

abstract class KeepsTransactionResponse {
  _transactionResponse: TransactionResponse;
  _transactionRuleResponse: TransactionRuleResponse;
}

export class Transaction extends KeepsTransactionResponse implements TransactionShape {
  id: string|number;
  title: string;
  description: string;
  amount: number;
  type: TransactionType;
  dateTransacted: Date;
  parsedBusinessName?: string;
  parsedBusinessLocation: string;
  categoryId: number;
  otherCategoryIds: number[];
  isManual: boolean;
  accountId: number;
  category: Category;
  otherCategories: Category[];
  account: Account;
  constructor(...shapes: Partial<TransactionShape|KeepsTransactionResponse>[]) {
    super();
    Object.assign(this, ...shapes);
  }
  /**
   * Safely get the best display name for this transaction.
   * @returns {string} 
   * @memberOf Transaction
   */
  displayName(): string {
    return this.title || this.description || 'transaction';
  }
  /**
   * Safe retrieval for the transaction's category. If the category isn't set, it will lazy load the 
   * category.
   * @param {CategoryService} categoryService 
   * @param {number} [categoryId] - By default will load or attempt to load the primary category. If specified, 
   * this will search in otherCategoryIds for the target to load. If the categoryId doesn't exist in any known
   * @returns {Promise<Category>} 
   * @memberOf Transaction
   */
  getCategory(categoryService: CategoryService, categoryId?: number): Promise<Category> {
    // Principal usage is to load the primary category
    if (!categoryId || this.categoryId === categoryId) {
      if (this.category && this.category.constructor.name === 'Category') {
        return Promise.resolve(this.category);
      }
      if (!this.categoryId) {
        return Promise.reject(`Transaction ${this.id} does not have a categoryId`);
      }
      return categoryService.getCategory(this.categoryId || categoryId).then((value: Category) => value);
    }
    else {
      throw 'Not implemented yet';
    }
  }
  /** Create Transaction object array from ITransaction array */
  static createTransactionListFromResponse(transactionList: TransactionListResponse): Transaction[] {
    return transactionList.items.map(txn => {
      return this.createTransactionFromResponse(txn);      
    });
  }
  /** Create Transaction object from ICategory object */
  static createTransactionFromResponse(txnResp: TransactionResponse): Transaction {
    if (txnResp.categorisations.items.length > 0 && !txnResp.categorisations.primaryCategory) {
      throw `Transaction ${txnResp.id} does not not contain a primaryCategory, and category parsing has not been implemented yet.`;
    }
    if (txnResp.categorisations.primaryCategory) {
      let cty = txnResp.categorisations.primaryCategory;
      var category = Category.createCategoryFromResponse(cty, true);
    }
    let typeMultiplier = txnResp.flow === 'CREDIT' ? 1 : -1;
    let txnData: TransactionShape = {
      id: txnResp.id,
      title: txnResp.description,
      description: txnResp.description,
      accountId: txnResp.accountId,
      amount: txnResp.amount,
      type: txnResp.flow === 'CREDIT' ? TransactionType.Credit : TransactionType.Debit,
      dateTransacted: new Date(txnResp.date), 
      isManual: false,
    };
    let _transactionResponse = txnResp;
    return new Transaction(txnData, { category }, { _transactionResponse });
  }
  /**
   * 
   * 
   * @static
   * @param {TransactionRuleResponse} txnResp 
   * @returns {Transaction} 
   * @todo Currency codes, category lazy loading, flow
   * @see {@link https://opicagroup.atlassian.net/wiki/display/OP1/Post-prototype+remediation+list}
   * @memberOf Transaction
   */
  static createTransactionFromRuleResponse(txnResp: TransactionRuleResponse): Transaction {
    let txnData: TransactionShape = {
      id: txnResp.transactionId,
      description: txnResp.displayDescription,
      amount: txnResp.displayAmount.amount,
      type: txnResp.flow === 'CREDIT' ? TransactionType.Credit : TransactionType.Debit,      
      dateTransacted: new Date(txnResp.date), 
      isManual: false,
    };
    let _transactionRuleResponse = txnResp;
    return new Transaction(txnData, { _transactionRuleResponse });
  }
}