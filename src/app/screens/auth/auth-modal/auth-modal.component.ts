import { Component, ViewChild } from '@angular/core';
import { Platform, NavParams, NavController, ModalController, Events } from 'ionic-angular';
import { Keychain } from '@ionic-native/keychain';

import { AuthModalType, PinEntryType } from '../shared/auth-state';
import { AuthUtils } from '../shared/auth-utils';
import { LoginComponent } from '../login/login.component';
import { ForgotPasswordComponent } from '../forgot-password/forgot-password.component';
import { ChangePasswordComponent } from '../change-password/change-password.component';
import { ImmortalLoginComponent } from '../immortal-login/immortal-login.component';
import { PinEntryComponent } from '../pin-entry/pin-entry.component';
import { PinEntryPlaceholderComponent } from '../pin-entry-placeholder/pin-entry-placeholder.component';
import { ConnectionModalComponent } from '../../onboarding/connection-modal/connection-modal.component';
import { OnboardingService } from '../../../core/services/onboarding/onboarding.service';

@Component({
  selector: 'modal-auth',
  template: `
    <ion-nav #authNav></ion-nav>
  `
})
export class AuthModalComponent {
  @ViewChild('authNav') nav: NavController;
  _isModal: boolean;
  get isModal(): boolean {
    return !!this._isModal;
  }
  constructor(
    protected platform: Platform,
    protected keychain: Keychain,
    protected params: NavParams,
    protected modalCtrl: ModalController,
    protected events: Events,
    protected onboardingService: OnboardingService
  ) {}
  ionViewWillEnter() {
    if (this.params.get('isModal')) {
      this._isModal = !!this.params.get('isModal');
    }
  }
  ionViewDidEnter() {
    this.routeView();
  }
  ionViewDidLeave() {
    this.checkTriggerOnboarding();
  }
  checkTriggerOnboarding() {
    this.onboardingService.getStatus().then(status => {
      if (status.hasCompletedFirstRun) {
        let modal = this.modalCtrl.create(ConnectionModalComponent);
        modal.present();
        modal.onDidDismiss(() => {
          this.onboardingService.setStatus({ hasCompletedFirstRun: true });
        });
        // let captureProfileModal = this.modalCtrl.create(CaptureProfileModalComponent);
        // captureProfileModal.present(); 
        // captureProfileModal.onDidDismiss(() => {
          //// Straight afterwards, launch connection modal
          // this.modalCtrl.create(ConnectionModalComponent);
        // });
      }
    });
  }
  private checkPinEntryAvailable() {
    if (this.platform.is('ios')) {
      this.nav.setRoot(PinEntryPlaceholderComponent);
      this.keychain.getJson('opc.credentialsForPinReentry', '<none>').then(retrieved => {
        console.log(retrieved);
        debugger;
        // if (false) {
          let credentials: AuthUtils.AuthCredentials = { username: '', password: '' };
          this.nav.setRoot(PinEntryComponent, { pinEntryType: PinEntryType.Reentry, credentials });
        // }
        // else {
        //   this.nav.setRoot(LoginComponent);    
        // }
      });
    }
    else {
      this.nav.setRoot(LoginComponent);
    }
  }
  private routeView() {
    let authModalType: AuthModalType = this.params.get('authModalType');
    switch (authModalType) {
      case AuthModalType.ForgotPassword:
        return this.nav.setRoot(ForgotPasswordComponent);
      case AuthModalType.ChangePassword:
        return this.nav.setRoot(ChangePasswordComponent);
      case AuthModalType.ImmortalToken:
        return this.nav.setRoot(ImmortalLoginComponent);
      case AuthModalType.PinEntry:
        return this.nav.setRoot(PinEntryComponent);
      case AuthModalType.Credentials:
      default:
        // return this.checkPinEntryAvailable(); 
        this.nav.setRoot(LoginComponent);
    }
  }
}