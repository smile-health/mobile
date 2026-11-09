import fs from 'fs'
import path from 'path'
import { item, listFixture } from './fixtures'

const featuresDir = path.resolve(__dirname, '../services/features')

const payloads = (): unknown[] => [
  item,
  listFixture(),
  [item],
  { key: 'k', data: item, id: 1, index: 0, value: item, list: [item] },
  'x',
  1,
  true,
]

const isActionCreator = (v: any) =>
  typeof v === 'function' && typeof v.type === 'string' && v.match

/** Dispatch semua action slice + semua `fulfilled` endpoint API dengan data fixture. */
export const seedStore = (store: any, api: any) => {
  const files = fs
    .readdirSync(featuresDir)
    .filter((f) => f.endsWith('.slice.ts'))
  for (const f of files) {
    const mod = require(path.join(featuresDir, f))
    for (const v of Object.values<any>(mod)) {
      if (!isActionCreator(v)) continue
      for (const p of payloads()) {
        try {
          store.dispatch(v(p))
        } catch {
          /* payload tidak cocok untuk reducer ini */
        }
      }
    }
  }
  for (const name of Object.keys(api.endpoints)) {
    for (const p of payloads()) {
      for (const originalArgs of [{}, { programId: 1, page: 1, id: 1 }, 1]) {
        try {
          store.dispatch({
            type: 'api/executeQuery/fulfilled',
            payload: p,
            meta: {
              arg: { endpointName: name, originalArgs, type: 'query' },
              requestId: 'r',
              requestStatus: 'fulfilled',
              fulfilledTimeStamp: 1,
            },
          })
          store.dispatch({
            type: 'api/executeMutation/fulfilled',
            payload: p,
            meta: {
              arg: { endpointName: name, originalArgs, type: 'mutation' },
              requestId: 'r',
              requestStatus: 'fulfilled',
              fulfilledTimeStamp: 1,
            },
          })
        } catch {
          /* reducer matcher mengharapkan bentuk payload lain */
        }
      }
    }
  }
}

/** Contoh nilai untuk validasi schema yup. */
export const schemaSamples = (): any[] => [
  {},
  item,
  { ...item, qty: 0, quantity: 0, name: '' },
  { ...item, qty: -1, status: 0 },
  {
    ...item,
    batch: null,
    material: null,
    entity: null,
    activity: null,
    items: [item],
    stocks: [item],
    details: [item],
    list: [item],
    reason: { value: 1, label: 'r' },
    date: '2025-01-01',
    note: 'x',
    patient: { name: 'a', nik: '123' },
    patients: [{ name: 'a', nik: '123' }],
  },
  { items: [], stocks: [], details: [], list: [] },
]
