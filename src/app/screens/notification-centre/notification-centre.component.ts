import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

import { NotificationListComponent } from './notification-list/notification-list.component';
import { AlertListComponent } from './alert-list/alert-list.component';
import { CategorisationQueueComponent } from './categorisation-queue/categorisation-queue.component';
import { VersionService } from '../../core/services/version/version.service';

@Component({
  selector: 'root-notification-centre',
  templateUrl: 'notification-centre.html',
  host: {
    class: 'notification-centre'
  }
})
export class NotificationCentreComponent {
  screens = { 
    notificationList: NotificationListComponent,
    alertList: AlertListComponent,
    categorisationQueue: CategorisationQueueComponent,
  };
  constructor(
    protected nav: NavController,
    protected versionService: VersionService
  ) {}
  ionViewCanEnter(): boolean {
   return this.versionService.isCapabilityEnabled('CAP_ACCOUNTS');
  }
}