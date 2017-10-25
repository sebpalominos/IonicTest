import { Injectable } from '@angular/core';
import { URLSearchParams } from '@angular/http';
import { Events } from 'ionic-angular';
import { InsightsHttpService } from '../insights-http/insights-http.service';
import { Storage } from '@ionic/storage';

import { NotificationResponse, NotificationStatusResponse } from '../../data/notification/notification-response';
import { WebNotificationListResponse, WebNotificationResponse } from '../../data/notification/notification-response';
import { Notification, NotificationShape } from '../../../screens/notification-centre/shared/notification.model';
import { NotificationType, NotificationStateType, NotificationIndex, NotificationQueryStatus } from '../../../screens/notification-centre/shared/notification-type';

@Injectable()
export class NotificationService {
  private _isRetrieving: boolean;
  get isRetrieving(): boolean {
    return this._isRetrieving;
  }
  private _newNotificationCount: number;
  get newNotificationCount(): number {
    return this._newNotificationCount || 0;
  }
  set newNotificationCount(newCount: number) {
    this._newNotificationCount = newCount;
    if (newCount > 0) {
      this.events.publish('notifications:addedNew');
    }
  }
  lastRetrievedDate: Date;
  constructor(
    protected events: Events,
    protected http: InsightsHttpService, 
    protected storage: Storage
  ) {
    // Set the initial number of new notifications
    let retrieveLocalPromise = this.storage.get('notifications.index');
  }
  /**
   * Retrieve new notifications from local storage.
   * @returns {Promise<Notification[]>} 
   * @memberof NotificationService
   */
  getNotifications(limit: number = 10, offset: number = 0): Promise<Notification[]> {
    return this.storage.get('notifications.index').then(index => {
      if (index) {
        // 0. Reverse the index. NOTE: MINOR PERFORMANCE HIT. REWRITE THIS, SO THAT INDEX IS PERSISTED IN REVERSE.
        // 1. Grab ID's from the the index
        // 2. Find corresponding dated lists
        // 3. Zip together the required lists
        // 4. Retrieve the originally requested subset, converted to Notification objects.
        if (offset >= Object.keys(index).length) {
          return null;
        }
        else {
          let ids = Object.keys(index).reverse().slice(offset, offset + limit);
          let listKeys = ids.map(id => index[id]).filter((value, index, self) => self.indexOf(value) === index);
          return Promise.all(listKeys.map(listKey => this.storage.get(`notifications.${listKey}`))).then(lists => {
            let all = Array.prototype.concat.apply([], lists);
            return all.filter(notif => notif && ~ids.indexOf(String(notif.id))).map(notif => new Notification(notif));
          });
        }
      }
      return null;
    });
  }
  /**
   * Retrieve remote notifications and merge with local storage.
   * @returns {Promise<boolean>} 
   * @memberof NotificationService
   */
  pullNotifications(afterDate?: Date, statuses?: NotificationQueryStatus[]): Promise<boolean> {
    afterDate = afterDate || this.lastRetrievedDate;
    let requestStartDate = new Date();
    if (this._isRetrieving) {
      console.warn('Retrieve notifications was called but is already underway.');
      return Promise.resolve(false);
    }
    let channel = 'WEB';
    let endpoint = ['notifications', 'check', channel, afterDate ? String(+afterDate) : ''];      // last arg would be a timestamp
    if (statuses) {
      let params = new URLSearchParams();
      params.set('status', statuses.join(','));
      var opts = { search: params };
    }
    let retrieveRemotePromise = this.http.get(endpoint, opts).toPromise();
    let retrieveLocalPromise = this.storage.get('notifications.index');
    this._isRetrieving = true;
    return Promise.all([retrieveRemotePromise, retrieveLocalPromise]).then(responses => {
      // 1. Grab the retrieved local index and retrieved remote notif list
      // 2. Extract existing IDs from local index
      // 3. Find entries from remote list that are not Existing
      // 4. Add them locally into index and main list.
      // let [ remoteResp, localResp ] = ;
      let remoteResp = responses[0];
      if (remoteResp.ok) {
        let localIndex: NotificationIndex = responses[1];
        let remoteBody: WebNotificationListResponse = remoteResp.json();
        // Filter to only new notifications, if local stuff exists. It might not, in which 
        // case we'd just leave body.items unfiltered.
        if (localIndex) {
          let ids = Object.keys(localIndex);
          remoteBody.items = remoteBody.items.filter(notif => !~ids.indexOf(String(notif.id)));
        }
        // Bump new notification count
        this._newNotificationCount += remoteBody.items.filter(item => item.status === 'NEW').length;
        // Shard by date-based listKey
        let listKeyify = (date: Date) => date.toISOString().slice(0,10).replace(/-/g, '');
        let newNotifs = Notification.createListFromResponse(remoteBody);
        let listKeys = newNotifs.map(notif => listKeyify(notif.dateTime)).filter((value, index, self) => self.indexOf(value) === index);
        let persistencePromises: Promise<any>[] = [];
        // let todayListKey = new Date().toISOString().slice(0,10).replace(/-/g, '');
        // Add to list(s)
        listKeys.forEach(listKey => {
          let saveListPromise = this.storage.get(`notifications.${listKey}`).then(list => {
            list = list || [];
            let newList = list.concat.apply([], newNotifs.filter(notif => listKeyify(notif.dateTime) === listKey));
            return this.storage.set(`notifications.${listKey}`, newList);
          });
          persistencePromises.push(saveListPromise);
        });
        // Add to index. We already retrieved the index at the beginning of this method.
        localIndex = localIndex || {};
        newNotifs.forEach(notif => {
          localIndex[notif.id] = listKeyify(notif.dateTime);
        });
        let saveIndexPromise = this.storage.set('notifications.index', localIndex);
        persistencePromises.push(saveIndexPromise);
        return Promise.all(persistencePromises).then(() => {
          this._isRetrieving = false;
          this.lastRetrievedDate = requestStartDate;
          return true;
        });
      }
      else {
        this._isRetrieving = false;
        return false;
      }
    }).catch(err => {
      this._isRetrieving = false;
      throw err;
    });
  }
  /**
   * Set and save notification status
   * @param {number} notificationId 
   * @param {NotificationStateType} state 
   * @returns {Promise<NotificationStatusResponse>} 
   * @memberof NotificationService
   */
  setNotificationStatus(notificationId: number, state: NotificationStateType): Promise<NotificationStatusResponse> {
    // 1. Set in local as read or unread.
    // 2. THEN (and only then) if marked as read, then send update to server.
    let statusResponse = <NotificationStatusResponse>{ success: true };
    let updateServer = () => {
      let endpoint = ['notifications', 'update'];
      let payload = { id: notificationId, status: NotificationStateType[state].toUpperCase() };
      return this.http.post(endpoint, payload).toPromise().then(resp => {
        statusResponse.remote = resp.ok;
        statusResponse.success = statusResponse.success && resp.ok;
        return statusResponse;
      });
    };
    return this.storage.get('notifications.index').then((index: NotificationIndex) => {
      if (index[notificationId]) {
        return this.storage.get(`notifications.${index[notificationId]}`).then(list => {
          let notif: NotificationShape = list.find(notif => notif.id === notificationId);
          if (notif) {
            notif.state = state;
            notif.stateLastChangeDate = new Date();
          }
          return this.storage.set(`notifications.${index[notificationId]}`, list).then(() => {
            statusResponse.success = statusResponse.local = true;
            return state === NotificationStateType.Read 
              ? updateServer()
              : statusResponse;
          });
        });
      }
      statusResponse.success = statusResponse.local = false;
      return statusResponse;
    });
  }
  setAllNotificationsAsRead(): Promise<NotificationStatusResponse> {
    throw new Error('To be implemented');
  }
  ping(): Promise<boolean> {
    let endpoint = ['notifications', 'check', 'WEB', String(+new Date)];      // Note trailing slash is required for this call...
    return this.http.get(endpoint).toPromise().then(resp => {
      return resp.ok;
    });
  }
}

