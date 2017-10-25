import { Component, ViewChildren, ViewChild, QueryList, ElementRef } from '@angular/core';
import { NavController, ViewController, AlertController, ActionSheetController, LoadingController } from 'ionic-angular';
import { Config, Platform, NavParams, Events, TextInput } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { Keyboard } from '@ionic-native/keyboard';
import { Keychain } from '@ionic-native/keychain';
import { TouchID } from '@ionic-native/touch-id';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { SafariViewController } from '@ionic-native/safari-view-controller';

import { SafariViewControllerLauncher } from '../../shared/safari-view-component-launcher';
import { AuthModalComponent } from '../auth-modal/auth-modal.component';
import { PinEntryType, TouchIdErrorCodes } from '../shared/auth-state';
import { AuthUtils } from '../shared/auth-utils';
import { ForgotPasswordComponent } from '../forgot-password/forgot-password.component';
import { ImmortalLoginComponent } from '../immortal-login/immortal-login.component';
import { LoginHelpComponent } from '../login-help/login-help.component';
import { PinEntryComponent } from '../pin-entry/pin-entry.component';
import { FinishedFingerprintComponent } from '../finished-fingerprint/finished-fingerprint.component';
import { AuthService } from '../../../core/services/auth/auth.service';
import { NotificationService } from '../../../core/services/notification/notification.service';
import { TelemetryService } from '../../../core/services/telemetry/telemetry.service';
import { VersionService } from '../../../core/services/version/version.service';
import { EndpointSwitcherComponent } from '../../../shared/endpoint-switcher/endpoint-switcher.component';

@Component({
  selector: 'opc-login',
  templateUrl: 'login.component.html',
  host: {
    class: 'opc-login fullscreen-form'
  }
})
export class LoginComponent {
  @ViewChildren('credentialInput') credentialInputs: QueryList<TextInput>;
  @ViewChild('endpointSwitcher') endpointSwitcher: EndpointSwitcherComponent;
  svcLauncher: SafariViewControllerLauncher = SafariViewControllerLauncher.init();  
  username: string;
  password: string;
  usesPin: boolean;
  showForm: boolean;
  showFingerprint: boolean;
  isSuccessful: boolean = false;
  allowChangeBaseUrl: boolean;
  showChangeBaseUrl: boolean;
  screens = {
    forgotPassword: ForgotPasswordComponent,
    loginHelp: LoginHelpComponent,
    immortalLogin: ImmortalLoginComponent,
    pinEntry: PinEntryComponent,
    finishedFingerprint: FinishedFingerprintComponent
  };
  showCreateUser: boolean;
  showUseToken: boolean;
  constructor(
    protected statusBar: StatusBar,
    protected keyboard: Keyboard,
    protected keychain: Keychain,
    protected touchId: TouchID,
    protected inAppBrowser: InAppBrowser,
    protected safariViewController: SafariViewController,
    protected platform: Platform,
    protected config: Config,
    protected params: NavParams, 
    protected navCtrl: NavController, 
    protected viewCtrl: ViewController, 
    protected actionSheetCtrl: ActionSheetController,
    protected alertCtrl: AlertController, 
    protected loadingCtrl: LoadingController,
    protected events: Events,
    protected authService: AuthService,
    protected notificationService: NotificationService,
    protected telemetryService: TelemetryService,
    protected versionService: VersionService
  ) {}
  ionViewWillLoad() {
    this.showCreateUser = this.versionService.isCapabilityEnabled('CAP_CREATE_USER');
    this.showUseToken = this.versionService.isCapabilityEnabled('CAP_IMMORTAL_LOGIN') && this.config.getBoolean('allowImmortalToken', true);
    this.allowChangeBaseUrl = this.config.getBoolean('allowEnvChange', false);
    let url = this.config.get('inAppBrowserRegistrationUrl');
    this.svcLauncher.warmUp(url);
  }
  ionViewWillEnter() {
    this.statusBar.hide();
  }
  ionViewWillLeave() {
    this.statusBar.show();
  }
  ionViewDidLoad() {
    this.usesPin = true;    // Assume we are using 
    this.showForm = false;
    this.showFingerprintIfValid(); 
    setTimeout(() => {
      this.showForm = true;
      // setTimeout(() => this.credentialInputs.first.setFocus() , 400);
    }, 300);
    // Todo: Hide footer when keyboard shown
    // Keyboard.onKeyboardShow().subscribe()
  }
  // ionViewCanLeave(): boolean{
  //   // Only leave if login was successful.
  //   return this.isSuccessful;
  // }
  continue() {
    //=============================
    // TODO: 
    //=============================
    if (this.validate() && this.usesPin) {
      let credentials: AuthUtils.AuthCredentials = { username: this.username, password: this.password };
      this.navCtrl.push(this.screens['pinEntry'], { pinEntryType: PinEntryType.WithCredentials, credentials });
    }
    else {
      this.alertCtrl.create({
        title: 'Login details required',
        message: 'Provide your username and password',
        buttons: [ 'OK' ]
      }).present();
    }
  }
  verifyFingerprint() {
    this.touchId.verifyFingerprint('Log in to OPICA Insights').then(() => {
      this.submitWithFingerprintData().then(() => {
        this.closeAuthModal();
      });
    }).catch(err => {
      // if NOT user cancelled, then show error alert
      let legitReasonsToFailFingerprint = [
        TouchIdErrorCodes.UserCancelled, 
        TouchIdErrorCodes.UserCancelledAlt, 
        TouchIdErrorCodes.SystemCancelled
      ];
      if (legitReasonsToFailFingerprint.indexOf(err) < 0) {
        console.log('Touch ID login failed');
        this.telemetryService.submitException({
          responseMessage: 'Touch ID login failed'
        }, { errorReason: TouchIdErrorCodes[err] });
      //   // If it wasn't a cancellation, show an error screen because it was in fact an error.
      //   this.alertCtrl.create({
      //     title: 'Touch ID error',
      //     message: `TouchID failed: ${TouchIdErrorCodes[err] ? TouchIdErrorCodes[err] : err}`,
      //     buttons: [ 'OK' ]
      //   }).present();
      }
    });
  }
  submitWithFingerprintData(): Promise<boolean> {
    let loading = this.loadingCtrl.create({
      spinner: 'crescent',
      content: 'Logging in',
    });
    loading.present();
    return this.authService.loginWithFingerprint().then(() => {
      loading.dismiss();
      return true;
    }).catch(err => {
      loading.dismiss();
      let alertOptions = AuthUtils.handleErrorOptions(err);
      this.alertCtrl.create(alertOptions).present();
      this.authService.wipeFingerprintData();
    });
  }
  showLoginOptions() {
    if (this.allowChangeBaseUrl) {
      let actionSheet = this.actionSheetCtrl.create({
        title: 'Login options'
      });
      actionSheet.addButton({
        text: 'Help', 
        handler: () => {
          this.navCtrl.push(this.screens['loginHelp']);
        }
      });
      actionSheet.addButton({
        text: 'Change environment...',
        handler: () => {
          this.showChangeBaseUrl = true;
          actionSheet.dismiss().then(() => {
            this.endpointSwitcher.selectEndpoint();
          });
          return false;
        }
      });
      actionSheet.addButton({
        role: 'cancel',
        text: 'Cancel'
      });
      actionSheet.present();
    }
    else {
      this.navCtrl.push(this.screens['loginHelp']);
    }
  }
  registerNewUser() {
    // Fire up the in-app browser!
    let url = this.config.get('inAppBrowserRegistrationUrl');
    // this.inAppBrowser.create(url, '_blank', {
    //   toolbar: 'yes',
    //   closebuttoncaption: 'Close',
    //   location: 'no',
    //   hidden: 'no',
    //   zoom: 'no',
    //   hardwareback: 'no',
    // });    // _blank forces it to load in the InAppBrowser
    this.svcLauncher.launch(url);
  }
  closeAuthModal() {
    this.statusBar.show();
    let parentNavController = this.navCtrl.parent as NavController;
    let parentViewController = parentNavController.getActive() as ViewController;
    let parentComponent = parentViewController.getContent() as AuthModalComponent;
    this.events.publish('auth:modalFinished', !!parentComponent.isModal, parentViewController);
  }
  private bindSelectedEndpoint(selectedEndpoint: string) {
    this.authService.stagedEndpointBaseUrl = selectedEndpoint;
  }
  private validate(): boolean {
    return !!this.username && !!this.password;
  }
  private submitCredentials(optionalPinArray?: number[]): Promise<any> {
    // NOTE: For a reference implementation, see PinEntryComponent
    return Promise.resolve();
  }
  private showFingerprintIfValid() {
    if (!this.authService.isFingerprintNotPreferred) {
      this.touchId.isAvailable().then(() => {
        Promise.all([
          this.authService.hasFingerprintData(),
          this.touchId.didFingerprintDatabaseChange()
        ]).then(results => {
          let [ hasFingerprintData, didFingerprintDatabaseChange ] = results;
          if (hasFingerprintData && didFingerprintDatabaseChange) {
            this.authService.wipeFingerprintData();
            this.alertCtrl.create({
              title: 'Fingerprints changed',
              message: `New fingerprints were added to Touch ID since OPICA Insights was last opened. You'll have to enter your credentials again.`,
              buttons: [ 'OK' ]
            }).present();
          }
          else if (hasFingerprintData) {
            this.showFingerprint = true;
          }
        }).catch(err => {
          console.warn('Touch ID not available');
        });
      }).catch(err => {
        if (TouchIdErrorCodes[err]) {
          console.warn(`TouchID failed: ${TouchIdErrorCodes[err]} (${err})`);
        } 
        else {
          console.warn(`TouchID failed: ${err}`);
        }
      });
    }
  }
}
