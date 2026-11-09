import dayjs from 'dayjs'
import {
  createReviewItems,
  createTransferStockItem,
  createTransferStockItems,
  createTransferStockPayload,
  getAllStocks,
  getFormItemsValue,
  getHeaderMaterialProps,
  getValidTransferStock,
} from '../helpers/TransferStockHelpers'

const stock = (id: number, extra: any = {}) => ({
  id,
  batch: null,
  qty: 10,
  available_qty: 8,
  activity: { id: 1, name: 'A' },
  price: 5,
  total_price: 50,
  budget_source: null,
  ...extra,
})
const material: any = {
  id: 3,
  name: 'Mat',
  consumption_unit_per_distribution_unit: 4,
  is_managed_in_batch: 1,
}

describe('TransferStockHelpers', () => {
  it('getAllStocks meratakan detail dan aman untuk undefined', () => {
    expect(getAllStocks([{ stocks: [1] }, { stocks: [2, 3] }] as any)).toEqual([1, 2, 3])
    expect(getAllStocks()).toEqual([])
  })

  it('createTransferStockItem memetakan budget source', () => {
    const noBudget = createTransferStockItem(stock(1) as any, material)
    expect(noBudget).toMatchObject({
      material_id: 3,
      material_name: 'Mat',
      piece_per_unit: 4,
      stock_id: 1,
      change_qty: null,
      budget_source: null,
    })
    const withBudget = createTransferStockItem(
      stock(1, { budget_source: { id: 2, name: 'APBN' } }) as any,
      material
    )
    expect(withBudget.budget_source).toEqual({ value: 2, label: 'APBN' })
    const emptyBudget = createTransferStockItem(
      stock(1, { budget_source: { name: 'x' } }) as any,
      material
    )
    expect(emptyBudget.budget_source).toBeNull()
  })

  it('createTransferStockItems memakai transaksi yang sudah ada', () => {
    const items = createTransferStockItems(
      [stock(1), stock(2)] as any,
      material,
      [{ stock_id: 2, change_qty: 5 }] as any
    )
    expect(items[0]).toHaveProperty('piece_per_unit', 4)
    expect(items[1]).toMatchObject({ id: 2, change_qty: 5 })
  })

  it('getFormItemsValue memisah batch kedaluwarsa dan aktif', () => {
    const past = dayjs().subtract(2, 'day').format('YYYY-MM-DD')
    const future = dayjs().add(2, 'day').format('YYYY-MM-DD')
    const data: any = {
      material,
      details: [
        {
          stocks: [
            stock(1, { batch: { expired_date: past } }),
            stock(2, { batch: { expired_date: future } }),
            stock(3),
          ],
        },
      ],
    }
    const trx: any = [
      { material_id: 3, destination_activity: { value: 9, label: 'X' } },
    ]
    const r = getFormItemsValue(data, trx)
    expect(r.items.expiredBatch).toHaveLength(1)
    expect(r.items.activeBatch).toHaveLength(2)
    expect(r.destination_activity_id).toBe(9)

    const nonBatch = getFormItemsValue(
      { ...data, material: { ...material, is_managed_in_batch: 0 } },
      []
    )
    expect(nonBatch.items.expiredBatch).toHaveLength(0)
    expect(nonBatch.destination_activity).toBeUndefined()
  })

  it('getValidTransferStock hanya membawa change_qty > 0', () => {
    const r = getValidTransferStock({
      destination_activity: { value: 1, label: 'x' },
      items: {
        activeBatch: [{ change_qty: 2, stock_id: 1 }, { change_qty: 0 }],
        expiredBatch: [{ change_qty: null }, { change_qty: 4, stock_id: 2 }],
      },
    } as any)
    expect(r.map((i: any) => i.change_qty)).toEqual([2, 4])
    expect(r[0]).toMatchObject({ is_open_vial: false, unit: '' })
    expect(r[0].created_at).toBeTruthy()
  })

  it('getHeaderMaterialProps memakai default saat aggregate kosong', () => {
    expect(getHeaderMaterialProps({ material: { name: 'M' } } as any)).toEqual({
      name: 'M',
      updatedAt: '',
      qty: 0,
      min: 0,
      max: 0,
      available: 0,
      allocated: 0,
    })
    expect(
      getHeaderMaterialProps({
        material: { name: 'M' },
        aggregate: {
          max: 9,
          min: 1,
          total_qty: 5,
          updated_at: 'u',
          total_allocated_qty: 2,
          total_available_qty: 3,
        },
      } as any)
    ).toEqual({ name: 'M', updatedAt: 'u', qty: 5, min: 1, max: 9, available: 3, allocated: 2 })
  })

  it('createTransferStockPayload mengisi default', () => {
    expect(
      createTransferStockPayload(
        [
          { material_id: 1, stock_id: 2, destination_activity: { value: 7 }, change_qty: 3 },
          { material_id: 1, change_qty: 1 },
        ] as any,
        5,
        6
      )
    ).toEqual({
      entity_id: 5,
      companion_program_id: 6,
      materials: [
        { material_id: 1, stock_id: 2, companion_activity_id: 7, qty: 3 },
        { material_id: 1, stock_id: 0, companion_activity_id: 0, qty: 1 },
      ],
    })
    expect(createTransferStockPayload([])).toEqual({
      entity_id: 0,
      companion_program_id: 0,
      materials: [],
    })
  })

  it('createReviewItems mengelompokkan per material', () => {
    const r = createReviewItems(
      [
        { material_id: 1, material_name: 'A', created_at: '2025-01-01 10:00:00' },
        { material_id: 1, material_name: 'A', created_at: '2025-01-01 10:00:00' },
        { material_id: 2, material_name: 'B', created_at: null },
      ] as any,
      { name: 'Prog' } as any
    )
    expect(r).toHaveLength(2)
    expect(r[0].items).toHaveLength(2)
    expect(r[0].items[0].program_name).toBe('Prog')
    expect(r[1].materialName).toBe('B')
    expect(createReviewItems([{ material_id: 1 }] as any)[0].items[0].program_name).toBe('')
  })
})
