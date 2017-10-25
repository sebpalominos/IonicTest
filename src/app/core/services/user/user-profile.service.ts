import { Injectable } from '@angular/core';
import { Events } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import 'rxjs/add/observable/throw';

import { InsightsHttpService } from '../insights-http/insights-http.service';
import { LocalProfile, UserDetails } from '../../data/user/profile';
import { UserProfileResponse } from '../../data/user/user-response';
import { JuggleAvatars, JUGGLE_AVATAR_MAP } from '../../data/user/juggle-avatar';
import { StateChangeResponse } from '../../data/shared/state-change-response';

@Injectable()
export class UserProfileService {
  profileAvatarUrl: string;
  constructor(
    protected events: Events,
    protected storage: Storage,
    protected http: InsightsHttpService
  ) { this.init() }
  /**
   * Values to be stored locally in-app
   * @param {Partial<LocalProfile>} profile 
   * @returns {Promise<boolean>} 
   * @memberof UserProfileService
   */
  public setLocalProfile(profile: Partial<LocalProfile>): Promise<boolean> {
    return this.storage.get('profile:local').then((profile: LocalProfile) => {
      profile = Object.assign(profile || {}, profile);
      return this.storage.set('profile:local', profile).then(result => {
        console.log(`Localprofile save result: ${JSON.stringify(result)}`);
        return true;
      });
    });
  }
  /**
   * Retrieve in-app local profile values
   * @returns {Promise<LocalProfile>} 
   * @memberof UserProfileService
   */
  public getLocalProfile(): Promise<LocalProfile> {
    return this.storage.get('profile:local').then((profile: LocalProfile) => {
      return Object.assign({
        preferredName: 'OPICA User',
        email: '',
        motto: `I'm here to save`
      } as LocalProfile, profile);
    });
  }
  /**
   * @todo Improve with strict typings
   * @returns {Promise<any>} 
   * @memberof UserProfileService
   */
  getProfileSettings(): Promise<any> {
    let endpoint = [ 'profile' ];
    return this.http.get(endpoint).toPromise().then(resp => {
      let body: UserProfileResponse = resp.json();
      return body.settings;
    });
  }

  /**
   * Retrieve the URL for this user's Juggle avatar
   * @param {boolean} [overrideCache=false] 
   * @returns {Promise<string>} 
   * 
   * @memberof UserProfileService
   */
  public getJuggleAvatar(overrideCache = false): Promise<string> {
    if (this.profileAvatarUrl && !overrideCache) {
      return Promise.resolve(this.profileAvatarUrl);
    }
    else {
      return Promise.all([
        this.storage.get('assets.baseUrlEndpoint'),
        this.getProfileSettings()
      ]).then(results => {
        let [ assetBase, settings ] = results;
        if (!assetBase) {
          throw new Error('Asset base URL is not set at assets.baseUrlEndpoint in local storage.');
        }
        if (settings.find(setting => setting.type === 'STOCK_AVATAR')) {
          let avatarId = settings.find(setting => setting.type === 'STOCK_AVATAR').value;
          if (JUGGLE_AVATAR_MAP[avatarId]) {
            this.profileAvatarUrl = `${assetBase}${JUGGLE_AVATAR_MAP[avatarId]}`;
            return this.profileAvatarUrl;
          }
        }
        throw new Error('ID not found in avatar map');
      });
    }
  }
  /**
   * Set the avatar for Juggle
   * @param {JuggleAvatars} avatar 
   * @returns {Promise<StateChangeResponse>} 
   * @memberof UserProfileService
   */
  public setJuggleAvatar(avatar: JuggleAvatars): Promise<StateChangeResponse> {
    let endpoint = [ 'profile' ];
    let payload = { STOCK_AVATAR: avatar };
    return this.http.put(endpoint, payload).toPromise().then(resp => {
      if (resp.ok) {
        let body: UserProfileResponse = resp.json();
        let hasStockAvatar = !!body.settings.find(setting => setting.type === 'STOCK_AVATAR');
        return { success: hasStockAvatar } as StateChangeResponse;      // this is a sub-optimal check because it doesn't inspect what the avatar # is.
      }
      return { success: false } as StateChangeResponse;
    });
  }
  private init() {
    // Subscribe to the UserDetails event
    this.events.subscribe('auth:userDetails', (userDetails: UserDetails) => {
      // Set LocalProfile to have these userdetails
      // TODO: Have flags to indicate if the user overrode these values or not.
      let deltaLocalProfile: Partial<LocalProfile> = {
        username: userDetails.username,
        email: userDetails.email,
        preferredName: userDetails.firstName && userDetails.lastName ? `${userDetails.firstName} ${userDetails.lastName}` : '',
      };
      this.setLocalProfile(deltaLocalProfile);
    });
  }
}