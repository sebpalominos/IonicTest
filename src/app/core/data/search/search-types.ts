export type SearchResult = {
  screen: keyof SearchNavigableScreens;
  params?: any;
  icon: { type: 'ion-icon'|'opc-icon'; name: string; set?: string; };
  nameLabel: string;      // probably bind as innerHTML
  typeLabel: string;      // bind to an ion-note right
  matchCoefficient?: number;    // A really shitty way of ranking results
};
export interface SearchNavigableScreens {
  category: any;
  suggestion: any;
  account: any;
  accountList: any;
  profile: any;
  goalCentre: any;
  goal: any;
  categoryList: any;
  notificationList: any;
  propertyCentre: any;
  transactionList: any;
}
export type SearchResultMatchCoefficient = {
  matchCoefficient: number;
  item: any; 
}