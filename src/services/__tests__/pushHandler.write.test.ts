const mockMessaging = {
  onMessage: jest.fn(),
  onNotificationOpenedApp: jest.fn(),
  getInitialNotification: jest.fn(),
}
jest.mock('@/services/FirebaseMessaging', () => ({
  __esModule: true,
  default: () => mockMessaging,
}))
jest.mock('../Notifee', () => ({
  __esModule: true,
  default: { onForegroundEvent: jest.fn(), onBackgroundEvent: jest.fn() },
  EventType: { PRESS: 1 },
}))
jest.mock('../push-notification/NotificationChannelManager', () => ({
  notificationChannelManager: { createChannels: jest.fn().mockResolvedValue(undefined) },
}))
jest.mock('../push-notification/NotificationDisplayManager', () => ({
  notificationDisplayManager: { displayTestNotification: jest.fn().mockResolvedValue(undefined) },
}))
jest.mock('../push-notification/NotificationStorageManager', () => ({
  notificationStorageManager: {
    storeTestNotification: jest.fn().mockResolvedValue(undefined),
    incrementBadgeCount: jest.fn().mockResolvedValue(undefined),
  },
}))
jest.mock('../push-notification/NotificationEventHandlers', () => ({
  notificationEventHandlers: {
    onForegroundMessage: jest.fn(),
    onNotificationOpened: jest.fn(),
    onNotificationPress: jest.fn().mockResolvedValue(undefined),
  },
}))
import notifee from '../Notifee'
import { notificationChannelManager } from '../push-notification/NotificationChannelManager'
import { notificationDisplayManager } from '../push-notification/NotificationDisplayManager'
import { notificationStorageManager } from '../push-notification/NotificationStorageManager'
import { notificationEventHandlers as eh } from '../push-notification/NotificationEventHandlers'
import {
  notificationTestingService,
  pushNotificationHandlerService as svc,
} from '../push-notification/PushNotificationHandlerService'

describe('PushNotificationHandlerService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
  })
  afterEach(() => jest.useRealTimers())

  it('sendTestNotification menjalankan tiga langkah', async () => {
    await notificationTestingService.sendTestNotification()
    expect(notificationStorageManager.storeTestNotification).toHaveBeenCalled()
    expect(notificationDisplayManager.displayTestNotification).toHaveBeenCalled()
    expect(notificationStorageManager.incrementBadgeCount).toHaveBeenCalled()
    svc.sendTestNotification()
    expect(notificationStorageManager.storeTestNotification).toHaveBeenCalledTimes(2)
  })

  it('initialize memasang handler firebase & notifee, hanya sekali', async () => {
    mockMessaging.getInitialNotification.mockResolvedValue({ id: 'init' })
    expect(svc.isServiceInitialized()).toBe(false)
    await svc.initialize()
    expect(svc.isServiceInitialized()).toBe(true)
    expect(notificationChannelManager.createChannels).toHaveBeenCalledTimes(1)

    // handler firebase
    expect(mockMessaging.onMessage).toHaveBeenCalled()
    mockMessaging.onMessage.mock.calls[0][0]({ a: 1 })
    expect(eh.onForegroundMessage).toHaveBeenCalled()
    mockMessaging.onNotificationOpenedApp.mock.calls[0][0]({ id: 'o' })
    expect(eh.onNotificationOpened).toHaveBeenCalledWith({ id: 'o' })
    await Promise.resolve()
    await Promise.resolve()
    jest.advanceTimersByTime(2000)
    expect(eh.onNotificationOpened).toHaveBeenCalledWith({ id: 'init' })

    // handler notifee
    const fg = (notifee.onForegroundEvent as jest.Mock).mock.calls[0][0]
    fg({ type: 1, detail: { d: 1 } })
    fg({ type: 0, detail: { d: 2 } })
    expect(eh.onNotificationPress).toHaveBeenCalledTimes(1)
    const bg = (notifee.onBackgroundEvent as jest.Mock).mock.calls[0][0]
    await bg({ type: 1, detail: { d: 3 } })
    await bg({ type: 0, detail: { d: 4 } })
    expect(eh.onNotificationPress).toHaveBeenCalledTimes(2)

    await svc.initialize()
    expect(notificationChannelManager.createChannels).toHaveBeenCalledTimes(1)
  })
})

describe('PushNotificationHandlerService error & tanpa initial notification', () => {
  it('menelan error saat inisialisasi dan tetap ditandai initialized', async () => {
    jest.resetModules()
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {})
    jest.doMock('../push-notification/NotificationChannelManager', () => ({
      notificationChannelManager: { createChannels: jest.fn().mockRejectedValue(new Error('x')) },
    }))
    const mod = require('../push-notification/PushNotificationHandlerService')
    await mod.pushNotificationHandlerService.initialize()
    expect(spy).toHaveBeenCalled()
    expect(mod.pushNotificationHandlerService.isServiceInitialized()).toBe(true)
    spy.mockRestore()
  })

  it('getInitialNotification null tidak memicu handler', async () => {
    jest.resetModules()
    mockMessaging.getInitialNotification.mockResolvedValue(null)
    const handlers = require('../push-notification/NotificationEventHandlers')
    const mod = require('../push-notification/PushNotificationHandlerService')
    await mod.pushNotificationHandlerService.initialize()
    await Promise.resolve()
    expect(handlers.notificationEventHandlers.onNotificationOpened).not.toHaveBeenCalled()
  })
})
