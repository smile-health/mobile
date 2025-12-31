import createMessaging from '@/services/FirebaseMessaging'
import { isIOS } from '@/utils/CommonUtils'
import notifee, { AuthorizationStatus } from '../Notifee'

class NotificationPermissionService {
  async requestPermission(): Promise<boolean> {
    try {
      const result = await (isIOS
        ? this.requestIOSPermission()
        : this.requestAndroidPermission())

      return result
    } catch {
      return false
    }
  }

  async checkPermission(): Promise<boolean> {
    try {
      const result = await (isIOS
        ? this.checkIOSPermission()
        : this.checkAndroidPermission())

      return result
    } catch {
      return false
    }
  }

  private async requestIOSPermission(): Promise<boolean> {
    const authStatus = await createMessaging().requestPermission()

    const isGranted =
      authStatus === createMessaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === createMessaging.AuthorizationStatus.PROVISIONAL

    return isGranted
  }

  private async requestAndroidPermission(): Promise<boolean> {
    const settings = await notifee.requestPermission()

    const isGranted =
      settings.authorizationStatus >= AuthorizationStatus.AUTHORIZED

    return isGranted
  }

  private async checkIOSPermission(): Promise<boolean> {
    const authStatus = await createMessaging().hasPermission()

    const isGranted =
      authStatus === createMessaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === createMessaging.AuthorizationStatus.PROVISIONAL

    return isGranted
  }

  private async checkAndroidPermission(): Promise<boolean> {
    const settings = await notifee.getNotificationSettings()

    const isGranted =
      settings.authorizationStatus >= AuthorizationStatus.AUTHORIZED

    return isGranted
  }
}

export const notificationPermissionService = new NotificationPermissionService()
