const mockMsg: any = {
  getToken: jest.fn(),
  onMessage: jest.fn(),
  onNotificationOpenedApp: jest.fn(),
  getInitialNotification: jest.fn(),
  onTokenRefresh: jest.fn(),
}
jest.mock('@/services/FirebaseMessaging', () => ({
  __esModule: true,
  default: () => mockMsg,
}))
jest.mock('@/utils/NavigationUtils', () => ({ navigate: jest.fn() }))
jest.mock('../firebase/NotificationPermissionService', () => ({
  notificationPermissionService: {
    requestPermission: jest.fn(),
    checkPermission: jest.fn(),
  },
}))
jest.mock('../push-notification', () => ({
  notificationChannelManager: {
    createChannels: jest.fn().mockResolvedValue(undefined),
  },
  notificationDisplayManager: {
    displayNotification: jest.fn().mockResolvedValue(undefined),
  },
}))
import { navigate } from '@/utils/NavigationUtils'
import { notificationPermissionService as perm } from '../firebase/NotificationPermissionService'
import {
  notificationChannelManager,
  notificationDisplayManager,
} from '../push-notification'

const fresh = () => {
  let svc: any
  jest.isolateModules(() => {
    svc =
      require('../firebase/FirebaseMessagingService').firebaseMessagingService
  })
  return svc
}

beforeEach(() => {
  jest.clearAllMocks()
  mockMsg.getInitialNotification.mockResolvedValue(null)
  mockMsg.getToken.mockResolvedValue('tok')
})

describe('FirebaseMessagingService', () => {
  it('delegasi izin', async () => {
    const svc = fresh()
    ;(perm.requestPermission as jest.Mock).mockResolvedValue(true)
    ;(perm.checkPermission as jest.Mock).mockResolvedValue(false)
    expect(await svc.requestPermission()).toBe(true)
    expect(await svc.checkPermission()).toBe(false)
  })

  it('initialize: ditolak => tidak initialized', async () => {
    const svc = fresh()
    ;(perm.requestPermission as jest.Mock).mockResolvedValue(false)
    await svc.initialize()
    expect(svc.isServiceInitialized()).toBe(false)
    expect(mockMsg.getToken).not.toHaveBeenCalled()
  })

  it('initialize sukses lalu tidak diulang', async () => {
    const svc = fresh()
    ;(perm.requestPermission as jest.Mock).mockResolvedValue(true)
    await svc.initialize()
    expect(svc.isServiceInitialized()).toBe(true)
    expect(svc.getCurrentToken()).toBe('tok')
    expect(notificationChannelManager.createChannels).toHaveBeenCalledTimes(1)
    await svc.initialize()
    expect(notificationChannelManager.createChannels).toHaveBeenCalledTimes(1)
  })

  it('initialize gagal ditangani', async () => {
    const svc = fresh()
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {})
    ;(perm.requestPermission as jest.Mock).mockRejectedValue(new Error('x'))
    await svc.initialize()
    expect(spy).toHaveBeenCalled()
    expect(svc.isServiceInitialized()).toBe(false)
    spy.mockRestore()
  })

  it('getFCMToken gagal => null', async () => {
    const svc = fresh()
    mockMsg.getToken.mockRejectedValue(new Error('x'))
    expect(await svc.getFCMToken()).toBeNull()
  })

  it('handler pesan', async () => {
    jest.useFakeTimers()
    const svc = fresh()
    mockMsg.getInitialNotification.mockResolvedValue({ id: 1 })
    svc.setupMessageHandlers()
    await mockMsg.onMessage.mock.calls[0][0]({ m: 1 })
    expect(notificationDisplayManager.displayNotification).toHaveBeenCalledWith(
      { m: 1 }
    )
    mockMsg.onNotificationOpenedApp.mock.calls[0][0]()
    expect(navigate).toHaveBeenCalledWith('Notification')
    await Promise.resolve()
    await Promise.resolve()
    jest.advanceTimersByTime(2000)
    expect(navigate).toHaveBeenCalledTimes(2)
    mockMsg.onTokenRefresh.mock.calls[0][0]('new')
    expect(svc.getCurrentToken()).toBe('new')
    jest.useRealTimers()
  })

  it('navigasi gagal ditangani', () => {
    const svc = fresh()
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {})
    ;(navigate as jest.Mock).mockImplementationOnce(() => {
      throw new Error('nav')
    })
    svc.setupMessageHandlers()
    mockMsg.onNotificationOpenedApp.mock.calls[0][0]()
    expect(spy).toHaveBeenCalled()
    spy.mockRestore()
  })
})
