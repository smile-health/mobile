jest.mock('i18next', () => ({ __esModule: true, t: (k: string) => k }))

import { AddNewBatchSchema } from '../AddNewBatchSchema'
import { BudgetSourceSchema } from '../BudgetSourceSchema'
import { CompletedSequenceSchema } from '../CompletedSequenceSchema'

const errs = async (schema: any, v: any) => {
  try {
    await schema.validate(v, { abortEarly: false })
    return [] as string[]
  } catch (error: any) {
    return error.errors as string[]
  }
}

describe('AddNewBatchSchema', () => {
  const ok = {
    code: 'B1',
    production_date: null,
    manufacture_id: 1,
    manufacture: { id: 1, name: 'M' },
    expired_date: '2030-01-01',
  }
  it('valid dan address default string kosong', async () => {
    const schema = AddNewBatchSchema()
    expect(await errs(schema, ok)).toEqual([])
    const out = await schema.validate({
      ...ok,
      manufacture: { id: 1, name: 'M', address: null },
    })
    expect(out.manufacture.address).toBe('')
  })
  it('menolak code dan tanggal kosong', async () => {
    const e = await errs(AddNewBatchSchema(), {
      ...ok,
      code: '',
      expired_date: '',
    })
    expect(e.filter((x) => x === 'validation.required')).toHaveLength(2)
  })
})

describe('BudgetSourceSchema', () => {
  const base = { change_qty: 1, unit: 'vial' }
  it('tanpa pembelian: sumber dana opsional', async () => {
    expect(
      await errs(BudgetSourceSchema(), {
        ...base,
        is_purchase: false,
        budget_source: null,
        budget_source_id: null,
        year: null,
        price: null,
      })
    ).toEqual([])
  })
  it('pembelian: sumber dana, tahun, harga wajib', async () => {
    const e = await errs(BudgetSourceSchema(), {
      ...base,
      is_purchase: true,
      budget_source: null,
      budget_source_id: null,
      year: null,
      price: null,
    })
    expect(e.filter((x) => x === 'validation.required').length).toBe(3)
  })
  it('pembelian: harga minimal 1', async () => {
    expect(
      await errs(BudgetSourceSchema(), {
        ...base,
        is_purchase: true,
        budget_source: null,
        budget_source_id: 1,
        year: 2025,
        price: 0,
      })
    ).toContain('validation.zero_quantity')
  })
})

describe('CompletedSequenceSchema', () => {
  const patient = (date: any) => ({
    material_index: 0,
    patient_index: 0,
    data: [{ actual_transaction_date: date }],
  })
  it('valid', async () => {
    expect(
      await errs(CompletedSequenceSchema(), {
        patients: [patient('2025-01-01')],
      })
    ).toEqual([])
  })
  it('tanggal transaksi wajib', async () => {
    expect(
      await errs(CompletedSequenceSchema(), { patients: [patient('')] })
    ).toContain('validation.required')
  })
})
