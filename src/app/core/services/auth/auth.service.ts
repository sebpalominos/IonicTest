import { Injectable } from '@angular/core';
import { Events } from 'ionic-angular';
import { InsightsHttpService } from '../insights-http/insights-http.service';
import { Storage } from '@ionic/storage';

import { AuthImmortalService } from './auth-immortal.service';
import { TelemetryService } from '../telemetry/telemetry.service';
import { UserDetails } from '../../data/user/profile';
import { AuthException, AuthExceptionType } from '../../data/auth/auth-exception';
import { LoginResponse } from '../../data/auth/login-response';
import { FingerprintProtectedData } from '../../data/auth/auth-fingerprint';
import { AuthState } from '../../../screens/auth/shared/auth-state';

@Injectable()
export class AuthService extends AuthImmortalService {
  private _userDetails: UserDetails;
  get userDetails(): UserDetails {
    return this._userDetails || { username: undefined };
  }
  private isStagedEndpointBaseUrl: boolean = false;
  private _endpointBaseUrl: string;
  set stagedEndpointBaseUrl(endpointBaseUrl: string) {
    this.isStagedEndpointBaseUrl = true;
    this._endpointBaseUrl = endpointBaseUrl;
  }
  isFingerprintNotPreferred: boolean;
  isCredentialsReady: boolean;
  constructor(
    protected events: Events,
    protected storage: Storage,
    protected http: InsightsHttpService,
    protected telemetryService: TelemetryService
  ) { 
    super(storage, events, http, telemetryService);
    this.init();
  }
  /**
   * Perform new login request to identity endpoint 
   * @param {string} username 
   * @param {string} password 
   * @returns {Promise<boolean>} 
   * @todo Add PIN to the login mechanism
   * @memberOf AuthService
   */
  login(username: string, password: string, pin?: number[]): Promise<boolean> {
    let endpoint = ['access', 'login'];
    let digits = pin && pin.slice(0, 6) || [null, null, null, null, null, null];
    let payload = { username, password, digits, licenceCode: '' };
    // UserDetails will get published if the login is successful
    this.events.subscribe('auth:userDetails', (userDetails: UserDetails) => {
      this._userDetails = userDetails;
    });
    // If any endpointBaseUrl was staged, then apply it now
    if (this.isStagedEndpointBaseUrl) {
      this.http.setEndpointBaseUrl(this._endpointBaseUrl);
      this.isStagedEndpointBaseUrl = false;      // This must be wiped, so that next time it won't stick
    }
    // Defer to the OpicaHttpService login, which will incidentally 
    // save the required tokens.
    return this.http.login(endpoint, payload).then(isLoggedIn => {
      console.log('login', isLoggedIn);
      if (isLoggedIn) {
        this.events.publish('auth:authenticated', AuthState.Credential);
        this.events.publish('auth:credentialsReady');
      }
      else {
        this.events.publish('auth:notAuthenticated');
      }
      return isLoggedIn;
    });
  }
  /**
   * Delete login-related tokens
   * @returns {Promise<boolean>} 
   * @todo: Trigger an event for logout occurred
   * @memberOf AuthService
   */
  logout(): Promise<boolean> {
    let endpoint = ['access', 'logout'];
    return Promise.all([
      // this.storage.remove('auth.testHarness.immortalToken'),
      // this.storage.remove('auth.testHarness.baseUrlEndpoint'),
      this.http.get(endpoint),
      this.storage.remove('auth.authToken'),
      this.storage.remove('auth.csrfToken'),
      this.depersistImmortal()
    ]).then(() => {
      this.events.publish('auth:notAuthenticated');
      return true;
    }).catch(err => {
      console.error(err);
      return false;
    });
  }
  /**
   * Save known PIN digits and PIN hash in local storage, for comparing in re-entry.
   * @param {number[]} pin 
   * @returns {Promise<boolean>} 
   * @memberof AuthService
   */
  persistPin(pin: number[]): Promise<boolean> {
    return Promise.resolve(true);
  }
  /**
   * Check for login tokens or if it's immortally logged in.
   * Also invokes event if not logged in.
   * @returns {Promise<boolean>} 
   * @memberOf AuthService
   */
  status(): Promise<boolean> {
    return Promise.all([
      this.storage.get('auth.testHarness.immortalToken'),
      this.storage.get('auth.csrfToken'),
      this.storage.get('auth.csrfTokenExpiry')
    ]).then(results => {
      let [devImmortalToken, csrfToken, csrfTokenExpiry] = results;
      if (devImmortalToken) {
        console.log('%cStatus check: Immortal Token OK', 'color: rebeccapurple; font-weight: bold' );
        return true;
      }
      // The csrf token is the only thing that needs to be explicitly stored.
      // BUT always validate if authenticated or not through ping to backend endpoint
      if (csrfToken) {
        console.log('%cStatus check: CSRF Token Available', 'color: #b894dc; font-weight: bold' );
        return this.http.ping(csrfToken).then(isAuthenticated => {
          console.log(
            isAuthenticated ? '%cStatus check: CSRF Token OK' : '%cStatus check: CSRF Token expired', 
            isAuthenticated ? 'color: rebeccapurple; font-weight: bold' : 'color: firebrick; font-weight: bold'
          );
          return isAuthenticated;
        });
      }
      // At this point, no known authentication methods were used
      // Publish an event, to trigger stuff like login screens
      this.events.publish('auth:notAuthenticated');
      return false;
    });
  }
  /**
   * Enact a login using stored fingerprint-protected credentials
   * @todo Insecure storage for credentials
   * @returns {Promise<boolean>} 
   * @memberof AuthService
   */
  loginWithFingerprint(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.storage.get('auth:fingerprintProtectedData').then((fpData: FingerprintProtectedData) => {
        // Check if there are in fact any credentials saved. If not, reject.
        if (this.checkFingerprintDataIntegrity(fpData)) {
          this.login(fpData.username, fpData.password, fpData.pin).then(success => {
            resolve(success);
          });
        }
        else {
          reject(new AuthException(AuthExceptionType.NoFingerprintProtectedData, 'Fingerprint login has not been set up'));
        }
      });
    });
  }
  /**
   * Save a new round of credentials to be used for fingerprint login
   * @param {FingerprintProtectedData} fpData - Credentials and PIN to be stored
   * @returns {Promise<boolean>} 
   * 
   * @memberof AuthService
   */
  setFingerprintData(fpData: FingerprintProtectedData): Promise<boolean> {
    return this.storage.set('auth:fingerprintProtectedData', fpData).then(resp => true);
  }
  /**
   * Disable fingerprint-data login, remove credentials.
   * @desc This method is useful for wiping after a failed auth attempt using fingerprint-protected data.
   * @returns {Promise<boolean>} 
   * @memberof AuthService
   */
  wipeFingerprintData(): Promise<boolean> {
    return this.setFingerprintData({ enabled: false });
  }
  /**
   * Check if fingerprint data available for login usage
   * @returns {Promise<boolean>} 
   * @memberof AuthService
   */
  hasFingerprintData(): Promise<boolean> {
    return this.storage.get('auth:fingerprintProtectedData').then((fpData: FingerprintProtectedData) => {
      return this.checkFingerprintDataIntegrity(fpData);
    });
  }
  /**
   * Set a user preference to never prompt for fingerprint
   * @param {boolean} preference 
   * @returns {Promise<boolean>} 
   * @memberof AuthService
   */
  setFingerprintPreference(preference: boolean): Promise<boolean> {
    let nonPreference = !preference;
    this.isFingerprintNotPreferred = nonPreference;
    return this.storage.set('auth:fingerprintNotPreferred', nonPreference).then(resp => true);
  }
  /**
   * Check that fingerprint data can be used for login purposes
   * @private
   * @param {FingerprintProtectedData} fpData 
   * @returns {boolean} 
   * @memberof AuthService
   */
  private checkFingerprintDataIntegrity(fpData: FingerprintProtectedData): boolean {
    let enabled = fpData.enabled;
    let credentialsAvailable = fpData.username && fpData.password;
    let pinAvailable = fpData.pin && fpData.pin.length;
    return enabled && credentialsAvailable && !!pinAvailable;
  }
  /**
   * Misc setup tasks including:
   * - Listening for successful login events.
   * @private
   * @memberof AuthService
   */
  private init() {
    this.storage.get('auth:fingerprintNotPreferred').then(notPreferred => {
      console.log(`Fingerprint not preferred: ${notPreferred}`);
      this.isFingerprintNotPreferred = !!notPreferred;
    });
  }
}