import { Account, AccountShape } from '../../../screens/accounts/shared/account.model';
import { InstitutionAccountMap, AccountTypeMap } from '../../../screens/accounts/shared/account-data-maps';
import { Institution, InstitutionShape }  from '../../../screens/onboarding/shared/institution.model';
import { ACCOUNT_TYPE_NAMES } from '../../../core/data/account/account-types';

export namespace AccountMapper {
  /**
   * Create a map which indexes accounts by their type
   * @static
   * @param {Account[]} accounts 
   * @param {string[]} accountTypes 
   * @returns {AccountTypeMap[]} 
   * @memberOf Mapper
   */
  export function mapAccountsByType(accounts: Account[], accountTypes: string[]): AccountTypeMap[] {
    // Grab all pending accounts and put them into their own category
    return accountTypes.map(typeValue => {
      // Lookup type name and map to a friendly name
      let typeName = parseAccountTypeName(typeValue);
      return <AccountTypeMap> { 
        accounts: accounts.filter(ac => ac.type === typeValue),
        typeValue, 
        typeName, 
      };
    });
  }
  /**
   * Create a map which indexes accounts by the institution to which they belong
   * @static
   * @param {Account[]} accounts 
   * @returns {InstitutionAccountMap[]} 
   * @memberOf Mapper
   */
  export function mapAccountsByInstitution(accounts: Account[]): InstitutionAccountMap[] {
    // Get unique non nulls
    let instos = accounts.map(ac => ac.institution).filter((fi, index, self) => {
      return fi && index === self.map(s => s.id).indexOf(fi.id);
    });
    if (instos.length > 0){
      return instos.map(fi => ({
        institution: fi,
        // colors: INSTITUTION_COLORS.find(ic => ic.slug === fi.slug),      // Use css slug-based classes instead
        colorSchemeClassName: `insto-colorscheme-${fi.slug}`,
        accounts: accounts.filter(account => account.institutionId === fi.id && !account.isSyncing),
        pendingAccounts: accounts.filter(account =>  account.institutionId === fi.id && account.isSyncing),
      } as InstitutionAccountMap));
    }
    else {
      return [{
        accounts: accounts,
        institution: new Institution({ id: 0, name: 'Accounts', slug: '' })
      } as InstitutionAccountMap];
    }
  }
  export function parseAccountTypeName(typeValue: string, nounForm: 'singular'|'plural' = 'singular'): string {
    if (ACCOUNT_TYPE_NAMES.hasOwnProperty(typeValue)) {
      return ACCOUNT_TYPE_NAMES[typeValue][nounForm];      // We want plural names to display on the account list
    }
    else {
      let typeValueLowered: string = typeValue.replace('_', ' ').toLowerCase();
      return `${typeValueLowered.charAt(0)}${typeValueLowered.substring(1)}`;     // Sentence case
    }
  }
}