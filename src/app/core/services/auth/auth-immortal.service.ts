import { Injectable } from '@angular/core';
import { Events } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { InsightsHttpService } from '../insights-http/insights-http.service';
import { TelemetryService } from '../telemetry/telemetry.service';

import { AuthState } from '../../../screens/auth/shared/auth-state';

@Injectable()
export class AuthImmortalService {
  isUsingImmortal: boolean;
  constructor(
    protected storage: Storage,
    protected events: Events,
    protected http: InsightsHttpService,
    protected telemetryService: TelemetryService,
  ) {}
 /**
   * Immortal Token login, for dev/test only. 
   * @todo: Account for failed storage scenarios. 
   * @param {string} immortal 
   * @returns {Promise<boolean>} 
   * @memberOf AuthService
   */
  persistImmortal(immortal: string, endpoint?: string): Promise<boolean> {
    return this.storage.ready().then(() => {
      console.log(`Setting immortal token to ${immortal}`);
      let setImmortal = this.storage.set('auth.testHarness.immortalToken', immortal);
      let setEndpoint = endpoint 
        ? this.storage.set('auth.testHarness.baseUrlEndpoint', endpoint) 
        : this.storage.remove('auth.testHarness.baseUrlEndpoint');
      // A convenient time to set asset base
      let setAssetBase = endpoint 
        ? this.storage.set('assets.baseUrlEndpoint', endpoint.replace('api/', 'assets/')) 
        : this.storage.remove('assets.baseUrlEndpoint');
      return Promise.all([setImmortal, setEndpoint]).then(results => {
        this.telemetryService.setUsername(immortal, true);
        return this.http.reloadImmortal().then(() => {
          this.events.publish('auth:authenticated', AuthState.ImmortalToken);    // Needed to trigger homepage to reload
          this.events.publish('auth:credentialsReady', AuthState.ImmortalToken);
          this.isUsingImmortal = true;
          return true;
        });
      });
    });
  }
  /**
   * The opposite of persistImmortal
   * @returns {Promise<boolean>} 
   * @memberOf AuthTestHarnessService
   */
  depersistImmortal(): Promise<boolean> {
    return this.storage.ready().then(() => {
      let unsetImmortal = this.storage.remove('auth.testHarness.immortalToken');
      let unsetEndpoint = this.storage.remove('auth.testHarness.baseUrlEndpoint');
      return Promise.all([unsetImmortal, unsetEndpoint]).then(results => {
        console.log(`Removed immortal token`);
        return this.http.reloadImmortal().then(() => {
          this.events.publish('auth:notAuthenticated');
          this.isUsingImmortal = false;
          return true;
        })
      });
    });
  }
}