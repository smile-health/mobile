jest.mock('i18next', () => ({ __esModule: true, t: (k: string) => k }))

import { IDENTITY_TYPE } from '../../constant/transaction.constant'
import { PatientInfoSchema } from '../PatientInfoSchema'

const t: any = (k: string) => k
const schema = PatientInfoSchema(t)

const base = (over: any = {}) => ({
  is_sequence: false,
  is_need_patient: true,
  is_temperature_sensitive: false,
  is_open_vial: false,
  available_qty: 100,
  piece_per_unit: 10,
  min_qty_vaccine: 10,
  max_qty_vaccine: 50,
  patient_ids: { nik: [], non_nik: [] },
  change_qty: 10,
  open_vial_qty: 0,
  close_vial_qty: 0,
  stock_quality_id: null,
  stock_quality: null,
  vaccine_type_id: undefined,
  vaccine_method_id: undefined,
  patients: [
    { identity_type: IDENTITY_TYPE.NIK, patient_id: '1234567890123456' },
  ],
  ...over,
})

const errors = async (v: any) => {
  try {
    await schema.validate(v, { abortEarly: false })
    return []
  } catch (error: any) {
    return error.errors as string[]
  }
}

describe('PatientInfoSchema', () => {
  it('valid untuk data lengkap', async () => {
    expect(await errors(base())).toEqual([])
  })

  it('menolak change_qty 0', async () => {
    expect(await errors(base({ change_qty: 0 }))).toContain(
      'validation.zero_quantity'
    )
  })

  it('menolak change_qty bukan kelipatan piece_per_unit', async () => {
    expect(await errors(base({ change_qty: 15 }))).toContain(
      'transaction.validation.multiply_qty'
    )
  })

  it('non-sequence: max-available memakai available_qty', async () => {
    expect(await errors(base({ change_qty: 110 }))).toContain(
      'transaction.validation.max_qty'
    )
  })

  it('sequence: min dan max memakai batas vaksin', async () => {
    const seq = {
      is_sequence: true,
      vaccine_type_id: 1,
      vaccine_method_id: 1,
      patients: [
        {
          identity_type: IDENTITY_TYPE.NIK,
          patient_id: '1234567890123456',
          vaccine_sequence: 1,
        },
      ],
    }
    expect(await errors(base({ ...seq, change_qty: 10 }))).toEqual([])
    expect(
      await errors(base({ ...seq, change_qty: 10, min_qty_vaccine: 20 }))
    ).toContain('transaction.validation.min_qty_vaccine')
    expect(await errors(base({ ...seq, change_qty: 60 }))).toContain(
      'transaction.validation.max_qty_vaccine'
    )
  })

  it('sequence: vaccine type, method, dan sequence wajib', async () => {
    const e = await errors(
      base({
        is_sequence: true,
        patients: [
          { identity_type: IDENTITY_TYPE.NIK, patient_id: '1234567890123456' },
        ],
      })
    )
    expect(e.filter((x) => x === 'validation.required').length).toBeGreaterThan(
      1
    )
  })

  it('vaccine_method wajib bila vaccine_type terisi', async () => {
    const e = await errors(base({ vaccine_type_id: 3 }))
    expect(e).toContain('validation.required')
  })

  it('stock_quality wajib bila sensitif suhu dan qty > 0', async () => {
    expect(
      await errors(base({ is_temperature_sensitive: true, change_qty: 10 }))
    ).toContain('validation.required')
    expect(
      await errors(
        base({
          is_temperature_sensitive: true,
          stock_quality_id: 1,
          stock_quality: { value: 1, label: 'ok' },
        })
      )
    ).toEqual([])
  })

  it('identity_type wajib untuk pasien', async () => {
    expect(
      await errors(base({ patients: [{ patient_id: '1234567890123456' }] }))
    ).toContain('validation.required')
  })

  it('NIK harus 16 digit', async () => {
    expect(
      await errors(
        base({
          patients: [{ identity_type: IDENTITY_TYPE.NIK, patient_id: '123' }],
        })
      )
    ).toContain('transaction.validation.patient_id')
  })

  it('non-NIK tidak dicek 16 digit', async () => {
    expect(
      await errors(
        base({
          patients: [
            { identity_type: IDENTITY_TYPE.NIK + 1, patient_id: 'abc' },
          ],
        })
      )
    ).toEqual([])
  })

  it('patient_id wajib', async () => {
    expect(
      await errors(base({ patients: [{ identity_type: IDENTITY_TYPE.NIK }] }))
    ).toContain('validation.required')
  })

  it('menolak patient_id duplikat dalam form', async () => {
    const p = {
      identity_type: IDENTITY_TYPE.NIK,
      patient_id: '1234567890123456',
    }
    expect(await errors(base({ patients: [p, { ...p }] }))).toContain(
      'transaction.validation.uniq_patient_id'
    )
  })

  it('menolak patient_id yang sudah ada di daftar NIK dan non-NIK', async () => {
    expect(
      await errors(
        base({ patient_ids: { nik: ['1234567890123456'], non_nik: [] } })
      )
    ).toContain('transaction.validation.uniq_patient_id')
    expect(
      await errors(
        base({
          patient_ids: { nik: [], non_nik: ['abc'] },
          patients: [
            { identity_type: IDENTITY_TYPE.NIK + 1, patient_id: 'abc' },
          ],
        })
      )
    ).toContain('transaction.validation.uniq_patient_id')
  })

  it('validasi panjang nomor telepon', async () => {
    const p = {
      identity_type: IDENTITY_TYPE.NIK,
      patient_id: '1234567890123456',
    }
    expect(
      await errors(base({ patients: [{ ...p, phone_number: '123' }] }))
    ).toContain('transaction.validation.phone_min')
    expect(
      await errors(base({ patients: [{ ...p, phone_number: '1'.repeat(16) }] }))
    ).toContain('transaction.validation.phone_max')
    expect(
      await errors(base({ patients: [{ ...p, phone_number: '12345678' }] }))
    ).toEqual([])
  })
})
