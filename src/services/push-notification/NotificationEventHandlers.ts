import type { FirebaseMessagingTypes } from '@react-native-firebase/messaging'
import { navigate } from '@/utils/NavigationUtils'
import { notificationDisplayManager } from './NotificationDisplayManager'
import { notificationStorageManager } from './NotificationStorageManager'

class NotificationEventHandlers {
  async onForegroundMessage(
    remoteMessage: FirebaseMessagingTypes.RemoteMessage
  ): Promise<void> {
    const notification =
      notificationStorageManager.parseRemoteMessageToNotification(remoteMessage)
    if (!notification) return

    await Promise.all([
      notificationStorageManager.storeNotification(notification),
      notificationDisplayManager.displayNotification(remoteMessage),
      notificationStorageManager.incrementBadgeCount(),
    ])
  }

  async onBackgroundMessage(
    remoteMessage: FirebaseMessagingTypes.RemoteMessage
  ): Promise<void> {
    const notification =
      notificationStorageManager.parseRemoteMessageToNotification(remoteMessage)
    if (!notification) return

    await Promise.all([
      notificationStorageManager.storeNotification(notification),
      notificationStorageManager.incrementBadgeCount(),
    ])
  }

  async onNotificationOpened(
    remoteMessage: FirebaseMessagingTypes.RemoteMessage
  ): Promise<void> {
    const notification =
      notificationStorageManager.parseRemoteMessageToNotification(remoteMessage)
    if (!notification) return

    await notificationStorageManager.markAsRead(notification.id)
    navigate('Notification')
  }

  async onNotificationPress(detail: any): Promise<void> {
    if (!detail?.notification?.data) return

    const notificationId = detail.notification.data.id

    if (notificationId) {
      await notificationStorageManager.markAsRead(notificationId)
    }

    // Semua notifikasi akan diarahkan ke notification list
    navigate('Notification')
  }
}

export const notificationEventHandlers = new NotificationEventHandlers()
