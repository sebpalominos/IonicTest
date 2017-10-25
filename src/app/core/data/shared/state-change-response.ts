// A state-change response is returned from the service to the component
// whenever a create update or delete takes place

export interface StateChangeResponse {
  success: boolean;
  id?: number | string;
  ids?: Array<number|string>;
  numChanged?: number;
  error?: any;
  data?: any;
};