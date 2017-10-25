import { Injectable, Inject } from '@angular/core';
import { Http, Request, Response, RequestOptions, RequestOptionsArgs, Headers } from '@angular/http';
import { Config, Events, AlertController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/toPromise';

import { OpicaHttp } from './opica-http';
import { CustomHttpService } from '../custom-http/custom-http.service';
import { TelemetryService } from '../telemetry/telemetry.service';
import { LoginResponse, LoginErrorResponse } from '../../data/auth/login-response';
import { AuthException, AuthExceptionType } from '../../data/auth/auth-exception';
import { UserDetails } from '../../data/user/profile';

/**
 * HttpAuth is a wrapper around the Ng2 http client and provides 
 * specific capability to authenticate and interact with the OPICA
 * Core backend, and also handling Auth token and CSRF token
 * persistence, and event emission/broadcasting if invalidated.
 */
@Injectable()
export class InsightsHttpService extends CustomHttpService {
  immortalToken: string;
  useImmortalToken: boolean;
  constructor(
    protected config: Config,
    protected http: Http,
    protected events: Events,
    protected storage: Storage,
    protected telemetryService: TelemetryService,
    public alertCtrl: AlertController
  ) { 
    super(config, http, storage);
    this.init();
  }

  /** 
   * Perform a login specifically to the OPICA core server, ensuring that 
   * CSRF tokens match, and other OPICA core rules (as of March 2017).
   * This is a low-level method, intended to be called from an Authentication service
   */
  login(loginEndpoint: string|string[], payload: any): Promise<boolean> {
    let url = this.baseUrl(loginEndpoint);
    console.log('url',url);
    // let alert = this.alertCtrl.create({
    //   title: 'Connected Endpoint',
    //   subTitle: 'url: '+url,
    //   buttons: ['OK']
    // });
    // alert.present();
    return this.http.post(url, payload, { withCredentials: true }).toPromise().then((resp: Response) => {
      // "{"status":"ERROR","message":"Login failed, please try again.","field":""}"
      // "{"status":"PRE_LOCK","message":"Three failed logins: one more and your account will be locked.","field":""}"
      return resp.ok 
        ? this.handleSuccessfulLogin(resp)
        : this.handleBadLogin(resp.status);
    }).catch(err => {
      console.error(err);
      if (err.status) {
        return this.handleBadLogin(err);
      }
      throw new AuthException(AuthExceptionType.Generic);
    });
  }
  
  /**
   * Perform a cookie/CSRF authenticated ping to the endpoint.
   * @todo Use something other than /notifications to retrieve a ping status
   * @param {string} [csrfToken] 
   * @returns {Promise<boolean>} 
   * @memberof OpicaHttpService
   */
  ping(csrfToken?: string): Promise<boolean> {
    // let endpointBaseUrl = this.config.get('apiEndpointBaseUrl');
    let pingEndpoint = `${this.endpointBaseUrl}notifications/check/WEB/${+new Date}`;
    let customHeaders: Headers = new Headers();
    if (csrfToken) {
      customHeaders.append('H-Csrf-Token', csrfToken);
    }
    let customRequestOptionsArgs: RequestOptionsArgs = {
      headers: customHeaders,
      withCredentials: true,
    };
    return super.get(pingEndpoint, customRequestOptionsArgs).toPromise().then(() => true).catch(err => false);
  }

  /**
   * Load stored information for the immortal login feature. This method should be called straight 
   * after test harness values are persisted or depersisted. 
   * @private
   * @returns {Promise<boolean>} - True iff any test harness value was loaded.
   * @memberOf OpicaHttpService
   */
  reloadImmortal(): Promise<boolean> {
    if (!this.config.getBoolean('allowImmortalToken')) {
      return Promise.resolve(false);
    }
    let loadImmortalToken = this.storage.get('auth.testHarness.immortalToken').then(existingValue => {
      // Set whatever it is. If it's null/undefined, that means it is probably logged out. 
      this.immortalToken = existingValue;
      this.useImmortalToken = !!existingValue;
      this.telemetryService.setUsername(this.immortalToken, true);
      return existingValue;
    });
    let loadApiPrefix = this.storage.get('auth.testHarness.baseUrlEndpoint').then(existingValue => {
      let preconfiguredEndpointBaseUrl = this.config.get('apiEndpointBaseUrl');
      this.config.set('', 'apiEndpointBaseUrl', existingValue ? existingValue : preconfiguredEndpointBaseUrl);    // Override it.
      return existingValue;
    });
    return Promise.all([loadImmortalToken, loadApiPrefix]).then(results => !!results.reduce((prev, curr) => prev || !!curr, false));
  }

  /**
   * Gets a local JSON file (which needs to be stored under the 'assets' folder)
   * @returns {Promise<any>} 
   * @memberof OpicaHttpService
   */
  getJSONConfig(configName: string): Promise<any> {
    let configNameParts = configName.split('.');
    let configNameClean = configNameParts.filter(part => {
      return part !== 'config' && part !== 'json';
    }).join('.');
    return this.http.get(`assets/config/${configNameClean}.config.json`).map(resp => resp.json()).catch((err, caught) => {
      // Most likely, the app config file wasn't found. 
      this.telemetryService.submitException({
        responseMessage: `Configuration file was not found: ${configNameClean}`,
      });
      return Observable.throw(err);    // Return an empty object if wasn't found.
    }).toPromise();
  }

  /**
   * Gets a number of local JSON files, and calls getJSONConfig for each.
   * @param {...string[]} configNames 
   * @returns {Promise<any[]>} 
   * @memberof OpicaHttpService
   */
  getJSONConfigs(configNames: string[]): Promise<any[]> {
    let configsToRetrieve = configNames.map(configName => this.getJSONConfig(configName));
    return Promise.all(configsToRetrieve);
  }

  /**
   * Sets endpoint base URL from first arg, OR if not provided, will set from config
   * @param {string} [newEndpoint] 
   * @memberof OpicaHttpService
   */
  setEndpointBaseUrl(newEndpoint?: string) {
    this.endpointBaseUrl = newEndpoint ? newEndpoint : this.config.get('apiEndpointBaseUrl');
  }

  /**
   * Set tokens as required, for example, after a login which retrieved both tokens.
   * Both tokens must be set at the same time (in behaviour they are issued together).
   */
  protected setTokens(authToken: string, csrfToken: string, shouldStoreTokens: boolean = true) : Promise<boolean> {
    this.authToken = authToken;
    this.csrfToken = csrfToken;
    if (shouldStoreTokens){
      // let expiryDate = new Date();
      // expiryDate.setDate(expiryDate.getDate() + 60);
      let storeTokenPromises = [
        this.storage.set('auth.authToken', authToken),
        this.storage.set('auth.csrfToken', csrfToken),
        this.storage.set('auth.authTokenExpiry', Infinity),
        this.storage.set('auth.csrfTokenExpiry', Infinity)
      ];
      return Promise.all(storeTokenPromises).then(() => true).catch(() => false);
    }
    else {
      return Promise.resolve(true);
    }
  }

  /**
   * Add authentication headers/cookies to every call
   * 
   * @protected
   * @param {RequestOptionsArgs} options 
   * @returns {RequestOptions} 
   * 
   * @memberOf OpicaHttpService
   */
  protected getAuthRequestOptions(requestOptions: RequestOptionsArgs, forceImmortal = false) : RequestOptions {
    let customHeaders: Headers = new Headers();
    if (this.useImmortalToken || forceImmortal) {
      customHeaders.append('H-Immortal-Token', this.immortalToken);
      // console.log('AUTH METHOD: Using Immortal Token');
    }
    else {
      customHeaders.append('H-Csrf-Token', this.csrfToken);
      // console.log('AUTH METHOD: Using standard AuthToken/Csrf Token authentication');
    }
    let customRequestOptionsArgs: RequestOptionsArgs = {
      headers: customHeaders,
      withCredentials: true,
    };
    let requestOptionsArgs = Object.assign(customRequestOptionsArgs, requestOptions || {});
    return new RequestOptions(requestOptionsArgs);
  }

  protected handleError(error: Response, caught: Observable<Response>, context?: any) {
    if (error.status === 401) {
      this.events.publish('auth:notAuthenticated');
    }
    else {
      // Report error to Telemetry endpoint
      this.telemetryService.submitException({
        requestMethod: context.method,
        requestEndpoint: context.url,
        requestAuthType: 'cred',
        responseCode: error.status,
        responseMessage: error.statusText,
      });
      // Continue as per superclass
      return super.handleError(error, caught);
    }
  }

  /**
   * Attempt to load stored/saved tokens upon first use. OPICA core 
   * (as of March 2017) requires CSRF and Auth tokens to be sent in 
   * parallel.
   */
  protected loadStoredTokens() {
    return this.storage.ready().then(() => {
      let retrieveTokenPromises = [
        this.storage.get('auth.authToken'),
        this.storage.get('auth.csrfToken'),
        this.storage.get('auth.authTokenExpiry'),
        this.storage.get('auth.csrfTokenExpiry')
      ];
      Promise.all(retrieveTokenPromises).then(promiseResults => {
        let [ authToken, csrfToken, authTokenExpiry, csrfTokenExpiry ] = promiseResults;
        this.setTokens(authToken, csrfToken, false).then(result => {
          this.events.publish('auth:credentialsReady');
        });
      });
    });
  }

  private init() {
    this.loadStoredTokens();
    this.endpointBaseUrl = this.config.get('apiEndpointBaseUrl');
  }

  private handleSuccessfulLogin(resp: Response): boolean {
    this.useImmortalToken = false;
    // let csrfTokenCookieName = 'X-Csrf-Token';
    // let authTokenCookieName = 'X-Auth-Token';
    //================================================
    let loginResp: LoginResponse = resp.json();
    // N.B. telemetryService: We could listen for auth:userDetails, but if that fails we're screwed
    // It is imperative that the telemetryService knows which useraccount it is.
    this.telemetryService.setUsername(loginResp.name);
    this.events.publish('auth:userDetails', {
      username: loginResp.name,
      firstName: loginResp.firstName,
      lastName: loginResp.lastName,
      email: loginResp.email,
      createdAt: new Date(loginResp.createdAt),
      licensingAction: loginResp.licensingAction
    } as UserDetails);
    // 1. Grab and check the CSRF token from the response body, and 
    // check it against the CSRF token cookie value. If cookie not found, 
    // the variable `csrfTokenCookie` should be null.
    let csrfTokenResponse = loginResp.userToken && loginResp.userToken.csrfToken;      // This is given, easily seen in response
    // let csrfTokenCookie = cookies.reduce((prev, cookie) => {
    //   let cookieParts = cookie.split(/\s*;\s*/);
    //   let [cookieName, cookieValue] = cookieParts[0].split(/\s*=\s*/);
    //   return cookieName === csrfTokenCookieName ? cookieValue : prev;
    // }, null);
    if (!csrfTokenResponse) {
      throw new AuthException(AuthExceptionType.CsrfTokenMissing);
    }
    //// 2. Extract the auth token from the cookies
    //// NOTE: NOT REQUIRED, COOKIES WILL WORK AS-IS
    // let authTokenCookie = cookies.reduce((prev, cookie) => {
    //   let cookieParts = cookie.split(/\s*;\s*/);
    //   let [cookieName, cookieValue] = cookieParts[0].split(/\s*=\s*/);
    //   return cookieName === authTokenCookieName ? cookieValue : prev;
    // }, null);
    // if (!authTokenCookie) {
    //   throw new AuthException(AuthExceptionType.AuthTokenMissing);
    // }
    //// 3. Persist into storage with an expiry date attached as well
    //// TODO: SWAP OUT EXPIRY DATE INTO CONFIGURATION
    this.setTokens(null, csrfTokenResponse).then(res => {
      console.log(`Set csrftoken: ${csrfTokenResponse}`);
    }).catch(err => console.warn(err));
    return true;
  }

  private handleBadLogin(error): boolean {
    debugger;
    try {
      let body: LoginErrorResponse = error.json();
      var errorMessage = body.message;
    }
    catch (jsonParseErr) {}
    switch (error.status) {
      case 400:
        throw new AuthException(AuthExceptionType.BadRequest, errorMessage);
      case 401:
      case 403:
        throw new AuthException(AuthExceptionType.IncorrectCredentials, errorMessage);
      case 429:
        throw new AuthException(AuthExceptionType.TooManyAttempts, errorMessage);
      default:
        throw new AuthException(AuthExceptionType.Generic, errorMessage);
    }
  }
}