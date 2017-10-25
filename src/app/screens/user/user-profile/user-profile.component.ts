import { Component } from '@angular/core';
import { NavController, ModalController, AlertController, ActionSheetController, Events } from 'ionic-angular';
import { Storage } from '@ionic/storage';

import { UserProfile } from '../shared/user-profile.model';
import { UserPreferencesShape } from '../shared/user-preferences.model';
import { UserProfileService } from '../../../core/services/user/user-profile.service';
import { AccountService } from '../../../core/services/account/account.service';
import { AuthService } from '../../../core/services/auth/auth.service';
import { UserDefaults } from '../../../core/data/user/user-defaults';
import { AccountStats } from '../../../core/data/account/account-stats';

import { AccountSettingsComponent } from '../account-settings/account-settings.component';
import { AuthModalComponent } from '../../auth/auth-modal/auth-modal.component';
import { CaptureProfileModalComponent } from '../../onboarding/capture-profile-modal/capture-profile-modal.component';
import { DevelopmentSettingsComponent } from '../../misc/development-settings/development-settings.component';

@Component({
  selector: 'scr-user-profile',
  templateUrl: 'user-profile.html'
})
export class UserProfileComponent {
  profile: UserProfile;
  profileAvatar: string;
  preferredName: string;
  preferences: UserPreferencesShape;
  accountStats: AccountStats;
  numAccountsPluralMapping: any;
  // userStats: { label: string, value: any, currency?: boolean }[];
  screens = {
    accountSettings: AccountSettingsComponent,
    devSettings: DevelopmentSettingsComponent,
    authModal: AuthModalComponent,
    captureProfile: CaptureProfileModalComponent
  };
  constructor(
    protected storage: Storage,
    protected events: Events,
    protected modalCtrl: ModalController,
    protected actionSheetCtrl: ActionSheetController, 
    protected navCtrl: NavController, 
    protected alertCtrl: AlertController,
    protected accountService: AccountService,
    protected authService: AuthService,
    protected userProfileService: UserProfileService,
  ) {}
  ionViewWillLoad(){
    this.loadAll();
    this.numAccountsPluralMapping = {
      '=0': 'No accounts',
      '=1': '1 account connected',
      'other': '# accounts connected'
    };
  }
  showDevSettings() {
    this.navCtrl.push(this.screens['devSettings']);
  }
  showOptions() {
    let btnLogoutImmortal: any = {
      text: 'Log out (token)',
      role: 'destructive',
      handler: () => this.authService.depersistImmortal()
    };
    let btnLogoutNormal: any = {
      text: 'Log out',
      role: 'destructive',
      handler: () => this.authService.logout()
    };
    let btnDeveloperSettings: any = {
      text: 'Developer settings',
      handler: () => { 
        // Close AS before transition
        actionSheet.dismiss().then(() => {
          this.navCtrl.push(this.screens['devSettings']);          
        });
        return false;
      }
    };
    let btnChangeName = {
      text: 'Change name',
      handler: () => {
        actionSheet.dismiss().then(() => {
          let modal = this.modalCtrl.create(this.screens['captureProfile']);
        });
        return false;
      }
    };
    let btnCancel: any = {
      text: 'Cancel',
      role: 'cancel',
      handler: () => { console.log('Cancel clicked'); }
    };
    let actionSheet = this.actionSheetCtrl.create();
    actionSheet.addButton(this.authService.isUsingImmortal ? btnLogoutImmortal : btnLogoutNormal);
    // actionSheet.addButton(btnChangeName);
    actionSheet.addButton(btnDeveloperSettings);
    actionSheet.addButton(btnCancel);
    actionSheet.present();
  }
  updateFingerprintLoginPreference() {
    if (this.preferences) {
      this.authService.setFingerprintPreference(this.preferences.useFingerprintLogin);
    }
  }
  wipeStorage() {
    let proceedWipe = () => {
      this.storage.clear().then(() => {
        this.alertCtrl.create({ title: 'Storage wiped', message: 'You are probably also logged out.', buttons: ['OK'] }).present();
      });
    };
    this.alertCtrl.create({ 
      title: 'Confirm wipe', 
      message: 'All locally stored info will be wiped',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        { text: 'Proceed', handler: proceedWipe }
      ]
    }).present();
  }
  private loadAll(): Promise<boolean> {
    let localProfilePromise = this.userProfileService.getLocalProfile().then(localProfile => {
      this.preferredName = localProfile.preferredName;
      this.events.subscribe('profile:nameChanged', newPreferredName => {
        this.preferredName = newPreferredName;
      });
    }).catch(err => {
      console.warn(err);
    });
    let avatarPromise = this.userProfileService.getJuggleAvatar().then(profileAvatarUrl => {
      this.profileAvatar = profileAvatarUrl || UserDefaults.AVATAR_URL;
    }).catch(err => {
      this.profileAvatar = UserDefaults.AVATAR_URL;
      console.warn(err);
    });
    let accountStatsPromise = this.accountService.getAccountStats().then(accountStats => {
      this.accountStats = accountStats;
    });
    let prefsPromise = Promise.resolve().then(() => {
      let prefs: UserPreferencesShape = {
        useFingerprintLogin: !this.authService.isFingerprintNotPreferred
      };
      this.preferences = prefs;
    });
    return Promise.all([
      localProfilePromise, 
      avatarPromise,
      accountStatsPromise,
      prefsPromise
    ]).then(results => true);
  }
  private loadUserPreferences() {
    
  }
}
