jest.mock('i18next', () => ({ __esModule: true, t: (k: string) => k }))

import { ReturnHealthFacilitySchema } from '../ReturnHealthFacilitySchema'

const schema = ReturnHealthFacilitySchema()
const opt = { value: 1, label: 'x' }
const row = (over: any = {}) => ({
  transaction_id: 1,
  activity: { id: 1, name: 'a' },
  material_id: 1,
  unit: 'vial',
  piece_per_unit: 10,
  stock_id: 1,
  is_temperature_sensitive: false,
  is_open_vial: false,
  is_any_discard: false,
  batch: null,
  consumption_qty: 20,
  max_return: 20,
  change_qty: 10,
  open_vial_qty: 0,
  close_vial_qty: 0,
  stock_quality_id: null,
  stock_quality: null,
  transaction_reason_id: null,
  transaction_reason: null,
  other_reason: null,
  price: null,
  year: null,
  budget_source_id: null,
  budget_source: null,
  created_at: null,
  ...over,
})
const run = async (over: any) => {
  try {
    await schema.validate({ selectedTrx: [row(over)] }, { abortEarly: false })
    return [] as string[]
  } catch (e: any) {
    return e.errors as string[]
  }
}

describe('ReturnHealthFacilitySchema', () => {
  it('valid untuk vial tertutup normal', async () => {
    expect(await run({})).toEqual([])
  })

  it('wajib punya selectedTrx', async () => {
    await expect(schema.validate({})).rejects.toBeTruthy()
  })

  it('change_qty: min, kelipatan, dan max_return', async () => {
    expect(await run({ change_qty: 0 })).toContain('validation.zero_quantity')
    expect(await run({ change_qty: 15 })).toContain(
      'transaction.validation.multiply_qty'
    )
    expect(await run({ change_qty: 30 })).toContain(
      'transaction.validation.max_return_qty'
    )
    expect(await run({ change_qty: 10, max_return: undefined })).toContain(
      'transaction.validation.max_return_qty'
    )
  })

  it('broken_qty wajib saat ada discard', async () => {
    expect(await run({ is_any_discard: true, broken_qty: undefined })).toContain(
      'validation.required'
    )
    expect(await run({ is_any_discard: true, broken_qty: 0 })).toContain(
      'validation.zero_quantity'
    )
    expect(await run({ is_any_discard: true, broken_qty: 20 })).toContain(
      'transaction.validation.max_discard_qty'
    )
    expect(
      await run({
        is_any_discard: true,
        broken_qty: 10,
        transaction_reason_id: 1,
        transaction_reason: {
          value: 1,
          label: 'r',
          is_purchase: false,
          is_other: false,
        },
      })
    ).toEqual([])
  })

  it('transaction_reason_id wajib bila ada qty dan discard', async () => {
    expect(
      await run({ is_any_discard: true, broken_qty: 5, transaction_reason_id: null })
    ).toContain('validation.required')
  })

  it('other_reason wajib bila alasan is_other', async () => {
    expect(
      await run({
        transaction_reason: {
          value: 1,
          label: 'r',
          is_purchase: false,
          is_other: true,
        },
        other_reason: null,
      })
    ).toContain('validation.required')
  })

  describe('open vial', () => {
    const open = (over: any = {}) => ({
      is_open_vial: true,
      change_qty: null,
      max_return: 30,
      open_vial_qty: 5,
      close_vial_qty: 10,
      ...over,
    })

    it('valid', async () => {
      expect(await run(open())).toEqual([])
    })

    it('open_vial_qty harus < piece_per_unit dan >= 1', async () => {
      expect(await run(open({ open_vial_qty: 10 }))).toContain(
        'transaction.validation.max_qty_vaccine'
      )
      expect(await run(open({ open_vial_qty: 0 }))).toContain(
        'validation.zero_quantity'
      )
    })

    it('open_vial wajib bila close_vial terisi', async () => {
      expect(await run(open({ open_vial_qty: undefined }))).toBeDefined()
      expect(await run(open({ open_vial_qty: 0, close_vial_qty: 10 }))).toContain(
        'validation.required'
      )
    })

    it('close_vial: kelipatan dan batas max', async () => {
      expect(await run(open({ close_vial_qty: 15 }))).toContain(
        'transaction.validation.multiply_qty'
      )
      expect(await run(open({ close_vial_qty: 40, open_vial_qty: 0 }))).toContain(
        'transaction.validation.max_qty_vaccine'
      )
      expect(await run(open({ close_vial_qty: 30, open_vial_qty: 5 }))).toContain(
        'transaction.validation.max_qty_vaccine'
      )
      expect(await run(open({ close_vial_qty: 0 }))).toContain(
        'validation.zero_quantity'
      )
    })

    it('broken_open_vial harus sama dengan open_vial_qty', async () => {
      expect(
        await run(open({ is_any_discard: true, broken_open_vial: 3 }))
      ).toContain('transaction.validation.must_equal_open_vial')
      expect(
        await run(open({ is_any_discard: true, broken_open_vial: undefined }))
      ).toContain('validation.required')
    })

    it('broken_close_vial: kelipatan dan max', async () => {
      expect(await run(open({ broken_close_vial: 7 }))).toContain(
        'transaction.validation.multiply_qty'
      )
      expect(await run(open({ broken_close_vial: 20 }))).toContain(
        'transaction.validation.max_discard_close_vial'
      )
      expect(await run(open({ broken_close_vial: 10 }))).toEqual([])
      expect(await run(open({ broken_close_vial: 0 }))).toContain(
        'validation.zero_quantity'
      )
    })
  })
})
