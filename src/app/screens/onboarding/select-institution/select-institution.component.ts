import { Component, ViewChild } from '@angular/core';
import { NavParams, NavController, LoadingController, AlertController, Searchbar, Content } from 'ionic-angular';

import { ProvideCredentialsComponent } from '../provide-credentials/provide-credentials.component';
import { Institution } from '../shared/institution.model';
import { OnboardingUtils } from '../shared/onboarding-utils';
import { InstitutionService } from '../../../core/services/institution/institution.service';

const defaultInstoLogoUrl = 'assets/img/res/opica/opica-approved.png';
type DisplayableInsto = {
  insto: Institution;
  logo: string;
  hidden?: boolean;
};

@Component({
  selector: 'scr-select-institution',
  templateUrl: 'select-institution.html',
  host: {
    class: 'select-institution'
  }
})
export class SelectInstitutionComponent {
  @ViewChild(Content) content: Content;
  @ViewChild(Searchbar) searchbar: Searchbar;
  instos: DisplayableInsto[];
  isSkippable: boolean;
  showLoading: boolean;
  showFilter: boolean;
  constructor(
    protected params: NavParams, 
    protected navCtrl: NavController,
    protected alertCtrl: AlertController,
    protected loadingCtrl: LoadingController,
    protected institutionService: InstitutionService
  ) {}
  ionViewWillLoad() {
    // let deepLinkParams: OnboardingUtils.DeepLinkParams = this.params.get('params') || {};
    this.isSkippable = this.params.get('skippable') || false;
  }
  // NOTE: By virtue of being the first screen in the modal, ionView*Load will not place the modal in the right place.
  ionViewWillEnter() {
    if (!this.instos || this.instos.length === 0) {
      this.loadInstos();
    }
  }
  toggleFilter(showFilter?: boolean) {
    this.showFilter = showFilter !== undefined ? showFilter : !this.showFilter;
    if (this.showFilter) {
      setTimeout(() => {
        this.searchbar.value = '';
        this.searchbar.setFocus();
      }, 250);
    }
    else {
      this.instos.forEach(item => item.hidden = false);
    }
    this.content.resize();
  }
  filterItems(event: any) {
    let filterKeyword = event.target.value;
    let determineIfHidden: (displayInsto: DisplayableInsto) => boolean = displayInsto => {
      if (filterKeyword === '' || filterKeyword === null || filterKeyword === undefined) return false;
      let instoNameLower = displayInsto.insto.displayName().toLowerCase();
      return instoNameLower.includes(filterKeyword.toLowerCase()) === false;
    };
    this.instos.forEach(displayInsto => {
      displayInsto.hidden = determineIfHidden(displayInsto);
    });
  }
  submitInsto(institution: Institution) {
    let loading = this.loadingCtrl.create({ 
      content: `Selecting ${institution.displayName()}`,
      spinner: 'crescent',
      dismissOnPageChange: true, 
    });
    loading.present();
    this.institutionService.setInstitution(institution).then((institutionId: number) => {
      loading.dismiss();
      if (institutionId >= 0) {
        let provideCredentialsParams = { institution, institutionId } as OnboardingUtils.ProvideCredentialsParams;
        this.navCtrl.push(ProvideCredentialsComponent, provideCredentialsParams);
      }
      else {
        this.alertCtrl.create({
          title: "Could not select", 
          subTitle: "There was an error in setting this institution.",
          buttons: [ 'OK' ]
        }).present();
      }
    }).catch(err => {
      console.error(err);
      loading.dismiss().catch(err => console.error(err));
    });
  }
  skip() {
    this.closeAll();
  }
  closeAll() {
    let modalParent = this.navCtrl.parent.getActive().dismiss();
  }
  private updateInstoToDefaultLogo(displayInsto: DisplayableInsto) {
    displayInsto.logo = defaultInstoLogoUrl;
  }
  private loadInstos() {
    // Load a list of institutions and let user choose the next one
    this.showLoading = true;
    // let loading = this.loadingCtrl.create({ dismissOnPageChange: true, content: "Loading institutions" });
    // loading.present();
    this.institutionService.getInstitutions().then((instos: Institution[]) => {
      // Move the "test" instos to the top
      // instos.unshift(instos.splice(instos.findIndex(i => i.slug === 'bank_of_custom'), 1)[0]);
      // instos.unshift(instos.splice(instos.findIndex(i => i.slug === 'bank_of_statements'), 1)[0]);
      this.instos = instos.map(insto => ({ insto, logo: insto.getLogoUrl() } as DisplayableInsto));
      this.showLoading = false;
      // loading.dismiss();
    }).catch(err => {
      console.error(err);
      this.showLoading = false;
    });
  }
}
