import { Component } from '@angular/core';
import { ViewController, AlertController } from 'ionic-angular'

import { AuthService } from '../../../core/services/auth/auth.service';

@Component({
  selector: 'modal-change-password',
  templateUrl: 'change-password.component.html',
  host: {
    class: 'opc-change-password fullscreen-form'
  }
})
export class ChangePasswordComponent {
  existingPassword: string;
  newPassword: string;
  newPasswordAgain: string;
  isSuccessful: boolean = false;
  constructor(public viewCtrl: ViewController, public alertCtrl: AlertController, public authService: AuthService){}
  /** Change password using bound input values, check for new password congruency first */
  submitChangePassword(){
    // Check same new and again
    if (this.newPassword !== this.newPasswordAgain){
      this.alert('Password mismatch', 'Ensure both new passwords are identical');
      return;
    }
    // TODO: CHANGE PASSWORD
  }
  
  /** Helper for alert */
  private alert(title: string, subtitle?: string){
    this.alertCtrl.create({
      title: title,
      subTitle: subtitle,
      buttons: ['OK']
    }).present();
  }
}
