import { Component } from '@angular/core';
import { NavController, ViewController } from 'ionic-angular';
import { NavParams, Events } from 'ionic-angular';

import { TouchIdErrorCodes } from '../shared/auth-state';
import { AuthModalComponent } from '../auth-modal/auth-modal.component';

@Component({
  selector: 'finished-fingerprint',
  templateUrl: 'finished-fingerprint.component.html',
  host: {
    class: 'finished-fingerprint'
  }
})
export class FinishedFingerprintComponent {
  isError: boolean;
  errorCode: TouchIdErrorCodes;
  constructor(
    protected events: Events,
    protected params: NavParams,
    protected navCtrl: NavController,
    protected viewCtrl: ViewController
  ) {}
  ionViewDidLoad() {
    if (this.params.get('touchIdError')) {
      this.isError = true;
      this.errorCode = this.params.get('touchIdError');
    }
  }
  closeAuthModal() {
    let parentNavController = this.navCtrl.parent as NavController;
    let parentViewController = parentNavController.getActive() as ViewController;
    let parentComponent = parentViewController.getContent() as AuthModalComponent;
    this.events.publish('auth:modalFinished', !!parentComponent.isModal, parentViewController);
  }
}