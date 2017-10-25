import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { Account, AccountShape } from '../../../screens/accounts/shared/account.model';
import { SavingsGoal } from '../../../screens/goal-centre/shared/savings-goal.model';
import { AccountResponse, AccountListResponse } from '../../data/account/account-response';
import { History, HistoryDataPoint } from '../../../screens/misc/shapes/history';
import { Institution, InstitutionShape } from '../../../screens/onboarding/shared/institution.model';
import { InstitutionSelectionResponse } from '../../data/institution/institution-response';
import { StateChangeResponse } from '../../data/shared/state-change-response';
import { TimeScaleType } from '../../../core/data/shared/constant-types';
import { ACCOUNTS, BALANCES } from '../../data/account/mock-accounts';
import { ASSETS, PROPERTY_ASSETS } from '../../data/asset/mock-assets';
import { FINANCIAL_INSTITUTIONS } from '../../data/institution/mock-institutions';
import { TRANSACTIONS_DAILY, TRANSACTION_CATEGORIES_DAILY } from '../../data/transaction/mock-daily-transactions';

@Injectable()
export class AccountMockService {

  private showHelpTip: boolean = true;
  constructor() {}

  getAccounts(): Promise<Account[]> {
    return Promise.resolve(new Array<Account>());     // Empty test
    // return Promise.resolve(ACCOUNTS.map(ac => {
    //   let institution = new Institution(FINANCIAL_INSTITUTIONS.find(i => i.id === ac.institutionId));
    //   return new Account(ac, { institution });
    // }));
  }

  getAccount(id: number): Promise<Account> {
    let institution = new Institution(FINANCIAL_INSTITUTIONS.find(i => i.id === id));
    return Promise.resolve(new Account(ACCOUNTS.find(ac => ac.id === id), { institution }));
  }

  getAccountBalanceHistory(id: number, regularity: TimeScaleType = TimeScaleType.Weekly): Promise<History> {
    if (regularity === TimeScaleType.Weekly){
      return Promise.resolve(BALANCES['Weekly']);
    }
    if (regularity === TimeScaleType.Daily){
      return Promise.resolve(BALANCES['Daily']);
    }
  }

  updateAccount(accountDelta: any): Promise<StateChangeResponse> {
    // Note: only field that can be updated is `nickname`
    return Promise.resolve({ success: true, id: 2 });
  }

  getShowHelpTip(): Promise<boolean> {
    return Promise.resolve(this.showHelpTip);
  }
  updateShowHelpTip(value: boolean): Promise<StateChangeResponse> {
    this.showHelpTip = value;
    return Promise.resolve({ success: true });
  }

}