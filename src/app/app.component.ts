import { Component, ViewChild } from '@angular/core';
import { Nav, Platform, AlertController, ModalController, MenuController, Config, Events, AlertOptions } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { Keyboard } from '@ionic-native/keyboard';
import { Storage } from '@ionic/storage';

import { AuthService } from './core/services/auth/auth.service';
import { AccountService } from './core/services/account/account.service';
import { TaskService } from './core/services/task/task.service';      // DEPRECATED, MARK FOR REMOVAL
import { TaskManagerService } from './core/services/task/task-manager.service';
import { NotificationService } from './core/services/notification/notification.service';
import { InsightsHttpService } from './core/services/insights-http/insights-http.service';
import { VersionService } from './core/services/version/version.service';
import { TelemetryService } from './core/services/telemetry/telemetry.service';
import { VersionMigrationService } from './core/services/version/version-migration.service';
import { CapabilityDefinitionItem } from './core/data/version/version-types';

// Since this contains the menu, it needs every single screen component
import { DevelopmentStartPageComponent } from './screens/misc/development-start-page/development-start-page.component';
import { AffordabilityComponent } from './screens/affordability/affordability.component';
import { AuthModalComponent } from './screens/auth/auth-modal/auth-modal.component';
import { HomeComponent } from './screens/home/home.component';
import { HomePlaceholderComponent } from './screens/home/home-placeholder/home-placeholder.component';
import { NotificationCentreComponent } from './screens/notification-centre/notification-centre.component';
import { AccountsComponent } from './screens/accounts/accounts.component';
import { CategoriesComponent } from './screens/categories/categories.component';
import { GoalCentreComponent } from './screens/goal-centre/goal-centre.component';
import { PropertyCentreComponent } from './screens/property-centre/property-centre.component';
import { UserProfileComponent } from './screens/user/user-profile/user-profile.component';
import { FirstRunComponent } from './screens/home/first-run/first-run.component';
import { CaptureProfileModalComponent } from './screens/onboarding/capture-profile-modal/capture-profile-modal.component';
import { ConnectionModalComponent } from './screens/onboarding/connection-modal/connection-modal.component';

interface MenuItem extends CapabilityDefinitionItem {
  label: string;
  screen?: any;
  handler?: any;
  ionicon?: string;
  opicon?: { name: string; set: string; };
  modal?: boolean;
};

@Component({
  selector: 'root-app',
  templateUrl: 'app.component.html'
})
export class AppComponent {
  @ViewChild(Nav) nav: Nav;
  menuItems: MenuItem[];
  settingsItems: MenuItem[];
  versionName: string;
  versionLabel: string;
  numNotifications: number;
  screens = {
    development: DevelopmentStartPageComponent,
    home: HomeComponent,
    homePlaceholder: HomePlaceholderComponent,
    profile: UserProfileComponent,
    notifications: NotificationCentreComponent,
    accounts: AccountsComponent,
    goalCentre: GoalCentreComponent,
    propertyCentre: PropertyCentreComponent,
    categories: CategoriesComponent,
    authModal: AuthModalComponent,
    firstRunModal: FirstRunComponent,      // Shows a slideshow if they have not used the app before
    connectionModal: ConnectionModalComponent,    // Prompts them to connect to an institution
    captureProfileModal: CaptureProfileModalComponent,    // Captures their profile information for a custom experience
  }; 
  showNotificationTray: boolean;
  isAuthModalOpen: boolean;
  storageReady: boolean;
  googleApiUrlKey: string;
  constructor(
    protected keyboard: Keyboard,
    protected statusBar: StatusBar,
    protected splashScreen: SplashScreen,
    protected platform: Platform, 
    protected config: Config, 
    protected storage: Storage,
    protected events: Events,
    protected modalCtrl: ModalController,
    protected menuCtrl: MenuController,
    protected alertCtrl: AlertController,
    protected http: InsightsHttpService,
    protected accountService: AccountService,
    protected authService: AuthService,
    protected taskService: TaskService,
    protected notificationService: NotificationService,
    protected taskManagerService: TaskManagerService,
    protected telemetryService: TelemetryService,
    protected versionService: VersionService,
    protected versionMigrationService: VersionMigrationService,
  ) {}
  ngOnInit() {
    this.applyConfiguration(['app', 'cms', 'env']).then(() => {
      this.initializeApp();
    });
    
  }
  initializeApp(): Promise<boolean> {
    this.splashScreen.show();
    this.nav.setRoot(this.screens['homePlaceholder']);
    return Promise.all([
      this.platform.ready(),
      this.storage.ready().then(() => this.storageReady = true),      // If storage is ready before initialisation, then services don't need to individually check
      this.http.reloadImmortal(),
      this.versionMigrationService.checkAndWipeStorage(),
      this.taskManagerService.reviveTasks(this.taskService),      
    ]).then(promiseResults => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.statusBar.overlaysWebView(true);
      this.statusBar.styleDefault();
      
      // iOS Keyboard Scroll stuff
      if (this.platform.is('ios')) {
        this.keyboard.disableScroll(true);
      }

      // Perform some post-ready activities
      this.subscribeEvents();
      this.populateMenuItems();
      this.applyEnvironmentSettings();

      // Killswitch for splash page -- iOS
      // In case home:loaded event doesn't fire in a timely way.
      let splashPageTimeout = Number(this.config.get('splashPageTimeout', '10000'));
      setTimeout(() => {
        this.events.unsubscribe('init:landed');
        this.splashScreen.hide();
      }, splashPageTimeout);
      return true;
    }).catch(() => {
      // TODO: Replace this with a proper screen within the app, with a friendly/cute message.
      this.alertCtrl.create({
        title: 'Warning: App not fully initialised',
        message: 'Functionality may not work as expected',
        buttons: [ 'OK' ]
      }).present();
      return false;
    });
  }
  /**
   * Apply configuration from *.config.json files
   * @private
   * @memberof App
   */
  private applyConfiguration(configNamesToLoad: string[] = ['app', 'env']): Promise<boolean> {
    // Version configuration
    this.versionService.ready().then(versionInfo => {
      this.versionName = 'OPICA Insights Preview';
      this.versionLabel = versionInfo.version;
    });
    // Apply application config - Read json file(s) and do stuff
    return this.http.getJSONConfigs(configNamesToLoad).then((retrievedConfigLists: any[]) => {
      if (retrievedConfigLists) {
        console.log('retrievedConfigLists',retrievedConfigLists);
        retrievedConfigLists.forEach(retrievedConfigList => {
          Object.keys(retrievedConfigList).forEach(key => {
            this.config.set(key, retrievedConfigList[key]);
          });
        });
        return true;
      }
      else {
        return false;
      }
    }).catch(err => {
      console.error(err);
      return false;
    });
    // return this.http.getConfigJSON('app').then(appConfig => {
    // return Promise.resolve(true);
  }
  /**
   * Fill the drawer menu with list items, depending on the configuration/white label
   * @private
   * @memberof App
   */
  private populateMenuItems() {
    // Is notification centre enabled – if so, show the tray
    this.showNotificationTray = this.versionService.isCapabilityEnabled('CAP_NOTIFICATION_CENTRE');
    // Menu items are the first group of items
    this.menuItems = this.versionService.assignCapabilityDesignation<MenuItem>([
      { identifier: 'CAP_OTHER', label: 'Dashboard', opicon: { name: 'pie-chart', set: 'business' }, screen: this.screens['home'] },
      { identifier: 'CAP_GOAL_CENTRE', label: 'Saving Goals', opicon: { name: 'coin-7', set: 'business' }, screen: this.screens['goalCentre'] }, 
      { identifier: 'CAP_PROPERTY_CENTRE', label: 'Property Centre', opicon: { name: 'placeholder-6', set: 'interaction' }, screen: this.screens['propertyCentre'] },
      // { identifier: 'CAP_OTHER', label: 'Affordability', opicon: { name: 'placeholder-6', set: 'interaction' }, component: AffordabilityComponent },
      { identifier: 'CAP_ACCOUNTS', label: 'Bank Accounts', opicon: { name: 'id-card-4', set: 'essential' }, screen: this.screens['accounts'] },
      { identifier: 'CAP_BREAKDOWN', label: 'Spending Breakdown', opicon: { name: 'price-tag-3', set: 'business' }, screen: this.screens['categories'] },
    ]);
    // Settings items are the second group of items
    this.settingsItems = this.versionService.assignCapabilityDesignation<MenuItem>([
      { identifier: 'CAP_OTHER', label: 'Log out', ionicon: 'log-out', handler: () => this.authService.logout() },      
    ]);
  }
  /**
   * Handler for whenever a side drawer menu item is selected
   * @private
   * @param {MenuItem} menuItem 
   * @memberof App
   */
  private handleMenuAction(menuItem: MenuItem) {
    // Perform an action based on either the 'handler' or the 'screen'
    if (menuItem.handler) {
      menuItem.handler();
    }
    else if (menuItem.screen) {
      if (menuItem.modal){
        this.modalCtrl.create(menuItem.screen).present().catch(err => {
          this.events.publish('version:accessRestricted', err);
        });
      }
      else {
        this.nav.setRoot(menuItem.screen).catch(err => {
          this.events.publish('version:accessRestricted', err);
        });
      }
    }
    else {
      console.warn(`Neither 'handler' or 'screen' was registered for '${menuItem.label}'`);
    }
  }
  private subscribeEvents() {
    /* Global alert system */
    this.events.subscribe('root:showAlert', (alertOpts: AlertOptions) => {
      this.alertCtrl.create(alertOpts).present();
    });  
    /* Perform or trigger any tasks that needed authentication in order to work */
    this.events.subscribe('auth:authenticated', (fromModal: boolean = false) => {
      this.fireNotificationRetrieval();
    });
    /* Prevent multiple auth modals from opening up. */
    this.events.subscribe('auth:notAuthenticated', () => {
      if (!this.isAuthModalOpen) {
        this.showAuthenticationModal();
      }
    });
    /* Switch out the main screen */
    this.events.subscribe('auth:modalFinished', (fromModal: boolean = false, modalViewController: any) => {
      if (fromModal) {
        // The auth screen was opened in a modal view controller, so just close that
        modalViewController.dismiss();
      }
      else {
        // The auth screen was opened directly in the main nav, so now switch it out with the home screen
        this.showHome();
      }
    });
    this.events.subscribe('init:landed', () => {
      this.events.unsubscribe('init:landed');
      this.splashScreen.hide();
    });
    this.events.subscribe('notifications:addedNew', () => {
      this.numNotifications = this.notificationService.newNotificationCount;
    });
    this.events.subscribe('version:accessRestricted', (pageNavigationError) => {
      this.alertCtrl.create({
        title: 'Not available',
        message: `The section you tried to access is not available.`,
        buttons: [ 
          { text: 'Help', handler: () => console.log('Todo: In-app support') },
          { text: 'OK', role: 'cancel' }
        ]
      }).present();
    });
    // this.events.subscribe('auth:authenticated', () => {
    //   this.nav.setRoot(DevelopmentStartPageComponent);      // DEVELOPMENT ENTRY POINT
    //   this.fireNotificationRetrieval();    
    // });
  }
  /**
   * Check environment and apply relevant configuration logic
   * @private
   * @memberof App
   */
  private applyEnvironmentSettings() {
    /* 2017-06-18: Assume by default that a login must occur every session */
    let envIdentifier = this.config.get('env');
    // Automatically set the endpoint depending on the environment, if endpoint information is available
    // This would be configured within the env.config.json file
    if (this.config.get('autoEnvBaseUrl', false) && this.config.get('availableEndpoints')) {
      let availableEndpoints: Array<{ identifier: string; value: string; }> = this.config.get('availableEndpoints');
      let matchedEnvEndpoint = availableEndpoints.find(aep => aep.identifier === envIdentifier);
      if (matchedEnvEndpoint) {
        this.http.setEndpointBaseUrl(matchedEnvEndpoint.value);
      }
    }

    // Additional settings for development environment
    // Automatically apply some dev shortcuts when accessing the app in development mode
    if (envIdentifier === 'dev') {    // In URL, place qsa --> /?ionicEnv=dev
      // If login is required, bring up the login modal before hiding the splashscreen
      // Otherwise, because /?ionicEnv=dev is in the URL bar, skup the auth modal
      this.authService.status().then(isLoggedIn => {
        if (isLoggedIn) {
          // Jump to the development screen - is authenticated in dev mode
          this.nav.setRoot(this.screens['development']);    // Might as well, because it's in dev mode
          this.fireNotificationRetrieval();
        }
        else {
          // Go to the login screen - not authenticated
          this.nav.push(this.screens['authModal'], null, { animate: false, direction: 'forward' }).then(() => {
            this.nav.last().onDidDismiss(() => {
              this.isAuthModalOpen = false;
            });
          });
        }
      });
    }
    else {
      this.showAuthenticationModal();
    }
  }

  /**
   * 
   * @desc Sets a placeholder page as the root page, the immediately pushes the authentication screen on top
   * @private
   * @memberof App
   */
  private showAuthenticationModal() {
    this.menuCtrl.swipeEnable(false);    // Do not allow swiping to show menu    
    this.isAuthModalOpen = true;
    console.log('isAuthModalOpen=true');
    // this.nav.setRoot(this.screens['homePlaceholder']).then(() => {
      // this.nav.push(this.screens['authModal'], null, { animate: false, direction: 'forward' }).then(() => {
      this.nav.setRoot(this.screens['authModal']).then(() => {
        this.nav.last().onDidDismiss(() => {
          console.log('isAuthModalOpen=false');
          this.isAuthModalOpen = false;
        });
      });
    // });
    // let modal = this.modalCtrl.create(this.screens['authModal'], null, { enableBackdropDismiss: false });
    // modal.present();
    // modal.onDidDismiss(() => this.isAuthModalOpen = false);
  }
  private showHome() {
    //// For debate: Do we always want to send the user back to the home page?
    this.menuCtrl.swipeEnable(true);   // Re-enable swipe-to-open-menu
    this.nav.setRoot(this.screens['home']).then(() => {
      //// Retrieve notifications – Todo: Move this to an observable timer
      this.postLoginChecks();
    });
  }
  
  private postLoginChecks() {
    // If this is the first time accessing the app, run through the first-run slideshow. 
    // this.onboardingService
    // If there are no accounts, then show a popup to add new accounts
    this.accountService.hasAccounts().then(hasAccounts => {
      if (!hasAccounts) {
        this.modalCtrl.create(this.screens['connectionModal']).present();
      }
    });
    // If required, capture their personal details
    
  }

  private fireNotificationRetrieval() {
    let notificationRetrievalInterval = Number(this.config.get('notificationRetrievalInterval', '15000'));
    this.notificationService.pullNotifications(null, ['new', 'read']).then(status => {
      // Regularly retrieve only new notifications
      // setInterval(() => {
      //   this.notificationService.pullNotifications()
      //   .catch(err => {
      //     console.warn('Failed to retrieve notifications (app.component)');
      //     console.error(err);
      //     throw err;
      //   });
      // }, notificationRetrievalInterval);
    }).catch(err => {
      console.warn('Failed to retrieve notifications — initial (app.component)');
      console.error(err);
    });
  }
}
