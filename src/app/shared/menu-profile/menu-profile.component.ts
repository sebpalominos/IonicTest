import { Component, Input } from '@angular/core';
import { Nav, Events, MenuController } from 'ionic-angular';

import { UserProfile, UserProfileShape } from '../../screens/user/shared/user-profile.model';
import { UserProfileComponent } from '../../screens/user/user-profile/user-profile.component';
import { UserDefaults } from '../../core/data/user/user-defaults';
import { LocalProfile } from '../../core/data/user/profile';
import { AccountStats } from '../../core/data/account/account-stats';
import { AuthService } from '../../core/services/auth/auth.service';
import { AccountService } from '../../core/services/account/account.service';
import { UserService } from '../../core/services/user/user.service';
import { UserProfileService } from '../../core/services/user/user-profile.service';
import { VersionService } from '../../core/services/version/version.service';

@Component({
  selector: 'menu-profile',
  template: `
    <ion-list class="opc-menu-profile" no-lines no-border>
      <ion-item padding-vertical [ngStyle]="themeStyles" (tap)="profileAction()">
        <!--<ion-spinner item-start name="crescent" [hidden]="avatarUrl"></ion-spinner>-->
        <ion-avatar item-start *ngIf="avatarUrl">
          <img [src]="avatarUrl">
        </ion-avatar>
        <h2 class="profile-name">{{captionUpper}}</h2>
        <p *ngIf="accountStats">{{accountStats.numActiveAccounts | i18nPlural:numAccountsPluralMapping}}</p>
        <p [hidden]="accountStats">{{captionLower}}</p>
      </ion-item>
    </ion-list>
  `
})
export class MenuProfileComponent {
  @Input() nav: Nav;
  // profile: UserProfile;
  // localProfile: LocalProfile;
  avatarUrl: string = UserDefaults.AVATAR_URL;
  captionUpper: string = UserDefaults.USERNAME;
  captionLower: string = UserDefaults.SUBTITLE;
  accountStats: AccountStats;
  themeStyles: any;
  numConnectedAccounts: number;
  numAccountsPluralMapping: any;
  numInstosPluralMapping: any;
  isLoaded: boolean;
  screens = {
    profile: UserProfileComponent
  };
  constructor(
    protected events: Events,
    protected menuCtrl: MenuController,
    protected userService: UserService,
    protected profileService: UserProfileService,
    protected authService: AuthService,
    protected accountService: AccountService,
    protected versionService: VersionService
  ) {}
  ngOnInit() {
    if (this.versionService.isCapabilityEnabled('CAP_EXPLORE_PROFILE')) {
      // In a scenario where CAP_EXPLORE_PROFILE is on, then attempt to load profile details into this component 
      this.authService.status().then(isAuthed => {
        let isDeferred = !isAuthed;
        this.loadProfile(isDeferred);
      });
    }
    else {
      // In a scenario where CAP_EXPLORE_PROFILE is off, then load a static banner
      this.loadBanner();
    }
    this.numAccountsPluralMapping = {
      '=0': 'No accounts yet',
      '=1': '1 account connected',
      'other': '# accounts connected'
    };
  }
  /**
   * Load some non-profile content, e.g. static info for a banner.
   * @memberof MenuProfileComponent
   */
  loadBanner() {
    this.isLoaded = true;
    this.avatarUrl = this.versionService.theme('logo') || UserDefaults.AVATAR_URL;
    this.captionUpper = this.versionService.theme('title') || UserDefaults.USERNAME;
    this.captionLower = this.versionService.theme('subtitle') ||UserDefaults.USERNAME;      // TBA chuck in their bank or hashtag or something
    this.themeStyles = {};
    if (this.versionService.theme('color')) {
      this.themeStyles.backgroundColor = this.versionService.theme('color');
      this.themeStyles.color = 'white';
    }
    if (this.versionService.theme('fgColor')) {
      this.themeStyles.color = this.versionService.theme('fgColor');
    }
    if (this.versionService.theme('bgColor')) {
      this.themeStyles.backgroundColor = this.versionService.theme('bgColor');
    }
  }
  /**
   * Loads avatar, username and subtitle.
   * @memberof MenuProfileComponent
   */
  loadProfile(isDeferred = false) {
    if (isDeferred) {
      this.avatarUrl = UserDefaults.AVATAR_URL;
      this.events.subscribe('auth:authenticated', () => {
        doLoadProfile.call(this);
      });
    }
    else if (!this.isLoaded) {
      doLoadProfile.call(this);
    }
    function doLoadProfile() {
      Promise.all([
        this.profileService.getLocalProfile(), 
        // this.profileService.getJuggleAvatar().catch(err => console.warn(err)),
        this.accountService.getAccountStats(),
      ]).then(results => {
        console.log('doLoadProfile',results);
        this.isLoaded = true;
        // Set the captions 
        let localProfile = results[0] as LocalProfile;
        this.captionUpper = this.upperCaption(localProfile);
        this.captionLower = this.lowerCaption(localProfile);
        // Set the avatar
        let avatarUrl =  UserDefaults.AVATAR_URL;
        // let avatarUrl = UserDefaults.AVATAR_URL;
        this.avatarUrl = avatarUrl;
        // Set account stats
        this.accountStats = results[1] as AccountStats;
        console.log(`MenuProfileComponent loaded this from local profile: ${JSON.stringify(localProfile)}`);
      }).catch((err) => {
        console.log('menu-profile',err);
      });
    }
  }
  protected upperCaption(localProfile: LocalProfile): string {
    let profileUsername = this.authService.userDetails.username || localProfile.username;
    let profilePreferredName = localProfile.preferredName;
    return profileUsername || UserDefaults.USERNAME;
  }
  protected lowerCaption(localProfile: LocalProfile): string {
    let profileEmail = this.authService.userDetails.email || localProfile.email;
    return profileEmail || UserDefaults.USERNAME;      // TBA chuck in their bank or hashtag or something
  }
  protected profileAction() {
    if (this.versionService.isCapabilityEnabled('CAP_EXPLORE_PROFILE')) {
      this.nav.setRoot(this.screens['profile']).then(() => {
        this.menuCtrl.close();
      });
    }
  }
}