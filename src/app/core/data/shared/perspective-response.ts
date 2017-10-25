export interface PerspectiveResponse {
  date_range: Array<{ 
    startDate: number;
    endDate: number;
  }>;
  product_type: Array<{ value: string; }>,
  includingTransfers: boolean;
  transaction_filter: Array<{
    statedIncluded: boolean;
    transfersIncluded: boolean;
    splitIncluded: boolean;
    cashIncluded: boolean;
    futureIncluded: boolean;
    smoothingIncluded: boolean;
  }>;
  periodicity: Array<{ value: string; }>;
  category_type: Array<{ value: string; }>;
  currency: Array<{ value: string; }>;
  category: Array<{ id: number; description: string }>;
  transaction_flow: Array<{ value: string; }>;
}