import { navigate } from '@/utils/NavigationUtils'
import { notificationPermissionService } from './NotificationPermissionService'
import messaging from '../FirebaseMessaging'
import {
  notificationChannelManager,
  notificationDisplayManager,
} from '../push-notification'

class FirebaseMessagingService {
  private fcmToken: string | null = null
  private isInitialized = false

  // Public API methods
  async requestPermission(): Promise<boolean> {
    const result = await notificationPermissionService.requestPermission()
    return result
  }

  async checkPermission(): Promise<boolean> {
    const result = await notificationPermissionService.checkPermission()
    return result
  }

  setupMessageHandlers(): void {
    this.setupMessageHandlersInternal()
  }

  getCurrentToken(): string | null {
    return this.fcmToken
  }

  isServiceInitialized(): boolean {
    return this.isInitialized
  }

  // Core initialization
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return
    }

    try {
      const hasPermission =
        await notificationPermissionService.requestPermission()
      if (!hasPermission) {
        return
      }

      await this.getFCMToken()
      this.setupMessageHandlersInternal()
      await notificationChannelManager.createChannels()

      this.isInitialized = true
    } catch (error) {
      console.error('Failed to initialize Firebase messaging service:', error)
    }
  }

  async getFCMToken(): Promise<string | null> {
    try {
      this.fcmToken = await messaging().getToken()
      return this.fcmToken
    } catch {
      return null
    }
  }

  // Private implementation methods
  private setupMessageHandlersInternal(): void {
    // Foreground message handler
    messaging().onMessage(async (remoteMessage) => {
      await notificationDisplayManager.displayNotification(remoteMessage)
    })

    // App opened from background
    messaging().onNotificationOpenedApp(() => {
      this.handleNotificationPress()
    })

    // App opened from quit state
    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (remoteMessage) {
          setTimeout(() => {
            this.handleNotificationPress()
          }, 2000)
        }
      })

    // Token refresh handler
    messaging().onTokenRefresh((token) => {
      this.fcmToken = token
      // Token will be sent to backend during login process
    })
  }

  private handleNotificationPress(): void {
    try {
      navigate('Notification')
    } catch (error) {
      console.error('Error handling notification press:', error)
    }
  }
}

export const firebaseMessagingService = new FirebaseMessagingService()
