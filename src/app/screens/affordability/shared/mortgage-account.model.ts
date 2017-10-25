import { MortgageAccountResponse } from '../../../core/data/account/account-response';

// NOTE: This mortgage account entity is fundamentally differnt to the account object. 
// In future the should be somewhat merged together; however right now, this object is
// mainly used as a vehicle for displaying various mortgage-related costs.

export interface MortgageAccountShape {
  id: number;
  months: number;
  description: string;
  productId: number;
  providerId: number;
  startDate: Date;
  switchingProductId: number;
  currentRepayment: number;
  currentBalance: number;
  interestRate: number;
  interestRateLastUpdated: Date;    // TODO. Currently backed does not account for this.
  // Todo: Add all the other currency values. Not important right now though. 
}
abstract class KeepsMortgageAccountResponse {
  _mortgageAccountResponse: MortgageAccountResponse;
}
export class MortgageAccount extends KeepsMortgageAccountResponse implements MortgageAccountShape {
  id: number;
  months: number;
  description: string;
  productId: number;
  providerId: number;
  startDate: Date;
  switchingProductId: number;
  currentRepayment: number;
  currentBalance: number;
  interestRate: number;
  interestRateLastUpdated: Date;
  constructor(...shapes: Partial<MortgageAccountShape & KeepsMortgageAccountResponse>[]) {
    super();
    Object.assign(this, ...shapes);
  }
  displayName(): string {
    return this.description || 'Mortgage';
  }
  static createFromResponse(resp: MortgageAccountResponse): MortgageAccount {
    let _mortgageAccountResponse = resp; 
    return new MortgageAccount(<MortgageAccountShape>{
      id: resp.id,
      months: resp.months,
      description: resp.description,
      productId: resp.productId,
      providerId: resp.providerId,
      startDate: new Date(resp.startDate),
      switchingProductId: resp.switchingProductId,
      currentRepayment: resp.currentRepayment && resp.currentRepayment.amount,
      currentBalance: resp.currentBalance && resp.currentBalance.amount,
      interestRate: resp.interestRate
    }, { _mortgageAccountResponse });
  }
}