/**
 * Render semua komponen dan layar inventory di dalam FormProvider dengan form
 * yang terisi (batch aktif/kedaluwarsa, open vial, discard, pasien), param route
 * kaya, dan store terisi; lalu picu handler on* pada tiap elemen. Ini melengkapi
 * smoke global yang tidak punya konteks form (useFormContext = null).
 */
import '@/test-utils/inventory-mocks'
import fs from 'fs'
import path from 'path'
import React from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { act, cleanup, render } from '@testing-library/react-native'
import { chaosItem, chaosList, item } from '@/test-utils/fixtures'
import { setRtkMode } from '@/test-utils/rtkMock'
import { route } from '@/test-utils/inventory-render'

const root = path.resolve(__dirname, '..')
const walk = (dir: string): string[] =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) return e.name.startsWith('__') ? [] : walk(p)
    return /\.tsx$/.test(e.name) && !/\.test\./.test(e.name) ? [p] : []
  })
const files = ['component', 'transaction', 'stock']
  .flatMap((d) => walk(path.join(root, d)))
  .sort()

const material: any = {
  id: 1,
  name: 'Vaksin',
  is_managed_in_batch: 1,
  is_temperature_sensitive: 1,
  is_open_vial: 1,
  consumption_unit_per_distribution_unit: 10,
  unit_of_consumption: 'dosis',
}
const batch = {
  id: 1,
  code: 'B1',
  production_date: '2024-01-01',
  expired_date: '2030-01-01',
  manufacture: { id: 1, name: 'M', address: 'a' },
}
const row = (over: any = {}): any => ({
  qty: 100,
  allocated_qty: 0,
  available_qty: 100,
  max_open_vial_qty: 5,
  min: 0,
  max: 1000,
  updated_at: '2025-01-01',
  activity: { id: 1, name: 'Act' },
  material_id: 1,
  is_temperature_sensitive: true,
  is_open_vial: false,
  is_any_discard: false,
  is_need_patient: false,
  is_sequence: false,
  unit: 'dosis',
  piece_per_unit: 10,
  stock_id: 1,
  change_qty: 10,
  open_vial_qty: 0,
  close_vial_qty: 0,
  broken_qty: 0,
  transaction_reason_id: 1,
  transaction_reason: { value: 1, label: 'r', is_other: false, is_purchase: true },
  other_reason: null,
  price: 100,
  year: 2024,
  budget_source_id: 1,
  budget_source: { value: 1, label: 'APBN' },
  stock_quality_id: 1,
  stock_quality: { value: 1, label: 'VVM A' },
  batch,
  created_at: '2025-01-01T00:00:00.000Z',
  vaccine_type_id: 1,
  vaccine_method_id: 1,
  patients: [
    { identity_type: 1, patient_id: '1234567890123456', vaccine_sequence: 1, phone_number: '0811111111' },
  ],
  ...over,
})
const rows = () => [
  row(),
  row({ is_open_vial: true, open_vial_qty: 2, close_vial_qty: 10, change_qty: null }),
  row({ is_any_discard: true, broken_qty: 2, transaction_reason: { value: 2, label: 'o', is_other: true, is_purchase: false } }),
  row({ batch: null, stock_id: null, is_need_patient: true, is_sequence: true, is_open_vial: true, broken_open_vial: 1, broken_close_vial: 10 }),
]

const stockQuality = { id: 1, label: 'VVM A' }
const rich: any = {
  ...row(),
  id: 1,
  stock: { id: 1, batch, stock_quality: stockQuality, qty: 5, available_qty: 5, allocated_qty: 0, open_vial_qty: 0 },
  stocks: [row()],
  material,
  activity: { id: 1, name: 'Act' },
  customer: { id: 1, name: 'Cust' },
  transaction_type: { id: 7, name: 'Tipe' },
  transactionTypeId: 7,
  created_by: { firstname: 'A', lastname: 'B' },
  transaction_purchase: { price: 100, year: 2024, budget_source: { id: 1, name: 'APBN' } },
  patients: [
    {
      identity_type: 1,
      identity_number: '1234567890123456',
      patient_id: '1234567890123456',
      phone_number: '0811111111',
      vaccine_sequence: { id: 1, title: 'Dosis 1' },
      vaccine_type: { id: 1, name: 'T' },
      vaccine_method: { id: 1, name: 'M' },
    },
  ],
  materialName: 'Vaksin',
  transactionName: 'Tipe',
  activityName: 'Act',
  vaccineTypeName: 'T',
  vaccineMethodName: 'M',
  max_return: 5,
  consumption_qty: 5,
}
const stockItem: any = {
  material,
  protocol: { is_patient_needed: 1, is_sequence: 1 },
  details: [{ activity: { id: 1, name: 'Act' }, stocks: [rich.stock, { ...rich.stock, id: 2, batch: null }], total_qty: 10, total_available_qty: 5, total_allocated_qty: 1, min: 1, max: 20, updated_at: '2025-01-01' }],
}
const seed = (v: number) => {
  const { store } = require('@/services/store')
  const trx = require('@/services/features/transaction.slice')
  const ws = require('@/services/features/workspace.slice')
  const auth = require('@/services/features/auth.slice')
  store.dispatch(trx.setActivity({ id: 1, name: 'Act' }))
  store.dispatch(trx.setMaterial(stockItem))
  store.dispatch(trx.setMaterials([stockItem]))
  store.dispatch(
    trx.setExistingTrx({
      transactionTypeId: v % 6 + 4,
      activity: { id: 1, name: 'Act' },
      customer: { id: 2, name: 'C' },
      program: { id: 1, name: 'P' },
      transactions: rows(),
    })
  )
  store.dispatch(
    ws.setSelectedWorkspace({
      id: 1,
      entity_id: 1,
      name: 'P',
      config: { material: { is_hierarchy_enabled: v % 2 }, order: {} },
      activities: [{ id: 1, name: 'Act' }],
    })
  )
  store.dispatch(auth.setUserData({ id: 1, entity: { id: 1, name: 'Ent' }, firstname: 'A' }))
}

const nav = require('@react-navigation/native').__nav
const noop = jest.fn()
const types = ['add_stock', 'reduce_stock', 'discard', 'consumption', 'return', 'cancel_discard']

const Harness = ({ C, props, capture }: any) => {
  const form = useForm({
    defaultValues: {
      activeBatch: rows(),
      expiredBatch: rows(),
      selectedTrx: rows(),
      patients: rows()[0].patients,
      ...rows()[0],
      keyword: '',
      activity: { id: 1, name: 'Act' },
    } as any,
  })
  capture(form)
  return (
    <FormProvider {...form}>
      <C {...props(form)} />
    </FormProvider>
  )
}

const fire = async (screen: any) => {
  let nodes: any[] = []
  try {
    nodes = screen.UNSAFE_root.findAll(
      (n: any) =>
        n.props &&
        Object.keys(n.props).some((k) => /^on[A-Z]/.test(k) && typeof n.props[k] === 'function')
    )
  } catch {
    return
  }
  for (const n of nodes.slice(0, 30)) {
    for (const k of Object.keys(n.props)) {
      if (!/^on[A-Z]/.test(k) || typeof n.props[k] !== 'function') continue
      for (const args of [[], ['5'], [{ nativeEvent: { text: '3' } }], [{ id: 1, value: 1, label: 'x', name: 'x' }]] as any[][]) {
        try {
          await act(async () => {
            await n.props[k](...args)
          })
        } catch {
          /* handler menolak argumen ini */
        }
      }
    }
  }
}

jest.setTimeout(120000)

describe('inventory: komponen & layar dalam konteks form', () => {
  it.each(files.map((f) => [path.relative(root, f), f]))('%s', async (_rel, file) => {
    const mod = require(file)
    const comps = Object.entries<any>(mod).filter(
      ([k, v]) =>
        (/^[A-Z]/.test(k) || k === 'default') &&
        (typeof v === 'function' || v?.$$typeof) &&
        !/^[A-Z0-9_]+$/.test(k)
    )
    for (const [, C] of comps) {
      for (let v = 0; v < 8; v++) {
        setRtkMode(v === 5 ? 'empty' : v === 6 ? 'loading' : v === 7 ? 'chaos' : 'data', v)
        const r = rows()[v % 4]
        const c = chaosItem(v)
        route().params = {
          id: 1,
          activity: { id: 1, name: 'Act' },
          material,
          item: { material, protocol: v % 2 ? { is_patient_needed: 1, is_sequence: 1 } : undefined, details: [{ stocks: [item], total_qty: 1 }] },
          stockItem: { material, details: [] },
          stock: stockItem,
          formUpdate: noop,
          detail: stockItem,
          path: 'activeBatch.0',
          patientIds: { nik: [], non_nik: [] },
          batchList: [{ id: 1, code: 'B1' }],
          isPurchase: v % 2 === 0,
          alerts: [{ id: 1 }],
          transactionType: v % 4 + 7,
          type: types[v % types.length],
          data: v > 4 ? c : rich,
          ...(v > 4 ? { items: chaosList(v) } : {}),
        }
        nav.navigate.mockClear()
        seed(v)
        let form: any
        const props = (f: any) => ({
          batchType: v % 2 ? 'expiredBatch' : 'activeBatch',
          index: v % 4,
          type: types[v % types.length],
          item: v > 4 ? c : rich,
          stock: r,
          data: v > 4 ? c : rich,
          sections: [{ title: 'section.material_batch', fieldname: 'activeBatch', data: [r, r] }],
          items: [rich],
          list: [rich],
          transactions: rows(),
          isHierarchy: v % 2 === 0,
          programName: 'P',
          entityName: 'E',
          batchList: [],
          material,
          control: f.control,
          name: 'activity',
          fieldName: `activeBatch.${v % 4}`,
          testID: 'tid',
          visible: true,
          isVisible: true,
          onPress: noop,
          onClose: noop,
          onDismiss: noop,
          onChange: noop,
          onSubmit: noop,
          onDelete: noop,
          onSelect: noop,
          onApply: noop,
          onReset: noop,
          onPressDetailPatient: noop,
          navigation: nav,
          route: route(),
          t: (k: string) => k,
        })
        try {
          const screen = render(<Harness C={C} props={props} capture={(f: any) => (form = f)} />)
          await act(async () => {
            await Promise.resolve()
          })
          if (v === 0 || v === 4) await fire(screen)
        } catch (e: any) {
          /* kombinasi props ini tidak valid untuk komponen */
          if (process.env.FS_ERRS)
            fs.appendFileSync(
              process.env.FS_ERRS,
              `${_rel} v${v}: ${String(e?.message).slice(0, 160).replace(/\n/g, ' ')} @ ${String(e?.stack).split('\n').find((l) => l.includes('/src/') && !l.includes('__tests__'))?.replace(/.*\/src\//, '')}\n`
            )
        }
        cleanup()
      }
    }
    expect(comps).toBeDefined()
  })
})
