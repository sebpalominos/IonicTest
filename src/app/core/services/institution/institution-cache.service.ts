import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';

import { CacheService } from '../shared/cache.service';
import { Cache } from '../../data/shared/cache';
import { Institution, InstitutionShape } from '../../../screens/onboarding/shared/institution.model';

@Injectable()
export class InstitutionCacheService extends CacheService<Institution[]> {
  constructor(
    protected storage: Storage
  ) { super(storage); }

  protected cacheKey: string = 'cache.institutions';
  protected cacheTTL: number = 86400;      // 24 hrs

  /**
   * Get data out of the cache
   * @returns {Promise<Institution[]>} 
   * @memberOf InstitutionCacheService
   */
  public get(): Promise<Institution[]> {
    return super._get().then((instos: Institution[]) => {
      // Must revive object through constructor, as it gets flattened from cache
      return instos.map(i => new Institution(i));
    });
  }
  /**a
   * Set data into the cache, with default expiry
   * @param {Institution[]} data 
   * @param {boolean} [overwrite=false] - Clear out existing data before writing
   * @returns {Promise<boolean>} 
   * @memberOf InstitutionCacheService
   */
  public set(data: Institution[], overwrite: boolean = false): Promise<boolean> {
    return this.checkValid(!overwrite).then(ok => {
      if (ok) {
        return this.get().then((instos: Institution[]) => {
          return Object.assign(instos, data);
        });
      }
      return data;
    }).then((instos: Institution[]) => {
      return super._set(instos);
    });
  }
  /**
   * Determine whether or not it's recommend to use the current cache
   * @returns {Promise<boolean>} 
   * @memberOf InstitutionCacheService
   */
  public checkValid(cacheEnabled: boolean = true): Promise<boolean> {
    // if (this.versionService.versionInfo.version)
    return cacheEnabled ? super._checkValid() : Promise.resolve(false);
  }
}