import { PerspectiveResponse } from '../../data/shared/perspective-response';
import { Currency } from '../../data/shared/constant-types';

export type CashflowListResponse = {
  // lastSixMonthsAvgIncome: CashflowResponse;
  // lastSixMonthsAvgExpenditure: CashflowResponse;
  // lastMonthExpenditure: CashflowResponse;
  // lastMonthIncome: CashflowResponse;
  [ keyName: string ]: CashflowResponse;
};
export interface CashflowResponse {
  identifier: string;
  perspective: PerspectiveResponse;
  flow: 'DEBIT' | 'CREDIT';
  value: Currency;
}