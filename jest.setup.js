jest.mock('expo', () => ({
  isRunningInExpoGo: jest.fn(() => false),
}))

jest.mock('@react-native-community/netinfo', () => ({
  fetch: jest.fn().mockResolvedValue({ isConnected: true }),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
}))

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  mergeItem: jest.fn(),
  clear: jest.fn(),
  getAllKeys: jest.fn(),
}))

jest.mock('react-redux', () => ({
  useDispatch: () => jest.fn(),
  useSelector: jest.fn(),
  useStore: () => ({ getState: jest.fn(), dispatch: jest.fn() }),
}))

jest.mock('expo-constants', () => ({
  expoConfig: {
    version: '1.0.0',
  },
}))

jest.mock('expo-localization', () => ({
  getLocales: jest.fn(() => [{ languageCode: 'en' }]),
}))

jest.mock('react-i18next', () => ({
  useTranslation: jest.fn().mockReturnValue({
    t: jest.fn((key) => key), // Simulate `t` returning the key for easy assertions
    i18n: { changeLanguage: jest.fn() },
  }),
}))

// Mock i18n
jest.mock('@/i18n', () => ({
  t: jest.fn((key) => key),
  i18n: { changeLanguage: jest.fn() },
}))

// Mock @notifee/react-native
jest.mock('@notifee/react-native', () => {
  const mockNotifee = {
    createChannel: jest.fn().mockResolvedValue(),
    displayNotification: jest.fn().mockResolvedValue(),
    getNotificationSettings: jest.fn().mockResolvedValue({
      authorizationStatus: 1,
    }),
    requestPermission: jest.fn().mockResolvedValue({
      authorizationStatus: 1,
    }),
    onBackgroundEvent: jest.fn(),
    onForegroundEvent: jest.fn(),
    AndroidImportance: {
      HIGH: 4,
      DEFAULT: 3,
      LOW: 2,
      MIN: 1,
      NONE: 0,
    },
    AuthorizationStatus: {
      NOT_DETERMINED: 0,
      DENIED: 1,
      AUTHORIZED: 2,
      PROVISIONAL: 3,
    },
  }

  return {
    __esModule: true,
    default: mockNotifee,
    AndroidImportance: mockNotifee.AndroidImportance,
    AuthorizationStatus: mockNotifee.AuthorizationStatus,
  }
})

// Mock @react-native-firebase/messaging
jest.mock('@react-native-firebase/messaging', () => {
  const mockMessaging = {
    hasPermission: jest.fn().mockResolvedValue(2),
    requestPermission: jest.fn().mockResolvedValue(2),
    getToken: jest.fn().mockResolvedValue('mock-fcm-token'),
    onMessage: jest.fn(),
    onNotificationOpenedApp: jest.fn(),
    getInitialNotification: jest.fn().mockResolvedValue(null),
    onTokenRefresh: jest.fn(),
    setBackgroundMessageHandler: jest.fn(),
    AuthorizationStatus: {
      NOT_DETERMINED: 0,
      DENIED: 1,
      AUTHORIZED: 2,
      PROVISIONAL: 3,
    },
  }

  return () => mockMessaging
})
