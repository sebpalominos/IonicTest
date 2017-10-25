import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

import { AccountComponent } from '../../../screens/accounts/account/account.component';
import { CategoryComponent } from '../../../screens/categories/category/category.component';
import { CreateGoalComponent } from '../../../screens/goal-centre/create-goal/create-goal.component';
import { EditGoalComponent } from '../../../screens/goal-centre/edit-goal/edit-goal.component';
import { PropertyComponent } from '../../../screens/property-centre/property/property.component';
import { TransactionComponent } from '../../../screens/transactions/transaction/transaction.component';
// import { AccountListComponent } from '../../../screens/accounts/accounts.component';
// import { Categories } from '../../../screens/categories/categories.component';
// import { PropertyShortlistComponent } from '../../../screens/property-centre/property-shortlist/property-shortlist.component';
// import { PropertySearchComponent } from '../../../screens/property-centre/property-search/property-search.component';
// import { TransactionsComponent } from '../../../screens/transactions/transactions.component';
// import { UserProfileComponent } from '../../../screens/user/user-profile/user-profile.component';

/**
 * == Note for future viewers ==
 * The ScreenService was an experiment which failed due to circular import dependencies. The current 
 * and correct approach is to define, within the fields of the Component class, the other screen components 
 * which may be required. Conventionally, place these screens within a field called `screens` with a type of 
 * `{ [screenName: string]: any }`. 
 */

@Injectable()
export class ScreenService {
  private screenList: ScreenInfo[];
  public screens: {[name: string]: any}
  constructor(){
    // Register all our screens here into this common service
    // Conventionally, our naming system drops the 'Component' suffix
    this.screenList = [
      { name: 'account', label: 'Account', component: AccountComponent },
      { name: 'category', label: 'Category', component: CategoryComponent },
      { name: 'createGoal', label: 'Create Goal', component: CreateGoalComponent },
      { name: 'editGoal', label: 'Edit Goal', component: EditGoalComponent },
      { name: 'property', label: 'Property', component: PropertyComponent },
      { name: 'transaction', label: 'Transaction', component: TransactionComponent },
      // { name: 'accountList', label: 'Accounts', component: AccountListComponent },
      // { name: 'categoryList', label: 'Categories', component: CategoryListComponent },
      // { name: 'notificationCentre', label: 'Notifications', component: NotificationCentreComponent },
      // { name: 'propertyShortlist', label: 'Property Shortlist', component: PropertyShortlistComponent },
      // { name: 'propertySearch', label: 'Property Search', component: PropertySearchComponent },
      // { name: 'transactionList', label: 'Transactions', component: TransactionsComponent },
      // { name: 'userProfile', label: 'User Profile', component: UserProfileComponent }
    ];
    // Create an array to make components easily accessible by other components
    this.screens = Object.freeze(this.screenList.reduce((prev, current) => {
      prev[current.name] = current.component;
      return prev;
    }, {}));
  }
  /** Retrieve a single screen by name */
  get(screenName: string) : ScreenInfo {
    screenName = screenName.charAt(0).toLowerCase() + screenName.substring(1);
    return this.screenList.find(item => item.name === screenName);
  }
  /** Retrieve an array of screens by name if they exist */
  getMany(screenNames: string[]) : ScreenInfo[] {
    return screenNames.map(screenName => this.get(screenName)).filter(item => item === undefined);
  }
}

type ScreenInfo = {
  name: string;     // What is it accessed as
  label: string;    // What label would show up on a menu
  component: any;
  icon?: string;
}