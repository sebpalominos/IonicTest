import { Storage } from '@ionic/storage';
import { Cache } from '../../data/shared/cache';
/**
 * CacheService serializes data objects alongside timestamp information, and implementations 
 * would typically use a client-side service such as LocalStorage to persist the data.
 * @export
 * @abstract
 * @class CacheService
 */
export abstract class CacheService<T> {
  constructor(
    protected storage: Storage
  ) {}
  /**
   * The key (namespace + name) under which the concrete implementation will store its cache object
   * @protected
   * @abstract
   * @type {string}
   * @memberOf CacheService
   */
  protected abstract cacheKey: string;
  protected abstract cacheTTL: number;
  /**
   * Retrieve cached objects in the relevant format
   * @abstract
   * @template T 
   * @returns {T[]}
   * @memberOf CacheService
   */
  public abstract get(): Promise<T>;
  protected _get(): Promise<T> {
    return this.storage.get(this.cacheKey).then((cache: Cache) => cache.data as T);
  }
  /**
   * Persist objects into the cache with timestamp info
   * @abstract
   * @template T 
   * @param {(T|T[])} items 
   * @memberOf CacheService
   */
  public abstract set(items?: T): Promise<boolean>;
  protected _set(data: T, cacheSettingsOverride?: Cache): Promise<boolean> {
    let cache: Cache = { data, dateLastRetrieved: new Date(), ttl: this.cacheTTL || 86440 };
    Object.assign(cache, cacheSettingsOverride || {});
    return this.storage.set(this.cacheKey, cache).then(() => true);
  }
  /**
   * Check the cached object(s) for timestamp validity and return an overall result
   * @abstract
   * @returns {boolean} 
   * @memberOf CacheService
   */
  public abstract checkValid(): Promise<boolean>;
  protected _checkValid(): Promise<boolean> {
    return this.storage.get(this.cacheKey).then((cache: Cache) => {
      if (!cache) {
        return false;
      }
      let cacheValid = true;
      if (cache.expires) {
        cacheValid = Date.now() - +cache.expires > 0;    // Is now less than expiry time
      }
      else if (cache.dateLastRetrieved && cache.ttl) {
        cacheValid = Date.now() - +new Date(cache.dateLastRetrieved) < (cache.ttl * 1000);     // is now less than dateRetrieved + TTL
      }
      let isNotEmptyArray = !(Array.isArray(cache.data) && cache.data.length === 0);
      let isNotEmptyObject = Object.keys(cache.data).length === 0;
      return cacheValid && cache.data && (isNotEmptyArray || isNotEmptyObject);
    }); 
  }
}