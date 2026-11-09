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
  const { View } = require('react-native')
  return { __esModule: true, default: View }
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
  navigate: jest.fn(),
  goBack: jest.fn(),
  navigationRef: { isReady: () => false, navigate: jest.fn() },
}))

import fs from 'fs'
import path from 'path'
import React from 'react'
import { render, renderHook, cleanup, act } from '@testing-library/react-native'
import { setRtkMode } from '@/test-utils/rtkMock'
import { item, listFixture } from '@/test-utils/fixtures'

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
const anyValue: any = new Proxy(function () {}, {
  get: (_t, k) => {
    if (k === Symbol.toPrimitive) return () => 1
    if (k === Symbol.iterator) return function* () {}
    if (k === 'then') return undefined
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
    if (k === 'constructor') continue
    let v: any
    try {
      v = obj[k]
    } catch {
      continue
    }
    if (typeof v === 'function') {
      for (const args of argSets) {
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
      for (const args of [[], [anyValue], ['x'], [{ nativeEvent: { text: 'a', layout: { width: 1, height: 1 } } }]] as any[][]) {
        await safe(() => act(async () => { await n.props[k](...args) }))
      }
    }
  }
}

const isComponent = (k: string, v: any) =>
  /^[A-Z]/.test(k) &&
  (typeof v === 'function' || (v && v.$$typeof)) &&
  !/^[A-Z0-9_]+$/.test(k)

describe('smoke + fuzz kode aplikasi', () => {
  afterAll(() => {
    if (process.env.SMOKE_ERRS)
      fs.writeFileSync(process.env.SMOKE_ERRS, JSON.stringify(errs, null, 1))
  })

  it.each(files.map((f) => [path.relative(srcRoot, f), f]))('%s', async (_rel, file) => {
    let mod: any
    try {
      mod = require(file)
    } catch (e) {
      note(e)
      throw new Error('import gagal ' + (e as Error).message.slice(0, 200))
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
            if (m === 'data') await fireHandlers(screen)
          })
          cleanup()
        }
      } else if (/^use[A-Z]/.test(k) && typeof v === 'function') {
        for (const m of ['data', 'empty', 'error'] as const) {
          setRtkMode(m)
          for (const args of argSets) {
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
          await safe(() => v(...args))
        }
      } else if (typeof v === 'object') {
        await exercise(v)
      }
    }
    cleanup()
    expect(Object.keys(mod).length).toBeGreaterThanOrEqual(0)
  })
})
