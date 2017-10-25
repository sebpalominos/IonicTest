import { NgModule } from '@angular/core';
import { IonicModule } from 'ionic-angular';
import { SharedModule } from '../../shared/shared.module';
import { TruncateModule } from 'ng2-truncate';

import { UserProfileComponent } from './user-profile/user-profile.component';
import { AccountSettingsComponent } from './account-settings/account-settings.component';

@NgModule({
  declarations: [ 
    UserProfileComponent,
    AccountSettingsComponent
  ],
  imports: [
    IonicModule,
    SharedModule,
    TruncateModule
  ],
  exports: [ 
    UserProfileComponent,
    AccountSettingsComponent
  ],
  entryComponents: [ 
    UserProfileComponent,
    AccountSettingsComponent
  ]
})
export class UserModule {}
