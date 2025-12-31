import type { FirebaseMessagingTypes } from '@react-native-firebase/messaging'
import { notificationChannelManager } from './NotificationChannelManager'
import notifee, { AndroidImportance } from '../Notifee'

class NotificationDisplayManager {
  private generateNotificationId(): string {
    return `notif_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`
  }

  async displayNotification(
    remoteMessage: FirebaseMessagingTypes.RemoteMessage
  ): Promise<void> {
    try {
      const { notification, data } = remoteMessage

      if (!notification?.title || !notification?.body) {
        return
      }

      const channelId = notificationChannelManager.getChannelId()
      const smallIcon = notificationChannelManager.getSmallIcon()
      const notificationId = this.generateNotificationId()

      const androidConfig: any = {
        channelId,
        pressAction: { id: 'default' },
        importance: AndroidImportance.HIGH,
      }

      if (smallIcon) {
        androidConfig.smallIcon = smallIcon
      }

      await notifee.displayNotification({
        title: notification.title,
        body: notification.body,
        data: {
          ...data,
          id: notificationId,
        } as Record<string, string>,
        android: androidConfig,
        ios: {
          sound: 'default',
        },
      })
    } catch (error) {
      console.error('❌ Error displaying notification:', error)
    }
  }

  async displayTestNotification(): Promise<void> {
    try {
      const channelId = notificationChannelManager.getChannelId()
      const smallIcon = notificationChannelManager.getSmallIcon()
      const notificationId = this.generateNotificationId()

      const androidConfig: any = {
        channelId,
        pressAction: { id: 'default' },
        importance: AndroidImportance.HIGH,
      }

      if (smallIcon) {
        androidConfig.smallIcon = smallIcon
      }

      await notifee.displayNotification({
        title: 'Test Notification',
        body: 'This is a test notification',
        data: { type: 'general', id: notificationId },
        android: androidConfig,
        ios: {
          sound: 'default',
        },
      })
    } catch (error) {
      console.error('❌ Error displaying test notification:', error)
    }
  }
}

export const notificationDisplayManager = new NotificationDisplayManager()
