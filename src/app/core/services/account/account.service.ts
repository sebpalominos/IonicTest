import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { InsightsHttpService } from '../insights-http/insights-http.service';
import { Storage } from '@ionic/storage';

import { Account, SyncingAccount } from '../../../screens/accounts/shared/account.model';
import { AccountLocalInfo } from '../../../screens/accounts/shared/account-data-maps';
import { AccountResponse, AccountListResponse, AccountReferenceDataResponse } from '../../data/account/account-response';
import { AccountListDisabled } from '../../data/account/account-list-disabled';

import { TransactionKpiListResponse } from '../../data/transaction/transaction-response';
import { AccountStats } from '../../data/account/account-stats';
import { Institution } from '../../../screens/onboarding/shared/institution.model';
import { InstitutionService } from '../institution/institution.service';
import { StateChangeResponse } from '../../data/shared/state-change-response';
import { TransactionService } from '../transaction/transaction.service';
import { TransactionMetric } from '../../../screens/transactions/shared/transaction-metric.model';

@Injectable()
export class AccountService {
  accountsMetadata: { [accountId: number]: AccountLocalInfo }
  constructor(
    protected http: InsightsHttpService,
    protected storage: Storage,
    protected transactionService: TransactionService,
    protected institutionService: InstitutionService,
  ) {}
  /**
   * Returns a set of stats about the user's bank accounts
   * @returns {Promise<AccountStats>} 
   * @memberof AccountService
   */
  getAccountStats(): Promise<AccountStats> {
    let endpoint = ['external-accounts'];
    return this.http.get(endpoint).map(resp => resp.json()).toPromise().then((accountsResp: AccountListResponse) => {
      // Todo: Derive the connected/disconnected/syncing numbers properly. For now just return some kinda number
      // let activeAccounts = accounts.filter(ac => !ac.isSyncing) as Account[];
      // let connectedAccounts = activeAccounts.filter(ac => !ac.isDisconnected) as Account[];
      // let disconnectedAccounts = activeAccounts.filter(ac => ac.isDisconnected) as Account[];
      // let syncingAccounts = accounts.filter(ac => ac.isSyncing) as SyncingAccount[];
      return {
        netWorth: accountsResp.balances.overallBalance.amount,
        numActiveAccounts: accountsResp.allAccounts.length,
        numConnectedAccounts: accountsResp.allAccounts.length,
        numDisconnectedAccounts: 0,      // Todo: Derive this properly
        numSyncingAccounts: 0,      // Todo: Derive this properly
        numInstitutions: accountsResp.connectorSiteSummaries.length,      // There is one site summary per insto
      } as AccountStats;
    });
  }
  /**
   * All accounts for the authenticatServer errored user
   * @returns {Promise<Account[]>} 
   * @memberOf AccountService
   */
  getAccounts(): Promise<Account[]> {
    let endpoint = ['external-accounts'];
    let retrieveAccountsPromise: Promise<AccountListResponse> = this.http.get(endpoint).map(resp => resp.json()).toPromise();
    let retrieveDisplayOrderPromise: Promise<number[]> = this.storage.get('accounts.listDisplayOrder');
    // .catch(err => {
    //   console.log('This went straight to catch');
    //   console.log(err);
    // });
    return Promise.all([
      retrieveAccountsPromise,
      retrieveDisplayOrderPromise
    ]).then((results: any[]) => {
      let accountListData: AccountListResponse = results[0];
      let displayOrder: number[] = results[1];
      return this.institutionService.getKnownInstitutions().then(instos => {
        // ================================================================
        // Separate "pending" accounts from established accounts
        // And insert more future conditions here...
        let syncingAccountsListData = accountListData.allAccounts.filter(ac => {  
          let siteSummary = accountListData.connectorSiteSummaries.find(ss => {
            return ss.providerInternalSlug === ac.providerSlug || ss.providerInternalId === ac.providerId;    // But Cormac reckons just slug is OK
          });
          let accountNotInSiteSummaries = siteSummary == null;
          let accountStatusNeverRefreshed = siteSummary && (
            siteSummary.lastRefreshStatus === null      // TBC: a new enum value of 'NEVER_REFRESHED' will be added at a later date. Check for that as well.
          );
          return accountNotInSiteSummaries || accountStatusNeverRefreshed;
        });
        // Then, remove pending accounts from main data list
        let syncingAccounts = SyncingAccount.createSyncingAccountListFromResponse(syncingAccountsListData, instos);
        syncingAccountsListData.forEach(pa => accountListData.allAccounts.splice(accountListData.allAccounts.indexOf(pa), 1));
        // ================================================================
        // Create data models from response data (i.e. accounts that didn't get spliced out)
        let instoStatusList = accountListData.connectorSiteSummaries;
        let accounts = Account.createListFromResponse(accountListData, instos, instoStatusList);
        if (displayOrder && displayOrder.length) {
          // Sort in-place, compare to position in displayOrder list
          accounts.sort(compareAccounts.bind(this, displayOrder));
        }
        // ================================================================
        return Array.prototype.concat(accounts, syncingAccounts) as Account[];
      });
    }).catch(err => {
      // The Promise.all() failed because something inside failed.
      console.error(err);
      return null;
    });
    function compareAccounts(displayOrder, a, b) {
      let aIndex = displayOrder.findIndex(order => a.id === order);
      let bIndex = displayOrder.findIndex(order => b.id === order);
      if (aIndex >= 0 && bIndex >= 0) {
        if (aIndex > bIndex) {
          return 1;
        }
        if (aIndex > bIndex) {
          return -1;
        }
        return 0;
      }
      return 0;
    }
  }
  /**
   * A particular account based on ID for the authenticated user
   * TODO: Return the institution as well.
   * @param {number} id 
   * @returns {Promise<Account>} 
   * @memberOf AccountService
   */
  getAccount(id: number): Promise<Account> {
    let endpoint = ['external-accounts', String(id)];
    return this.http.get(endpoint).map(resp => resp.json()).toPromise().then((accountData: AccountResponse) => {
      return Account.createFromResponse(accountData, new Institution({ name: 'To be implemented' }));
    });
  }
  /**
   * Remove an account
   * @todo Currently it will come back when the refresh from Proviso occurs
   * @param {number} id 
   * @returns {Promise<StateChangeResponse>} 
   * @memberof AccountService
   */
  removeAccount(id: number): Promise<StateChangeResponse> {
    let endpoint = ['external-accounts', String(id)];
    return this.http.delete(endpoint).toPromise().then(resp => {
      // console.log('removeAccount', resp);
      return {success: resp.ok};
    })
    // return Promise.resolve(<StateChangeResponse>{success: true});
  }

  getDisabledAccounts() {
    let endpoint = ['external-accounts','connected-sites-summary'];
    return this.http.get(endpoint).map(resp => resp.json()).toPromise();
  }

  reenableAccount(payload){
    let endpoint = ['external-accounts', 'reenable-connected-account'];
    return this.http.post(endpoint, payload).map(resp => resp.json()).toPromise();
  }
  /**
   * The different types of items available
   * https://34.249.211.199/api/external-accounts/productTypes
   * @returns {Promise<string[]>} 
   * @memberOf AccountService
   */
  getAccountTypes(): Promise<string[]> {
    let endpoint = ['external-accounts', 'productTypes'];
    return this.http.get(endpoint).map(resp => {
      return resp.json();
    }).toPromise().then((accountTypes: AccountReferenceDataResponse) => {
      return accountTypes.items;    // These should be string[]
    });
  }
  /**
   * Get information on the completion rate of categorisation
   * @desc Use the 'KPIs' endpoint to get stats on what's already categorised
   * @param {number} [accountId] 
   * @returns {Promise<TransactionMetric>} 
   * 
   * @memberof TransactionService
   */
  getCategorisationMetric(accountId: number): Promise<TransactionMetric> {
    let endpoint = ['transactions', 'kpis'];
    let payload = {
      ACCOUNT: [{ id: accountId }]
    };
    return this.http.post(endpoint, payload).toPromise().then(resp => {
      let body: TransactionKpiListResponse = resp.json();
      let list = TransactionMetric.createTransactionMetricListFromResponse(body);
      return list.find(metric => metric.identifier === 'CATEGORISATION_RATE_IN_PERSPECTIVE');
    });
  }
  /**
   * Sets the display order for account IDs
   * @param {number[]} order - Account IDs in order of desired display
   * @returns {Promise<boolean>} 
   * @memberof AccountService
   */
  setAccountDisplayOrder(order: number[]): Promise<boolean> {
    return this.storage.set('accounts.listDisplayOrder', order).then(resp => {
      console.log(`Account display order was set to ${JSON.stringify(resp)}`);
      return true;
    })
  }
  /**
   * Retrieve locally stored metadata for this account entry
   * @param {number} id 
   * @returns {Promise<{ [key: string]: any }>} 
   * @memberof AccountService
   */
  getAccountLocalInformation(id: number, forceRefresh?: boolean): Promise<AccountLocalInfo> {
    if (this.accountsMetadata && !forceRefresh) {
      return Promise.resolve<AccountLocalInfo>(this.accountsMetadata[id]);
    }
    else {
      return this.storage.get('accounts.localInfo').then(resp => {
        let localInfo = resp || {};
        this.accountsMetadata = localInfo;
        return localInfo[id];
      }); 
    }
  }
  /**
   * Set local metadata for this account entry
   * @param {number} id 
   * @param {{ [key: string]: any }} addInfo 
   * @param {string[]} [removeInfo] 
   * @returns {Promise<boolean>} 
   * 
   * @memberof AccountService
   */
  setAccountLocalInformation(id: number, addInfo: Partial<AccountLocalInfo>, removeInfo?: string[]): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.getAccountLocalInformation(id).then(resp => {
        let localInfo = resp || {};
        localInfo[id] = localInfo[id] || {};
        // Remove, before adding. 
        if (removeInfo) {
          removeInfo.forEach(keyName => delete localInfo[id][keyName]);
        }
        if (addInfo) {
          localInfo[id] = Object.assign(localInfo[id], addInfo);
        }
        this.storage.set('accounts.localInfo', localInfo).then(resp => {
          this.accountsMetadata = localInfo;
          resolve(true);
        });
      })
    });
  }
  /**
   * Determine if the user has any accounts
   * @returns {Promise<boolean>} 
   * @memberof AccountService
   */
  hasAccounts(): Promise<boolean> {
    return this.getAccounts().then(accounts => {
      return accounts.length > 0;
    }).catch(err => {
      console.error(err);
      return false;
    });
  }
}