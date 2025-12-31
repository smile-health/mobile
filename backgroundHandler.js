import messaging from './src/services/FirebaseMessaging'
import notifee from './src/services/Notifee'

import { updateArrayData } from './src/storage'
import { PUSH_NOTIFICATION_STORAGE_KEYS } from './src/utils/Constants'

/**
 * Generate unique notification ID
 */
const generateNotificationId = () => {
  return `notif_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`
}

/**
 * Parse Firebase remote message to notification format
 */
const parseRemoteMessageToNotification = (remoteMessage) => {
  const { notification, data } = remoteMessage
  if (!notification?.title || !notification?.body) return null

  return {
    id: generateNotificationId(),
    title: notification.title,
    body: notification.body,
    data: data || {},
    timestamp: new Date().toISOString(),
    isRead: false,
    type: data?.type || 'general',
  }
}

/**
 * Store notification using existing storage utility
 */
const storeNotification = async (notification) => {
  try {
    await updateArrayData(
      PUSH_NOTIFICATION_STORAGE_KEYS.NOTIFICATIONS,
      (notifications) => {
        return [notification, ...notifications].slice(0, 100)
      }
    )
  } catch {
    // Silent error handling for background process
  }
}

/**
 * Increment badge count using existing storage utility
 */
const incrementBadgeCount = async () => {
  try {
    const { pushNotificationStorageService } = await import(
      './src/services/push-notification/pushNotificationStorage.service'
    )
    await pushNotificationStorageService.incrementBadgeCount()
  } catch {
    // Silent error handling for background process
  }
}

/**
 * Background message handler for Firebase Cloud Messaging
 * This handler is called when the app is in the background or terminated
 */
messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  try {
    const notification = parseRemoteMessageToNotification(remoteMessage)
    if (!notification) {
      return
    }

    // Store notification for later retrieval
    await storeNotification(notification)

    // Increment badge count
    await incrementBadgeCount()

    // Create notification channel if needed (Android)
    const channelId = 'default'
    await notifee.createChannel({
      id: channelId,
      name: 'Default Channel',
      importance: 4, // HIGH importance
    })

    // Display the notification using Notifee
    await notifee.displayNotification({
      title: notification.title,
      body: notification.body,
      data: {
        ...notification.data,
        id: notification.id,
      },
      android: {
        channelId,
        pressAction: {
          id: 'default',
        },
        importance: 4, // HIGH importance
      },
      ios: {
        sound: 'default',
      },
    })
  } catch {
    // Silent error handling for background process
  }
})

/**
 * Background event handler for Notifee
 * This handler is called when the user interacts with notifications
 */
notifee.onBackgroundEvent(async ({ type, detail }) => {
  try {
    const { notification } = detail
    if (!notification?.data?.id) {
      return
    }

    // Handle notification press
    if (type === 1) {
      // EventType.PRESS
      // The app will handle navigation when it opens
    }
  } catch {
    // Silent error handling for background process
  }
})
