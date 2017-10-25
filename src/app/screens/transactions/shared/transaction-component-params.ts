import { TransactionShape } from './transaction.model';
import { TransactionCategorisationResultInfo, TransactionRuleInformerResponse } from './transaction-data-maps';
import { Category, CategoryShape } from '../../categories/shared/category.model';
import { StateChangeResponse } from '../../../core/data/shared/state-change-response';

// Namespace for action mappings/messaging between screen
export namespace TransactionComponentParams {
  export interface ApplyCategoryResult {
    cancelled?: boolean;
    lastAction?: Promise<StateChangeResponse>;
    similarTransactions?: TransactionShape[];
    numSelectedTransactions: number;
    category: CategoryShape;
  }
  export interface SimilarCategoryComponentParams {
    category: Category;
    supersedingGroups: SupersedingGroupResult;
    ruleResult: TransactionRuleInformerResponse;
  }
  export interface SupersedingGroupResult {
    superseding: TransactionShape;
    superseded: TransactionShape[];
  }
}