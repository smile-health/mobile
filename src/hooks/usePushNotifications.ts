import { useState, useEffect, useCallback } from 'react'
import { AppState } from 'react-native'
import { firebaseMessagingService } from '@/services/firebase'
import createMessaging from '@/services/FirebaseMessaging'
import notifee from '@/services/Notifee'
import {
  pushNotificationStorageService,
  pushNotificationHandlerService,
} from '@/services/push-notification'
import { loadLocalData, saveLocalData } from '@/storage'
import { PUSH_NOTIFICATION_STORAGE_KEYS } from '@/utils/Constants'
import { isNetworkAvailable } from '@/utils/NetworkUtils'

export interface UsePushNotificationsReturn {
  isPermissionGranted: boolean
  requestPermission: () => Promise<void>
  token: string | null
  initializePushNotifications: () => Promise<void>
}

export const usePushNotifications = (): UsePushNotificationsReturn => {
  const [isPermissionGranted, setIsPermissionGranted] = useState(false)
  const [token, setToken] = useState<string | null>(null)

  const requestPermission = useCallback(async (): Promise<void> => {
    try {
      let hasPermission = await firebaseMessagingService.checkPermission()

      if (!hasPermission) {
        hasPermission = await firebaseMessagingService.requestPermission()
      }

      if (hasPermission) {
        const fcmToken = await firebaseMessagingService.getFCMToken()
        setIsPermissionGranted(true)

        if (fcmToken) {
          setToken(fcmToken)
          await saveLocalData(
            PUSH_NOTIFICATION_STORAGE_KEYS.FCM_TOKEN,
            fcmToken
          )
        } else {
          setToken(null)
        }
      } else {
        setIsPermissionGranted(false)
        setToken(null)
      }
    } catch {
      throw new Error('Failed to request notification permission')
    }
  }, [])

  const initializePushNotifications = useCallback(async () => {
    try {
      const storedToken = await loadLocalData(
        PUSH_NOTIFICATION_STORAGE_KEYS.FCM_TOKEN
      )
      const hasPermission = await firebaseMessagingService.checkPermission()

      setIsPermissionGranted(hasPermission)

      if (hasPermission && !storedToken) {
        const newToken = await firebaseMessagingService.getFCMToken()
        if (newToken) {
          await saveLocalData(
            PUSH_NOTIFICATION_STORAGE_KEYS.FCM_TOKEN,
            newToken
          )
          setToken(newToken)
        } else {
          setToken(null)
        }
      } else {
        setToken(storedToken)
      }

      await pushNotificationHandlerService.initialize()
    } catch (error) {
      console.error('Failed to initialize push notifications:', error)
    }
  }, [])

  useEffect(() => {
    const subscription = AppState.addEventListener(
      'change',
      async (nextAppState) => {
        if (nextAppState === 'active') {
          const isConnected = await isNetworkAvailable()
          if (
            isConnected &&
            pushNotificationHandlerService.isServiceInitialized()
          ) {
            await pushNotificationStorageService.processOfflineQueue()
            await saveLocalData(
              PUSH_NOTIFICATION_STORAGE_KEYS.LAST_SYNC,
              Date.now().toString()
            )
          }
        }
      }
    )

    return () => {
      subscription.remove()
    }
  }, [])

  useEffect(() => {
    requestPermission()
  }, [requestPermission])

  return {
    isPermissionGranted,
    requestPermission,
    token,
    initializePushNotifications,
  }
}

export const useNotificationPermission = () => {
  const [permissionStatus, setPermissionStatus] =
    useState<string>('not-determined')

  const checkPermissionStatus = useCallback(async () => {
    try {
      const authStatus = await createMessaging().hasPermission()

      const status = (() => {
        switch (authStatus) {
          case createMessaging.AuthorizationStatus.AUTHORIZED: {
            return 'granted'
          }
          case createMessaging.AuthorizationStatus.PROVISIONAL: {
            return 'provisional'
          }
          case createMessaging.AuthorizationStatus.DENIED: {
            return 'denied'
          }
          default: {
            return 'not-determined'
          }
        }
      })()

      setPermissionStatus(status)
      return status
    } catch {
      return 'error'
    }
  }, [])

  useEffect(() => {
    checkPermissionStatus()
  }, [checkPermissionStatus])

  return {
    permissionStatus,
    checkPermissionStatus,
  }
}

export const useNotificationBadge = () => {
  const [badgeCount, setBadgeCount] = useState(0)

  const loadBadgeCount = useCallback(async () => {
    try {
      const count =
        Number.parseInt(
          (await loadLocalData(PUSH_NOTIFICATION_STORAGE_KEYS.BADGE_COUNT)) ??
            '0'
        ) || 0
      setBadgeCount(count)
      await notifee.setBadgeCount(count)
    } catch {}
  }, [])

  const updateBadgeCount = useCallback(async (count: number) => {
    try {
      await saveLocalData(
        PUSH_NOTIFICATION_STORAGE_KEYS.BADGE_COUNT,
        count.toString()
      )
      await notifee.setBadgeCount(count)
      setBadgeCount(count)
    } catch {}
  }, [])

  const incrementBadgeCount = useCallback(async () => {
    try {
      await pushNotificationStorageService.incrementBadgeCount()
      const newCount =
        Number.parseInt(
          (await loadLocalData(PUSH_NOTIFICATION_STORAGE_KEYS.BADGE_COUNT)) ??
            '0'
        ) || 0
      setBadgeCount(newCount)
      await notifee.setBadgeCount(newCount)
    } catch {}
  }, [])

  const clearBadgeCount = useCallback(async () => {
    try {
      await saveLocalData(PUSH_NOTIFICATION_STORAGE_KEYS.BADGE_COUNT, '0')
      await notifee.setBadgeCount(0)
      setBadgeCount(0)
    } catch {}
  }, [])

  useEffect(() => {
    loadBadgeCount()
  }, [loadBadgeCount])

  return {
    badgeCount,
    updateBadgeCount,
    incrementBadgeCount,
    clearBadgeCount,
    loadBadgeCount,
  }
}
