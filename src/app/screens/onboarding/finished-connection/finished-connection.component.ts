import { Component } from '@angular/core';
import { NavParams, NavController, Events } from 'ionic-angular';

import { TaskService } from '../../../core/services/task/task.service';

@Component({
  selector: 'scr-finished-connection',
  templateUrl: 'finished-connection.html',
  host: {
    class: 'finished-connection'
  }
})
export class FinishedConnectionComponent {
  constructor(
    protected params: NavParams, 
    protected navCtrl: NavController,
    protected events: Events,
    protected taskService: TaskService
  ) {}
  ionViewWillLoad() {
    // this.taskService.checkConnectionNewAccounts();      // Disabled - find a better way
    this.events.publish('connect:finished');
  }
  closeAll() {
    let modalParent = this.navCtrl.parent.getActive().dismiss();
  }
}
