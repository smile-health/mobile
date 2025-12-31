import { Platform } from 'react-native'
import notifee, { AndroidImportance } from '../Notifee'

class NotificationChannelManager {
  private readonly DEFAULT_CHANNEL = {
    id: 'default',
    name: 'App Notifications',
    importance: AndroidImportance.HIGH,
    sound: 'default',
  }

  async createChannels(): Promise<void> {
    if (Platform.OS === 'ios') return

    await notifee.createChannel(this.DEFAULT_CHANNEL)
  }

  getChannelId(): string {
    return 'default'
  }

  getSmallIcon(): string | undefined {
    return undefined
  }
}

export const notificationChannelManager = new NotificationChannelManager()
