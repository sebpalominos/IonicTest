import { Account, SyncingAccount, AccountShape } from './account.model';
import { InstitutionShape } from '../../onboarding/shared/institution.model';
import { InstitutionColorType } from '../../../core/data/institution/institution-color';
import { DisabledAccountResponse } from '../../../core/data/institution/institution-response';

export type InstitutionAccountMap = {
  institution: InstitutionShape;
  accounts?: AccountShape[];
  syncingAccounts?: AccountShape[];
  colors?: InstitutionColorType;
  colorSchemeClassName?: string;
};
export type AccountTypeMap = {
  typeValue: string|number;
  typeName: string;
  accounts?: AccountShape[];
};
export type AccountInfoMap = {
  account: Account;
  isSyncing: boolean;
  isDisconnected: boolean;
  isReconnectable: boolean;
  order?: number;
  providerId?: number;
  providerSlug?: string;
  isEditing?: boolean;
  isRemoving?: boolean;
  checked?: boolean;
};
export type DisabledAccountsMap = {
  providerName: string;    // The name given by the datasource
  providerInternalSlug: string;
  connector: string;      // This is the datasource e.g. Proviso  
  disabledAccounts: Array<DisabledAccountResponse>;
};
export interface AccountLocalInfo {
  nickname: string;
}