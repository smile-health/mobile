jest.mock('@/storage', () => ({
  loadLocalData: jest.fn(),
  saveLocalData: jest.fn(),
  removeLocalData: jest.fn(),
}))

import dayjs from 'dayjs'
import { loadLocalData } from '@/storage'
import { TRANSACTION_TYPE } from '@/utils/Constants'
import { createNewBatchTrx } from '../AddStockHelpers'
import {
  trxDiscardToCreateTransaction,
  updateExistingTransaction,
} from '../CancelDiscardHelpers'
import {
  checkDraftTransaction,
  checkParamsChange,
  checkTrxDraftFlag,
  createTransactionData,
  createTransactionStock,
  findNextMaterial,
  generateTrxBatch,
  getDefaultValue,
  getMaterialCardProps,
  getMaterialTrxLabel,
  getTrxListSection,
  getTrxStockSection,
  getValidTransaction,
  getVaccineSequenceName,
  loadExistingTransaction,
  updatePartialValues,
} from '../TransactionHelpers'

const material: any = {
  id: 1,
  name: 'Mat',
  is_managed_in_batch: 1,
  is_temperature_sensitive: 1,
  is_open_vial: 1,
  consumption_unit_per_distribution_unit: 5,
  unit_of_consumption: 'dosis',
}

describe('getTrxListSection', () => {
  it('mengelompokkan transaksi per tanggal', () => {
    const list: any[] = [
      { id: 1, created_at: '2025-01-02T03:00:00.000Z' },
      { id: 2, created_at: '2025-01-02T04:00:00.000Z' },
      { id: 3, created_at: '2025-03-05T04:00:00.000Z' },
    ]
    const sections = getTrxListSection(list)
    expect(sections).toHaveLength(2)
    expect(sections[0].data).toHaveLength(2)
    expect(sections[1].data).toHaveLength(1)
  })
})

describe('createTransactionStock', () => {
  const stocks: any[] = [
    { id: 1, qty: 3, open_vial_qty: 2, batch: null },
    { id: 2, qty: 4, batch: null },
  ]

  it('memakai transaksi yang sudah ada dan membuat stok baru untuk sisanya', () => {
    const trx: any[] = [
      { material_id: 1, stock_id: 1, change_qty: 9 },
      { material_id: 1, stock_id: null, change_qty: 1, batch: { code: 'N' } },
      { material_id: 2, stock_id: null },
    ]
    const res = createTransactionStock(stocks, trx, material, undefined, true)
    expect(res).toHaveLength(3)
    expect(res[0].batch).toMatchObject({ code: 'N' })
    expect(res[1]).toMatchObject({ stock_id: 1, change_qty: 9, max_open_vial_qty: 2 })
    expect(res[2]).toMatchObject({ stock_id: 2, qty: 4, is_open_vial: true })
  })

  it('non-batch tanpa stok tetap menghasilkan satu baris default', () => {
    const res = createTransactionStock(
      [],
      [],
      { ...material, is_managed_in_batch: 0 },
      { is_patient_needed: 1, is_sequence: 1 } as any
    )
    expect(res).toHaveLength(1)
    expect(res[0].stock_id).toBeNull()
  })

  it('batch tanpa stok menghasilkan array kosong', () => {
    expect(createTransactionStock([], [], material)).toEqual([])
  })

  it('protocol mengisi is_need_patient dan is_sequence', () => {
    const res = createTransactionStock(
      [{ id: 1, qty: 1, activity: { id: 1, name: 'a' } } as any],
      [],
      material,
      { is_patient_needed: 1, is_sequence: 1 } as any
    )
    expect(res[0]).toMatchObject({ is_need_patient: true, is_sequence: true })
  })
})

describe('getTrxStockSection & getDefaultValue', () => {
  it('membuat section dengan judul sesuai tipe batch', () => {
    const sections = getTrxStockSection({ activeBatch: [], expiredBatch: [] })
    expect(sections.map((s) => s.title)).toEqual([
      'section.material_batch',
      'section.expired_material_batch',
    ])
  })

  it('memisahkan batch kedaluwarsa dan aktif', () => {
    const past = { batch: { expired_date: dayjs().subtract(2, 'day').format() } }
    const future = { batch: { expired_date: dayjs().add(2, 'day').format() } }
    const none = { batch: null }
    const res = getDefaultValue([past, future, none] as any)
    expect(res.expiredBatch).toHaveLength(1)
    expect(res.activeBatch).toHaveLength(2)
  })

  it('non-batch memasukkan semua ke active; default argumen kosong', () => {
    const past = { batch: { expired_date: '2000-01-01' } }
    expect(getDefaultValue([past] as any, false).activeBatch).toHaveLength(1)
    expect(getDefaultValue()).toEqual({ activeBatch: [], expiredBatch: [] })
  })
})

describe('createTransactionData & getValidTransaction', () => {
  it('menyalin properti dan mengisi created_at', () => {
    const data = createTransactionData({ material_id: 3, change_qty: 2 } as any)
    expect(data.material_id).toBe(3)
    expect(data.change_qty).toBe(2)
    expect(typeof data.created_at).toBe('string')
  })

  it('hanya menyisakan transaksi dengan qty > 0', () => {
    const res = getValidTransaction([
      { material_id: 1, change_qty: 1 },
      { material_id: 2, open_vial_qty: 1 },
      { material_id: 3, close_vial_qty: 1 },
      { material_id: 4, change_qty: 0 },
      { material_id: 5, change_qty: -1 },
    ] as any)
    expect(res.map((r) => r.material_id)).toEqual([1, 2, 3])
  })
})

describe('findNextMaterial', () => {
  const items: any[] = [{ material: { id: 1 } }, { material: { id: 2 } }]
  it('mengembalikan item berikutnya', () => {
    expect(findNextMaterial(items, items[0])).toBe(items[1])
  })
  it('undefined untuk item terakhir, tak ditemukan, atau input kosong', () => {
    expect(findNextMaterial(items, items[1])).toBeUndefined()
    expect(findNextMaterial(items, { material: { id: 9 } } as any)).toBeUndefined()
    expect(findNextMaterial([], items[0])).toBeUndefined()
    expect(findNextMaterial(items, null)).toBeUndefined()
  })
})

describe('getMaterialTrxLabel', () => {
  const t: any = jest.fn((k: string, o: any) => `${k}:${o.qty}`)
  const trx: any[] = [
    { material_id: 1, change_qty: 1000, open_vial_qty: 2, close_vial_qty: 3 },
    { material_id: 2, change_qty: 50 },
  ]
  it('menghitung total qty material dan memformat label', () => {
    const label = getMaterialTrxLabel(trx, TRANSACTION_TYPE.ADD_STOCK, 1, t)
    expect(label).toContain('transaction.transaction_label.add_stock')
  })
  it('undefined bila total <= 0 atau tipe tak dikenal', () => {
    expect(getMaterialTrxLabel(trx, TRANSACTION_TYPE.ADD_STOCK, 9, t)).toBeUndefined()
    expect(getMaterialTrxLabel(trx, 9999, 1, t)).toBeUndefined()
  })
})

describe('loadExistingTransaction', () => {
  it('memanggil callback saat draft ada', async () => {
    ;(loadLocalData as jest.Mock).mockResolvedValueOnce({ a: 1 })
    const cb = jest.fn()
    expect(await loadExistingTransaction(1, cb)).toEqual({ a: 1 })
    expect(cb).toHaveBeenCalledWith({ a: 1 })
  })
  it('tanpa callback atau draft tidak memanggil callback', async () => {
    ;(loadLocalData as jest.Mock).mockResolvedValueOnce(null)
    const cb = jest.fn()
    expect(await loadExistingTransaction(1, cb)).toBeNull()
    expect(cb).not.toHaveBeenCalled()
    ;(loadLocalData as jest.Mock).mockResolvedValueOnce({ a: 1 })
    expect(await loadExistingTransaction(1)).toEqual({ a: 1 })
  })
  it('mengembalikan null bila storage gagal', async () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {})
    ;(loadLocalData as jest.Mock).mockRejectedValueOnce(new Error('x'))
    expect(await loadExistingTransaction(1)).toBeNull()
    spy.mockRestore()
  })
})

describe('util lain', () => {
  it('updatePartialValues memanggil setValue per key dengan validasi', () => {
    const setValue = jest.fn()
    updatePartialValues('activeBatch.0' as any, setValue, {
      change_qty: 1,
      unit: 'x',
    } as any)
    expect(setValue).toHaveBeenCalledWith('activeBatch.0.change_qty', 1, {
      shouldValidate: true,
    })
    expect(setValue).toHaveBeenCalledTimes(2)
  })

  it('getMaterialCardProps dengan dan tanpa detail', () => {
    expect(
      getMaterialCardProps({
        material,
        details: [
          {
            updated_at: 'u',
            total_qty: 1,
            min: 2,
            max: 3,
            total_available_qty: 4,
            total_allocated_qty: 5,
          },
        ],
      } as any)
    ).toEqual({
      name: 'Mat',
      updatedAt: 'u',
      qty: 1,
      min: 2,
      max: 3,
      available: 4,
      allocated: 5,
      showMinMax: true,
    })
    expect(getMaterialCardProps({ material } as any, false)).toMatchObject({
      qty: 0,
      updatedAt: '',
      showMinMax: false,
    })
  })

  it('checkParamsChange', () => {
    expect(checkParamsChange(undefined, {})).toBe(true)
    expect(checkParamsChange({ page: 1, a: 1 }, { page: 1, a: 1 })).toBe(false)
    expect(checkParamsChange({ page: 2, a: 1 }, { page: 1, a: 1 })).toBe(true)
    expect(checkParamsChange({ page: 1, a: 2 }, { page: 1, a: 1 })).toBe(true)
  })

  it('generateTrxBatch', () => {
    expect(generateTrxBatch(null)).toBeNull()
    expect(generateTrxBatch({ code: 'c' } as any)?.manufacture).toEqual({
      id: 0,
      name: '',
      address: '',
    })
    expect(
      generateTrxBatch({ code: 'c', manufacture: { id: 2, name: 'n', address: 'a' } } as any)
        ?.manufacture
    ).toEqual({ id: 2, name: 'n', address: 'a' })
  })

  it('checkDraftTransaction & checkTrxDraftFlag', () => {
    expect(checkDraftTransaction(TRANSACTION_TYPE.ADD_STOCK, TRANSACTION_TYPE.REDUCE_STOCK)).toBe(true)
    expect(checkDraftTransaction(TRANSACTION_TYPE.VIEW_STOCK, TRANSACTION_TYPE.REDUCE_STOCK)).toBe(false)
    expect(checkDraftTransaction(TRANSACTION_TYPE.ADD_STOCK, TRANSACTION_TYPE.ADD_STOCK)).toBe(false)
    expect(checkDraftTransaction(undefined, 1)).toBe(false)
    expect(checkTrxDraftFlag(1, 1)).toBe(true)
    expect(checkTrxDraftFlag(1, 2)).toBe(false)
    expect(checkTrxDraftFlag(undefined, undefined)).toBe(false)
  })

  it('getVaccineSequenceName', () => {
    const items: any[] = [{ id: 1, title: 'Dosis 1' }]
    expect(getVaccineSequenceName(items, 1)).toBe('Dosis 1')
    expect(getVaccineSequenceName(items, 2)).toBe('')
    expect(getVaccineSequenceName(undefined, 1)).toBe('')
  })
})

describe('AddStockHelpers.createNewBatchTrx', () => {
  it('membuat transaksi batch baru dengan kode huruf besar', () => {
    const res = createNewBatchTrx(
      { id: 1, name: 'A' } as any,
      material,
      {
        code: 'abc',
        expired_date: '2030-01-01',
        production_date: null,
        manufacture: { id: 1, name: 'M', address: '' },
      } as any
    )
    expect(res.batch?.code).toBe('ABC')
    expect(res).toMatchObject({
      material_id: 1,
      is_temperature_sensitive: true,
      is_open_vial: true,
      unit: 'dosis',
      piece_per_unit: 5,
      activity: { id: 1, name: 'A' },
    })
  })

  it('default unit dan piece_per_unit saat material tidak punya data', () => {
    const res = createNewBatchTrx(
      { id: 1, name: 'A' } as any,
      { id: 2 } as any,
      { code: 'x', manufacture: {} } as any
    )
    expect(res).toMatchObject({ unit: '', piece_per_unit: 1, is_open_vial: false })
  })
})

describe('CancelDiscardHelpers', () => {
  const discard: any = {
    id: 7,
    stock_id: 3,
    material_id: 1,
    other_reason: 'x',
    change_qty: 4,
    created_at: 'c',
    activity: { id: 1, name: 'a' },
    stock: { batch: null, stock_quality: { id: 2, label: 'VVM B' } },
    transaction_purchase: { price: 10, year: 2024 },
  }
  it('trxDiscardToCreateTransaction', () => {
    expect(trxDiscardToCreateTransaction(discard)).toMatchObject({
      transaction_ids: [7],
      change_qty: 4,
      stock_quality_id: 2,
      stock_quality: { value: 2, label: 'VVM B' },
      price: 10,
      year: 2024,
    })
  })
  it('tanpa stock_quality dan purchase', () => {
    const res = trxDiscardToCreateTransaction({
      ...discard,
      transaction_purchase: undefined,
      stock: { batch: null, stock_quality: null },
    })
    expect(res).toMatchObject({
      stock_quality_id: null,
      stock_quality: null,
      price: null,
      year: null,
    })
    const noLabel = trxDiscardToCreateTransaction({
      ...discard,
      stock: { batch: null, stock_quality: { id: 3 } },
    })
    expect(noLabel.stock_quality).toEqual({ value: 3, label: '' })
  })
  it('updateExistingTransaction menambah dan menghapus item', () => {
    const trx: any = { transaction_ids: [1], change_qty: 10 }
    expect(updateExistingTransaction(trx, discard, false)).toMatchObject({
      transaction_ids: [1, 7],
      change_qty: 14,
    })
    expect(
      updateExistingTransaction({ transaction_ids: [1, 7], change_qty: 14 } as any, discard, true)
    ).toMatchObject({ transaction_ids: [1], change_qty: 10 })
    expect(
      updateExistingTransaction({ change_qty: 0 } as any, discard, false).transaction_ids
    ).toEqual([7])
  })
})
