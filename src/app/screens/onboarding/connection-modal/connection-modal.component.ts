import { Component, ViewChild } from '@angular/core';
import { NavParams, NavController } from 'ionic-angular';

import { ProvideCredentialsComponent } from '../provide-credentials/provide-credentials.component';
import { SelectInstitutionComponent } from '../select-institution/select-institution.component';
import { OnboardingUtils } from '../shared/onboarding-utils';
import { VersionService } from '../../../core/services/version/version.service';

@Component({
  selector: 'modal-connection',
  template: `
    <ion-nav #onboardingNav></ion-nav>
  `,
  host: {
    class: 'connection-modal'
  }
})
export class ConnectionModalComponent {
  @ViewChild('onboardingNav') nav: NavController;
  constructor(
    protected params: NavParams,
    protected versionService: VersionService
  ) {}
  ionViewCanEnter(): boolean {
   return this.versionService.isCapabilityEnabled('CAP_ACCOUNTS');
  }
  ionViewWillEnter() {
    // Check if this is a reconnection request
    if (this.params.get('isReconnectInstitution')) {
      let provideCredentialsParams = {
        institutionSlug: this.params.get('institutionSlug'),
        institutionId: this.params.get('institutionId'),
      } as OnboardingUtils.ProvideCredentialsParams;
      this.nav.setRoot(ProvideCredentialsComponent, provideCredentialsParams);
    }
    else {
      this.nav.setRoot(SelectInstitutionComponent, { skippable: this.params.get('isSkippable') });
    }
  }
}