jest.mock('@/services/FirebaseMessaging', () => {
  const create: any = jest.fn()
  create.AuthorizationStatus = { AUTHORIZED: 1, PROVISIONAL: 2, DENIED: 0 }
  return { __esModule: true, default: create }
})
jest.mock('@/services/Notifee', () => ({
  __esModule: true,
  default: { setBadgeCount: jest.fn().mockResolvedValue() },
}))
jest.mock('@/services/firebase', () => ({
  firebaseMessagingService: {
    checkPermission: jest.fn(),
    requestPermission: jest.fn(),
    getFCMToken: jest.fn(),
  },
}))
jest.mock('@/services/push-notification', () => ({
  pushNotificationStorageService: {
    processOfflineQueue: jest.fn(),
    incrementBadgeCount: jest.fn(),
  },
  pushNotificationHandlerService: {
    initialize: jest.fn(),
    isServiceInitialized: jest.fn(),
  },
}))
jest.mock('@/storage', () => ({
  loadLocalData: jest.fn(),
  saveLocalData: jest.fn(),
}))
jest.mock('@/utils/NetworkUtils', () => ({ isNetworkAvailable: jest.fn() }))

import { AppState } from 'react-native'
import { act, renderHook, waitFor } from '@testing-library/react-native'
import { firebaseMessagingService as fm } from '@/services/firebase'
import mockCreate from '@/services/FirebaseMessaging'
import notifee from '@/services/Notifee'
import {
  pushNotificationHandlerService as handler,
  pushNotificationStorageService as store,
} from '@/services/push-notification'
import { loadLocalData, saveLocalData } from '@/storage'
import { isNetworkAvailable } from '@/utils/NetworkUtils'
import {
  useNotificationBadge,
  useNotificationPermission,
  usePushNotifications,
} from '../usePushNotifications'

const f = fm as jest.Mocked<typeof fm>
beforeEach(() => {
  jest.clearAllMocks()
  f.checkPermission.mockResolvedValue(true)
  f.requestPermission.mockResolvedValue(true)
  f.getFCMToken.mockResolvedValue('tok')
})

describe('usePushNotifications', () => {
  it('izin sudah ada: simpan token', async () => {
    const { result } = await renderHook(() => usePushNotifications())
    await waitFor(() => expect(result.current.token).toBe('tok'))
    expect(result.current.isPermissionGranted).toBe(true)
    expect(saveLocalData).toHaveBeenCalledWith(expect.anything(), 'tok')
    expect(f.requestPermission).not.toHaveBeenCalled()
  })

  it('izin diminta, token kosong', async () => {
    f.checkPermission.mockResolvedValue(false)
    f.getFCMToken.mockResolvedValue(null)
    const { result } = await renderHook(() => usePushNotifications())
    await waitFor(() => expect(f.requestPermission).toHaveBeenCalled())
    await waitFor(() => expect(result.current.isPermissionGranted).toBe(true))
    expect(result.current.token).toBeNull()
  })

  it('izin ditolak', async () => {
    f.checkPermission.mockResolvedValue(false)
    f.requestPermission.mockResolvedValue(false)
    const { result } = await renderHook(() => usePushNotifications())
    await waitFor(() => expect(f.requestPermission).toHaveBeenCalled())
    expect(result.current.isPermissionGranted).toBe(false)
    expect(result.current.token).toBeNull()
  })

  it('requestPermission melempar error terbungkus', async () => {
    const { result } = await renderHook(() => usePushNotifications())
    await waitFor(() => expect(result.current.token).toBe('tok'))
    f.checkPermission.mockRejectedValue(new Error('x'))
    await expect(result.current.requestPermission()).rejects.toThrow(
      'Failed to request notification permission'
    )
  })

  it('initializePushNotifications: token baru, token tersimpan, gagal', async () => {
    const { result } = await renderHook(() => usePushNotifications())
    await waitFor(() => expect(result.current.token).toBe('tok'))
    ;(loadLocalData as jest.Mock).mockResolvedValueOnce(null)
    await act(async () => result.current.initializePushNotifications())
    expect(handler.initialize).toHaveBeenCalled()

    ;(loadLocalData as jest.Mock).mockResolvedValueOnce(null)
    f.getFCMToken.mockResolvedValueOnce(null)
    await act(async () => result.current.initializePushNotifications())
    expect(result.current.token).toBeNull()

    ;(loadLocalData as jest.Mock).mockResolvedValueOnce('stored')
    await act(async () => result.current.initializePushNotifications())
    expect(result.current.token).toBe('stored')

    const spy = jest.spyOn(console, 'error').mockImplementation(() => {})
    ;(loadLocalData as jest.Mock).mockRejectedValueOnce(new Error('x'))
    await act(async () => result.current.initializePushNotifications())
    expect(spy).toHaveBeenCalled()
    spy.mockRestore()
  })

  it('AppState active: sinkron antrian offline hanya bila online & terinisialisasi', async () => {
    const remove = jest.fn()
    let cb: any
    const spy = jest.spyOn(AppState, 'addEventListener').mockImplementation(((
      _: string,
      c: any
    ) => {
      cb = c
      return { remove }
    }) as any)
    const { unmount } = await renderHook(() => usePushNotifications())
    await waitFor(() => expect(cb).toBeDefined())
    await cb('background')
    expect(isNetworkAvailable).not.toHaveBeenCalled()
    ;(isNetworkAvailable as jest.Mock).mockResolvedValue(false)
    await cb('active')
    expect(store.processOfflineQueue).not.toHaveBeenCalled()
    ;(isNetworkAvailable as jest.Mock).mockResolvedValue(true)
    ;(handler.isServiceInitialized as jest.Mock).mockReturnValue(true)
    await cb('active')
    expect(store.processOfflineQueue).toHaveBeenCalled()
    await unmount()
    expect(remove).toHaveBeenCalled()
    spy.mockRestore()
  })
})

describe('useNotificationPermission', () => {
  it.each([
    [1, 'granted'],
    [2, 'provisional'],
    [0, 'denied'],
    [9, 'not-determined'],
  ])('status %s => %s', async (s, label) => {
    ;(mockCreate as jest.Mock).mockReturnValue({
      hasPermission: jest.fn().mockResolvedValue(s),
    })
    const { result } = await renderHook(() => useNotificationPermission())
    await waitFor(() => expect(result.current.permissionStatus).toBe(label))
  })

  it('error => "error"', async () => {
    ;(mockCreate as jest.Mock).mockReturnValue({
      hasPermission: jest.fn().mockRejectedValue(new Error('x')),
    })
    const { result } = await renderHook(() => useNotificationPermission())
    let r: any
    await act(async () => {
      r = await result.current.checkPermissionStatus()
    })
    expect(r).toBe('error')
  })
})

describe('useNotificationBadge', () => {
  it('load, update, increment, clear', async () => {
    ;(loadLocalData as jest.Mock).mockResolvedValue('3')
    const { result } = await renderHook(() => useNotificationBadge())
    await waitFor(() => expect(result.current.badgeCount).toBe(3))
    expect(notifee.setBadgeCount).toHaveBeenCalledWith(3)
    await act(async () => result.current.updateBadgeCount(7))
    expect(result.current.badgeCount).toBe(7)
    ;(loadLocalData as jest.Mock).mockResolvedValue('8')
    await act(async () => result.current.incrementBadgeCount())
    expect(store.incrementBadgeCount).toHaveBeenCalled()
    expect(result.current.badgeCount).toBe(8)
    await act(async () => result.current.clearBadgeCount())
    expect(result.current.badgeCount).toBe(0)
  })

  it('nilai tidak valid / null jadi 0 dan error ditelan', async () => {
    ;(loadLocalData as jest.Mock).mockResolvedValue(null)
    const { result } = await renderHook(() => useNotificationBadge())
    await waitFor(() => expect(notifee.setBadgeCount).toHaveBeenCalledWith(0))
    ;(loadLocalData as jest.Mock).mockResolvedValue('abc')
    await act(async () => result.current.incrementBadgeCount())
    expect(result.current.badgeCount).toBe(0)
    ;(saveLocalData as jest.Mock).mockRejectedValue(new Error('x'))
    await act(async () => result.current.updateBadgeCount(5))
    await act(async () => result.current.clearBadgeCount())
    ;(loadLocalData as jest.Mock).mockRejectedValue(new Error('x'))
    await act(async () => result.current.loadBadgeCount())
    await act(async () => result.current.incrementBadgeCount())
    expect(result.current.badgeCount).toBe(0)
  })
})
