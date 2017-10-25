import { Notification } from './notification.model';
import { OpiconParams } from '../../../shared/opc-icon/opc-icon-type';

export { OpiconParams };
export interface NotificationListItem {
  ionicon?: string;
  opicon?: OpiconParams;
  notification: Notification;
  showUnreadCounter: boolean;
};
export type NotificationQueryStatus = 'new' | 'read' | 'dismissed';
export type NotificationIndex = {
  [id: number]: string;
};
export enum NotificationType {
  Info = 1,           // Non-actionable event 
  Actionable,         // Something that maps to an internal component
  Alert,              // Something that the user subscribed to
  Suggestions,        // View embedded suggestions
  Broadcast,          // Pushed from bank
  WebPage,            // Maps to a URL ie. opens in a web wrapper
}
export enum NotificationStateType {
  New = 0,
  Read = 1,
  Dismissed = 2
}