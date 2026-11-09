const load = (isExpoGo: boolean, target: 'messaging' | 'notifee') => {
  let out: any
  jest.isolateModules(() => {
    jest.doMock('@/utils/DeviceUtils', () => ({ isExpoGo }))
    jest.doMock('@react-native-firebase/messaging', () => ({
      __esModule: true,
      default: () => ({ getToken: jest.fn() }),
    }))
    out = require(target === 'messaging' ? '../FirebaseMessaging' : '../Notifee')
  })
  return out
}

describe('FirebaseMessaging wrapper', () => {
  it('Expo Go memakai mock', async () => {
    const createMessaging = load(true, 'messaging').default
    const m = createMessaging()
    expect(await m.hasPermission()).toBe(1)
    expect(await m.requestPermission()).toBe(1)
    expect(await m.getToken()).toBe('mock-fcm-token')
    expect(await m.getInitialNotification()).toBeNull()
    expect(typeof m.onTokenRefresh()).toBe('function')
    expect(typeof m.onMessage()).toBe('function')
    expect(typeof m.onNotificationOpenedApp()).toBe('function')
    expect(m.setBackgroundMessageHandler()).toBeUndefined()
    m.onTokenRefresh()()
    m.onMessage()()
    m.onNotificationOpenedApp()()
    expect(createMessaging.AuthorizationStatus.AUTHORIZED).toBe(1)
  })

  it('build native memakai modul firebase', () => {
    const createMessaging = load(false, 'messaging').default
    expect(createMessaging().getToken).toBeDefined()
  })
})

describe('Notifee wrapper', () => {
  it('Expo Go memakai mock', async () => {
    const mod = load(true, 'notifee')
    const n = mod.default
    expect(await n.requestPermission()).toEqual({ authorizationStatus: 1 })
    expect(await n.getNotificationSettings()).toEqual({ authorizationStatus: 1 })
    expect(await n.createChannel()).toBe('mock-channel-id')
    await n.displayNotification()
    await n.setBadgeCount()
    await n.setNotificationCategories()
    n.onForegroundEvent()()
    n.onBackgroundEvent()
    expect(mod.EventType.PRESS).toBe(1)
    expect(mod.AuthorizationStatus.AUTHORIZED).toBe(1)
    expect(mod.AndroidImportance.HIGH).toBe(4)
  })

  it('build native memakai notify-kit', () => {
    const mod = load(false, 'notifee')
    expect(mod.default.createChannel).toBeDefined()
    expect(mod.AuthorizationStatus).toBeDefined()
  })
})
