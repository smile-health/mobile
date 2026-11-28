import type { Messaging, RemoteMessage } from '@react-native-firebase/messaging'
import { isExpoGo } from '@/utils/DeviceUtils'

/**
 * Thin wrapper around the @react-native-firebase/messaging modular API.
 *
 * Since v27 the package no longer ships the namespaced default export
 * (`messaging().getToken()`), so every call goes through the modular
 * functions with an explicit Messaging instance. In Expo Go the native
 * module is unavailable, so a no-op implementation with the same shape
 * is used instead.
 */
type MessagingModule = Pick<
  typeof import('@react-native-firebase/messaging'),
  | 'getMessaging'
  | 'getToken'
  | 'hasPermission'
  | 'requestPermission'
  | 'onMessage'
  | 'onNotificationOpenedApp'
  | 'getInitialNotification'
  | 'onTokenRefresh'
  | 'setBackgroundMessageHandler'
  | 'AuthorizationStatus'
>

const createExpoGoMock = (): MessagingModule => {
  const noopUnsubscribe = () => {}
  return {
    getMessaging: () => ({}) as Messaging,
    getToken: () => Promise.resolve('mock-fcm-token'),
    hasPermission: () => Promise.resolve(1),
    requestPermission: () => Promise.resolve(1),
    onMessage: () => noopUnsubscribe,
    onNotificationOpenedApp: () => noopUnsubscribe,
    getInitialNotification: () => Promise.resolve(null),
    onTokenRefresh: () => noopUnsubscribe,
    setBackgroundMessageHandler: () => {},
    AuthorizationStatus: {
      NOT_DETERMINED: -1,
      DENIED: 0,
      AUTHORIZED: 1,
      PROVISIONAL: 2,
      EPHEMERAL: 3,
    },
  }
}

const rnfb: MessagingModule = isExpoGo
  ? createExpoGoMock()
  : require('@react-native-firebase/messaging')

const instance = () => rnfb.getMessaging()

export const AuthorizationStatus = rnfb.AuthorizationStatus

export const getToken = () => rnfb.getToken(instance())

export const hasPermission = () => rnfb.hasPermission(instance())

export const requestPermission = () => rnfb.requestPermission(instance())

export const onMessage = (
  listener: (message: RemoteMessage) => Promise<void> | void
) => rnfb.onMessage(instance(), listener)

export const onNotificationOpenedApp = (
  listener: (message: RemoteMessage) => void
) => rnfb.onNotificationOpenedApp(instance(), listener)

export const getInitialNotification = () =>
  rnfb.getInitialNotification(instance())

export const onTokenRefresh = (listener: (token: string) => void) =>
  rnfb.onTokenRefresh(instance(), listener)

export const setBackgroundMessageHandler = (
  handler: (message: RemoteMessage) => Promise<void>
) => rnfb.setBackgroundMessageHandler(instance(), handler)

export { type RemoteMessage } from '@react-native-firebase/messaging'
