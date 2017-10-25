import { Component } from '@angular/core';
import { NavParams, NavController, LoadingController, AlertController } from 'ionic-angular';

import { OnboardingUtils } from '../shared/onboarding-utils';
import { Institution } from '../shared/institution.model';
import { ExplainConnectionHelpComponent } from '../explain-connection-help/explain-connection-help.component';
import { FinishedConnectionComponent } from '../finished-connection/finished-connection.component';
import { OnboardingService } from '../../../core/services/onboarding/onboarding.service';
import { InstitutionService } from '../../../core/services/institution/institution.service';

@Component({
  selector: 'opc-provide-credentials',
  templateUrl: 'provide-credentials.html',
  host: {
    class: 'fullscreen-form opc-provide-credentials'
  }
})
export class ProvideCredentialsComponent {
  insto: Institution;
  providerId: number|string;
  fields: OnboardingUtils.CredentialInputFieldShape[];
  showFieldsLoading: boolean;
  showLoadingError: boolean;
  constructor(
    protected params: NavParams, 
    protected navCtrl: NavController,
    protected alertCtrl: AlertController,
    protected loadingCtrl: LoadingController,
    protected onboardingService: OnboardingService, 
    protected institutionService: InstitutionService, 
  ) {}
  ionViewWillLoad() {
    // Expect navParams to yield (1) The institution and (2) the externalProviderId
    this.retrieveProviderId().then(providerId => {
      this.providerId = providerId;
      this.loadCredentialFields();
      return this.retrieveInsto();
    }).then(insto => {
      this.insto = insto;
    }).catch(err => {
      console.error(err);
      this.showLoadingError = true;
    });
  }
  showExplainConnection() {
    this.navCtrl.push(ExplainConnectionHelpComponent);
  }
  submitConnect() {
    if (!this.validateFields()) {
      this.alertCtrl.create({ 
        title: "Fields", 
        subTitle: "Please provide details for all fields", 
        buttons: [ 'OK' ]
      }).present();
      return;
    }
    let loading = this.loadingCtrl.create({ content: 'Connecting' });
    loading.present();
    this.onboardingService
      .submitConnectionCredentials(this.providerId, this.fields)
      .then((success: boolean) => {
        loading.dismiss();
        if (success) {
          this.navCtrl.push(FinishedConnectionComponent);
        }
        else {
          this.alertCtrl.create({ 
            title: "Could not connect", 
            subTitle: "We couldn't retrieve your accounts using the provided details.",
            buttons: [ 'OK' ]
          }).present();
        }
      })
      .catch(err => {
        loading.dismiss();
        this.alertCtrl.create({ 
          title: "Error", 
          subTitle: "An error occurred.", 
          message: err,
          buttons: [ 'OK' ]
        }).present();
      });
  }
  closeAll() {
    let modalParent = this.navCtrl.parent.getActive().dismiss();
  }
  private validateFields(): boolean {
    for (let field of this.fields) {
      if (field.value === '') {
        return false;
      }
    }
    return true;
  }
  private loadCredentialFields() {
    this.showFieldsLoading = true;
    this.onboardingService.getConnectionCredentialFields(this.providerId).then((fields: OnboardingUtils.CredentialInputFieldShape[]) => {
      this.fields = fields;
      this.showFieldsLoading = false;
    }).catch(err => {
      this.showFieldsLoading = false;
      this.showLoadingError = true;
    });
  }
  private retrieveProviderId(): Promise<number> {
    if (this.params.get('institutionId')) {
      return Promise.resolve(this.params.get('institutionId'));
    }
    else if (this.params.get('internalProviderId')) {
      // This is supposed to be an alias for institutionId
      return Promise.resolve(this.params.get('internalProviderId'));
    }
    else {
      return Promise.reject('Institution ID not found');
    }
  }
  private retrieveInsto(): Promise<Institution> {
    if (this.params.get('insto') || this.params.get('institution')) {
      return Promise.resolve(this.params.get('insto') || this.params.get('institution'));
    }
    else if (this.params.get('institutionId') || this.params.get('institutionSlug')) {
      return this.institutionService.getKnownInstitution({
        id: this.params.get('institutionId'),
        slug: this.params.get('institutionSlug')
      }).catch(err => {
        console.error(err);
      });
    }
    else {
      return Promise.reject('Insto argument not found');
    }
  }
}
