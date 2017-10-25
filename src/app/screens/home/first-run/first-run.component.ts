import { Component, ViewChild, Renderer, SimpleChanges } from '@angular/core';
import { Content, NavController, ModalController, LoadingController, Events } from 'ionic-angular';

import { UserSummary } from '../../user/shared/user-summary.model';
import { UserService } from '../../../core/services/user/user.service';

@Component({
  selector: 'scr-first-run',
  templateUrl: 'first-run.html'
})
export class FirstRunComponent {
  constructor(
    public events: Events,
    public navCtrl: NavController, 
    public modalCtrl: ModalController, 
    public loadingCtrl: LoadingController,
    private userService: UserService,
  ){}
  ionViewWillEnter() {
    
  }
}
