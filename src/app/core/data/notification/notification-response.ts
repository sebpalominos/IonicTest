import { NotificationShape, NotificationStateShape } from '../../../screens/notification-centre/shared/notification.model';

// Notifications retrieved statically from /api/notifications/check/WEB
export type WebNotificationListResponse = {
  items: WebNotificationResponse[];
  eventTypes: string[];
};
export interface WebNotificationResponse {
  id: number;
  raisedAt: number;
  event: {
    type: string;      // This is actually a predefined list of constants
    severity: 'INFO' | 'WARNING' | 'ERROR';
  };
  status: 'NEW' | 'READ' | 'DISMISSED';
  title: string;
  text: string;
  link: string;
  metadata: any;
}
// 'Classic' notifcations
export type NotificationResponse = {
  notifications: NotificationShape[];
  notificationState: NotificationStateShape;
};
// Combined status (both from saving locally and remotely
export interface NotificationStatusResponse {
  success: boolean;
  local: boolean;
  remote: boolean;
  errorMessage?: string;
};