import NetInfo from '@react-native-community/netinfo'
import { isNetworkAvailable } from '@/utils/NetworkUtils'
import { notificationStorageManager } from './NotificationStorageManager'

class NetworkConnectivityManager {
  private isInitialized = false

  setupNetworkListener(): void {
    if (this.isInitialized) return

    NetInfo.addEventListener((state) => {
      if (state.isConnected && state.isInternetReachable) {
        this.handleNetworkRestore()
      }
    })

    this.isInitialized = true
  }

  async checkOfflineQueueOnStartup(): Promise<void> {
    const isConnected = await isNetworkAvailable()

    if (isConnected) {
      await notificationStorageManager.processPendingOfflineNotifications()
    }
  }

  private handleNetworkRestore(): void {
    notificationStorageManager.processPendingOfflineNotifications()
  }
}

export const networkConnectivityManager = new NetworkConnectivityManager()
