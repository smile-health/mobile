import {
  extractPatientIds,
  getTrxStockWithOtherActivityStock,
  setAdditionalFormValue,
} from '../ConsumptionHelpers'
import { trxConsumptionToCreateTransaction } from '../ReturnHFHelpers'
import {
  convertValidationError,
  extractNumbers,
  mergePayloadWithOtherSequence,
} from '../ReviewTransactionHelpers'

const material: any = {
  id: 1,
  is_managed_in_batch: 0,
  is_temperature_sensitive: 1,
  consumption_unit_per_distribution_unit: 10,
  unit_of_consumption: 'dosis',
}
const stock = (id: number, extra: any = {}): any => ({
  id,
  qty: 10,
  open_vial_qty: 0,
  allocated_qty: 0,
  available_qty: 10,
  updated_at: '2025-01-01',
  material,
  activity: { id: 1, name: 'a' },
  batch: null,
  ...extra,
})

describe('ConsumptionHelpers', () => {
  it('extractPatientIds mengelompokkan NIK dan non-NIK tanpa duplikat', () => {
    const res = extractPatientIds([
      {
        patients: [
          { identity_type: 1, patient_id: 'a' },
          { identity_type: 1, patient_id: 'a' },
          { identity_type: 2, patient_id: 'b' },
          { identity_type: 2, patient_id: '' },
        ],
      },
      {},
    ] as any)
    expect(res).toEqual({ nik: ['a'], non_nik: ['b'] })
  })

  it('extractPatientIds untuk transaksi kosong', () => {
    expect(extractPatientIds([])).toEqual({ nik: [], non_nik: [] })
  })

  it('getTrxStockWithOtherActivityStock menambah stok aktivitas lain bila ada transaksinya', () => {
    const item: any = {
      material,
      protocol: undefined,
      details: [{ stocks: [stock(1)] }],
    }
    const details: any[] = [
      { activity: { id: 2 }, stocks: [stock(2)] },
      { activity: { id: 3 }, stocks: [stock(3)] },
      { activity: null, stocks: [stock(4)] },
    ]
    const trx: any[] = [
      { material_id: 1, stock_id: 2, activity: { id: 2 } },
      { material_id: 1, stock_id: 1, activity: { id: 1 } },
    ]
    const res = getTrxStockWithOtherActivityStock(item, trx, details, 1, false)
    expect(res.map((r: any) => r.stock_id ?? r.id).sort()).toEqual(
      expect.arrayContaining([1, 2])
    )
    expect(res.some((r: any) => (r.stock_id ?? r.id) === 3)).toBe(false)
  })

  it('getTrxStockWithOtherActivityStock tanpa transaksi aktivitas lain hanya stok default', () => {
    const item: any = { material, details: [], protocol: undefined }
    const res = getTrxStockWithOtherActivityStock(item, [], [], 1, false)
    // material non-batch selalu mendapat satu baris default tanpa stock_id
    expect(res).toHaveLength(1)
    expect(res[0].stock_id).toBeNull()
  })

  it('setAdditionalFormValue memanggil callback dengan nilai form', () => {
    const cb = jest.fn()
    setAdditionalFormValue(
      [],
      [stock(5)],
      [],
      { material, protocol: undefined, details: [] } as any,
      false,
      cb
    )
    expect(cb).toHaveBeenCalledTimes(1)
    expect(cb.mock.calls[0][0]).toBeDefined()
  })
})

describe('ReviewTransactionHelpers', () => {
  it('extractNumbers', () => {
    expect(extractNumbers('materials[2].patients[10]')).toEqual(['2', '10'])
    expect(extractNumbers('abc')).toEqual([])
  })

  const payload: any = {
    materials: [
      {
        patients: [
          { identity_type: 1, identity_number: '111' },
          { identity_type: 2, identity_number: '222' },
        ],
      },
    ],
  }

  it('convertValidationError memetakan key error ke pasien', () => {
    const res = convertValidationError(payload, {
      'materials[0].patients[1]': [
        { data: [{ vaccine_method_title: 'BCG', vaccine_sequence: 1 }] },
      ],
      'materials[5].patients[0]': [],
    } as any)
    expect(res[0]).toMatchObject({
      material_index: 0,
      patient_index: 1,
      vaccine_method_title: 'BCG',
      identity_type: 2,
      identity_number: '222',
    })
    expect(res[1].identity_number).toBeUndefined()
    expect(res[1].data).toEqual([])
  })

  describe('mergePayloadWithOtherSequence', () => {
    it('mengembalikan salinan bila patients kosong atau payload tanpa materials', () => {
      expect(
        mergePayloadWithOtherSequence(payload, { patients: [] } as any)
      ).toEqual(payload)
      expect(
        mergePayloadWithOtherSequence({} as any, { patients: [{}] } as any)
      ).toEqual({})
      expect(
        mergePayloadWithOtherSequence(payload, { patients: undefined } as any)
      ).toEqual(payload)
    })

    it('menggabungkan other_sequences ke pasien yang cocok', () => {
      const res = mergePayloadWithOtherSequence(payload, {
        patients: [
          {
            material_index: 0,
            patient_index: 1,
            data: [
              { actual_transaction_date: '2025-01-02', vaccine_sequence: 2 },
              { actual_transaction_date: '2025-02-02' },
              null,
            ],
          },
        ],
      } as any)
      expect(res.materials[0].patients![0]).toEqual(
        payload.materials[0].patients[0]
      )
      expect((res.materials[0].patients![1] as any).other_sequences).toEqual([
        { actual_transaction_date: '2025-01-02', vaccine_sequence: 2 },
        { actual_transaction_date: '2025-02-02', vaccine_sequence: 0 },
      ])
    })

    it('melewati material tanpa pasien terkait atau data bukan array', () => {
      const two = {
        materials: [
          { patients: [{ a: 1 }] },
          { patients: undefined },
          { patients: [{}] },
        ],
      } as any
      const res = mergePayloadWithOtherSequence(two, {
        patients: [
          { material_index: 1, patient_index: 0, data: [] },
          { material_index: 2, patient_index: 0, data: 'x' },
          { material_index: 0, patient_index: 5, data: [] },
        ],
      } as any)
      expect(res.materials[0]).toEqual(two.materials[0])
      expect(res.materials[1]).toEqual(two.materials[1])
      expect(res.materials[2].patients![0]).toEqual({})
    })
  })
})

describe('ReturnHFHelpers.trxConsumptionToCreateTransaction', () => {
  const base: any = {
    id: 9,
    activity: { id: 1, name: 'a' },
    stock_id: 3,
    material,
    other_reason: null,
    max_return: 7,
    change_qty: -20,
    created_at: '2025-01-01',
    stock: { batch: null, stock_quality_id: 2 },
    patients: [],
  }

  it('tanpa pasien: change_qty 0 dan stock_quality dicari', () => {
    const res = trxConsumptionToCreateTransaction(base, false)
    expect(res).toMatchObject({
      transaction_id: 9,
      change_qty: 0,
      max_return: 7,
      consumption_qty: 20,
      stock_quality: { value: 2, label: 'VVM B' },
      price: null,
      year: null,
      is_temperature_sensitive: true,
      is_open_vial: false,
      piece_per_unit: 10,
      unit: 'dosis',
      patients: [],
    })
  })

  it('dengan pasien: change_qty = max_return dan pasien dipetakan', () => {
    const res = trxConsumptionToCreateTransaction(
      {
        ...base,
        other_reason: 'x',
        stock: { batch: null, stock_quality_id: 99 },
        transaction_purchase: { price: 5, year: 2024 },
        patients: [
          {
            identity_type: 1,
            identity_number: '123',
            phone_number: '08',
            vaccine_sequence: { id: 4 },
            vaccine_type: { id: 5 },
            vaccine_method: { id: 6 },
          },
        ],
      },
      true
    )
    expect(res.change_qty).toBe(7)
    expect(res.stock_quality).toBeNull()
    expect(res.price).toBe(5)
    expect(res.year).toBe(2024)
    expect(res.other_reason).toBe('x')
    expect(res.vaccine_type_id).toBe(5)
    expect(res.vaccine_method_id).toBe(6)
    expect(res.patients).toEqual([
      {
        identity_type: 1,
        patient_id: '123',
        phone_number: '08',
        vaccine_sequence: 4,
      },
    ])
  })
})
