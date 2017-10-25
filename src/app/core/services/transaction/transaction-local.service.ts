import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';

import { Transaction } from '../../../screens/transactions/shared/transaction.model';

@Injectable()
export class TransactionLocalService {
  constructor(
    protected storage: Storage
  ) {}
  getCategoryIgnoredTransactions(): Promise<number[]> {
    return this.storage.get('transactions.categoryIgnored').then(storedTransactionIds => {
      return storedTransactionIds || [];
    });
  }
  clearCategoryIgnoredTransactions(): Promise<boolean> {
    return this.storage.set('transactions.categoryIgnored', null);
  }
  setCategoryIgnoredTransaction(transaction: Transaction): Promise<boolean> {
    return this.storage.get('transactions.categoryIgnored').then(storedTransactionIds => {
      let transactionIds: number[] = storedTransactionIds || [];
      if (transactionIds.indexOf(transaction.id as number) < 0) {
        transactionIds.push(transaction.id as number);
      }
      return this.storage.set('transactions.categoryIgnored', transactionIds);
    });
  }
}