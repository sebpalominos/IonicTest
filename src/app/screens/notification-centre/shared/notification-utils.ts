import { Notification } from './notification.model';
import { NotificationType } from './notification-type';
import { ACTIONABLE_SCREENS } from './notification-action-screens';
import { OnboardingUtils } from '../../onboarding/shared/onboarding-utils';

export namespace NotificationUtils {
  /**
   * Given a notification type name, deduce the contextual type of the notification 
   * @todo Implementation
   * @export
   * @param {string} eventTypeName 
   * @returns {NotificationType} 
   */
  export function determineType(eventTypeName: string): NotificationType {
    switch (eventTypeName) {
      // Requesting a reconnection
      case 'CONNECTOR_SITE_CREDENTIALS_REQUIRED':
        return NotificationType.Actionable;
      default:
        return NotificationType.Info;
    }
  }
  /**
   * Takes a notification, inspects existing fields, and assigns action
   * related fields if necessary
   * @export
   * @param {Notification} notification 
   */
  export function processAction(notification: Notification): void {
    switch (notification.typeName) {
      // Requesting a reconnection
      case 'CONNECTOR_SITE_CREDENTIALS_REQUIRED':
        notification.actionComponent = 'reconnection';
        notification.actionData = <OnboardingUtils.DeepLinkParams>{ 
          institutionId: notification.dataPoints['providerInternalId'],
          institutionSlug: notification.dataPoints['providerInternalSlug']
        };
        notification.isActionModal = true;
        return;
    }
  }
}