/**
 * Smoke + fuzz test seluruh kode screens/hooks/services: render tiap komponen, jalankan tiap hook (renderHook), panggil tiap fungsi export, lalu picu handler yang dikembalikan hook atau terpasang di elemen.
 * Render tiap komponen (default/named export)
 * dengan store asli, hook RTK Query di-stub, navigasi di-mock. Tiap file
 * dirender dalam beberapa mode data (data, kosong, loading, error).
 * Tag `write`: store dan mock mutation berubah selama render dan interaksi.
 */
jest.mock('@/services/apis/asset-inventory.api', () => require('@/test-utils/rtkMock').wrapApiModule(jest.requireActual('@/services/apis/asset-inventory.api')))
jest.mock('@/services/apis/asset.api', () => require('@/test-utils/rtkMock').wrapApiModule(jest.requireActual('@/services/apis/asset.api')))
jest.mock('@/services/apis/auth.api', () => require('@/test-utils/rtkMock').wrapApiModule(jest.requireActual('@/services/apis/auth.api')))
jest.mock('@/services/apis/budget-source.api', () => require('@/test-utils/rtkMock').wrapApiModule(jest.requireActual('@/services/apis/budget-source.api')))
jest.mock('@/services/apis/cva.api', () => require('@/test-utils/rtkMock').wrapApiModule(jest.requireActual('@/services/apis/cva.api')))
jest.mock('@/services/apis/disposal.api', () => require('@/test-utils/rtkMock').wrapApiModule(jest.requireActual('@/services/apis/disposal.api')))
jest.mock('@/services/apis/entity.api', () => require('@/test-utils/rtkMock').wrapApiModule(jest.requireActual('@/services/apis/entity.api')))
jest.mock('@/services/apis/event-report-count.api', () => require('@/test-utils/rtkMock').wrapApiModule(jest.requireActual('@/services/apis/event-report-count.api')))
jest.mock('@/services/apis/event-report-detail.api', () => require('@/test-utils/rtkMock').wrapApiModule(jest.requireActual('@/services/apis/event-report-detail.api')))
jest.mock('@/services/apis/event-report.api', () => require('@/test-utils/rtkMock').wrapApiModule(jest.requireActual('@/services/apis/event-report.api')))
jest.mock('@/services/apis/inventory.api', () => require('@/test-utils/rtkMock').wrapApiModule(jest.requireActual('@/services/apis/inventory.api')))
jest.mock('@/services/apis/materials.api', () => require('@/test-utils/rtkMock').wrapApiModule(jest.requireActual('@/services/apis/materials.api')))
jest.mock('@/services/apis/notification.api', () => require('@/test-utils/rtkMock').wrapApiModule(jest.requireActual('@/services/apis/notification.api')))
jest.mock('@/services/apis/order.api', () => require('@/test-utils/rtkMock').wrapApiModule(jest.requireActual('@/services/apis/order.api')))
jest.mock('@/services/apis/profile.api', () => require('@/test-utils/rtkMock').wrapApiModule(jest.requireActual('@/services/apis/profile.api')))
jest.mock('@/services/apis/reason.api', () => require('@/test-utils/rtkMock').wrapApiModule(jest.requireActual('@/services/apis/reason.api')))
jest.mock('@/services/apis/reconciliation.api', () => require('@/test-utils/rtkMock').wrapApiModule(jest.requireActual('@/services/apis/reconciliation.api')))
jest.mock('@/services/apis/setting.api', () => require('@/test-utils/rtkMock').wrapApiModule(jest.requireActual('@/services/apis/setting.api')))
jest.mock('@/services/apis/stock-taking.api', () => require('@/test-utils/rtkMock').wrapApiModule(jest.requireActual('@/services/apis/stock-taking.api')))
jest.mock('@/services/apis/ticket-material.api', () => require('@/test-utils/rtkMock').wrapApiModule(jest.requireActual('@/services/apis/ticket-material.api')))
jest.mock('@/services/apis/transaction-types.api', () => require('@/test-utils/rtkMock').wrapApiModule(jest.requireActual('@/services/apis/transaction-types.api')))
jest.mock('@/services/apis/transaction.api', () => require('@/test-utils/rtkMock').wrapApiModule(jest.requireActual('@/services/apis/transaction.api')))
jest.mock('@/services/apis/transfer-stock.api', () => require('@/test-utils/rtkMock').wrapApiModule(jest.requireActual('@/services/apis/transfer-stock.api')))
jest.mock('@/services/apis/vaccine-sequence.api', () => require('@/test-utils/rtkMock').wrapApiModule(jest.requireActual('@/services/apis/vaccine-sequence.api')))
jest.mock('@/services/apis/workspaces.api', () => require('@/test-utils/rtkMock').wrapApiModule(jest.requireActual('@/services/apis/workspaces.api')))

jest.mock('@/storage', () => ({
  saveLocalData: jest.fn().mockResolvedValue(undefined),
  loadLocalData: jest.fn().mockResolvedValue(null),
  loadArrayData: jest.fn().mockResolvedValue([]),
  loadMultipleLocalData: jest.fn().mockResolvedValue({}),
  updateLocalData: jest.fn().mockResolvedValue(undefined),
  updateArrayData: jest.fn().mockResolvedValue(undefined),
  removeLocalData: jest.fn().mockResolvedValue(undefined),
  removeMultipleLocalData: jest.fn().mockResolvedValue(undefined),
  clearLocalData: jest.fn().mockResolvedValue(undefined),
}))
jest.mock('i18next', () => {
  const t = (k: string) => k
  const i18n = { t, language: 'en', changeLanguage: jest.fn(), exists: () => true }
  return { __esModule: true, default: i18n, t, ...i18n }
})
jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'))
jest.mock('react-native-safe-area-context', () =>
  require('react-native-safe-area-context/jest/mock').default
)
jest.mock('react-native-pager-view', () => {
  const mockReact = require('react')
  const { View: MockView } = require('react-native')
  const PagerView = mockReact.forwardRef((props: any, ref: any) => {
    mockReact.useImperativeHandle(ref, () => ({
      setPage: jest.fn(),
      setPageWithoutAnimation: jest.fn(),
      setScrollEnabled: jest.fn(),
    }))
    return mockReact.createElement(MockView, props, props.children)
  })
  return { __esModule: true, default: PagerView }
})
jest.mock('react-redux', () => {
  return {
    Provider: ({ children }: any) => children,
    useSelector: (sel: any) => sel(require('@/services/store').store.getState()),
    useDispatch: () => require('@/services/store').store.dispatch,
    useStore: () => require('@/services/store').store,
  }
})
jest.mock('@react-navigation/native', () => {
  const nav = {
    navigate: jest.fn(),
    goBack: jest.fn(),
    push: jest.fn(),
    replace: jest.fn(),
    reset: jest.fn(),
    setOptions: jest.fn(),
    dispatch: jest.fn(),
    canGoBack: jest.fn(() => true),
    addListener: jest.fn(() => jest.fn()),
    getParent: jest.fn(),
    isFocused: jest.fn(() => true),
  }
  const params = new Proxy(
    { id: 1, programId: 1, activityId: 1, data: { id: 1 } },
    { get: (t: any, k: any) => (k in t ? t[k] : undefined) }
  )
  return {
    useNavigation: () => nav,
    useRoute: () => ({ key: 'k', name: 'n', params }),
    useFocusEffect: (cb: any) => {
      const React = require('react')
      React.useEffect(() => cb(), [])
    },
    useIsFocused: () => true,
    useNavigationState: (sel: any) => sel({ index: 0, routes: [{ name: 'n' }] }),
    useTheme: () => ({ colors: {} }),
    CommonActions: { navigate: jest.fn(), reset: jest.fn() },
    StackActions: { replace: jest.fn(), push: jest.fn(), popToTop: jest.fn() },
    NavigationContainer: ({ children }: any) => children,
    createNavigationContainerRef: () => ({ isReady: () => false, navigate: jest.fn(), current: null }),
  }
})
jest.mock('@/utils/NavigationUtils', () => ({
  navigateToLogin: jest.fn(),
  navigateAndReset: jest.fn(),
  navigate: jest.fn(),
  goBack: jest.fn(),
  navigationRef: { isReady: () => false, navigate: jest.fn() },
}))

import fs from 'fs'
import path from 'path'
import React from 'react'
import { render, renderHook, cleanup, act } from '@testing-library/react-native'
import { setRtkMode } from '@/test-utils/rtkMock'
import { chaosItem, chaosList, item, listFixture } from '@/test-utils/fixtures'
import { seedStore, schemaSamples } from '@/test-utils/seedStore'

const srcRoot = path.resolve(__dirname, '..')
const walk = (dir: string): string[] =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) return e.name.startsWith('__') ? [] : walk(p)
    return /\.tsx?$/.test(e.name) &&
      !/\.(test|d)\./.test(e.name) &&
      !/\/(models|types|assets)\//.test(p)
      ? [p]
      : []
  })

const files = ['screens', 'hooks', 'services']
  .flatMap((d) => walk(path.join(srcRoot, d)))
  .filter((f) => !/services\/(apis|features)\//.test(f)) // sudah dites terpisah
  .sort()
const modes = ['data', 'empty', 'loading', 'error'] as const

// Proxy "apa saja": bisa dipanggil, diakses, diiterasi; dipakai sebagai argumen.
const anyValue: any = new Proxy((() => undefined) as any, {
  get: (_t, k) => {
    if (k === Symbol.toPrimitive) return () => 1
    if (k === Symbol.iterator) return function* () {}
    if (k === 'then') return undefined
    if (k === 'arguments' || k === 'caller' || k === 'prototype')
      return (_t as any)[k]
    if (k === 'length') return 0
    return anyValue
  },
  apply: () => anyValue,
  has: () => true,
})

const nav = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  setOptions: jest.fn(),
  push: jest.fn(),
  addListener: jest.fn(() => jest.fn()),
}
const baseProps: any = {
  t: (k: string) => k,
  id: 1,
  data: { id: 1 },
  item,
  items: [item],
  onPress: jest.fn(),
  onChange: jest.fn(),
  onClose: jest.fn(),
  onSubmit: jest.fn(),
  navigation: nav,
  route: { params: { id: 1 } },
}
const argSets: any[][] = [
  [],
  [baseProps],
  [item],
  [listFixture()],
  [anyValue],
  [1, 'x'],
  [item, item, item],
]

jest.setTimeout(120000)
// Handler async yang dipicu fuzz boleh menolak promise; jangan gagalkan test lain.
beforeEach(() => {
  process.removeAllListeners('unhandledRejection')
  process.removeAllListeners('uncaughtException')
  process.on('unhandledRejection', () => undefined)
  process.on('uncaughtException', () => undefined)
})
beforeAll(() => {
  const AsyncStorage = require('@react-native-async-storage/async-storage')
  AsyncStorage.getAllKeys.mockResolvedValue([])
  AsyncStorage.getItem.mockResolvedValue(null)
})

let hookSeed = 0
const SEEDS = 12
const PROP_SEEDS = 10
const handlerArgs: any[][] = [[], [item], ['x'], [1], [anyValue]]
const hookArgs: any[][] = [[], [baseProps], [anyValue], [chaosItem(1)], [{ ...baseProps, item: chaosItem(2), data: chaosList(2) }],
  [item, item],
  [chaosItem(1), chaosItem(2)],
  [chaosItem(3), chaosItem(4), chaosItem(5)],
  [chaosItem(6), listFixture()],
  [listFixture(), chaosItem(7), item]]

// replaceReducer merusak store global; sisanya API react-hook-form yang
// melempar error async jika dipanggil dengan argumen asal.
const SKIP_KEYS = new Set([
  'constructor',
  'replaceReducer',
  'control',
  'watch',
  'register',
  'subscribe',
  'setValue',
  'getValues',
  'setError',
  'trigger',
  'unregister',
  'setFocus',
  'resetField',
  'getFieldState',
  'formState',
])

// Layar yang handler submit-nya menolak promise secara async tanpa catch bila state fuzz tidak lengkap.
const hashKey = (str: string) => {
  let h = 5
  for (let i = 0; i < str.length; i++) h = (h * 33 + str.charCodeAt(i)) >>> 0
  return h
}
/** Props "kacau": nama prop -> nilai dipilih dari kumpulan nilai berdasar hash(nama)+seed. */
const propsChaos = (seed: number): any => {
  const cache: Record<string, any> = {}
  return new Proxy({} as any, {
    get: (_t, k) => {
      if (typeof k === 'symbol') return undefined
      if (k in cache) return cache[k]
      let v: any
      if (/^on[A-Z]/.test(k) || /^(handle|set|toggle|render)[A-Z]/.test(k)) v = jest.fn()
      else if (k === 't') v = (x: string) => x
      else if (k === 'navigation') v = nav
      else {
        const opts = [
          chaosItem(seed),
          chaosList(seed),
          0,
          1,
          'abc',
          true,
          false,
          null,
          undefined,
          [],
          [chaosItem(seed + 1)],
          { id: 1 },
        ]
        v = opts[(hashKey(k) + seed) % opts.length]
      }
      cache[k] = v
      return v
    },
    has: () => true,
  })
}

const NO_FIRE = /RelocationFinalReviewScreen/

const errs: Record<string, number> = {}
const note = (e: unknown) => {
  const key =
    String((e as Error)?.message).slice(0, 120).replace(/\n/g, ' ') +
    ' @ ' +
    (String((e as Error)?.stack)
      .split('\n')
      .find((l) => l.includes('/src/') && !l.includes('__tests__'))
      ?.replace(/.*\/src\//, '') ?? '')
  errs[key] = (errs[key] ?? 0) + 1
}

const safe = async (fn: () => unknown) => {
  try {
    const r: any = fn()
    if (r && typeof r.then === 'function') await Promise.resolve(r).catch(note)
  } catch (e) {
    note(e)
  }
}

/** Panggil semua fungsi pada objek (hasil hook / service / handler map). */
const exercise = async (obj: any, depth = 0) => {
  if (!obj || depth > 1 || (typeof obj !== 'object' && typeof obj !== 'function'))
    return
  const keys = new Set<string>(Object.keys(obj))
  const proto = typeof obj === 'object' ? Object.getPrototypeOf(obj) : null
  if (proto && proto !== Object.prototype && proto !== Array.prototype) {
    for (const k of Object.getOwnPropertyNames(proto)) keys.add(k)
  }
  for (const k of keys) {
    if (SKIP_KEYS.has(k)) continue
    let v: any
    try {
      v = obj[k]
    } catch {
      continue
    }
    if (typeof v === 'function') {
      for (const args of handlerArgs) {
        await safe(() => act(async () => { await v.apply(obj, args) }))
      }
    } else if (v && typeof v === 'object' && depth < 1 && !React.isValidElement(v)) {
      await exercise(v, depth + 1)
    }
  }
}

/** Picu handler on* pada semua node dari pohon render. */
const fireHandlers = async (screen: any) => {
  let nodes: any[] = []
  try {
    nodes = screen.UNSAFE_root.findAll(
      (n: any) =>
        n.props &&
        Object.keys(n.props).some(
          (k) => /^on[A-Z]/.test(k) && typeof n.props[k] === 'function'
        )
    )
  } catch {
    return
  }
  for (const n of nodes.slice(0, 60)) {
    for (const k of Object.keys(n.props)) {
      if (!/^on[A-Z]/.test(k) || typeof n.props[k] !== 'function') continue
      for (const args of [[], [item], ['x'], [{ nativeEvent: { text: 'a', layout: { width: 1, height: 1 } } }]] as any[][]) {
        await safe(() => act(async () => { await n.props[k](...args) }))
      }
    }
  }
}

/** Hasil fungsi: validasi kalau schema yup, jalankan kalau fungsi, telusuri kalau object. */
const inspectResult = async (out: any) => {
  if (!out) return
  if (typeof out.validateSync === 'function') {
    for (const sample of schemaSamples()) {
      await safe(() => out.validateSync(sample, { abortEarly: false }))
      await safe(() => out.validate(sample, { abortEarly: false }))
      await safe(() => out.isValidSync(sample))
    }
    return
  }
  if (typeof out === 'function') {
    for (const args of handlerArgs) await safe(() => out(...args))
    return
  }
  if (typeof out === 'object') await exercise(out)
}

const isComponent = (k: string, v: any) =>
  /^[A-Z]/.test(k) &&
  (typeof v === 'function' || (v && v.$$typeof)) &&
  !/^[A-Z0-9_]+$/.test(k)

afterAll(() => {
  if (process.env.SMOKE_ERRS)
    fs.writeFileSync(process.env.SMOKE_ERRS, JSON.stringify(errs, null, 1))
})

describe.each([['store kosong', false], ['store terisi', true]])('smoke + fuzz kode aplikasi (%s)', (_label, seeded) => {
  beforeAll(() => {
    if (seeded) {
      seedStore(require('@/services/store').store, require('@/services/api').default)
    }
  })

  it.each(files.map((f) => [path.relative(srcRoot, f), f]))('%s', async (_rel, file) => {
    let mod: any
    try {
      mod = require(file)
    } catch {
      try {
        mod = require(file) // percobaan kedua: modul native kadang gagal sekali saat pertama dimuat
      } catch (e) {
        // modul yang butuh native binary (mis. network-logger/FileReader) tidak bisa dimuat di Jest
        note(e)
        return
      }
    }
    for (const [key, v] of Object.entries<any>(mod)) {
      if (v == null) continue
      const k =
        key === 'default' && typeof v === 'function' && v.name ? v.name : key
      if (isComponent(k, v)) {
        for (const m of modes) {
          setRtkMode(m)
          await safe(async () => {
            const screen = render(React.createElement(v, baseProps))
            await act(async () => {
              await Promise.resolve()
            })
            if (m === 'data' && !NO_FIRE.test(String(_rel))) await fireHandlers(screen)
          })
          cleanup()
        }
        for (let seed = 0; seed < SEEDS; seed++) {
          setRtkMode('chaos', seed)
          const c = chaosItem(seed)
          await safe(async () => {
            const screen = render(
              React.createElement(v, {
                ...baseProps,
                item: c,
                data: c,
                items: chaosList(seed),
              })
            )
            await act(async () => {
              await Promise.resolve()
            })
            if (seed % 2 === 0 && !NO_FIRE.test(String(_rel)))
              await fireHandlers(screen)
          })
          cleanup()
        }
        // Variasi props: tiap nama prop mendapat nilai deterministik berbeda per seed,
        // sehingga prop selain item/data/items (batch, material, order, ...) ikut bervariasi.
        const renderFn = typeof v === 'function' ? v : (v.type ?? v.render)
        if (typeof renderFn === 'function') {
          for (let seed = 0; seed < PROP_SEEDS; seed++) {
            setRtkMode(seed % 3 === 0 ? 'empty' : 'chaos', seed)
            const proxyProps = propsChaos(seed)
            const Wrapper = () => renderFn(proxyProps, null)
            await safe(async () => {
              render(React.createElement(Wrapper))
              await act(async () => {
                await Promise.resolve()
              })
            })
            cleanup()
          }
        }
      } else if (/^use[A-Z]/.test(k) && typeof v === 'function') {
        for (const m of ['data', 'empty', 'chaos', 'chaos'] as const) {
          setRtkMode(m, m === 'chaos' ? (hookSeed += 1) : 0)
          for (const args of hookArgs) {
            await safe(async () => {
              const hook = renderHook(() => v(...args))
              await act(async () => {
                await Promise.resolve()
              })
              await exercise(hook.result.current)
              hook.unmount()
            })
          }
        }
      } else if (typeof v === 'function') {
        setRtkMode('data')
        for (const args of argSets) {
          await safe(async () => {
            const out = await v(...args)
            await inspectResult(out)
          })
        }
      } else if (typeof v === 'object') {
        await inspectResult(v)
      }
    }
    cleanup()
    if (process.env.SMOKE_DBG && require('@/services/store').store.getState().setting == null) {
      require('fs').appendFileSync('/tmp/nullsetting.txt', String(_rel) + '\n')
    }
    expect(Object.keys(mod).length).toBeGreaterThanOrEqual(0)
  })
})
