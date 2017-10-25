import { Component } from '@angular/core';

import { NotificationShape, NotificationStateShape } from '../../../screens/notification-centre/shared/notification.model';
import { NotificationType, NotificationStateType } from '../../../screens/notification-centre/shared/notification-type';
import { NotificationService } from '../../../core/services/notification/notification.service';

@Component({
  selector: 'scr-alert-list',
  templateUrl: 'alert-list.html'
})
export class AlertListComponent {
  constructor(private notfService: NotificationService) {}
  ngOnInit(){
    
  }
}