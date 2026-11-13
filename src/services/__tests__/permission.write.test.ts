const mockMessaging: any = {
  requestPermission: jest.fn(),
  hasPermission: jest.fn(),
}
const mockCreate: any = () => mockMessaging
mockCreate.AuthorizationStatus = { AUTHORIZED: 1, PROVISIONAL: 2 }
jest.mock('@/services/FirebaseMessaging', () => ({
  __esModule: true,
  default: mockCreate,
}))
jest.mock('../Notifee', () => ({
  __esModule: true,
  default: { requestPermission: jest.fn(), getNotificationSettings: jest.fn() },
  AuthorizationStatus: { AUTHORIZED: 1 },
}))

const load = (ios: boolean) => {
  let mod: any
  jest.isolateModules(() => {
    jest.doMock('@/utils/CommonUtils', () => ({ isIOS: ios }))
    mod = {
      svc: require('../firebase/NotificationPermissionService')
        .notificationPermissionService,
      notifee: require('../Notifee').default,
    }
  })
  return mod
}

describe('NotificationPermissionService iOS', () => {
  it.each([
    [1, true],
    [2, true],
    [0, false],
  ])('status %s => %s', async (status, expected) => {
    const { svc } = load(true)
    mockMessaging.requestPermission.mockResolvedValue(status)
    mockMessaging.hasPermission.mockResolvedValue(status)
    expect(await svc.requestPermission()).toBe(expected)
    expect(await svc.checkPermission()).toBe(expected)
  })

  it('error => false', async () => {
    const { svc } = load(true)
    mockMessaging.requestPermission.mockRejectedValue(new Error('x'))
    mockMessaging.hasPermission.mockRejectedValue(new Error('x'))
    expect(await svc.requestPermission()).toBe(false)
    expect(await svc.checkPermission()).toBe(false)
  })
})

describe('NotificationPermissionService Android', () => {
  it('izin diberikan / ditolak', async () => {
    const { svc, notifee } = load(false)
    notifee.requestPermission.mockResolvedValue({ authorizationStatus: 1 })
    notifee.getNotificationSettings.mockResolvedValue({
      authorizationStatus: 0,
    })
    expect(await svc.requestPermission()).toBe(true)
    expect(await svc.checkPermission()).toBe(false)
  })

  it('error => false', async () => {
    const { svc, notifee } = load(false)
    notifee.requestPermission.mockRejectedValue(new Error('x'))
    notifee.getNotificationSettings.mockRejectedValue(new Error('x'))
    expect(await svc.requestPermission()).toBe(false)
    expect(await svc.checkPermission()).toBe(false)
  })
})
