import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';

import { VersionService } from './version.service';
import { CacheService } from '../shared/cache.service';
import { VersionInfo } from '../../data/version/version-types';

@Injectable()
export class VersionMigrationService extends CacheService<VersionInfo> {
  protected cacheKey: string = 'versionInfo';
  protected cacheTTL: number = 0;      // Never
  constructor(
    protected storage: Storage,
    protected versionService: VersionService
  ) { super(storage); }
  /**
   * If a semver major or minor version change is detected, drop local storage. 
   * Only do this is checkValid can confirm that version is out of date.
   * @todo Configure central control for this service somewhere in a file or something
   * @returns {Promise<boolean>} 
   * @memberof VersionMigrationService
   */
  checkAndWipeStorage(): Promise<boolean> {
    return this.checkValid().then(isValid => {
      return this.versionService.ready().then(currentVersion => {
        if (!isValid) {
          // Update version info, then 
          return super._set(currentVersion).then(() => {
            console.warn(`Version Migration Service checked the build version (${currentVersion.version}) and found it was different to the stored version. Local storage will be dumped.`);
            return this.storage.clear().then(() => true);
          });
        }
        else {
          console.log(`Version Migration Service checked the version (${currentVersion.version}), which is still valid.`);
          return false;
        }
      });
      // let currentVersion = this.versionService.versionInfo;
    });
  }
  /**
   * Returns true if version numbers are mismatched due to upgrades
   * @returns {Promise<boolean>} 
   * @memberof VersionMigrationService
   */
  checkValid(): Promise<boolean> {
    return this.versionService.ready().then(versionInfo => {
      let currentMajorMinor = semverRetrieveMajorMinor(versionInfo.version);
      return super._get().then((versionInfo: VersionInfo) => {
        let storedMajorMinor = semverRetrieveMajorMinor(versionInfo.version);
        return currentMajorMinor === storedMajorMinor;
      }).catch(err => {
        // Most likely version info has never been stored. 
        // Set new version info, then assume valid because we don't know otherwise
        console.warn('Version Migration Service was unable to detect the current stored version.');
        let currentVersion = versionInfo;      
        super._set(currentVersion).then(() => {
          console.info(`The current version ${currentVersion.version} will be stored as the current version.`);
        }).catch(err => {
          console.warn(`Attempted to automatically set the current version to ${currentVersion.version} but it didn't work.`);
        });
        return true;
      });
    });
    function semverRetrieveMajorMinor(semverString: string): string {
      return semverString.split('.').slice(0, 2).join('.');
    }
  }
  /**
   * Return currently registered (stored) version info
   * @returns {Promise<any>} 
   * @memberof VersionMigrationService
   */
  get(): Promise<VersionInfo> {
    return super._get();
  }
  /**
   * Register the current version info
   * @returns {Promise<VersionInfo>} 
   * @memberof VersionMigrationService
   */
  set<VersionInfo>(currentVersion): Promise<boolean> {
    return this.versionService.ready().then(versionInfo => {
      return super._set(versionInfo);    
    })
  }
}