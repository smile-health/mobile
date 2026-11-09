jest.mock('i18next', () => ({ __esModule: true, t: (k: string) => k }))

import { TRANSACTION_TYPE } from '@/utils/Constants'
import { TRANSACTION_LABEL_KEYS } from '../../constant/transaction.constant'
import {
  createAddStockValidationSchema,
  createConsumptionValidationSchema,
  createDiscardValidationSchema,
  createReduceStockValidationSchema,
  createTransactionStockSchema,
  getTrxValidationSchema,
} from '../TransactionCreateSchema'

const K = TRANSACTION_LABEL_KEYS
const row = (over: any = {}) => ({
  qty: 100,
  allocated_qty: 0,
  available_qty: 100,
  max_open_vial_qty: 0,
  min: 0,
  max: 1000,
  updated_at: '2025-01-01',
  activity: { id: 1, name: 'a' },
  material_id: 1,
  is_temperature_sensitive: false,
  is_open_vial: false,
  unit: 'vial',
  piece_per_unit: 10,
  stock_id: 1,
  change_qty: 10,
  open_vial_qty: 0,
  close_vial_qty: 0,
  transaction_reason_id: 1,
  transaction_reason: {
    value: 1,
    label: 'r',
    is_other: false,
    is_purchase: false,
  },
  other_reason: null,
  price: null,
  year: null,
  budget_source_id: null,
  budget_source: null,
  stock_quality_id: null,
  stock_quality: null,
  batch: null,
  created_at: null,
  ...over,
})
const run = async (type: any, over: any) => {
  try {
    await createTransactionStockSchema(type).validate(row(over), {
      abortEarly: false,
    })
    return [] as string[]
  } catch (e: any) {
    return e.errors as string[]
  }
}

describe('createTransactionStockSchema', () => {
  it('valid untuk semua tipe', async () => {
    for (const k of [K.ADD_STOCK, K.REDUCE_STOCK, K.DISCARDS, K.CONSUMPTION]) {
      expect(await run(k, {})).toEqual([])
    }
  })

  it('change_qty: min, kelipatan, dan melebihi stok', async () => {
    expect(await run(K.REDUCE_STOCK, { change_qty: 0 })).toContain(
      'validation.zero_quantity'
    )
    expect(await run(K.REDUCE_STOCK, { change_qty: 15 })).toContain(
      'transaction.validation.multiply_qty'
    )
    expect(await run(K.REDUCE_STOCK, { change_qty: 200 })).toContain(
      'transaction.validation.max_qty'
    )
    // tambah stok boleh melebihi available_qty
    expect(await run(K.ADD_STOCK, { change_qty: 200 })).toEqual([])
  })

  it('alasan transaksi wajib kecuali konsumsi', async () => {
    expect(
      await run(K.REDUCE_STOCK, { transaction_reason_id: null })
    ).toContain('validation.required')
    expect(
      await run(K.CONSUMPTION, { transaction_reason_id: null })
    ).toEqual([])
  })

  it('other_reason wajib bila alasan is_other', async () => {
    expect(
      await run(K.REDUCE_STOCK, {
        transaction_reason: { value: 1, label: 'r', is_other: true, is_purchase: false },
      })
    ).toContain('validation.required')
  })

  it('tambah stok pembelian: harga, tahun, sumber dana wajib', async () => {
    const e = await run(K.ADD_STOCK, {
      transaction_reason: { value: 1, label: 'r', is_other: false, is_purchase: true },
    })
    expect(e.filter((x) => x === 'validation.required').length).toBeGreaterThanOrEqual(3)
    expect(
      await run(K.REDUCE_STOCK, {
        transaction_reason: { value: 1, label: 'r', is_other: false, is_purchase: true },
      })
    ).toEqual([])
  })

  it('stock_quality wajib bila sensitif suhu dan ada qty', async () => {
    expect(
      await run(K.REDUCE_STOCK, { is_temperature_sensitive: true })
    ).toContain('validation.required')
    expect(
      await run(K.REDUCE_STOCK, {
        is_temperature_sensitive: true,
        change_qty: 0,
        open_vial_qty: 0,
        close_vial_qty: 0,
      })
    ).not.toContain('validation.required')
  })

  describe('open vial', () => {
    const open = (over: any = {}) => ({
      is_open_vial: true,
      change_qty: null,
      max_open_vial_qty: 5,
      open_vial_qty: 3,
      close_vial_qty: 10,
      ...over,
    })
    it('valid', async () => {
      expect(await run(K.REDUCE_STOCK, open())).toEqual([])
    })
    it('open vial melebihi batas', async () => {
      expect(await run(K.REDUCE_STOCK, open({ open_vial_qty: 9 }))).toContain(
        'transaction.validation.max_qty'
      )
    })
    it('open vial minimal 1', async () => {
      expect(await run(K.REDUCE_STOCK, open({ open_vial_qty: 0 }))).toContain(
        'validation.zero_quantity'
      )
    })
    it('discard: open vial harus sama dengan max', async () => {
      expect(await run(K.DISCARDS, open({ open_vial_qty: 3 }))).toContain(
        'transaction.validation.open_vial_discard'
      )
      expect(await run(K.DISCARDS, open({ open_vial_qty: 5 }))).toEqual([])
    })
    it('konsumsi: open vial wajib bila close vial terisi', async () => {
      expect(
        await run(K.CONSUMPTION, open({ open_vial_qty: 0, close_vial_qty: 10 }))
      ).toContain('validation.required')
    })
    it('close vial: kelipatan, min, dan melebihi stok', async () => {
      expect(await run(K.REDUCE_STOCK, open({ close_vial_qty: 15 }))).toContain(
        'transaction.validation.multiply_qty'
      )
      expect(await run(K.REDUCE_STOCK, open({ close_vial_qty: 0 }))).toContain(
        'validation.zero_quantity'
      )
      expect(await run(K.REDUCE_STOCK, open({ close_vial_qty: 200 }))).toContain(
        'transaction.validation.max_qty'
      )
    })
    it('max_open_vial_qty 0 membuat open vial nullable', async () => {
      expect(
        await run(K.REDUCE_STOCK, open({ max_open_vial_qty: 0, open_vial_qty: null }))
      ).toEqual([])
    })
  })
})

describe('getTrxValidationSchema', () => {
  it('memilih schema per tipe transaksi', () => {
    expect(getTrxValidationSchema(TRANSACTION_TYPE.ADD_STOCK)).toBe(
      createAddStockValidationSchema
    )
    expect(getTrxValidationSchema(TRANSACTION_TYPE.REDUCE_STOCK)).toBe(
      createReduceStockValidationSchema
    )
    expect(getTrxValidationSchema(TRANSACTION_TYPE.DISCARDS)).toBe(
      createDiscardValidationSchema
    )
    expect(getTrxValidationSchema(TRANSACTION_TYPE.CONSUMPTION)).toBe(
      createConsumptionValidationSchema
    )
    expect(getTrxValidationSchema()).toBe(createAddStockValidationSchema)
  })

  it('schema form menerima activeBatch dan expiredBatch kosong', async () => {
    for (const s of [
      createAddStockValidationSchema,
      createReduceStockValidationSchema,
      createDiscardValidationSchema,
      createConsumptionValidationSchema,
    ]) {
      await expect(
        s.validate({ activeBatch: [], expiredBatch: [] })
      ).resolves.toBeTruthy()
      await expect(s.validate({})).rejects.toBeTruthy()
    }
  })
})
