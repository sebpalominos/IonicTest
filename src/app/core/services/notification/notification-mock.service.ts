import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Storage } from '@ionic/storage';

import { Notification } from '../../../screens/notification-centre/shared/notification.model';
import { NotificationType, NotificationStateType } from '../../../screens/notification-centre/shared/notification-type';
import { NotificationResponse, NotificationStatusResponse } from '../../data/notification/notification-response';

@Injectable()
export class NotificationService {
  constructor(private http: Http, private storage: Storage) {}
  // Todo: Date from, date to, etc
  getNotifications(): Promise<Notification[]> {
    // Todo: Actually parse and retrieve the notification state from storage 
    return new Promise((resolve, reject) => {
      let notificationStatus = this.storage.get('notificationStatus').then(ns => {
        return null;
        // return resolve(Notification.createNotificationListFromResponse({ 
          // notifications: NOTIFICATIONS, 
          // notificationState: NOTIFICATION_STATE
        // }));
      });
    });
  }
  setNotificationStatus(notificationId: number, state: NotificationStateType): Promise<NotificationStatusResponse> {
    // let ns = this.storage.get('notificationStatuses').then(ns => {
    //   ns[notificationId] = state;
    //   this.storage.set('notificationStatuses', ns).then(() => {
    //     resolve(); 
    //   });
    // });
    return Promise.resolve({
      success: true
    });
  }
}

