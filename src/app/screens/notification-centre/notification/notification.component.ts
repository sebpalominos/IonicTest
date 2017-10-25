import { Component } from '@angular/core';
import { NavParams } from 'ionic-angular';

import { NotificationShape } from '../shared/notification.model';

@Component({
  selector: 'scr-notification',
  templateUrl: 'notification.html'
})
export class NotificationComponent {
  notification: NotificationShape;
  constructor(public navParams: NavParams) {}
  ngOnInit(){
    this.notification = <NotificationShape> this.navParams.data;
  }
}
