import { isExpoGo } from '@/utils/DeviceUtils'

// Using IIFE to create a non-mutable messaging function
const createMessaging = (() => {
  if (isExpoGo) {
    const mockMessaging = () => ({
      hasPermission: () => Promise.resolve(1),
      requestPermission: () => Promise.resolve(1),
      getToken: () => Promise.resolve('mock-fcm-token'),
      onTokenRefresh: () => () => {},
      setBackgroundMessageHandler: () => {},
      onMessage: () => () => {},
      onNotificationOpenedApp: () => () => {},
      getInitialNotification: () => Promise.resolve(null),
    })

    mockMessaging.AuthorizationStatus = {
      AUTHORIZED: 1,
      PROVISIONAL: 2,
      DENIED: 0,
    }

    return mockMessaging
  }
  return require('@react-native-firebase/messaging').default
})()

// Export as a function to prevent mutation
export default createMessaging
