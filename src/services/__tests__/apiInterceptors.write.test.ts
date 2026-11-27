jest.mock('axios', () => {
  const instance: any = jest.fn()
  instance.interceptors = {
    request: { use: jest.fn() },
    response: { use: jest.fn() },
  }
  instance.defaults = { headers: { common: {} } }
  class Cancel {
    message: string
    constructor(m: string) {
      this.message = m
    }
  }
  return {
    __esModule: true,
    default: { create: () => instance, Cancel },
    __instance: instance,
  }
})
jest.mock('@/utils/NetworkUtils', () => ({
  handleError: jest.fn((e: any) => ({
    status: 'CUSTOM_ERROR',
    error: String(e),
  })),
  checkNetworkStatus: jest.fn(),
}))
jest.mock('@/utils/NavigationUtils', () => ({ navigateToLogin: jest.fn() }))
jest.mock('@/utils/CommonUtils', () => ({ showError: jest.fn() }))
jest.mock('@/storage', () => ({
  clearLocalData: jest.fn().mockResolvedValue(undefined),
}))
jest.mock('@/i18n', () => ({
  __esModule: true,
  default: { t: (k: string) => k },
}))

import * as axiosMock from 'axios'
import { clearLocalData } from '@/storage'
import { showError } from '@/utils/CommonUtils'
import { navigateToLogin } from '@/utils/NavigationUtils'
import { checkNetworkStatus, handleError } from '@/utils/NetworkUtils'
import api from '../api'

const inst: any = (axiosMock as any).__instance
const reqOk = inst.interceptors.request.use.mock.calls[0][0]
const reqErr = inst.interceptors.request.use.mock.calls[0][1]
const resOk = inst.interceptors.response.use.mock.calls[0][0]
const resErr = inst.interceptors.response.use.mock.calls[0][1]

describe('request interceptor', () => {
  it('menambah header timezone saat jaringan siap', async () => {
    ;(checkNetworkStatus as jest.Mock).mockResolvedValue({
      isConnected: true,
      isReachable: true,
    })
    const cfg = await reqOk({ headers: {} })
    expect(typeof cfg.headers.timezone).toBe('string')
  })

  it('membatalkan saat offline', async () => {
    ;(checkNetworkStatus as jest.Mock).mockResolvedValue({
      isConnected: false,
      isReachable: false,
    })
    await expect(reqOk({ headers: {} })).rejects.toMatchObject({
      message: 'error.network_unavailable',
    })
  })

  it('membatalkan saat jaringan tidak stabil', async () => {
    ;(checkNetworkStatus as jest.Mock).mockResolvedValue({
      isConnected: true,
      isReachable: false,
    })
    await expect(reqOk({ headers: {} })).rejects.toMatchObject({
      message: 'error.network_unstable',
    })
  })

  it('error request dibungkus Error', async () => {
    await expect(reqErr('boom')).rejects.toThrow('boom')
  })
})

describe('response interceptor', () => {
  it('meneruskan response', () => {
    expect(resOk({ a: 1 })).toEqual({ a: 1 })
  })

  it('401 membersihkan sesi dan ke login', async () => {
    await expect(resErr({ response: { status: 401 } })).rejects.toEqual({
      response: { status: 401 },
    })
    expect(clearLocalData).toHaveBeenCalled()
    expect(navigateToLogin).toHaveBeenCalled()
    expect(showError).toHaveBeenCalledWith(
      'error.session-ended',
      'snackbar-error-sessionended'
    )
  })

  it('error lain hanya dilempar ulang', async () => {
    jest.clearAllMocks()
    await expect(resErr({ response: { status: 500 } })).rejects.toBeDefined()
    await expect(resErr()).rejects.toBeUndefined()
    expect(clearLocalData).not.toHaveBeenCalled()
  })
})

describe('axiosBaseQuery', () => {
  it('data sukses dan error lewat handleError', async () => {
    const base: any = (api as any).baseQuery ?? null
    // baseQuery tidak diekspos; dijalankan lewat endpoint yang di-inject
    const ep = api.injectEndpoints({
      endpoints: (b) => ({
        ping: b.query<any, void>({ query: () => ({ url: 'x' }) }),
      }),
      overrideExisting: true,
    })
    const { configureStore } = require('@reduxjs/toolkit')
    const store = configureStore({
      reducer: { [api.reducerPath]: api.reducer },
      middleware: (g: any) =>
        g({ serializableCheck: false }).concat(api.middleware),
    })
    inst.mockResolvedValueOnce({ data: { ok: 1 } })
    const ok: any = await store.dispatch((ep as any).endpoints.ping.initiate())
    expect(ok.data).toEqual({ ok: 1 })
    inst.mockRejectedValueOnce(new Error('bad'))
    const bad: any = await store.dispatch(
      (ep as any).endpoints.ping.initiate(undefined, { forceRefetch: true })
    )
    expect(handleError).toHaveBeenCalled()
    expect(bad.error.status).toBe('CUSTOM_ERROR')
    expect(base).toBeNull()
  })
})
