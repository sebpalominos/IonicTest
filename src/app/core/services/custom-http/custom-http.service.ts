import { Http, Request, RequestOptions, RequestOptionsArgs, Response } from '@angular/http';
import { Config } from 'ionic-angular';
import { Observable } from 'rxjs/Observable';
import { Storage } from '@ionic/storage';
import 'rxjs/add/operator/catch';

/**
 * Http is a wrapper around the Ng2 http client and provides 
 * specific capability to authenticate and interact with the OPICA
 * Core backend, and also handling Auth token and CSRF token
 * persistence, and event emission/broadcasting if invalidated.
 * This class must be concreted to suit a particular API version
 * or specific backend behaviour around auth/login.
 */
export abstract class CustomHttpService {
  protected authToken: string;
  protected csrfToken: string;
  protected isAuthSuccessful: boolean;
  protected sessionInvalidAttempts: number;
  protected endpointBaseUrl: string; 
  constructor(
    protected config: Config,
    protected http: Http,
    protected storage: Storage
  ) {}

  /**
   * Wrapper for HTTP GET, with authentication
   */
  public get(url: string|string[], options?: RequestOptionsArgs) : Observable<Response> {
    url = this.baseUrl(url);
    let requestOptions = this.getAuthRequestOptions(options);
    return this.http.get(url, requestOptions).catch((error, caught) => this.handleError(error, caught, { method: 'GET', url }));
  }

  /**
   * Wrapper for HTTP POST, with authentication
   */ 
  public post(url: string|string[], body: any, options?: RequestOptionsArgs) : Observable<Response> {
    url = this.baseUrl(url);
    let requestOptions = this.getAuthRequestOptions(options);
    return this.http.post(url, body, requestOptions).catch((error, caught) => this.handleError(error, caught, { method: 'POST', body, url }));
  }

  /**
   * Wrapper for HTTP PUT, with authentication
   */
  public put(url: string|string[], body: any, options?: RequestOptionsArgs) : Observable<Response> {
    url = this.baseUrl(url);
    let requestOptions = this.getAuthRequestOptions(options);
    return this.http.put(url, body, requestOptions).catch((error, caught) => this.handleError(error, caught, { method: 'PUT', body, url }));
  }

  /**
   * Wrapper for HTTP PATCH, with authentication
   */
  public patch(url: string|string[], body: any, options?: RequestOptionsArgs) : Observable<Response> {
    url = this.baseUrl(url);
    let requestOptions = this.getAuthRequestOptions(options);
    return this.http.patch(url, body, requestOptions).catch((error, caught) => this.handleError(error, caught, { method: 'PATCH', body, url }));
  }

  /**
   * Wrapper for HTTP DELETE, with authentication
   */
  public delete(url: string|string[], options?: RequestOptionsArgs) : Observable<Response> {
    url = this.baseUrl(url);
    let requestOptions = this.getAuthRequestOptions(options);
    return this.http.delete(url, requestOptions).catch((error, caught) => this.handleError(error, caught, { method: 'DELETE', url }));
  }

  /**
   * Wrapper for HTTP HEAD, with authentication
   */
  public head(url: string|string[], options?: RequestOptionsArgs) : Observable<Response> {
    url = this.baseUrl(url);
    let requestOptions = this.getAuthRequestOptions(options);
    return this.http.head(url, requestOptions).catch((error, caught) => this.handleError(error, caught, { method: 'HEAD', url }));
  }

  /**
   * Wrapper for HTTP OPTIONS, with authentication
   */
  public options(url: string|string[], options?: RequestOptionsArgs) : Observable<Response> {
    url = this.baseUrl(url);
    let requestOptions = this.getAuthRequestOptions(options);
    return this.http.options(url, requestOptions).catch((error, caught) => this.handleError(error, caught, { method: 'OPTIONS', url }));
  }

  /** 
   * Check if the error was an authentication issue
   */
  protected handleError(error: Response, caught: Observable<Response>, context?: any) {
    return Observable.throw(error.json().error || `${error.status} ${error.statusText}`);
    // return Observable.throw(error);
  }

  /** Set persistent tokens to be reused by CustomHttp */
  protected abstract setTokens(authToken: string, csrfToken: string, shouldStoreTokens?: boolean);

  /** Concrete class must implement an expiry procedure */
  // 03 Mar: Decided to set expiry within the setTokens method
  // protected abstract setTokenExpiry(expiryDate: Date);

  /** Concrete class must define how to wrangle auth headers */
  protected abstract getAuthRequestOptions(options: RequestOptionsArgs) : RequestOptions;

  /** Concrete class must define how to load previously stored tokens */
  protected abstract loadStoredTokens();

  protected authReady() : boolean {
    // return !!(this.authToken && this.csrfToken);    // authToken not explicitly stored here
    return !!this.csrfToken;
  }
  /**
   * Whether the auth is available ('up') or if it is down and not working
   */
  protected authUp() : boolean {
    return this.isAuthSuccessful;
  }


  /**
   * Add necessary URL prefixes and concatenate endpoint parts. 
   * @protected
   * @returns {string} - Either an array of path segments, or otherwise assume
   * string is already correctly joined with slashes
   * @memberOf CustomHttpService
   */
  protected baseUrl(url: string|string[]): string {
    url = Array.isArray(url) ? url.join('/') : url;
    return url.match(/^https?:\/\//i) ? url : this.endpointBaseUrl + url;
  }

}