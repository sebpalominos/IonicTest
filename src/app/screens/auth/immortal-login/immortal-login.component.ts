import { Component } from '@angular/core';
import { NavParams, NavController, ViewController, AlertController, LoadingController, ModalController, Events, Config } from 'ionic-angular'
import { StatusBar } from '@ionic-native/status-bar';

import { AuthModalComponent } from '../auth-modal/auth-modal.component';
import { ForgotPasswordComponent } from '../forgot-password/forgot-password.component';
import { LoginHelpComponent } from '../login-help/login-help.component';
import { AuthService } from '../../../core/services/auth/auth.service';
import { NotificationService } from '../../../core/services/notification/notification.service';
import { OnboardingService } from '../../../core/services/onboarding/onboarding.service';
import { InsightsHttpService } from '../../../core/services/insights-http/insights-http.service';
import { AuthException, AuthExceptionType } from '../../../core/data/auth/auth-exception';
import { CaptureProfileModalComponent } from '../../onboarding/capture-profile-modal/capture-profile-modal.component';
import { ConnectionModalComponent } from '../../onboarding/connection-modal/connection-modal.component';
import { EndpointOption } from '../../../shared/endpoint-switcher/endpoint-switcher.component';

@Component({
  selector: 'immortal-login',
  templateUrl: 'immortal-login.component.html',
  host: {
    class: 'opc-immortal-login fullscreen-form'
  }
})
export class ImmortalLoginComponent {
  immortalToken: string;
  selectedEndpoint: string;
  isSuccessful: boolean = false;
  allowChangeBaseUrl: boolean;
  showChangeBaseUrl: boolean;
  constructor(
    protected statusBar: StatusBar,
    protected config: Config,
    protected params: NavParams, 
    protected events: Events,
    protected navCtrl: NavController, 
    protected viewCtrl: ViewController, 
    protected alertCtrl: AlertController, 
    protected loadingCtrl: LoadingController,
    protected modalCtrl: ModalController,
    protected http: InsightsHttpService,
    protected authService: AuthService,
    protected notificationService: NotificationService,
  ) {}
  ionViewWillLoad() {
    this.allowChangeBaseUrl = this.config.getBoolean('allowEnvChange', false);
  }
  ionViewWillEnter() {
    this.statusBar.hide();
  }
  ionViewWillLeave() {
    this.statusBar.show();
  }
  submitLogin() {
    // Show a loading screen
    let submitting = this.loadingCtrl.create({
      spinner: 'crescent',
      content: 'Logging in',
    });
    submitting.present();
    // Save the immortal token & api prefix
    this.authService.persistImmortal(this.immortalToken, this.selectedEndpoint).then(result => {
      // Check by pinging against the goal status endpoint. 
      // Note: If it returns ANYTHING that is not a straight error, then treat this as success. 
      this.notificationService.ping().then(() => {
        this.isSuccessful = true;
        this.statusBar.show();
        // this.navCtrl.parent.getActive().dismiss();
        this.closeAuthModal();
        setTimeout(() => submitting.dismiss(), 800);
      }).catch(err => {
        submitting.dismiss();
        this.authService.depersistImmortal().then(() => {
          this.alertCtrl.create({
            title: 'Login failed',
            message: `Remote error: ${err}`,
            buttons: [ 'OK' ]
          }).present();
        })
      });
    }).catch(err => {
      this.authService.depersistImmortal().then(() => {
        submitting.dismiss();
        this.alertCtrl.create({
            title: 'Login failed',
            message: `Local Error: ${err}`,
            buttons: [ 'OK' ]
          }).present();
      });
    });
  }
  private bindSelectedEndpoint(selectedEndpoint: string) {
    this.selectedEndpoint = selectedEndpoint;
  }
  private closeAuthModal() {
    this.statusBar.show();
    let parentNavController = this.navCtrl.parent as NavController;
    let parentViewController = parentNavController.getActive() as ViewController;
    let parentComponent = parentViewController.getContent() as AuthModalComponent;
    this.events.publish('auth:modalFinished', !!parentComponent.isModal, parentViewController);
  }
}
