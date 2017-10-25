import { NgModule } from '@angular/core';
import { IonicModule } from 'ionic-angular';
import { Keyboard } from '@ionic-native/keyboard';
import { SharedModule } from '../../shared/shared.module';

import { AuthModalComponent } from './auth-modal/auth-modal.component';
import { ImmortalLoginComponent } from './immortal-login/immortal-login.component';
import { LoginComponent } from './login/login.component';
import { LoginHelpComponent } from './login-help/login-help.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { PinEntryComponent } from './pin-entry/pin-entry.component';
import { PinEntryPlaceholderComponent } from './pin-entry-placeholder/pin-entry-placeholder.component';
import { FinishedFingerprintComponent } from './finished-fingerprint/finished-fingerprint.component';

@NgModule({
  declarations: [
    AuthModalComponent,
    ImmortalLoginComponent,
    LoginComponent,
    LoginHelpComponent,
    ChangePasswordComponent,
    ForgotPasswordComponent,
    PinEntryComponent,
    PinEntryPlaceholderComponent,
    FinishedFingerprintComponent
  ],
  imports: [
    IonicModule,
    SharedModule
  ],
  exports: [
    AuthModalComponent,
    ImmortalLoginComponent,
    LoginComponent,
    LoginHelpComponent,
    ChangePasswordComponent,
    ForgotPasswordComponent,
    PinEntryComponent,
    PinEntryPlaceholderComponent,
    FinishedFingerprintComponent
  ],
  entryComponents: [
    AuthModalComponent,
    ImmortalLoginComponent,
    LoginComponent,
    LoginHelpComponent,
    ChangePasswordComponent,
    ForgotPasswordComponent,
    PinEntryComponent,
    PinEntryPlaceholderComponent,
    FinishedFingerprintComponent
  ],
  providers: [
    Keyboard
  ]
})
export class AuthModule {}