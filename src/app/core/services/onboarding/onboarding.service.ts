import { Injectable } from '@angular/core';
import { InsightsHttpService } from '../insights-http/insights-http.service';
import { Storage } from '@ionic/storage';

import { AccountListResponse } from '../../data/account/account-response';
import { InstitutionSelectionResponse, CredentialInputFieldResponse } from '../../data/institution/institution-response';
import { ConnectionSiteSelectedResponse, ConnectionEstablishedResponse } from '../../data/shared/institution-connection-response';
import { OnboardingStatus } from '../../data/onboarding/onboarding-types';
import { OnboardingUtils } from '../../../screens/onboarding/shared/onboarding-utils';

@Injectable()
export class OnboardingService {
  // private _hasCompletedFirstRun: boolean;
  // get hasCompletedFirstRun(): boolean {
  //    return this._hasCompletedFirstRun;
  // }
  // set hasCompletedFirstRun(hasCompleted: boolean) {
  //   this._hasCompletedFirstRun = hasCompleted;
  // }
  constructor(
    protected http: InsightsHttpService,
    protected storage: Storage
  ) {}
  /**
   * Get onboarding status flags
   * @returns {Promise<OnboardingStatus>} 
   * @memberof OnboardingService
   */
  public getStatus(): Promise<OnboardingStatus> {
    return this.storage.get('onboarding:status').then(status => {
      return Object.assign({
        hasCompletedFirstRun: false,
        hasAccounts: false,
        hasLocalProfile: false
      }, status || {}) as OnboardingStatus;
    }).catch(err => {
      console.error('Could not retrieve onboarding status');
      console.error(err);
      return {};
    });
  }
  public setStatus(newStatus: Partial<OnboardingStatus>) {
    return this.storage.get('onboarding:status').then(status => {
      return this.storage.set('onboarding:status', Object.assign(status, newStatus));
    });
  }
  /**
   * Given an institution, retrieve the credential fields required for that institution
   * @param {(string|number)} externalProviderId - The provider who will give us that institution's data
   * @returns {Promise<CredentialInputField[]>} 
   * @memberOf OnboardingService
   */
  public getConnectionCredentialFields(externalProviderId: string|number): Promise<OnboardingUtils.CredentialInputFieldShape[]> {
    let endpoint = ['external-accounts', 'connect', externalProviderId.toString()];
    return this.http.get(endpoint).toPromise().then(resp => {
      let credFields: { fields: CredentialInputFieldResponse[] } = resp.json();
      return credFields.fields.map(cf => {
        let inputTypeConditions: Array<{type: string, cond: boolean}> = [
          { type: 'number', cond: cf.fieldType.typeName === 'NUMBER' },
          { type: 'password', cond: cf.valueIdentifier === 'passord' || cf.name.toLowerCase() === 'password' }
        ];
        return <OnboardingUtils.CredentialInputFieldShape> {
          label: cf.displayName,
          placeholder: cf.displayName,
          inputName: cf.valueIdentifier,
          inputSize: cf.size,
          inputType: inputTypeConditions.reduce((existing, current) => current.cond ? current.type : existing, 'text'),
          required: !(cf.optional && cf.isOptional),
          valueMask: cf.valueMask,
          credentialInputFieldResponse: cf
        };
      });
    }).catch(err => {
      console.warn(err);
    });
  }
  /**
   * Request bank account retrieval at the backend, given the following credentials
   * @param {(number|string)} externalProviderId  - The provider who will give us that institution's data
   * @returns {Promise<boolean>} 
   * @memberOf OnboardingService
   */
  public submitConnectionCredentials(externalProviderId: number|string, fields: OnboardingUtils.CredentialInputFieldShape[]): Promise<boolean> {
    let endpoint = ['external-accounts', 'connect', `${externalProviderId}`];
    // CredentialInputFieldShape -> CredentialInputFieldResponse mapping occurs here
    let responseFields: CredentialInputFieldResponse[] = fields.map(f => ({
      valueIdentifier: f.inputName,
      value: f.value,
    }));
    let payload = { fields: responseFields };
    return this.http.post(endpoint, payload).toPromise().then(resp => {
      if (resp.status === 200) {
        let submitResp: { id: string } = resp.json();     // expect :id as guid string
        return submitResp.id ? true : false;
      }
      return false;
    }).catch(err => {
      console.warn(err);
      return false;
    });
  }
  /**
   * Get an ID list summary of existing accounts, used in a stateful way downstream 
   * to determine deltas (and therefore if any new accounts were added)
   * @returns {string[]} 
   * @memberOf OnboardingService
   */
  public getExistingAccountSummary(): Promise<number[]> {
    let path = ['external-accounts'];
    return this.http.get(path).toPromise().then(resp => {
      let accountList: AccountListResponse = resp.json();
      return accountList.allAccounts.map(ac => ac.id);
    });
  }
}