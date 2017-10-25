import { NgModule } from '@angular/core';
import { IonicModule } from 'ionic-angular';
import { SharedModule } from '../../shared/shared.module';

import { NotificationCentreComponent } from './notification-centre.component';
import { NotificationListComponent } from './notification-list/notification-list.component';
import { AlertListComponent } from './alert-list/alert-list.component';
import { CategorisationQueueComponent } from './categorisation-queue/categorisation-queue.component';
import { NotificationComponent } from './notification/notification.component';
// import { CategoryService } from './shared/category.service';

@NgModule({
  declarations: [ 
    NotificationCentreComponent, 
    NotificationListComponent,
    AlertListComponent,
    CategorisationQueueComponent,
    NotificationComponent
  ],
  imports: [
    IonicModule,
    SharedModule
  ],
  exports: [ 
    NotificationCentreComponent, 
    NotificationListComponent,
    AlertListComponent,
    CategorisationQueueComponent,
    NotificationComponent
  ],
  entryComponents: [ 
    NotificationCentreComponent, 
    NotificationListComponent,
    AlertListComponent,
    CategorisationQueueComponent,
    NotificationComponent
  ]
})
export class NotificationsModule {}
