import { Component } from '@angular/core';
import { NavController, ModalController, AlertController } from 'ionic-angular';
import { Storage } from '@ionic/storage';

import { AuthModalComponent } from '../../auth/auth-modal/auth-modal.component';
import { AuthService } from '../../../core/services/auth/auth.service';

@Component({
  selector: 'opc-dev-toggles',
  template: `
    <ion-header>
      <ion-navbar>
        <ion-title>Dev settings</ion-title>
      </ion-navbar>
    </ion-header>
    <ion-content>
      <info-bar context="info">Development settings</info-bar>
      <ion-list>
        <ion-item (click)="triggerTestLogin()">Trigger test login</ion-item>
      </ion-list>
      <ion-list>
        <ion-item (click)="logoutImmortal()">Logout immortal</ion-item>
        <ion-item (click)="wipeNotifications()"><span>Wipe notifications</span></ion-item>
        <ion-item (click)="wipeStorage()"><span style="color: red;">Wipe storage</span></ion-item>
      </ion-list>
    </ion-content>
  `
})
export class DevelopmentSettingsComponent {
  constructor(
    protected storage: Storage,
    protected navCtrl: NavController, 
    protected alertCtrl: AlertController, 
    protected modalCtrl: ModalController,
    protected authService: AuthService
  ) {}
  // =====================
  // FOR TESTING
  // =====================
  triggerTestLogin() {
    let modal = this.modalCtrl.create(AuthModalComponent);
    modal.present();
  }
  wipeStorage() {
    let proceedWipe = () => {
      this.storage.clear().then(() => {
        this.alertCtrl.create({ title: 'Storage wiped', message: 'You are probably also logged out.', buttons: ['OK'] }).present();
      });
    };
    this.alertCtrl.create({ 
      title: 'Are you sure', 
      message: 'All locally stored info will be wiped',
      buttons: [
        { text: 'Proceed', handler: proceedWipe },
        { text: 'Cancel', role: 'cancel' }
      ]
    }).present();
  }
  wipeNotifications() {
    this.storage.keys().then(keys => {
      let notificationKeys = keys.filter(key => key.includes('notifications.'));
      let wipePromises = [];
      notificationKeys.forEach(key => {
        wipePromises.push(this.storage.remove(key));
      });
      Promise.all(wipePromises).then(() => {
        this.alertCtrl.create({ title: 'Notifications wiped', buttons: ['OK'] }).present();
      });
    });
  }
  logoutImmortal() {
    this.authService.depersistImmortal()
  }
  // =====================

}