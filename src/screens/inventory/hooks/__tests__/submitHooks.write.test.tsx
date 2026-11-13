const mockUnwrap = jest.fn()
const mockCreate = jest.fn(() => ({ unwrap: mockUnwrap }))
jest.mock('@/services/apis/transaction.api', () => ({
  useCreateTrxConsumptionMutation: () => [mockCreate, { isLoading: false }],
  useCreateTrxAddStockMutation: () => [mockCreate, { isLoading: true }],
}))
jest.mock('@/i18n/useLanguage', () => ({
  useLanguage: () => ({ t: (k: string) => k }),
}))

import { act, renderHook } from '@testing-library/react-native'
import useSubmitAddStock from '../transactionSubmission/useSubmitAddStock'
import useSubmitConsumption from '../transactionSubmission/useSubmitConsumption'

const program: any = { entity_id: 11 }
const activity: any = { id: 2, entity_activity_id: 22 }
const customer: any = { id: 33 }

beforeEach(() => {
  mockCreate.mockClear()
  mockUnwrap.mockReset().mockResolvedValue({ ok: true })
})

describe('useSubmitConsumption', () => {
  it('menolak bila customer atau tanggal aktual kosong', async () => {
    const { result } = await renderHook(() => useSubmitConsumption())
    expect(() =>
      result.current.submitConsumption(program, [], activity, customer)
    ).toThrow()
    await act(() => result.current.setActualConsumptionDate('2025-01-01'))
    expect(() =>
      result.current.submitConsumption(program, [], activity, undefined as any)
    ).toThrow()
  })

  it('membangun payload: stok biasa, open vial, pasien dengan urutan, pasien tanpa urutan', async () => {
    const { result } = await renderHook(() => useSubmitConsumption())
    await act(() => result.current.setActualConsumptionDate('2025-01-01'))
    const trx: any[] = [
      { material_id: 1, change_qty: 2, stock_id: 5 },
      {
        material_id: 2,
        change_qty: 1,
        is_open_vial: true,
        open_vial_qty: 3,
        close_vial_qty: 4,
      },
      {
        material_id: 3,
        change_qty: 1,
        is_need_patient: true,
        is_sequence: true,
        vaccine_type_id: 7,
        vaccine_method_id: 8,
        patients: [
          {
            identity_type: 1,
            patient_id: 'P1',
            phone_number: '08',
            vaccine_sequence: 1,
            other_sequence: [2],
          },
          {},
        ],
      },
      {
        material_id: 4,
        change_qty: 1,
        is_need_patient: true,
        is_sequence: true,
      },
      {
        material_id: 5,
        change_qty: 1,
        is_need_patient: true,
        is_sequence: false,
        patients: [{ identity_type: 2, patient_id: 'P2' }],
      },
      {
        material_id: 6,
        change_qty: 1,
        is_need_patient: true,
        is_sequence: false,
      },
    ]
    let res: any
    await act(async () => {
      res = await result.current.submitConsumption(
        program,
        trx,
        activity,
        customer
      )
    })
    expect(res).toEqual({ ok: true })
    const payload = (mockCreate.mock.calls[0] as any[])[0]
    expect(payload).toMatchObject({
      activity_id: 2,
      entity_id: 11,
      customer_id: 33,
    })
    expect(payload.materials).toHaveLength(6)
    expect(payload.materials[0].stock_id).toBe(5)
    expect(payload.materials[1].stock_id).toBe(0)
    expect(payload.materials[2].patients[1]).toMatchObject({
      identity_type: 0,
      identity_number: '',
      phone_number: null,
    })
    expect(payload.materials[4]).toMatchObject({
      identity_type: 2,
      identity_number: 'P2',
      phone_number: null,
    })
    expect(result.current.consumptionPayload).toBeDefined()
    expect(result.current.isLoadingConsumption).toBe(false)
  })
})

describe('useSubmitAddStock', () => {
  it('membangun payload batch baru, stok lama, dan nilai default', async () => {
    const { result } = await renderHook(() => useSubmitAddStock())
    const trx: any[] = [
      {
        material_id: 1,
        change_qty: 4,
        price: 400,
        batch: {
          code: 'B',
          expired_date: '2030',
          production_date: '2029',
          manufacture: { id: 9 },
        },
        budget_source_id: 3,
        other_reason: 'x',
        stock_quality_id: 1,
        transaction_reason_id: 2,
        year: 2025,
      },
      {
        material_id: 2,
        change_qty: 1,
        stock_id: 8,
        batch: { code: 'Z', manufacture: { id: 1 } },
      },
      { material_id: 3, change_qty: 1 },
    ]
    await act(async () => {
      await result.current.submitAddStock(
        program,
        trx,
        activity,
        undefined as any
      )
    })
    const payload = (mockCreate.mock.calls[0] as any[])[0]
    expect(payload.materials[0]).toMatchObject({
      price: 100,
      batch: { code: 'B', manufacture_id: 9 },
      year: 2025,
    })
    expect(payload.materials[1].batch).toBeNull()
    expect(payload.materials[2]).toMatchObject({
      budget_source_id: 0,
      price: null,
      other_reason: null,
      transaction_reason_id: 0,
      year: null,
      stock_quality_id: null,
    })
    expect(result.current.isLoadingAddStock).toBe(true)
  })
})
