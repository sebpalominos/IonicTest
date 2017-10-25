import { Component, QueryList, ViewChild, ViewChildren, ElementRef } from '@angular/core';
import { NavController, ViewController, AlertController, LoadingController, ModalController } from 'ionic-angular';
import { NavParams, Events, Content, Config, Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { TouchID } from '@ionic-native/touch-id';

import { AuthModalComponent } from '../auth-modal/auth-modal.component';
import { PinEntryType, TouchIdErrorCodes } from '../shared/auth-state';
import { AuthUtils } from '../shared/auth-utils';
import { ForgotPasswordComponent } from '../forgot-password/forgot-password.component';
import { LoginHelpComponent } from '../login-help/login-help.component';
import { CaptureProfileModalComponent } from '../../onboarding/capture-profile-modal/capture-profile-modal.component';
import { ConnectionModalComponent } from '../../onboarding/connection-modal/connection-modal.component';
import { FinishedFingerprintComponent } from '../finished-fingerprint/finished-fingerprint.component';
import { AuthService } from '../../../core/services/auth/auth.service';
import { NotificationService } from '../../../core/services/notification/notification.service';
import { OnboardingService } from '../../../core/services/onboarding/onboarding.service';
import { AuthException, AuthExceptionType } from '../../../core/data/auth/auth-exception';
import { IonNumericKeyboard, IonNumericKeyboardOptions } from '../../../shared/ion-numeric-keyboard/ion-numeric-keyboard';

@Component({
  selector: 'pin-entry',
  templateUrl: 'pin-entry.component.html',
  host: {
    class: 'opc-pin-entry fullscreen-form'
  }
})
export class PinEntryComponent {
  @ViewChild(Content) content: Content;
  @ViewChildren('digitInput') digitInputs: QueryList<ElementRef>;
  digitPlaces: number[];
  digitPlaceMask: boolean[];
  digitPlaceValidity: boolean[];
  pin: number[];
  pinEntryType: PinEntryType;
  keyboardOptions: IonNumericKeyboardOptions;
  screens = {
    finishedFingerprint: FinishedFingerprintComponent
  };
  isLoginSuccessful: boolean = false
  isAlreadySubmitting: boolean;
  showKeyboard: boolean = true;
  constructor(
    protected statusBar: StatusBar,
    protected touchId: TouchID,
    protected config: Config,
    protected platform: Platform,
    protected params: NavParams, 
    protected events: Events,
    protected navCtrl: NavController, 
    protected loadingCtrl: LoadingController,
    protected alertCtrl: AlertController,
    protected authService: AuthService,
    protected notificationService: NotificationService,
  ) {}
  ionViewWillLoad() {
    this.setup();
  }
  ionViewWillEnter() {
    this.statusBar.hide();
  }
  ionViewWillLeave() {
    this.statusBar.show();
  }
  pinKeyedHandler(event: KeyboardEvent) {
    if (!this.isAlreadySubmitting) {
      let getNextBlankDigitIndex = (greaterThanIndex: number = -1) => this.pin.findIndex((digit, index) => index > greaterThanIndex && this.digitPlaceMask[index] && digit == null);    // Use of double equals is intentional
      let getLastDigitIndex = (lessThanIndex?: number) => this.pin.reduce((prev, curr, index) => (lessThanIndex == null || index < lessThanIndex) && this.digitPlaceMask[index] && curr != null ? index : prev, -1);    // Use of double equals is intentional
      let nextDigitIndex = getNextBlankDigitIndex();
      // Going out on a limb, and using KeyboardEvent.code
      // Check if backspace, and if blank, then regress
      if (event.key === 'backspace') {
        let currentDigitIndex = getLastDigitIndex();
        if (currentDigitIndex >= 0) {
          if (this.pin[currentDigitIndex] == null) {
            let previousDigitIndex = getLastDigitIndex(currentDigitIndex);
            if (previousDigitIndex >= 0) {
              this.pin[previousDigitIndex] = null;
            }
          }
          else {
            this.pin[currentDigitIndex] = null;
          }
        }
      }
      else if (nextDigitIndex >= 0) {
        // There _is_ a next box. Advance to that box.
        this.pin[nextDigitIndex] = Number(event.key);
        if (getNextBlankDigitIndex() < 0) {
          this.submit();  
        }
      }
      else {
        // No more boxes. Submit.
        this.submit();
      }
    }
  }
  submit() {
    if (this.validate()) {
      switch (this.pinEntryType) {
        case PinEntryType.WithCredentials:
          var loadingMessage = 'Logging in';
          break;
        case PinEntryType.Reentry:
        default:
          var loadingMessage = 'Validating PIN';
          break;
      }
      let submitting = this.loadingCtrl.create({
        spinner: 'crescent',
        content: loadingMessage,
        dismissOnPageChange: false
      });
      this.showKeyboard = false;
      submitting.present();
      this.isAlreadySubmitting = true;
      let { username, password } = this.getCredentials();
      this.submitCredentials(username, password).then(() => {
        submitting.dismiss();
      }).catch(err => {
        submitting.dismiss();
        let alertOptions = AuthUtils.handleErrorOptions(err);
        this.alertCtrl.create(alertOptions).present();
        this.authService.wipeFingerprintData();
        this.navCtrl.pop();
      });
    }
    else {
      console.warn('Failed PIN validation – bad PIN format');
    }
  }
  closeAuthModal() {
    this.statusBar.show();
    let parentNavController = this.navCtrl.parent as NavController;
    let parentViewController = parentNavController.getActive() as ViewController;
    let parentComponent = parentViewController.getContent() as AuthModalComponent;
    this.events.publish('auth:modalFinished', !!parentComponent.isModal, parentViewController);
  }
  private setup() {
    this.pinEntryType = this.params.get('pinEntryType') || PinEntryType.Reentry;
    this.digitPlaces = [0, 1, 2, 3, 4, 5];
    this.digitPlaceValidity = [true, true, true, true, true, true];
    this.digitPlaceMask = getShuffledDigitPlaceMask();      // Expect a 6-digit pin
    this.pin = Array<number>(6);
    this.keyboardOptions = {
      contentComponent: this.content, // mandatory, you have to pass the content reference
      rightControlKey: {
        type: 'icon', // could be 'icon' or 'text'
        value: 'backspace' // the icon name
      }
    };
    function getShuffledDigitPlaceMask() {
      let array = [true, false, true, false, true, false];    // 3x true, 3x false
      let counter = array.length;
      while (counter > 0) {
        let index = Math.floor(Math.random() * counter);
        counter--;
        let temp = array[counter];
        array[counter] = array[index];
        array[index] = temp;
      }
      return array;
    };
  }
  private submitCredentials(username: string, password: string): Promise<boolean> {
    // Don't worry about a loading overlay, the listening event should deal with that.
    return new Promise((resolve, reject) => {
      this.authService.login(username, password, this.pin).then(result => {
        this.isLoginSuccessful = result;
        if (!result) {
          return reject(new Error('Unknown login error'));
        }
        // If TouchID isn't permanently turned off (user pref) and is available...
        // let isTouchIdAvailable = ;
        // let isTouchIdAvailable = true;
        if (this.platform.is('ios') && !this.authService.isFingerprintNotPreferred && this.touchId.isAvailable()) {
          this.promptForFingerprintSetup();
          resolve();
        }
        else {
          setTimeout(() => resolve(), 600);
          this.closeAuthModal();
        }
      }).catch(err => {
        return reject(err);
      });
    });
  }
  private validate(): boolean {
    this.digitPlaceValidity = this.pin.map(pin => !!pin);
    // Todo: Deal with non-numeric inputs?
    let digitsEntered = this.pin.filter(digit => !!digit).length;
    return digitsEntered >= 3;
  }
  private getCredentials(): AuthUtils.AuthCredentials {
    if (this.params.get('credentials')) {
      return this.params.get('credentials');
    }
    else {
      this.alertCtrl.create({
        title: 'Cannot login',
        message: 'Username/password not correctly set. This is a technical error',
        buttons: [ 'Continue' ]
      }).present();
      return null;
    }
  }
  private promptForFingerprintSetup() {
    let alertOptions = AuthUtils.fingerprintSetupAlertOptions(() => {
      /// If selected YES for setup fingerprint
      // let credentials: AuthUtils.AuthCredentials = { username: this.username, password: this.password };
      // this.keychain.setJson('opc.credentials', credentials, true);
      this.touchId.verifyFingerprint('Use Touch ID for future logins').then(resp => {
        console.log('%cTouchID success for setup: ${resp}', 'color: limegreen');
        let credentials = this.getCredentials();
        this.authService.setFingerprintData({
          enabled: true,
          username: credentials.username,
          password: credentials.password,
          pin: this.pin
        }).then(() => {
          this.navCtrl.push(this.screens['finishedFingerprint']);
        });
      }).catch(err => {
        this.alertCtrl.create({
          title: 'Development debug',
          message: `Error code: ${JSON.stringify(err)}`,
          buttons: [ 'OK' ]
        }).present();
        if (~[TouchIdErrorCodes.UserCancelled, TouchIdErrorCodes.UserCancelledAlt, TouchIdErrorCodes.SystemCancelled].indexOf(err)) {
          // Simply close, if user cancelled.
          this.closeAuthModal();
        }
        else {
          // Show an error screen because it was in fact an error.\
          this.navCtrl.push(this.screens['finishedFingerprint'], { touchIdError: err }).then(() => {
            this.statusBar.show();
          });
          if (this.config.get('env') === 'dev' && TouchIdErrorCodes[err]) {
            console.warn(`TouchID failed: ${TouchIdErrorCodes[err]}`);
          }
        }
      });
    }, () => {
      /// If selected NO for setup fingerprint
      this.authService.setFingerprintPreference(false).then(() => {
        this.closeAuthModal();
      });
    });
    this.alertCtrl.create(alertOptions).present();
  }
}
