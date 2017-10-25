import { Injectable } from '@angular/core';
import { InsightsHttpService } from '../insights-http/insights-http.service';

import { InstitutionCacheService } from './institution-cache.service';
import { AccountListResponse } from '../../data/account/account-response';
import { InstitutionSelectionResponse, ProviderSummaryListResponse, ProviderStatusResponse, CredentialInputFieldResponse } from '../../data/institution/institution-response';
import { AffectedInstitution } from '../../data/institution/institution-types';
import { Institution, InstitutionShape } from '../../../screens/onboarding/shared/institution.model';
import { InstitutionIdMap } from '../../../screens/onboarding/shared/institution-data-maps';
import { ConnectionSiteSelectedResponse, ConnectionEstablishedResponse } from '../../data/shared/institution-connection-response';

@Injectable()
export class InstitutionService {
  constructor(
    protected http: InsightsHttpService,
    protected institutionCacheService: InstitutionCacheService
  ) {}
  /**
   * Retrieve list of financial institutions available from OPICA core/Bankfeeds
   * NOTE: This is EVERY SINGLE POSSIBLE INSTO, not the list of already-onboarded instos...
   * @param {boolean} [useCache=true] - Use the cache if possible
   * @returns {Promise<Institution[]>} 
   * @memberOf OnboardingService
   */
  public getInstitutions(useCache: boolean = true): Promise<Institution[]> {
    // return Promise.resolve(FINANCIAL_INSTITUTIONS.map(fi => new Institution(fi)));
    return this.institutionCacheService.checkValid(useCache).then(ok => {
      return ok ? this.institutionCacheService.get() : this.getInstitutionsFromRemote();
    });
  }
  private getInstitutionsFromRemote(): Promise<Institution[]> {
    let endpoint = ['external-accounts', 'search-sites', 'AU'];
    return this.http.get(endpoint).toPromise().then(resp => {
      let institutionResponses: InstitutionSelectionResponse[] = resp.json();
      let institutions = institutionResponses.map(i => Institution.createFromResponse(i));
      this.institutionCacheService.set(institutions);
      return institutions;
    }).catch(err => {
      console.warn(err);
      return null;
    });
  }
  /**
   * Temporary solution which string-matches provider names, due to lack of common ID between 'sites' and 'accounts'
   * @param {string[]} [providerNames] 
   * @returns {Promise<Institution[]>} 
   * 
   * @memberOf OnboardingService
   */
  public getInstitutionsByProviderNames(providerNames: string[], useCache: boolean = true): Promise<Institution[]> {
    // return Promise.resolve(FINANCIAL_INSTITUTIONS.map(fi => new Institution(fi)));
    return this.institutionCacheService.checkValid(useCache).then(ok => {
      if (ok) {
        return this.institutionCacheService.get().then(instos => {
          return instos.filter(i => providerNames.indexOf(i.commonName) + providerNames.indexOf(i.name) >= 0);
        });
      }
      return this.getInstitutionsByProviderNamesFromRemote(providerNames);
    });
  }
  private getInstitutionsByProviderNamesFromRemote(providerNames: string[]): Promise<Institution[]> {
    return this.getInstitutionsFromRemote().then(instos => {
      return instos.filter(i => providerNames.indexOf(i.commonName) + providerNames.indexOf(i.name) >= 0);
    });
  }
  /**
   * Retrieve a particular financial institution from OPICA core
   * @param {number} instoId 
   * @returns {Promise<Institution>} 
   * @memberOf OnboardingService
   */
  public getInstitution(searchName: string): Promise<Institution> {
    let endpoint = ['external-accounts', 'search-sites', 'AU', searchName];
    return this.http.get(endpoint).toPromise().then(resp => {
      let institutionResponses: InstitutionSelectionResponse[] = resp.json();
      let institutions = institutionResponses.map(i => Institution.createFromResponse(i));
      return institutions.pop();
    });
  }
  /**
   * If institution/provider status is not OK, return that provider here.
   * @returns {Promise<AffectedInstitution[]>} 
   * @memberof InstitutionService
   */
  public getAffectedInstitutions(): Promise<AffectedInstitution[]> {
    let endpoint = ['external-accounts', 'connected-sites-summary'];
    return this.http.get(endpoint).toPromise().then(resp => {
      let body: ProviderStatusResponse[] = resp.json();
      return body.filter(status => status.lastRefreshStatus !== 'SUCCESS').map(status => ({
        slug: status.providerInternalSlug,
        providerId: status.providerInternalId,
        providerSlug: status.providerInternalSlug,
        lastRefreshStatus: status.lastRefreshStatus
      } as AffectedInstitution));
    });
    // ProviderStatusResponse
  }
  /**
   * Get an institution that's previously been onboarded into OPICA Core.
   * @param {{ slug?: string; id?: number }} searchParams 
   * @returns {Promise<Institution>} 
   * @memberof InstitutionService
   */
  public getKnownInstitution(searchParams: { slug?: string; id?: number }): Promise<Institution> {
    let endpoint = ['external-accounts', 'providers', 'AU'];
    return this.http.get(endpoint).toPromise().then(resp => {
      let summaryResponseList: ProviderSummaryListResponse = resp.json();
      let summaries = summaryResponseList.items.map(i => Institution.createFromSummaryResponse(i));
      if (searchParams.id) {
        return summaries.find(sm => sm.id === searchParams.id);      
      }
      if (searchParams.slug) {
        return summaries.find(sm => sm.slug === searchParams.slug);
      }
      return undefined;
    });
  }
  /**
   * Get a list of institutions that have previously been onboarded into OPICA Core.
   * @param {Array<{ slug?: string; id?: number }>} [searchParamSet] 
   * @returns {Promise<Institution[]>} 
   * @memberof InstitutionService
   */
  public getKnownInstitutions(searchParamSet?: Array<{ slug?: string; id?: number }>): Promise<Institution[]> {
    let endpoint = ['external-accounts', 'providers', 'AU'];
    return this.http.get(endpoint).toPromise().then(resp => {
      let summaryResponseList: ProviderSummaryListResponse = resp.json();
      let summaries = summaryResponseList.items.map(i => Institution.createFromSummaryResponse(i));
      if (searchParamSet) {
        return summaries.filter(sm => {
          for (var i in searchParamSet) {
            if (sm.id === searchParamSet[i].id || sm.slug === searchParamSet[i].slug) {
              return true;
            }
          }
          return false;
        });
      }
      else {
        return summaries;
      }
    });
  }
  /**
   * Submit a selected financial institution. At the API server, this should facilitate a new connection to the provider if necessary.
   * @param {Institution} institution - Nominate an institution to use
   * @returns {Promise<number>} - The externalProviderId to be used for a subsequent connection call 
   * @memberOf OnboardingService
   */
  public setInstitution(institution: Institution): Promise<number> {
    let endpoint = ['external-accounts', 'site-selected'];
    let payload = institution.convertToPayload();
    return this.http.post(endpoint, payload).toPromise().then(resp => {
      if (resp.ok) { 
        let siteSelectedResponse: ConnectionSiteSelectedResponse = resp.json();
        return siteSelectedResponse.externalAccountProviderId;
      }
      else {
        return -1;
      }
    }).catch(err => {
      console.warn(err);
    });
  }
}