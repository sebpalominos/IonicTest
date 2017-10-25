import { Component } from '@angular/core';
import { NavController, ViewController, NavParams, LoadingController, AlertController } from 'ionic-angular';
import { AccountService } from '../../../core/services/account/account.service';
import { InstitutionService } from '../../../core/services/institution/institution.service';
import { SyncingAccount } from '../shared/account.model';
import { Institution } from '../../onboarding/shared/institution.model';

@Component({
  selector: 'scr-disabled-accounts-list',
  templateUrl: 'disabled-accounts.component.html',
  host: {
    class: 'disabled-accounts-list '
  }
})
export class DisabledAccountsComponent {

  showDisabledAccountsLoading: boolean = false;
  isChecked: boolean = false;
  disabledAccounts;
  reenableCount = 0;
  reenableArray: SyncingAccount[] = [];
  disableAccountCount: number = 0;

  constructor(
    public navCtrl: NavController,
    protected navParams: NavParams,
    protected accountService: AccountService,
    protected institutionService: InstitutionService,
    public viewCtrl: ViewController,
    public loadingCtrl: LoadingController,
    protected alertCtrl: AlertController,
  ) {
    if (this.navParams.get('disabled')) {
      // console.log('param disable', this.navParams.get('disabled'));
      this.disabledAccounts = this.navParams.get('disabled');
      this.loadDisabledAccounts(this.disabledAccounts, true);
      console.log('modal disabled-accounts', this.disabledAccounts);
    }
  }

  loadDisabledAccounts(disabledAccounts, foreground = false, refresher?) {
    this.showDisabledAccountsLoading = true;
    // console.log('disabledAccounts', this.disabledAccounts)
    disabledAccounts.forEach(elem => {
      let instoParams = { slug: elem.providerInternalSlug, id: elem.providerInternalId };
      this.institutionService.getKnownInstitution(instoParams).then(insto => {
        this.showDisabledAccountsLoading = false;
        elem.bankLogoUrl = insto.logoUrl;
      });
    });
    this.disableAccountCount = this.countDisabledAccounts(disabledAccounts);
  }

  selectedDisabledAccount() {

    let isSelectedCount = 0;
    let noSelectedCount = 0
    this.disabledAccounts.forEach(elem => {
      elem.disabledAccounts.forEach(subelem => {
        if (subelem.checked) {
          isSelectedCount += 1;
        } else {
          noSelectedCount += 1;
        }
      });
    });
    // console.log('disableAccountCount',disableAccountCount);
    if (noSelectedCount === this.disableAccountCount) {
      this.isChecked = false;
    } else {
      this.isChecked = true;
    }
    // console.log('isSelectedCount',isSelectedCount);
    // console.log('noSelectedCount',noSelectedCount);
    // console.log('selectedDisabledAccount',this.isChecked);
  }

  countDisabledAccounts(disabledAccounts): number {
    let disabledAccountCount: number = 0;
    disabledAccounts.forEach(elem => {
      disabledAccountCount += elem.disabledAccounts.length;
      // console.log('disabledAccountCount',disabledAccountCount);
    });
    return disabledAccountCount;
  }

  reenableAccounts() {

    if (this.isChecked) {

      let enableHandler = () => {
        let loading = this.loadingCtrl.create({ content: `Re-enabling account(s)` });
        loading.present();

        //First: know the amount of selected accounts to re-enable
        // this.disabledAccounts.forEach((elem) => {
        //   elem.disabledAccounts.forEach((subelem) => {
        //     if (subelem.checked) {
        //       this.reenableCount += this.reenableCount;
        //     }
        //   });
        // });
        //Second: Re-enabling accounts and saving a counter in reenableArray
        this.disabledAccounts.forEach((elem) => {
          elem.disabledAccounts.forEach((subelem) => {
            if (subelem.checked) {
              this.accountService.reenableAccount(subelem).then(reenableAccount => {
                this.disabledAccounts = reenableAccount;
                this.reenableArray.push({
                  id: subelem.connectorUserSiteId,
                  name: subelem.name,
                  institutionId: elem.providerInternalId,
                  origin: 'reenabled',
                  institution: {
                    id: elem.providerInternalId,
                    name: elem.providerName,
                    slug: elem.providerInternalSlug,
                    logoUrl: elem.bankLogoUrl
                  } as Institution
                } as SyncingAccount);
              });
              console.log('reenableArray', this.reenableArray);
            }
          });
        });
        //Third: Callback disabledAccounts to Account list
        // if (this.reenableCount === this.reenableArray.length) {
          loading.dismiss();
          this.viewCtrl.dismiss({ reenabled: this.reenableArray, disabled: this.disabledAccounts });
        // }
      }
      this.reenableCount = this.selectedEnabledAccountsCount();
      let alert;
      if (this.reenableCount == 1) {
        alert = this.alertCtrl.create({
          title: 'Re-enable account',
          message: 'Do you want to re-enable this account?'
        });
      }
      else if (this.reenableCount > 1) {
        alert = this.alertCtrl.create({
          title: 'Re-enable account',
          message: 'Do you want to re-enable these accounts?'
        });
      }

      alert.addButton({ text: 'No', role: 'cancel' });
      alert.addButton({ text: 'Yes', handler: () => enableHandler() });
      alert.present();
    }
  }

  private selectedEnabledAccountsCount(): number {
    let count = 0;
    this.disabledAccounts.forEach((elem) => {
      elem.disabledAccounts.forEach((subelem) => {
        if (subelem.checked) {
          count++;
        }
      });
    });
    return count;
  }

  cancel() {
    this.viewCtrl.dismiss();
  }

}