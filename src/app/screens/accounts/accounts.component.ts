import { Component, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NavController, AlertController, ActionSheetController, ModalController, LoadingController, Events, Content, List, reorderArray } from 'ionic-angular';

import { Account, SyncingAccount, AccountShape } from './shared/account.model';
import { Institution, InstitutionShape } from '../onboarding/shared/institution.model';
import { InstitutionAccountMap, AccountTypeMap, AccountInfoMap } from './shared/account-data-maps';
import { AccountComponent } from './account/account.component';
import { DisabledAccountsComponent } from './disabled-accounts/disabled-accounts.component';
import { AccountService } from '../../core/services/account/account.service';
import { InstitutionService } from '../../core/services/institution/institution.service';
import { ConnectionModalComponent } from '../onboarding/connection-modal/connection-modal.component';
import { OnboardingUtils } from '../onboarding/shared/onboarding-utils';
import { CategoriesComponent } from '../categories/categories.component';
import { VersionService } from '../../core/services/version/version.service';
import { AffectedInstitution } from '../../core/data/institution/institution-types';
import { AccountMapper } from '../../core/data/account/account-mapper';
import { AccountStats } from '../../core/data/account/account-stats';

@Component({
  selector: 'scr-account-list',
  templateUrl: 'accounts.component.html',
  host: {
    class: 'account-list'
  }
})
export class AccountsComponent {
  @ViewChild(Content) content: Content;
  @ViewChild(List) list: List;
  accounts: AccountInfoMap[];
  accountStats: AccountStats;
  disabledAccounts;
  syncingAccounts: SyncingAccount[];
  instoAccountMap: InstitutionAccountMap[];
  accountTypeMap: AccountTypeMap[];
  loadingScreenIconUrls: string[];
  numAccountsPluralMapping: any;
  numTotalTransactionsPluralMapping: any;
  screens = {
    account: AccountComponent,
    categoryList: CategoriesComponent,
    connection: ConnectionModalComponent,
    reconnection: ConnectionModalComponent,
    disabledAccounts: DisabledAccountsComponent,
  };
  showAccountsLoadingError: boolean = false;
  showAccountsLoading: boolean;
  showNoAccountsTip: boolean = false;
  showEditMode: boolean;
  showDisableMode: boolean;
  isChecked: boolean = false;
  disableAccountCount: number;
  reenableAccountCount: number;

  get hasActiveAccounts(): boolean {
    return this.accounts && this.accounts.length > 0;
  }
  get hasSyncingAccounts(): boolean {
    return this.syncingAccounts && this.syncingAccounts.length > 0;
  }
  get hasNoAccounts(): boolean {
    return !(this.hasActiveAccounts || this.hasSyncingAccounts);
  }
  constructor(
    protected navCtrl: NavController,
    protected alertCtrl: AlertController,
    protected actionSheetCtrl: ActionSheetController,
    protected loadingCtrl: LoadingController,
    protected modalCtrl: ModalController,
    protected events: Events,
    protected accountService: AccountService,
    protected institutionService: InstitutionService,
    protected versionService: VersionService,
  ) { }
  ionViewWillLoad() {
    // this.showAccountsLoading = true;
    this.listenEvents();
    this.loadAccounts(true);
    this.numAccountsPluralMapping = {
      '=0': 'No accounts connected',
      '=1': '1 account connected',
      'other': '# accounts connected'
    };
    this.numTotalTransactionsPluralMapping = {
      '=0': '0 transactions total',
      '=1': '1 transaction in total',
      'other': '# total transactions'
    };
  }
  ionViewCanEnter(): boolean {
    return this.versionService.isCapabilityEnabled('CAP_ACCOUNTS');
  }
  loadAccounts(foreground = false, refresher?) {
    this.showAccountsLoading = true;
    // Do the account fetching and data munging

    Promise.all([
      this.accountService.getAccounts(),
      this.accountService.getAccountTypes(),
      this.institutionService.getAffectedInstitutions(),
      this.accountService.getAccountStats(),
      this.accountService.getDisabledAccounts(),
    ]).then(results => {
      let accounts = results[0] as Array<Account | SyncingAccount>;
      let accountTypes = results[1] as string[];
      let instoStatusList = results[2] as AffectedInstitution[];
      this.accountStats = results[3] as AccountStats;
      this.disabledAccounts = results[4];      
      this.disableAccountCount = this.countDisabledAccounts(results[4]);      
      if (accounts.length > 0) {
        let activeAccounts = accounts.filter(account => !account.isSyncing) as Account[];
        // console.log('activeAccounts',activeAccounts);
        let syncingAccounts = accounts.filter(account => account.isSyncing) as SyncingAccount[];
        
        this.syncingAccounts = syncingAccounts;
        this.accounts = activeAccounts.map(account => {
          if (account.institution) {
            return {
              account: account,
              isDisconnected: account.isDisconnected,
              isReconnectable: true,
              providerId: account.institutionId || account.institution.id,
              providerSlug: account.institution.slug,
            } as AccountInfoMap;
          }
          else {
            let matchedInstoStatusListItem = instoStatusList.find(affected => {
              let isMatchedId = affected.providerId === account.institutionId;
              let isMatchedSlug = account.institution && affected.providerSlug === account.institution.slug
              return isMatchedId || isMatchedSlug;
            });
            if (matchedInstoStatusListItem !== undefined) {
              let isReenterCreds = matchedInstoStatusListItem.lastRefreshStatus === 'REENTER_CREDENTIALS';
              return {
                account: account,
                isDisconnected: isReenterCreds,
                isReconnectable: true,
                providerId: matchedInstoStatusListItem.providerId,
                providerSlug: matchedInstoStatusListItem.providerSlug,
              } as AccountInfoMap;
            }
            else {
              return {
                account: account,
                isDisconnected: account.isDisconnected,
                isReconnectable: false,
              } as AccountInfoMap;
            }
          }
        });
        /**
         * PENDING ACCOUNTS: Accounts that are being connected for the very first time.
         * DISCONNECTED ACCOUNTS: Accounts that were previously connected, but not anymore. Usually it's because the internet banking password changed.
         */
        this.accountTypeMap = AccountMapper.mapAccountsByType(activeAccounts, accountTypes);
        // this.instoAccountMap = AccountMapper.mapAccountsByInstitution(accounts);
        this.accounts.forEach(ac => this.accountService.getAccountLocalInformation(ac.account.id).then(localInfo => {
          ac.account.nickname = localInfo ? localInfo.nickname : null;
        }));
        
        this.reenableAccountCount = this.diffReenableAccounts(this.disabledAccounts);
        if(!this.reenableAccountCount) this.syncingAccounts = [];
      }
      else {
        this.showNoAccountsTip = true;
      }
      console.log('accounts', this.accounts);
      console.log('syncingAccounts',this.syncingAccounts);
      console.log('disabledAccounts',this.disabledAccounts);
      console.log('reenableAccountCount', this.reenableAccountCount);
      console.log('disableAccountCount ',this.disableAccountCount );
      this.showAccountsLoadingError = false;
      this.showAccountsLoading = false;
      setTimeout(() => this.content.resize(), 0);
      refresher && refresher.complete();
    }).catch(error => {
      this.showAccountsLoadingError = true;
      this.showAccountsLoading = false;
      setTimeout(() => this.content.resize(), 0);
      refresher && refresher.complete();
    });
  }

  countDisabledAccounts(disabledAccounts): number{
    let disabledAccountCount: number = 0;
    disabledAccounts.forEach(elem => {
      disabledAccountCount +=elem.disabledAccounts.length;
      // console.log('disabledAccountCount',disabledAccountCount);
    });
    return disabledAccountCount;
  }

  diffReenableAccounts(disabledAccounts): number{
    let enabledAccountCount: number = 0;
    disabledAccounts.forEach(elem => {
      enabledAccountCount +=elem.enabledAccounts.length;
      // console.log('disabledAccountCount',disabledAccountCount);
    });
    return enabledAccountCount - this.accounts.length;
  }

  showOptions() {
    let actionSheet = this.actionSheetCtrl.create();
    actionSheet.addButton({
      text: 'Add new accounts',
      handler: () => this.showOnboardingModal()
    });
    actionSheet.addButton({
      text: 'Cancel',
      role: 'cancel'
    });
    actionSheet.addButton({
      text: 'Edit accounts',
      handler: () => this.showEditMode = true
    });
    actionSheet.addButton({
      text: 'Disable accounts',
      role: 'destructive',
      handler: () => this.showDisableMode = true
    });
    this.disabledAccounts.forEach(elem => {
      if (elem.disabledAccounts.length > 0) {
        actionSheet.addButton({
          text: 'See disabled accounts',
          handler: () => this.showDisabledAccounts()
        });
        return;
      }
    });
    actionSheet.present();
  }
  showDisabledAccounts() {
    let disableAccountsView = this.modalCtrl.create(this.screens['disabledAccounts'], {disabled: this.disabledAccounts});
    disableAccountsView.onDidDismiss(data => {
      if (data) {
        console.log('data',data);
        this.syncingAccounts =  data.reenabled;
        this.disabledAccounts = data.disabled;
        this.disableAccountCount = this.countDisabledAccounts(data.disabled);
      }
    });
    disableAccountsView.present();
  }
  showOnboardingModal() {
    let modal = this.modalCtrl.create(this.screens['connection']);
    modal.present();
  }
  hideAnnouncement() {
    this.showNoAccountsTip = false;
    // this.accountService.updateShowHelpTip(this.showNoAccountsTip);
  }
  selectedAccount(item: AccountInfoMap) {
    if (!this.showEditMode && !this.showDisableMode) {
      if (item.isDisconnected) {
        if (item.isReconnectable) {
          return this.promptReconnectAccount(item);
        }
        else {
          return this.alertCtrl.create({
            title: 'Account unavailable',
            message: 'There was an error when synchronising the details of this account. Contact us for assistance',
            buttons: ['OK']
          }).present();
        }
      }
      this.navCtrl.push(this.screens['account'], { account: item.account });
    }
  }
  removeAccount(account: AccountInfoMap) {
    let removeHandler = () => {
      account.isRemoving = true;
      let itemIndex = this.accounts.findIndex(acItem => acItem.account === account.account);
      if (itemIndex) {
        this.accounts.splice(itemIndex, 1);
        this.showEditMode = false;
        let accountId = account.account.id;
        this.accountService.removeAccount(accountId).then(resp => {
          if (resp.success) {
            this.events.publish('accounts:removedAccount', accountId);
          }
        });
      }
      else {
        console.warn(`Couldn't find account with ID of ${account.account.id}`);
      }
    }
    let alert = this.alertCtrl.create({
      title: 'Remove account',
      message: 'Do you want to remove this account?'
    });
    alert.addButton({ text: 'No', role: 'cancel' });
    alert.addButton({ text: 'Yes', handler: () => removeHandler() });
    alert.present();
  }

  selectedDisabledAccount() {
    
    let isSelectedCount = 0;
    let noSelectedCount = 0
    this.accounts.forEach(elem => {
      if (elem.checked) {
        isSelectedCount += 1;
      }else{
        noSelectedCount += 1;
      }      
    });
    if(noSelectedCount === this.accounts.length){
      this.isChecked = false;
    }else{
      this.isChecked = true;
    }
    // console.log('isSelectedCount',isSelectedCount);
    // console.log('noSelectedCount',noSelectedCount);
    // console.log('selectedDisabledAccount',this.isChecked);
  }

  disableAccount() {
    // console.log('isChecked',this.isChecked);
    
    if (this.isChecked) {

      let disableHandler = () => {

        let loading = this.loadingCtrl.create({ content: `Disabling account(s)` });
        loading.present();
        let removeIndexArray = [];
        this.accounts.forEach((elem, index) => {
          if (elem.checked) {
            // console.log('account', elem);
            elem.isRemoving = true;
            this.showDisableMode = false;
            removeIndexArray.push(index);
            // this.accounts.splice(index, 1);
            let accountId = elem.account.id;
            // console.log('disabling...', index);
            this.accountService.removeAccount(accountId).then(resp => {
              if (resp.success) {
                this.events.publish('accounts:removedAccount', accountId);
                this.syncingAccounts.push(elem.account as SyncingAccount);
              }
            });
            elem.checked = false;
          }
          if(index === this.accounts.length -1){            
            Promise.all([
              this.accountService.getAccountStats(),
              this.accountService.getDisabledAccounts(),
            ]).then(results => {
              this.accountStats = results[0] as AccountStats;
              this.disabledAccounts = results[1];
            });
            loading.dismiss();
          }
        });
        
        // console.log('removeIndexArray',removeIndexArray);
        // console.log('syncingAccounts disable()',this.syncingAccounts);
        for (var i = removeIndexArray.length -1; i >= 0; i--)
          this.accounts.splice(removeIndexArray[i],1);
        
      }

      let countDisable = this.selectedDisabledAccountsCount();
      let alert;
      if(countDisable == 1){
        alert = this.alertCtrl.create({
          title: 'Disable account',
          message: 'Do you want to disable this account?'
        });
      }
      else if(countDisable > 1){
        alert = this.alertCtrl.create({
          title: 'Disable account',
          message: 'Do you want to disable these accounts?'
        });
      }
      
      alert.addButton({ text: 'No', role: 'cancel' });
      alert.addButton({ text: 'Yes', handler: () => disableHandler() });
      alert.present();
    }
  }

  private selectedDisabledAccountsCount():number{
    let count=0;
    this.accounts.forEach(elem => {
      if (elem.checked) {
        count++
      }
    });
    return count;
  }

  cancelDisableAccount() {
    this.showDisableMode = false;
    this.isChecked = false;
    if(this.accounts){
      this.accounts.forEach(elem => {
        if (elem.checked) {
          // console.log('account',elem);
          elem.checked = false;
        }
      });
    }    
  }

  reorderAccounts(indexes) {
    this.accounts = reorderArray(this.accounts, indexes);
    this.accountService.setAccountDisplayOrder(this.accounts.map(ac => ac.account.id));
  }
  private promptReconnectAccount(account: AccountInfoMap) {
    let alert = this.alertCtrl.create({
      title: 'Account is disconnected',
      message: `Transactions are currently out-to-date. Do you want re-enter your account details?`
    });
    alert.addButton({
      text: 'Later', role: 'cancel'
    })
    alert.addButton({
      text: 'Yes', handler: () => {
        this.modalCtrl.create(this.screens['reconnection'], {
          isReconnectInstitution: true,
          institutionId: account.providerId,
          institutionSlug: account.providerSlug
        } as OnboardingUtils.DeepLinkParams).present();
      }
    });
    alert.present();
  }
  private subscribeEvents() {
    this.events.subscribe('connect:finished', () => {
      this.loadAccounts();
    });
  }
  private listenEvents() {
    this.events.subscribe('accounts:removedAccount', accountId => {
      // let itemIndex = this.accounts.findIndex(acItem => acItem.account.id === accountId);
      // if (itemIndex) {
      //   this.accounts.splice(itemIndex, 1);
      // }
    });
    this.events.subscribe('accounts:savedLocalInfo', accountId => {
      this.accountService.getAccountLocalInformation(accountId).then(localInfo => {
        let account = this.accounts && this.accounts.find(ac => ac.account.id === accountId);
        if (account) {
          account.account.nickname = localInfo ? localInfo.nickname : null;
        }
      });
    });
  }
}
