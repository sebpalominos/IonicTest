import { Component } from '@angular/core';
import { NavParams, NavController, AlertController } from 'ionic-angular'

import { AuthService } from '../../../core/services/auth/auth.service';

@Component({
  selector: 'modal-forgot-password',
  templateUrl: 'forgot-password.component.html',
  host: {
    class: 'opc-forgot-password fullscreen-form'
  }
})
export class ForgotPasswordComponent {
  email: string;
  forgottenMode: 'username'|'password'|'pin';
  isSubmitted: boolean = false;
  constructor(
    public nav: NavParams, 
    public navCtrl: NavController, 
    public alertCtrl: AlertController, 
    public authService: AuthService
  ) {}
  ionViewWillLoad() {
    console.log('fired willLoad');
    this.forgottenMode = 'password';
  }
  
  submitForgotPassword() {
    this.isSubmitted = true;
  }

  /** Helper for alert */
  private alert(title: string, subtitle?: string) {
    this.alertCtrl.create({
      title: title,
      subTitle: subtitle,
      buttons: ['OK']
    }).present();
  }
}
