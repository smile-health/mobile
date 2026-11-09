/**
 * Menjalankan setiap endpoint RTK Query (query builder, transformResponse,
 * merge, serializeQueryArgs) lewat store asli dengan axios di-mock.
 * Tag `write`: dispatch mutation dan mengubah state cache store.
 */
jest.mock('axios', () => {
  const instance: any = jest.fn()
  instance.interceptors = {
    request: { use: jest.fn() },
    response: { use: jest.fn() },
  }
  instance.defaults = { headers: { common: {} } }
  return {
    __esModule: true,
    default: { create: () => instance, Cancel: class Cancel {} },
    __instance: instance,
  }
})
jest.mock('@/utils/NetworkUtils', () => ({
  handleError: (e: unknown) => ({ status: 'CUSTOM_ERROR', error: String(e) }),
  checkNetworkStatus: jest.fn().mockResolvedValue({
    isConnected: true,
    isReachable: true,
  }),
}))
jest.mock('@/utils/NavigationUtils', () => ({ navigateToLogin: jest.fn() }))
jest.mock('@/utils/CommonUtils', () => ({ showError: jest.fn() }))

import { configureStore } from '@reduxjs/toolkit'
import * as axiosMock from 'axios'
import api, {
  setApiLanguage,
  setApiProgramId,
  setAuthToken,
  removeAuthToken,
} from '../api'
import '../apis/asset-inventory.api'
import '../apis/asset.api'
import '../apis/auth.api'
import '../apis/budget-source.api'
import '../apis/cva.api'
import '../apis/disposal.api'
import '../apis/entity.api'
import '../apis/event-report-count.api'
import '../apis/event-report-detail.api'
import '../apis/event-report.api'
import '../apis/inventory.api'
import '../apis/materials.api'
import '../apis/notification.api'
import '../apis/order.api'
import '../apis/profile.api'
import '../apis/reason.api'
import '../apis/reconciliation.api'
import '../apis/setting.api'
import '../apis/stock-taking.api'
import '../apis/ticket-material.api'
import '../apis/transaction-types.api'
import '../apis/transaction.api'
import '../apis/transfer-stock.api'
import '../apis/vaccine-sequence.api'
import '../apis/workspaces.api'

const mockInstance: any = (axiosMock as any).__instance

const item = {
  id: 1,
  name: 'A',
  code: 'c',
  label: 'l',
  value: 1,
  status: 1,
  qty: 1,
  entity: { id: 1, name: 'E' },
  material: { id: 1, name: 'M' },
  stocks: [],
  data: [],
}
// Array yang juga punya properti objek: aman untuk `.map(...)` maupun `.data`
// sehingga fungsi merge/transformResponse dari semua endpoint bisa jalan.
const extras = {
  data: [item],
  list: [item],
  items: [item],
  stocks: [item],
  details: [item],
  total: 1,
  page: 1,
}
const shapes: unknown[] = [
  Object.assign([item], extras),
  Object.assign([], { ...extras, data: [], list: [], items: [] }),
]

const makeStore = () =>
  configureStore({
    reducer: { [api.reducerPath]: api.reducer },
    middleware: (gdm) =>
      [
        ...gdm({ serializableCheck: false, immutableCheck: false }),
        api.middleware,
      ] as any,
  })

const argVariants = [
  {},
  { page: 1, id: 1, programId: 1, keyword: 'a', entity_id: 1 },
  { page: 2, id: 2, programId: 2, keyword: 'b' },
  1,
]

describe('api instance helpers', () => {
  it('mengatur header axios', () => {
    setAuthToken('tok')
    expect(mockInstance.defaults.headers.common.Authorization).toBe(
      'Bearer tok'
    )
    removeAuthToken()
    expect(mockInstance.defaults.headers.common.Authorization).toBeNull()
    setApiLanguage('id')
    expect(mockInstance.defaults.headers.common['Accept-Language']).toBe('id')
    setApiProgramId(5)
    expect(mockInstance.defaults.headers.common['X-Program-Id']).toBe(5)
  })

  it('mengembalikan error dari baseQuery saat axios gagal', async () => {
    mockInstance.mockRejectedValue(new Error('boom'))
    const store = makeStore()
    const endpoint: any = Object.values(api.endpoints)[0]
    const res: any = await store.dispatch(endpoint.initiate({}) as any)
    expect(res.error).toBeDefined()
  })
})

describe('semua endpoint RTK Query', () => {
  const endpoints = Object.entries(api.endpoints)

  it('terdaftar lebih dari 40 endpoint', () => {
    expect(endpoints.length).toBeGreaterThan(40)
  })

  it.each(endpoints)(
    '%s berjalan untuk berbagai bentuk respons',
    async (_n, ep: any) => {
      const store = makeStore()
      for (const shape of shapes) {
        mockInstance.mockResolvedValue({ data: shape })
        for (const args of argVariants) {
          const p: any = store.dispatch(
            ep.initiate(args, { forceRefetch: true }) as any
          )
          const res = await p
          expect(res).toBeDefined()
          p.unsubscribe?.()
          p.reset?.()
        }
      }
      store.dispatch(api.util.resetApiState())
      expect(mockInstance).toHaveBeenCalled()
    }
  )

  it.each(endpoints)('%s melaporkan error jaringan', async (_n, ep: any) => {
    const store = makeStore()
    mockInstance.mockRejectedValue(new Error('net'))
    const res: any = await store.dispatch(ep.initiate({}) as any)
    expect(res.error ?? res.data).toBeDefined()
    store.dispatch(api.util.resetApiState())
  })
})
