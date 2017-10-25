import { Component } from '@angular/core';
import { NavController, AlertController, Events } from 'ionic-angular';

import { UserProfileService } from '../../../core/services/user/user-profile.service';

@Component({
  selector: 'capture-name',
  templateUrl: 'capture-name.component.html',
  host: {
    class: 'onboarding-capture-name fullscreen-form'
  }
})
export class CaptureNameComponent {
  preferredName: string;
  constructor(
    protected navCtrl: NavController,      // used by template
    protected alertCtrl: AlertController,
    protected events: Events,
    protected profileService: UserProfileService
  ) {}
  submit() {
    if (!this.preferredName) {
      this.alertCtrl.create({ 
        title: 'Provide your name', 
        message: 'Please enter your preferred name before proceeding.',
        buttons: [ 'OK' ] 
      }).present();
      return;
    }
    this.profileService.setLocalProfile({ preferredName: this.preferredName }).then(result => {
      this.events.publish('profile:nameChanged', this.preferredName);
      this.navCtrl.parent.getActive().dismiss();  // Get outta heres
    }).catch(err => {
      console.log(err);
    });
  }
}