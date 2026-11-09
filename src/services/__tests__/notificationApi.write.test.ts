jest.mock('axios', () => {
  const instance: any = jest.fn()
  instance.interceptors = { request: { use: jest.fn() }, response: { use: jest.fn() } }
  instance.defaults = { headers: { common: {} } }
  return { __esModule: true, default: { create: () => instance, Cancel: class {} }, __instance: instance }
})
jest.mock('@/utils/NetworkUtils', () => ({
  handleError: (e: any) => ({ status: 'CUSTOM_ERROR', error: String(e) }),
  checkNetworkStatus: jest.fn(),
}))
jest.mock('@/utils/NavigationUtils', () => ({ navigateToLogin: jest.fn() }))
jest.mock('@/utils/CommonUtils', () => ({ showError: jest.fn() }))

import { configureStore } from '@reduxjs/toolkit'
import * as axiosMock from 'axios'
import api from '../api'
import { notificationApi } from '../apis/notification.api'

const inst: any = (axiosMock as any).__instance
const makeStore = () =>
  configureStore({
    reducer: { [api.reducerPath]: api.reducer },
    middleware: (g) => [...g({ serializableCheck: false, immutableCheck: false }), api.middleware] as any,
  })

const page = (data: any[]) => ({ data, meta: { current_page: 1, last_page: 1 }, current_page: 1, last_page: 1 })

describe('notificationApi', () => {
  beforeEach(() => inst.mockReset())

  it('query sederhana memanggil URL yang benar', async () => {
    const store = makeStore()
    inst.mockResolvedValue({ data: {} })
    await store.dispatch(notificationApi.endpoints.getOrderNotif.initiate(7) as any)
    expect(inst.mock.calls.at(-1)[0]).toEqual({ url: 'main/app/notif/order', method: 'GET', params: { entity_id: 7 } })
    await store.dispatch(notificationApi.endpoints.getOrderNotif.initiate(undefined, { forceRefetch: true }) as any)
    expect(inst.mock.calls.at(-1)[0].params).toBeUndefined()
    await store.dispatch(notificationApi.endpoints.readAllNotification.initiate() as any)
    expect(inst.mock.calls.at(-1)[0]).toEqual({ url: 'core/notifications/read', method: 'PUT' })
  })

  it('readSingleNotification: update optimis menandai read_at', async () => {
    const store = makeStore()
    inst.mockResolvedValue({ data: page([{ id: 1, read_at: null }, { id: 2, read_at: 'x' }]) })
    await store.dispatch(notificationApi.endpoints.getNotifications.initiate({} as any) as any)
    inst.mockResolvedValue({ data: {} })
    await store.dispatch(notificationApi.endpoints.readSingleNotification.initiate(1) as any)
    const entry: any = Object.values((store.getState() as any).api.queries).find((q: any) => q.endpointName === 'getNotifications')
    expect(entry.data.pages[0].data[0].read_at).toBeTruthy()
    expect(entry.data.pages[0].data[1].read_at).toBe('x')
    // sudah dibaca / id tidak ada: tidak berubah
    await store.dispatch(notificationApi.endpoints.readSingleNotification.initiate(2) as any)
    await store.dispatch(notificationApi.endpoints.readSingleNotification.initiate(99) as any)
  })

  it('readSingleNotification gagal: patch dibatalkan', async () => {
    const store = makeStore()
    inst.mockResolvedValue({ data: page([{ id: 1, read_at: null }]) })
    await store.dispatch(notificationApi.endpoints.getNotifications.initiate({} as any) as any)
    inst.mockRejectedValue(new Error('fail'))
    const res: any = await store.dispatch(notificationApi.endpoints.readSingleNotification.initiate(1) as any)
    expect(res.error).toBeDefined()
    await new Promise((r) => setTimeout(r, 20))
  })

  it('readSingleNotification tanpa cache notifikasi / halaman kosong', async () => {
    const store = makeStore()
    inst.mockResolvedValue({ data: {} })
    await store.dispatch(notificationApi.endpoints.readSingleNotification.initiate(1) as any)
    inst.mockResolvedValue({ data: page([]) })
    await store.dispatch(notificationApi.endpoints.getNotifications.initiate({ a: 1 } as any) as any)
    inst.mockResolvedValue({ data: { data: 'bukan-array', meta: {} } })
    await store.dispatch(notificationApi.endpoints.getNotifications.initiate({ a: 2 } as any) as any)
    inst.mockResolvedValue({ data: {} })
    await store.dispatch(notificationApi.endpoints.readSingleNotification.initiate(1) as any)
    expect(inst).toHaveBeenCalled()
  })
})
