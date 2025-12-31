import {
  loadLocalData,
  saveLocalData,
  loadArrayData,
  updateArrayData,
} from '@/storage'
import { PushNotificationItem } from '@/types/pushNotification'
import { PUSH_NOTIFICATION_STORAGE_KEYS } from '@/utils/Constants'

class PushNotificationStorageService {
  // Core notification functions that are actually used
  async getNotifications(): Promise<PushNotificationItem[]> {
    try {
      return await loadArrayData(PUSH_NOTIFICATION_STORAGE_KEYS.NOTIFICATIONS)
    } catch (error) {
      console.error('Error getting notifications:', error)
      return []
    }
  }

  async addNotification(notification: PushNotificationItem): Promise<void> {
    try {
      await updateArrayData(
        PUSH_NOTIFICATION_STORAGE_KEYS.NOTIFICATIONS,
        (notifications) => {
          return [notification, ...notifications].slice(0, 100) // Keep only last 100
        }
      )
    } catch (error) {
      console.error('Error adding notification:', error)
    }
  }

  async markAsRead(notificationId: string): Promise<void> {
    try {
      await updateArrayData(
        PUSH_NOTIFICATION_STORAGE_KEYS.NOTIFICATIONS,
        (notifications) => {
          return notifications.map((notif) =>
            notif.id === notificationId ? { ...notif, isRead: true } : notif
          )
        }
      )
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  // Badge Management - keep incrementBadgeCount as it has business logic
  async incrementBadgeCount(): Promise<void> {
    try {
      const current = await loadLocalData(
        PUSH_NOTIFICATION_STORAGE_KEYS.BADGE_COUNT
      )
      const currentCount = current ? Number.parseInt(current, 10) : 0
      await saveLocalData(
        PUSH_NOTIFICATION_STORAGE_KEYS.BADGE_COUNT,
        (currentCount + 1).toString()
      )
    } catch (error) {
      console.error('Error incrementing badge count:', error)
    }
  }

  // Offline Queue Management
  async getOfflineQueue(): Promise<PushNotificationItem[]> {
    try {
      return await loadArrayData(PUSH_NOTIFICATION_STORAGE_KEYS.OFFLINE_QUEUE)
    } catch (error) {
      console.error('Error getting offline notification queue:', error)
      return []
    }
  }

  async addToOfflineQueue(notification: PushNotificationItem): Promise<void> {
    try {
      await updateArrayData(
        PUSH_NOTIFICATION_STORAGE_KEYS.OFFLINE_QUEUE,
        (queue) => {
          return [notification, ...queue]
        }
      )
    } catch (error) {
      console.error('Error adding notification to offline queue:', error)
    }
  }

  async clearOfflineQueue(): Promise<void> {
    try {
      await saveLocalData(PUSH_NOTIFICATION_STORAGE_KEYS.OFFLINE_QUEUE, [])
    } catch (error) {
      console.error('Error clearing offline notification queue:', error)
    }
  }

  async processOfflineQueue(): Promise<void> {
    try {
      const queue = await this.getOfflineQueue()
      if (queue.length === 0) return

      // Process each notification in the queue
      for (const notification of queue) {
        // Add to regular notifications
        await this.addNotification(notification)
      }
      // Clear the queue after processing
      await this.clearOfflineQueue()
    } catch (error) {
      console.error('Error processing offline notification queue:', error)
    }
  }
}

export const pushNotificationStorageService =
  new PushNotificationStorageService()
