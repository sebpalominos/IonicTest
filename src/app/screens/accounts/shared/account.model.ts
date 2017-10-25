import { AccountResponse, AccountListResponse } from '../../../core/data/account/account-response';
import { Asset, AssetShape } from '../../assets/shared/asset.model';
import { AssetClass } from '../../assets/shared/asset-type';
import { Institution, InstitutionShape } from '../../onboarding/shared/institution.model';
import { InstitutionSelectionResponse, ProviderStatusResponse } from '../../../core/data/institution/institution-response';
import { AccountMapper } from '../../../core/data/account/account-mapper';

// This is stuff taken from the Proviso JSON extract
export interface AccountShape {
  id: number;     // OPICA internal ID
  institutionId: number;
  institution?: InstitutionShape;
  name: string;
  nickname?: string;     // Name assigned by user on OPC
  holder?: string;   // If it's a joint account, then what?
  bsb?: string;
  accountNumber?: string;
  dateLastRefreshed?: Date;
  balanceId?: number;
  balance?: AssetShape;
  projectedEndOfMonthBalanceId?: number;
  projectedEndOfMonthBalance?: AssetShape;
  type?: string;      // This is likely to be an OPICA scheme 
  currencyCode?: string;
  isSyncing: boolean;
  isDisconnected: boolean;
}

export class SyncingAccount implements AccountShape {
  id: number;     // OPICA internal ID
  name: string;
  institutionId: number;
  institution: Institution;
  origin?: string;
  readonly isSyncing: boolean = true;
  readonly isDisconnected: boolean = false;
  constructor(...shapes: Partial<AccountShape>[]) {
    Object.assign(this, ...shapes);
  }
  /** Get the best available FI name */
  institutionName(): string {
    return this.institution && (this.institution.commonName || this.institution.name);
  }
  static createSyncingAccountListFromResponse(pendingAccountList: AccountResponse[], instos: Institution[]): SyncingAccount[] {
    return pendingAccountList.map(ac => {
      let institution = instos.find(i => i.id === ac.providerId);
      return this.createPendingAccountFromResponse(ac, institution);
    });
  }
  static createPendingAccountFromResponse(account: AccountResponse, institution: Institution): SyncingAccount {
    return new SyncingAccount({
      id: null,
      institutionId: account.providerId,
      name: account.name,
    } as Partial<AccountShape>, { institution });
  }
}

abstract class KeepsAccountResponse {
  _accountResponse: AccountResponse;
}

export class Account extends KeepsAccountResponse implements AccountShape {
  id: number;
  name: string;
  nickname?: string;
  holder: string; 
  bsb: string;
  accountNumber: string;
  dateLastRefreshed: Date;
  type?: string;
  currencyCode?: string;
  balanceId?: number;
  balance?: Asset;
  projectedEndOfMonthBalanceId?: number;
  projectedEndOfMonthBalance?: Asset;
  institutionId: number;
  institution?: Institution;
  isDisconnected: boolean;
  isSyncing: boolean;
  constructor(...shapes: Partial<AccountShape & KeepsAccountResponse>[]) {
    super();
    Object.assign(this, ...shapes);
  }
  /** Get the best available account name */
  preferredName(): string {
    return this.nickname || this.name;
  }
  /** Get the best available FI name */
  institutionName(): string {
    return this.institution && (this.institution.commonName || this.institution.name);
  }
  /** Calculate a friendly-lookign type name */
  typeName(): string {
    return this.type 
      ? AccountMapper.parseAccountTypeName(this.type)
      : 'Account';
  }
  /** Zips account data with financial institution to return list of Account objects */
  static createListFromResponse(accountList: AccountListResponse, instos: Institution[], instoStatusList?: ProviderStatusResponse[]): Account[] {
    return accountList.allAccounts.map(ac => {
      let institution = instos.find(i => i.id === ac.providerId);
      let instoStatus = instoStatusList ? instoStatusList.find(is => is.providerInternalId === ac.providerId) : null;
      return this.createFromResponse(ac, institution, instoStatus);
    });
  }
  /** Zips account data with financial institution to return a complete Account object */
  static createFromResponse(accountResp: AccountResponse, institution: Institution, instoStatus?: ProviderStatusResponse): Account {
    let _accountResponse = accountResp;
    let balance: Asset = new Asset({
      id: accountResp.id,
      assetClass: AssetClass.Cash,
      currentValue: accountResp.balance,
      currentValueDate: new Date(accountResp.refreshedTo)
    });
    let now = new Date();
    if (accountResp.projectedEndOfMonthBalance) {
      var projectedEndOfMonthBalance: Asset = new Asset({
        id: accountResp.id,
        assetClass: AssetClass.Cash,
        currentValue: accountResp.projectedEndOfMonthBalance.amount,
        currentValueDate: new Date(now.getFullYear(), now.getMonth() + 1, 1),
        future: true,
      });
    }
    return new Account({
      id: accountResp.id,
      institutionId: accountResp.providerId,
      bsb: 'xxxxxx',
      accountNumber: 'xxxxxxxx',
      holder: '',
      name: accountResp.name,
      type: accountResp.productType,
      currencyCode: accountResp.currency,
      dateLastRefreshed: new Date(accountResp.refreshedTo),
      isDisconnected: instoStatus && instoStatus.lastRefreshStatus === 'REENTER_CREDENTIALS',
    } as Partial<AccountShape>, { institution, balance, projectedEndOfMonthBalance }, { _accountResponse });
  }
}