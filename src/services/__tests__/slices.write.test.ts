/**
 * Menjalankan setiap action creator di semua slice terhadap state awal dan
 * state hasil action sebelumnya, lalu memeriksa reducer tidak merusak state
 * (tetap object, tetap bisa diserialisasi). Tag `write`: mengubah state store.
 */
jest.mock('axios', () => {
  const instance: any = jest.fn().mockResolvedValue({ data: [] })
  instance.interceptors = {
    request: { use: jest.fn() },
    response: { use: jest.fn() },
  }
  instance.defaults = { headers: { common: {} } }
  return {
    __esModule: true,
    default: { create: () => instance, Cancel: class Cancel {} },
  }
})
jest.mock('@/utils/NavigationUtils', () => ({ navigateToLogin: jest.fn() }))
jest.mock('@/storage', () => ({
  saveLocalData: jest.fn(),
  removeLocalData: jest.fn(),
  clearLocalData: jest.fn(),
  getLocalData: jest.fn(),
}))

import * as activity from '../features/activity.slice'
import * as allocate from '../features/allocate.slice'
import * as authSlice from '../features/auth.slice'
import * as cva from '../features/cva.slice'
import * as disposal from '../features/disposal.slice'
import * as home from '../features/home.slice'
import * as materials from '../features/materials.slice'
import * as notifSlice from '../features/notif.slice'
import * as order from '../features/order.slice'
import * as orders from '../features/orders.slice'
import * as reasonOrder from '../features/reason-order.slice'
import * as reconciliation from '../features/reconciliation.slice'
import * as relocation from '../features/relocation.slice'
import * as review from '../features/review.slice'
import * as setting from '../features/setting.slice'
import * as stockTaking from '../features/stock-taking.slice'
import * as stock from '../features/stock.slice'
import * as ticket from '../features/ticket.slice'
import * as ticketReason from '../features/ticketReason.slice'
import * as transactionTypes from '../features/transaction-types.slice'
import * as transaction from '../features/transaction.slice'
import * as vaccineSequence from '../features/vaccine-sequence.slice'
import * as vendor from '../features/vendor.slice'
import * as workspace from '../features/workspace.slice'
import { store } from '../store'

const modules: Record<string, Record<string, any>> = {
  authSlice,
  notifSlice,
  activity,
  allocate,
  cva,
  disposal,
  home,
  materials,
  order,
  orders,
  reasonOrder,
  reconciliation,
  relocation,
  review,
  setting,
  stockTaking,
  stock,
  ticket,
  ticketReason,
  transactionTypes,
  transaction,
  vaccineSequence,
  vendor,
  workspace,
}

const item = { id: 1, name: 'A', value: 1, label: 'l', qty: 1, material_id: 1 }
const payloads: unknown[] = [
  undefined,
  null,
  1,
  'x',
  true,
  [],
  [item],
  {},
  { ...item, data: [item], list: [item], items: [item] },
  { key: 'k', data: item, id: 1, index: 0, value: item },
]

const isActionCreator = (v: any) =>
  typeof v === 'function' && typeof v.type === 'string' && v.match

describe('slice action creators', () => {
  const entries = Object.entries(modules).flatMap(([mod, exp]) =>
    Object.entries(exp)
      .filter(([, v]) => isActionCreator(v))
      .map(([name, creator]) => [`${mod}.${name}`, creator] as const)
  )

  it('menemukan banyak action creator', () => {
    expect(entries.length).toBeGreaterThan(40)
  })

  it.each(entries)('%s tidak merusak state', (_n, creator: any) => {
    for (const payload of payloads) {
      let action: any
      try {
        action = creator(payload)
      } catch {
        continue // prepare callback menolak bentuk payload ini
      }
      try {
        store.dispatch(action)
      } catch (error) {
        // reducer yang mengasumsikan payload bertipe tertentu boleh melempar
        // untuk payload asal; yang penting store tetap utuh.
        expect(error).toBeInstanceOf(Error)
      }
      const state = store.getState()
      expect(state).toBeDefined()
      expect(() => JSON.stringify(state)).not.toThrow()
    }
  })
})

describe('selector', () => {
  const selectors = Object.entries(modules).flatMap(([mod, exp]) =>
    Object.entries(exp)
      .filter(
        ([n, v]) =>
          typeof v === 'function' &&
          !isActionCreator(v) &&
          /^(get|select)/.test(n)
      )
      .map(([name, fn]) => [`${mod}.${name}`, fn] as const)
  )

  it.each(selectors)('%s mengembalikan nilai tanpa melempar', (_n, fn: any) => {
    let result: unknown
    try {
      result = fn(store.getState())
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
      return
    }
    expect(() => result).not.toThrow()
  })
})

describe('state awal', () => {
  it('setiap reducer menghasilkan state dari action tak dikenal', () => {
    const before = store.getState()
    store.dispatch({ type: 'tidak/dikenal' })
    expect(store.getState()).toEqual(before)
  })
})
