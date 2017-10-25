import { Transaction, TransactionShape } from './transaction.model';
import { TransactionResponse, TransactionRuleInformerResponse } from '../../../core/data/transaction/transaction-response';

export enum TransactionType {
  Unknown, 
  Debit = -1,
  Credit = 1
}
export type TransactionMap = {
  tx: Transaction;
  visible: boolean;
  ignored?: boolean;
  selected?: boolean;
};
export type MonthlyTransactionMap = {
  identifier: string;
  name: string;
  visible: boolean;
  transactions: TransactionMap[];
};

/* Categorisation results */
export { TransactionRuleInformerResponse };
export interface TransactionCategorisationResultInfo {
  success: boolean;
  done: boolean;
  supersedingGroups?: any;
  _transactionResponse?: { items: TransactionResponse };    // Might not be needed, as a summary is embedded into RuleInformer
  _ruleInformerResponse?: TransactionRuleInformerResponse;
}