import { Injectable } from '@angular/core';
import { Http, Request, Response, RequestOptions, RequestOptionsArgs, Headers } from '@angular/http';
import { Platform, Config } from 'ionic-angular';

/* NB: We cannot inject VersionService, due to a circular dependency problem. */
// import { VersionService } from '../version/version.service';
import { VersionInfo } from '../../data/version/version-types';
import { TelemetryPayload } from '../../data/telemetry/telemetry-payload';

@Injectable()
export class TelemetryService {
  private username: string = 'UNDEFINED_OPICA_USER';
  private versionInfo: VersionInfo;
  private apiVersionPrefix: string = 'v1';
  constructor(
    protected http: Http,
    protected config: Config, 
    protected platform: Platform,
  ) {}
  setUsername(username: string, isImmortal?: boolean) {
    this.username = `${isImmortal ? '[imm]' : ''}${username}`;
  }
  setVersionInfo(versionInfo: VersionInfo) {
    this.versionInfo = versionInfo;
  }
  submitException(apiExceptionParams: Partial<TelemetryPayload.ApiExceptionParams>, context?: any): Promise<boolean> {
    return this.getVersionInfo().then(versionInfo => {
      let endpointBase = this.config.get('telemetryEndpoint');
      if (endpointBase != null) {
        let url = [endpointBase, this.apiVersionPrefix, 'insights', 'telemetry', 'exception'].join('/');
        let payload = this.getExceptionRequestPayload(apiExceptionParams, versionInfo, context);
        let requestOptions = this.getRequestOptions();
        return this.http.post(url, payload, requestOptions).toPromise();
      }
      else {
        // Todo: Store in localstorage or something
        throw new Error();
      }
    }).then(resp => {
      let body = resp.json();
      if (body.success) {
        console.log(`Telemetry service posted: ${body.headline}`);
        return true;
      }
      console.warn(`Telemetry service failed to post exception (body.success == false)`);
      return false;
    }).catch(err => {
        console.warn('Telemetry service failed to post exception');
        console.warn(err);
        return false;
    });
  }
  private getExceptionRequestPayload(apiExceptionParams: Partial<TelemetryPayload.ApiExceptionParams>, versionInfo?: VersionInfo, context?: any): TelemetryPayload.ApiException {
    // let username = this.opicaHttpService.userDetails.username || this.opicaHttpService.immortalToken || 'UNKNOWN_OPICA_USER';
    return {
    	user: this.username,
    	env: this.config.get('env', 'NonProd'),
    	app: {
    		version: versionInfo.version,
    		platform: this.getPlatformString()
    	},
    	timestamp: {
    		logged: +new Date
    	},
    	context: JSON.stringify(context),
    	apiException: apiExceptionParams
    }
  }
  private getRequestOptions(): RequestOptions {
    let customHeaders: Headers = new Headers();
    customHeaders.append('Content-Type', 'application/json');    
    // If the telemetryApiToken key wasn't set, does this mean it's not required??
    let apiKey = this.config.get('telemetryApiKey');
    customHeaders.append('X-API-Key', apiKey);
    let customRequestOptionsArgs: RequestOptionsArgs = {
      headers: customHeaders
    };
    return new RequestOptions(customRequestOptionsArgs);
  }
  private getVersionInfo(): Promise<VersionInfo> {
    // This method returns a promise, for flexibility in future scenarios where
    // we may retrieve the version info through a promise-based service interface
    return Promise.resolve(this.versionInfo || {
      version: '0.0.0',
      versionDate: null,
      versionDateHuman: '',
    });
  }
  private getPlatformString(): string {
    let versions: any = this.platform.versions();
    if (versions.hasOwnProperty('ios')) {
      let appleDevice = versions.hasOwnProperty('ipad') ? 'iPad' : 'iPhone';
      if (versions.ios.str) {
        return `${appleDevice}/iOS ${versions.ios.str}`;
      }
      else if (versions.ios.major) {
        return `${appleDevice}/iOS ${versions.ios.major}.${versions.ios.minor}`;
      }
      else {
        return `${appleDevice}/iOS UnknownVersion`;
      }
    }
    else if (versions.hasOwnProperty('android')) {
      if (versions.android.str) {
        return `Android ${versions.android.str}`;
      }
      else if (versions.android.major) {
        return `Android ${versions.android.major}.${versions.android.minor}`;
      }
      else {
        return `Android UnknownVersion`;
      }
    }
  }
}