const mockInputs: any[] = []
const mockDropdowns: any[] = []

jest.mock('@/components/ActivityLabel', () => ({
  __esModule: true,
  default: () => null,
}))
jest.mock('@/components/dropdown/Dropdown', () => ({
  __esModule: true,
  default: (p: any) => {
    mockDropdowns.push(p)
    return null
  },
}))
jest.mock('@/components/forms', () => ({
  InputNumber: (p: any) => {
    mockInputs.push(p)
    return null
  },
}))
jest.mock('@/components/list/InfoRow', () => {
  const { Text } = require('react-native')
  return {
    InfoRow: ({ label, value }: any) => <Text>{`${label}=${value}`}</Text>,
  }
})
jest.mock('@/components/separator/Separator', () => ({
  __esModule: true,
  default: () => null,
}))
jest.mock('../EmptyStockView', () => {
  const { Text } = require('react-native')
  return { EmptyStockView: () => <Text>empty-view</Text> }
})
jest.mock('../StockInfoSection', () => ({
  __esModule: true,
  default: () => null,
}))

import React from 'react'
import { render } from '@testing-library/react-native'
import Hier from '../AllocationMaterialHierarchyRenderer'
import NonHier from '../AllocationMaterialNonHierarchyRenderer'

const t: any = (k: string) => k
const stock = (id: number, qty: number) => ({
  id,
  available_qty: qty,
  batch: {
    code: `B${id}`,
    expired_date: '2030-01-01',
    production_date: '2029-01-01',
    manufacture: { name: 'Man' },
  },
  activity: { name: 'A' },
})
const item = (over: any = {}): any => ({
  material: { id: 11, name: 'Mat', is_temperature_sensitive: 0 },
  qty: 10,
  total_allocated_qty: 7,
  stocks: [stock(1, 5), stock(2, 0)],
  ...over,
})
const draft = [
  {
    children: [
      {
        stock: [
          {
            stock_id: 1,
            draft_allocated_qty: 3,
            draft_order_stock_status_id: 2,
          },
        ],
      },
    ],
  },
]

beforeEach(() => {
  mockInputs.length = 0
  mockDropdowns.length = 0
})

describe('AllocationMaterialHierarchyRenderer', () => {
  const setup = async (it: any, extra: any = {}) => {
    const setValue = jest.fn()
    const watch = jest.fn((name: string) =>
      name.endsWith('draft_allocated_qty') ? extra.watched : undefined
    )
    const utils = await render(
      <Hier
        item={it}
        index={2}
        isBatch={extra.isBatch ?? false}
        control={{} as any}
        t={t}
        setValue={setValue}
        // @ts-expect-error tipe mock test tidak presisi
        watch={watch}
        materialParentId={5}
        draftData={draft}
      />
    )
    return { setValue, watch, ...utils }
  }

  it('stok kosong menampilkan EmptyStockView', async () => {
    const { getByText } = await setup(item({ stocks: [] }))
    getByText('empty-view')
  })

  it('input qty: nilai dari draft, editable sesuai ketersediaan, error bila melebihi stok', async () => {
    await setup(item(), { watched: 99 })
    expect(mockInputs).toHaveLength(2)
    expect(mockInputs[0].editable).toBe(true)
    expect(mockInputs[1].editable).toBe(false)
    expect(mockInputs[0].errors).toBe('transaction.validation.max_qty')
    expect(mockInputs[0].value).toBe(99)
  })

  it('nilai draft dipakai bila form kosong; tanpa error', async () => {
    await setup(item(), { watched: undefined })
    expect(mockInputs[0].value).toBe(3)
    expect(mockInputs[0].errors).toBeUndefined()
  })

  it('onChangeText mengisi semua field alokasi', async () => {
    const { setValue } = await setup(item(), { watched: 1 })
    mockInputs[0].onChangeText(5)
    const calls = Object.fromEntries(setValue.mock.calls)
    const base = 'order_items.2.children[0].allocations.0'
    expect(calls[`${base}.draft_allocated_qty`]).toBe('5')
    expect(calls[`${base}.stock_id`]).toBe(1)
    expect(calls[`${base}.material_child_id`]).toBe(11)
    expect(calls[`${base}.material_parent_id`]).toBe(5)
    expect(calls[`${base}.material`]).toMatchObject({ id: 11 })
  })

  it('material sensitif suhu menampilkan dropdown status dan menyimpan pilihan', async () => {
    const { setValue } = await setup(
      item({ material: { id: 11, name: 'M', is_temperature_sensitive: 1 } }),
      { watched: 1 }
    )
    expect(mockDropdowns).toHaveLength(2)
    expect(mockDropdowns[1].disable).toBe(true)
    expect(mockDropdowns[0].value).toBe(2)
    mockDropdowns[0].onChangeValue('x')
    expect(setValue).toHaveBeenCalledWith(
      'order_items.2.children[0].allocations.0.draft_order_stock_status',
      'x'
    )
  })

  it('mode batch menampilkan info batch', async () => {
    const { getByText, getAllByText } = await setup(item(), {
      isBatch: true,
      watched: 1,
    })
    getByText('section.material_batch')
    expect(getAllByText(/label.expired_date=/)).toHaveLength(2)
  })

  it('tanpa tanggal batch memakai "-"', async () => {
    const s = stock(3, 1)
    ;(s.batch as any).expired_date = undefined
    ;(s.batch as any).production_date = undefined
    const { getAllByText } = await setup(item({ stocks: [s] }), {
      isBatch: true,
    })
    getAllByText('label.expired_date=-')
    getAllByText('label.production_date=-')
  })
})

describe('AllocationMaterialNonHierarchyRenderer', () => {
  const setup = async (it: any, isBatch = false) => {
    const setValue = jest.fn()
    const utils = await render(
      <NonHier
        item={it}
        index={1}
        isBatch={isBatch}
        control={{} as any}
        t={t}
        setValue={setValue}
        draftData={draft}
      />
    )
    return { setValue, ...utils }
  }

  it('stok kosong: pesan empty_stock', async () => {
    const { getByText } = await setup(item({ stocks: [] }))
    getByText('label.empty_stock')
  })

  it('input qty memakai draft dan menyimpan qty serta stock id', async () => {
    const { setValue } = await setup(item())
    expect(mockInputs[0].value).toBe(3)
    mockInputs[0].onChangeText(8)
    expect(setValue).toHaveBeenCalledWith(
      'order_items.1.children.1.allocations.0.allocated_qty',
      '8'
    )
    expect(setValue).toHaveBeenCalledWith(
      'order_items.1.children.1.allocations.0.stock_id',
      1
    )
  })

  it('sensitif suhu: dropdown status; mode batch: info batch', async () => {
    const { getByText, getAllByText } = await setup(
      item({ material: { id: 1, name: 'M', is_temperature_sensitive: 1 } }),
      true
    )
    expect(mockDropdowns).toHaveLength(2)
    expect(mockDropdowns[0].value).toBe(2)
    getByText('section.material_batch')
    expect(getAllByText(/label.manufacturer=Man/)).toHaveLength(2)
  })

  it('tanpa tanggal batch memakai "-"', async () => {
    const s: any = stock(4, 1)
    s.batch.expired_date = undefined
    s.batch.production_date = undefined
    const { getAllByText } = await setup(item({ stocks: [s] }), true)
    getAllByText('label.expired_date=-')
  })
})
