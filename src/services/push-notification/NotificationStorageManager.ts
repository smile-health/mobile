import type { FirebaseMessagingTypes } from '@react-native-firebase/messaging'
import { saveLocalData } from '@/storage'
import {
  PushNotificationData,
  PushNotificationItem,
} from '@/types/pushNotification'
import { PUSH_NOTIFICATION_STORAGE_KEYS } from '@/utils/Constants'
import { isNetworkAvailable } from '@/utils/NetworkUtils'
import { pushNotificationStorageService } from './pushNotificationStorage.service'

class NotificationStorageManager {
  private generateNotificationId(): string {
    return `notif_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`
  }

  parseRemoteMessageToNotification(
    remoteMessage: FirebaseMessagingTypes.RemoteMessage
  ): PushNotificationItem | null {
    const { notification, data } = remoteMessage
    if (!notification?.title || !notification?.body) return null

    const notificationData = data as PushNotificationData

    return {
      id: this.generateNotificationId(),
      title: notification.title,
      body: notification.body,
      data: notificationData,
      timestamp: new Date().toISOString(),
      isRead: false,
      type: notificationData?.type || 'general',
    }
  }

  async storeNotification(notification: PushNotificationItem): Promise<void> {
    const isConnected = await isNetworkAvailable()

    if (isConnected) {
      await pushNotificationStorageService.addNotification(notification)
      await this.processPendingOfflineNotifications()
    } else {
      await pushNotificationStorageService.addToOfflineQueue(notification)
    }
  }

  async markAsRead(notificationId: string): Promise<void> {
    const isConnected = await isNetworkAvailable()

    await pushNotificationStorageService.markAsRead(notificationId)

    if (isConnected) {
      await this.processPendingOfflineNotifications()
    }
  }

  async processPendingOfflineNotifications(): Promise<void> {
    await pushNotificationStorageService.processOfflineQueue()
    await saveLocalData(
      PUSH_NOTIFICATION_STORAGE_KEYS.LAST_SYNC,
      Date.now().toString()
    )
  }

  async incrementBadgeCount(): Promise<void> {
    await pushNotificationStorageService.incrementBadgeCount()
  }

  async storeTestNotification(): Promise<void> {
    const testNotification: PushNotificationItem = {
      id: this.generateNotificationId(),
      title: 'Test Notification',
      body: 'This is a test notification',
      data: { type: 'general', deepLink: '' },
      timestamp: new Date().toISOString(),
      isRead: false,
      type: 'general',
    }

    await this.storeNotification(testNotification)
  }
}

export const notificationStorageManager = new NotificationStorageManager()
