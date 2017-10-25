import { Injectable } from '@angular/core';
import { Config } from 'ionic-angular';
import { InsightsHttpService } from '../insights-http/insights-http.service';

import { VersionInfo, WhiteLabel, CapabilityDefinitionItem } from '../../data/version/version-types';
// import { APP_VERSION_INFO } from '../../../config/version-info.config';
// import { WHITE_LABEL } from '../../../config/white-label.config';

@Injectable()
export class VersionService {
  protected _ready: Promise<VersionInfo>;
  protected versionInfo: VersionInfo;
  protected whiteLabel: WhiteLabel.Definition;  
  constructor(
    protected config: Config,
    protected http: InsightsHttpService
  ) { this.init(); }
  /**
   * Get a white label theme variable
   * @param {string} [keyName] 
   * @returns {Partial<WhiteLabel.ThemeDefinition>} 
   * @memberof VersionService
   */
  theme(keyName: string): any {
    // Assume theme keynames are 1 layer deep at most
    return this.hasTheme() && this.whiteLabel.theme[keyName];
  }
  /**
   * Get a theme capability setting
   * @param {WhiteLabel.CapabilityMatrixKey} [keyName] 
   * @returns {Partial<WhiteLabel.CapabilityMatrixDefinitions>} 
   * @memberof VersionService
   */
  capabilities(keyName: WhiteLabel.CapabilityMatrixKey): string | WhiteLabel.WLCapabilityTypeStagedTesting | WhiteLabel.WLCapabilityTypeOnOff {
    return this.hasCapabilities() && this.whiteLabel.capabilities[keyName];
  }
  /**
   * Absolute answer for whether a capability is or isn't enabled.
   * @param {WhiteLabel.CapabilityMatrixKey} keyName 
   * @returns {boolean} True (enabled) by default
   * @memberof VersionService
   */
  isCapabilityEnabled(keyName: WhiteLabel.CapabilityMatrixKey): boolean {
    if (this.hasCapabilities()) {
      let capabilityValue = this.capabilities(keyName);
      return capabilityValue ? ['alpha', 'beta', 'release', 'on'].indexOf(capabilityValue) >= 0 : true;
    }
    else {
      return true;
    }
  }
  /**
   * Check items against capability filters, returning only items which are non-hidden
   * @param {Array<{ identifier: WhiteLabel.CapabilityMatrixKey }>} list 
   * @returns {Array<{ identifier: WhiteLabel.CapabilityMatrixKey }>} 
   * @memberof VersionService
   */
  assignCapabilityDesignation<T extends CapabilityDefinitionItem>(list: T[], includeDisabled?: boolean): T[] {
    if (this.hasCapabilities()) {
      return list.map(listItem => {
        let capEntry = this.whiteLabel.capabilities[listItem.identifier];
        return Object.assign(listItem, { designation: capEntry, disabled: capEntry === 'disabled' });
      }).filter(listItem => {
        // Cut out stuff that's 'off' or 'hidden'
        // 'disabled' will have to be detected and filtered by the consumer
        return includeDisabled 
          ? ['disabled', 'alpha', 'beta', 'release', 'on'].indexOf(listItem.designation) >= 0
          : ['alpha', 'beta', 'release', 'on'].indexOf(listItem.designation) >= 0;
      });
    }
    else {
      return list;
    }
  }
  /**
   * 
   * @returns {Promise<VersionInfo>} 
   * @memberof VersionService
   */
  ready(): Promise<VersionInfo> {
    if (this.versionInfo) {
      return Promise.resolve(this.versionInfo);
    }
    else {
      return this._ready ? this._ready.then(versionInfo => {
        return versionInfo;
      }) : Promise.reject('VersionService Ready was not correctly set up');
    }
  }
  protected init() {
    // Bind the Config lookup to the _ready private field
    let versionInfoReady: Promise<VersionInfo> = this.http.getJSONConfigs(['version-info', 'white-label']).then((retrievedConfigLists: any[]) => {
      this.versionInfo = retrievedConfigLists[0];
      this.whiteLabel = retrievedConfigLists[1];
      return this.versionInfo;
    }).catch(err => {
      console.error(err);
      return { version: '0.0.0' } as VersionInfo;
    });
    this._ready = versionInfoReady;
  }
  private hasCapabilities(): boolean {
    return this.whiteLabel != null && !!this.whiteLabel.capabilities;
  }
  private hasTheme(): boolean {
    return this.whiteLabel != null && !!this.whiteLabel.theme;
  }
}