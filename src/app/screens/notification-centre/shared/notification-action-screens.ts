import { AccountComponent } from '../../accounts/account/account.component';
import { CategoryComponent } from '../../categories/category/category.component';
import { TransactionComponent } from '../../transactions/transaction/transaction.component';
import { PropertyComponent } from '../../property-centre/property/property.component';
import { ConnectionModalComponent } from '../../onboarding/connection-modal/connection-modal.component';

export interface ActionableScreens {
  account: any;
  transaction: any;
  category: any;
  property: any;
  connection: any;
  reconnection: any;
}
export const ACTIONABLE_SCREENS: ActionableScreens = {
  account: AccountComponent,
  transaction: TransactionComponent,
  category: CategoryComponent,
  property: PropertyComponent,
  connection: ConnectionModalComponent,
  reconnection: ConnectionModalComponent,
};