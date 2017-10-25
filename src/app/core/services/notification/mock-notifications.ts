import { NotificationShape, NotificationStateShape } from '../../../screens/notification-centre/shared/notification.model';
import { NotificationType, NotificationStateType } from '../../../screens/notification-centre/shared/notification-type';
/*
export const NOTIFICATIONS: NotificationShape[] = [
  { 
    id: 1,
    messagePlain: `In 14 weeks, you'll have enough equity to purchase one of your shortlisted properties`,
    messageHtml: `In <strong>14 weeks</strong>, you'll have enough equity to purchase one of your shortlisted properties`,
    dateTime: new Date('2016-01-09T10:00:00+11:00'),
    tags: ['equity', 'mortgage'],
    type: NotificationType.Info
  }, { 
    id: 2,
    messagePlain: 'The Rocket Repay variable rate is now 4.65%, down by 0.25%.',
    messageHtml: 'The <strong>Rocket Repay variable rate</strong> is now 4.65%, down by 0.25%.',
    dateTime: new Date('2016-01-08T09:00:00+11:00'),
    tags: ['ratechange', 'down'],
    type: NotificationType.Info,
    dataPoints: {
      currentInterestRate: 0.0465,
      previousInterestRate: 0.049,
      decrease: 0.0025
    }
  }, { 
    id: 3,
    messagePlain: 'You saved $258 more than last month. Good job!',
    messageHtml: 'You saved <strong>$258 more</strong> than last month. Good job!',
    tags: ['saving', 'positive'],
    dateTime: new Date('2016-01-07T14:15:00+11:00'),
    type: NotificationType.Info
  }, { 
    id: 4,
    messagePlain: 'Your Westpac Bank account was successfully synced with PFM+. Review the the auto-assigned categories now.',
    messageHtml: 'Your Westpac Bank account was successfully synced with PFM+. Review the the auto-assigned categories now.',
    dateTime: new Date('2016-01-06T12:22:00+11:00'),
    tags: ['sync'],
    type: NotificationType.Actionable,
    actionComponent: 'account',
    actionData: { 
      id: 1
    }
  }, { 
    id: 5,
    messagePlain: 'You\'ve reached 80% of your monthly limit for your shopping budget.',
    messageHtml: 'You\'ve reached <strong>80% of your monthly limit</strong> for your shopping budget.',
    dateTime: new Date('2016-01-06T11:08:00+11:00'),
    tags: ['warning', 'progress'],
    type: NotificationType.Actionable,
    actionComponent: 'category',
    actionData: { 
      id: 92
    }
  }, { 
    id: 6,
    messagePlain: 'A financial planner can help you create a comprehensive wealth strategy.',
    messageHtml: 'A <strong>financial planner</strong> can help you create a comprehensive wealth strategy.',
    dateTime: new Date('2016-01-05T12:00:00+11:00'),
    tags: ['institution', 'financialadvice'],
    type: NotificationType.WebPage,
    actionData: {
      url: 'https://www.google.com.au/?q=finanical+planner'
    }
  }, 
];
*/
// Stub
export const NOTIFICATION_STATE: NotificationStateShape = {
  1: NotificationStateType.New,
  2: NotificationStateType.New,
  3: NotificationStateType.New,
  4: NotificationStateType.Read,
  5: NotificationStateType.Read,
  6: NotificationStateType.Read
};