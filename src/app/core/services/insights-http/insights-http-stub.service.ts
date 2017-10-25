import { Injectable, Inject } from '@angular/core';
import { Http, Request, Response, RequestOptions, RequestOptionsArgs, Headers } from '@angular/http';
import { Config, Events } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/toPromise';

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
export class OpicaHttpServiceStub {
  immortalToken: string;
  useImmortalToken: boolean;
  constructor() { 
    this.init(); 
  }
  login(loginEndpoint: string|string[], payload: any): Promise<boolean> {
    return Promise.resolve(true);
  }
  ping(csrfToken?: string): Promise<boolean> {
    return Promise.resolve(true);
  }
  reloadImmortal(): Promise<boolean> {
    return Promise.resolve(true);
  }
  getJSONConfig(configName: string): Promise<any> {
    return Promise.resolve({});
  }
  getJSONConfigs(...configNames: string[]): Promise<any[]> {
    return Promise.resolve([{}]);
  }
  protected setTokens(authToken: string, csrfToken: string, shouldStoreTokens: boolean = true) : Promise<boolean> {
    return Promise.resolve(true);
  }
  protected getAuthRequestOptions(requestOptions: RequestOptionsArgs, forceImmortal = false) : RequestOptions {
    return new RequestOptions();
  }
  protected handleError(error: Response, caught: Observable<Response>, context?: any) {
    // VOID
  }
  protected loadStoredTokens() {
    // VOID
  }
  private init() {
    this.loadStoredTokens();
  }
  private handleSuccessfulLogin(resp: Response): boolean {
    return true;
  }
  private handleBadLogin(error): boolean {
    return true;
  }
}