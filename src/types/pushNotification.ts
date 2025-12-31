export type NotificationType = 'general'

export interface PushNotificationItem {
  id: string
  title: string
  body: string
  data: {
    type: NotificationType
    deepLink?: string
    [key: string]: any
  }
  timestamp: string
  isRead: boolean
  type: NotificationType
}

export interface NotificationSettings {
  enableNotifications: boolean
  enableSound: boolean
  enableVibration: boolean
  enableBadge: boolean
}

export interface PushNotificationData {
  type: NotificationType
  deepLink?: string
  [key: string]: any
}
