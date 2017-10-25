export interface Cache {
  dateLastRetrieved?: Date;
  ttl?: number;
  expires?: Date;
  data: any;
  dataExpiry?: any[];
}