import { NgModule } from '@angular/core';
import { IonicModule } from 'ionic-angular';
import { SharedModule } from '../../shared/shared.module';

import { AccountsComponent } from './accounts.component';
import { AccountComponent } from './account/account.component';
import { DisabledAccountsComponent } from './disabled-accounts/disabled-accounts.component';
import { EditAccountComponent } from './edit-account/edit-account.component';
import { AccountTopTransactionsComponent } from './shared/account-top-transactions/account-top-transactions.component';
import { AccountsLoadingComponent } from './shared/accounts-loading/accounts-loading.component';

@NgModule({
  declarations: [ 
    AccountsComponent, 
    AccountComponent,
    DisabledAccountsComponent,
    EditAccountComponent,
    AccountTopTransactionsComponent,
    AccountsLoadingComponent
  ],
  imports: [
    IonicModule,
    SharedModule
  ],
  exports: [ 
    AccountsComponent, 
    AccountComponent,
    EditAccountComponent,
    DisabledAccountsComponent
  ],
  entryComponents: [ 
    AccountsComponent, 
    AccountComponent,
    EditAccountComponent,
    DisabledAccountsComponent
  ],
})
export class AccountsModule {}
