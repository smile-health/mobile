import createMessaging from '@/services/FirebaseMessaging'
import { notificationChannelManager } from './NotificationChannelManager'
import { notificationDisplayManager } from './NotificationDisplayManager'
import { notificationEventHandlers } from './NotificationEventHandlers'
import { notificationStorageManager } from './NotificationStorageManager'
import notifee, { EventType } from '../Notifee'

class NotificationTestingService {
  async sendTestNotification(): Promise<void> {
    await Promise.all([
      notificationStorageManager.storeTestNotification(),
      notificationDisplayManager.displayTestNotification(),
      notificationStorageManager.incrementBadgeCount(),
    ])
  }
}

export const notificationTestingService = new NotificationTestingService()

class PushNotificationHandlerService {
  private isInitialized = false

  async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      await this.initializeServices()
      this.setupEventHandlers()
    } catch (error) {
      console.error('❌ Error initializing push notification handler:', error)
    }

    this.isInitialized = true
  }

  isServiceInitialized(): boolean {
    return this.isInitialized
  }

  sendTestNotification(): void {
    notificationTestingService.sendTestNotification()
  }

  private async initializeServices(): Promise<void> {
    await notificationChannelManager.createChannels()
  }

  private setupEventHandlers(): void {
    this.setupFirebaseHandlers()
    this.setupNotifeeHandlers()
  }

  private setupFirebaseHandlers(): void {
    createMessaging().onMessage(
      notificationEventHandlers.onForegroundMessage.bind(
        notificationEventHandlers
      )
    )

    createMessaging().onNotificationOpenedApp((remoteMessage) => {
      notificationEventHandlers.onNotificationOpened(remoteMessage)
    })

    createMessaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (remoteMessage) {
          setTimeout(() => {
            notificationEventHandlers.onNotificationOpened(remoteMessage)
          }, 2000)
        }
      })
  }

  private setupNotifeeHandlers(): void {
    notifee.onForegroundEvent(({ type, detail }) => {
      if (type === EventType.PRESS) {
        notificationEventHandlers.onNotificationPress(detail)
      }
    })

    notifee.onBackgroundEvent(async ({ type, detail }) => {
      if (type === EventType.PRESS) {
        await notificationEventHandlers.onNotificationPress(detail)
      }
    })
  }
}

export const pushNotificationHandlerService =
  new PushNotificationHandlerService()
