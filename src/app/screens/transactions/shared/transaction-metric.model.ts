import { TransactionKpiResponse, TransactionKpiListResponse } from '../../../core/data/transaction/transaction-response';

export interface TransactionMetricShape {
  identifier: string;
  numberCategorised: number;
  numberUncategorised: number;
  total: number;
  percentage: number;
}
export class TransactionMetric implements TransactionMetricShape {
  identifier: string;
  numberCategorised: number;
  numberUncategorised: number;
  total: number;
  percentage: number;
  constructor(...shapes: Partial<TransactionMetricShape>[]) {
    Object.assign(this, ...shapes);
  }
  static createTransactionMetricListFromResponse(resp: TransactionKpiListResponse): TransactionMetric[] {
    return resp.items.map(item => this.createTransactionMetricFromResponse(item));
  }
  static createTransactionMetricFromResponse(resp: TransactionKpiResponse): TransactionMetric {
    return new TransactionMetric(<TransactionMetricShape>{
      identifier: resp.identifier,
      numberCategorised: resp.content.numberCategorised,
      numberUncategorised: resp.content.numberUncategorised,
      total: resp.content.total,
      percentage: Math.round(resp.content.rate * 100)
    });
  }
}