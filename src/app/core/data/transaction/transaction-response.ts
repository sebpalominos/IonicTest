import { AccountShape } from '../../../screens/accounts/shared/account.model';
import { CategoryShape } from '../../../screens/categories/shared/category.model';
import { TransactionShape } from '../../../screens/transactions/shared/transaction.model';
import { CategoryResponse, CategoryListResponse } from '../category/category-response';
import { TransactionCategoryListResponse } from '../category/category-response';

export type TransactionRuleInformerResponse = {
  items: Array<{
    supersedingTransaction: TransactionRuleResponse;
    supersededTransactions: TransactionRuleResponse[];
    applyRule: boolean;
  }>;
  empty: boolean;
};
export type TransactionKpiListResponse = {
  items: TransactionKpiResponse[];
};

export interface TransactionPerspectiveResponse {
  collectedSettings: {
    items: Array<{
      type: string;
      active: boolean;
      items: any[];
    }>;
  };
}
export interface TransactionListResponse {
  items: TransactionResponse[];
  // transactions: TransactionShape[];
  // categories?: CategoryShape[];
  // accounts?: AccountShape[];
}
export interface TransactionResponse {
  // transaction: TransactionShape;
  // categories?: CategoryShape[];
  // account?: AccountShape;
  id: number;
  accountId: number;
  recurrenceId: number;
  date: number;
  type: string;
  status: string;
  flow: 'DEBIT'|'CREDIT';
  amount: number;
  currencyCode: string;
  description: string;
  categorisations: TransactionCategoryListResponse;
  valid: boolean;
};
export interface TransactionRuleResponse {
  transactionId: number;
  categoryId: number;
  displayDescription: string;
  displayAmount: {
    currencyCode: string;
    amount: number;
  };
  date: number;
  flow: 'DEBIT'|'CREDIT';
}
export interface TransactionUpdateCategoryResponse {
  done: boolean;
  transactions: {
    items: TransactionResponse[];
  };
  saveAsRuleInformer: TransactionRuleInformerResponse;
}
export interface TransactionKpiResponse {
  identifier: string;
  content: {
    perspective: TransactionPerspectiveResponse;
    numberCategorised: number;
    numberUncategorised: number;
    total: number;
    rate: number;
    dataType: string;
  };
  label: string;
  dataType: string;
}
