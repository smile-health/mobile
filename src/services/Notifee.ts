import { isExpoGo } from '@/utils/DeviceUtils'

const { notifee, AuthorizationStatus, AndroidImportance, EventType } = (() => {
  if (isExpoGo) {
    return {
      notifee: {
        requestPermission: () => Promise.resolve({ authorizationStatus: 1 }),
        getNotificationSettings: () =>
          Promise.resolve({ authorizationStatus: 1 }),
        createChannel: () => Promise.resolve('mock-channel-id'),
        displayNotification: () => Promise.resolve(),
        setBadgeCount: () => Promise.resolve(),
        setNotificationCategories: () => Promise.resolve(),
        onForegroundEvent: () => () => {}, // Returns an unsubscribe function
        onBackgroundEvent: () => {},
      },
      AuthorizationStatus: {
        NOT_DETERMINED: -1,
        DENIED: 0,
        AUTHORIZED: 1,
        PROVISIONAL: 2,
      },
      AndroidImportance: {
        DEFAULT: 3,
        HIGH: 4,
        LOW: 2,
        MIN: 1,
        NONE: 0,
      },
      EventType: {
        UNKNOWN: -1,
        DISMISSED: 0,
        PRESS: 1,
        ACTION_PRESS: 2,
        DELIVERED: 3,
        TRIGGER_NOTIFICATION_CREATED: 4,
      },
    }
  }
  const RealNotifee = require('@notifee/react-native')
  return {
    notifee: RealNotifee.default,
    AuthorizationStatus: RealNotifee.AuthorizationStatus,
    AndroidImportance: RealNotifee.AndroidImportance,
    EventType: RealNotifee.EventType,
  }
})()

export default notifee
export { AuthorizationStatus, AndroidImportance, EventType }
