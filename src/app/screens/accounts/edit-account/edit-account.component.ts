import { Component } from '@angular/core';
import { NavParams, NavController, Events } from 'ionic-angular';

import { AccountShape, Account } from '../shared/account.model';
import { AccountService } from '../../../core/services/account/account.service';

@Component({
  selector: 'scr-edit-account',
  templateUrl: 'edit-account.html'
})
export class EditAccountComponent {
  account: Account;
  nickname: string;
  showSaving: boolean;
  constructor(
    protected params: NavParams, 
    protected navCtrl: NavController, 
    protected events: Events,
    protected accountService: AccountService
  ) {}
  ionViewWillLoad(){
    if (this.params.get('account')) {
      this.account = this.params.get('account');
      this.accountService.getAccountLocalInformation(this.account.id).then(localInfo => {
        if (localInfo && localInfo.nickname) {
          this.nickname = localInfo.nickname;
        }
      });
    }
    else {
      console.error('Account not found in params');
    }
  }
  updateAccount() {
    this.showSaving = true;
    let accountId = this.account.id;
    let localInfo = { nickname: this.nickname };
    this.accountService.setAccountLocalInformation(accountId, localInfo).then(resp => {
      this.events.publish('accounts:savedLocalInfo', accountId);
      this.navCtrl.pop().then(() => {
        this.showSaving = false;
      });
    }).catch(err => {
      console.error(err);
        this.showSaving = false;
    });
  }
}
