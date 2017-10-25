import { Currency } from '../shared/currency';
import { ProviderStatusResponse } from '../institution/institution-response';
import { AccountShape } from '../../../screens/accounts/shared/account.model';
import { InstitutionShape } from '../../../screens/onboarding/shared/institution.model';
import { AssetShape } from '../../../screens/assets/shared/asset.model';
import { CategoryShape } from '../../../screens/categories/shared/category.model';
import { TransactionShape } from '../../../screens/transactions/shared/transaction.model';

export interface AccountListResponse {
  allAccounts: AccountResponse[];
  connectorSiteSummaries: ProviderStatusResponse[];
  balances: {
    overallBalance: Currency;
  };
}
// export interface AccountResponse {
//   account: AccountShape;
//   financialInstitution: InstitutionShape;
//   asset: AssetShape;
//   accountGoal?: AccountGoalShape;
// }

export interface AccountResponse {
  classIdentifier: string;        // ?
  id: number;
  productType: string;        // Should be refdata or enum
  productId: number;     // Guessing it's a number? Could possibly be a string       
  providerId: number;          // providerID of bank
  providerSlug: string;     // slug_value_if_any
  providerName: string;     // Name of bank
  name: string;            // Name of bank account
  currency: string;       // This is probably the 3-digit ISO code
  balance: number;        //decimal
  refreshedTo: number;        // this is supposed to be a date though
  projectedLowTilEndOfMonth: {
    date: number;       // should be a datetime
    value: Currency;
    dataType: string;       // e.g. "BALANCE", should be an enum
  };
  projectedEndOfMonthBalance: Currency;
  connected: string;            // Currently something like "NO", should be boolean?
}
export interface AccountReferenceDataResponse {
  items: any[];
}

// Looks like the mortgage account response is fundamentally different
// to account response
export interface MortgageAccountResponse {
  id: number;
  months: number;
  description: string;
  currencyCode: string;
  productId: number;
  providerId: number;
  startDate: number;
  switchingProductId: number;
  accountType: 'MORTGAGE';        // or what else?
  targetRepaymentValue: Currency;
  actualMonthlyDeposit: Currency;
  minimumMonthlyDeposit: Currency;
  statisticalBalance: Currency;
  statedMonthlyDeposit: Currency;
  statedInitialBalance: Currency;
  debtLevel: Currency;
  targetBalance: Currency;
  currentBalance: Currency;
  currentRepayment: Currency;
  statedMonthlyWithdrawals: Currency;
  minimumRepayment: Currency;
  debtLevelEditable: boolean;
  interestRate: number;
  risk: number;
}