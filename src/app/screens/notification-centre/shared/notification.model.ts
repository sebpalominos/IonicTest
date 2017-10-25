import { NotificationType, NotificationStateType } from './notification-type';
import { NotificationUtils } from './notification-utils';
import { WebNotificationListResponse, WebNotificationResponse } from '../../../core/data/notification/notification-response';
import { Suggestion, SuggestionShape } from '../../insights/shared/suggestion.model';
import { ActionableScreens, ACTIONABLE_SCREENS } from './notification-action-screens';

export interface NotificationShape {
  id: number;
  messageHtml: string;
  messagePlain: string;
  dateTime: Date;
  type: NotificationType;
  typeName: string;      // e.g. CONNECTOR_SITE_CREDENTIALS_REQUIRED
  tags?: string[];
  dataPoints?: { [dataPointName: string]: any };    // Any interesting data points such as "4.65%", pertaining to a home loan, etc
  state?: NotificationStateType;
  stateLastChangeDate?: Date;
}

export type NotificationStateShape = { 
  [notificationId: number]: NotificationStateType 
};

export class Notification implements NotificationShape {
  id: number;
  messageHtml: string;
  messagePlain: string;
  dateTime: Date;
  tags?: string[];
  type: NotificationType;
  typeName: string; 
  dataPoints?: { [dataPointName: string]: any }; 
  state?: NotificationStateType = NotificationStateType.New;
  stateLastChangeDate?: Date;
  actionComponent?: keyof ActionableScreens;     // Name of the component to invoke
  actionData?: any;             // Information needed by the component to display information 
  isActionModal?: boolean;
  constructor(...shapes: Partial<NotificationShape>[]){
    Object.assign(this, ...shapes);
  }
  message(): string {
    return this.messageHtml || this.messagePlain;
  }
  static createListFromResponse(resp: WebNotificationListResponse): Notification[] {
    return resp.items.map(respItem => {
      let notificationType = NotificationUtils.determineType(respItem.event.type);
      let notification = new Notification(<NotificationShape>{
        id: respItem.id,
        messagePlain: respItem.text,
        messageHtml: respItem.text,
        dateTime: new Date(respItem.raisedAt),
        type: notificationType,
        typeName: respItem.event.type,
        state: respItem.status === 'NEW' ?  NotificationStateType.New : NotificationStateType.Read,
        dataPoints: respItem.metadata
      });
      if (notificationType === NotificationType.Actionable) {
        NotificationUtils.processAction(notification);
      }
      return notification;
    });
  }
}