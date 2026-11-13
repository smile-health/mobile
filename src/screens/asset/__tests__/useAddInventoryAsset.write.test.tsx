const mockNav = { replace: jest.fn(), goBack: jest.fn() }
const mockCreate = jest.fn()
const mockEdit = jest.fn()
let mockLoading = { create: false, edit: false }
jest.mock('@react-navigation/native', () => ({ useNavigation: () => mockNav }))
jest.mock('@/i18n/useLanguage', () => ({
  useLanguage: () => ({ t: (k: string) => k }),
}))
jest.mock('@/utils/hooks/useProgramId', () => ({
  __esModule: true,
  default: () => 5,
}))
jest.mock('@/services/store', () => ({
  authState: (s: any) => s.auth,
  useAppSelector: (sel: any) =>
    sel({
      auth: {
        user: {
          entity: { name: 'Ent' },
          programs: [
            { id: 5, entity_id: 77 },
            { id: 6, entity_id: 1 },
          ],
        },
      },
    }),
}))
jest.mock('@/services/apis/asset-inventory.api', () => ({
  useCreateAssetInventoryMutation: () => [
    mockCreate,
    { isLoading: mockLoading.create },
  ],
  useEditAssetInventoryMutation: () => [
    mockEdit,
    { isLoading: mockLoading.edit },
  ],
}))
jest.mock('@/utils/CommonUtils', () => ({
  formatErrorMessage: (e: any) => `ERR:${e?.message}`,
  showError: jest.fn(),
  showSuccess: jest.fn(),
}))
jest.mock('@/utils/DateFormatUtils', () => ({
  convertString: (d: any) => `F:${new Date(d).getUTCFullYear()}`,
}))
jest.mock('@/screens/asset/schema/AssetInventorySchema', () => ({
  AssetInventorySchema: () => ({
    validate: async (v: any) => v,
    validateSync: (v: any) => v,
    __isYupSchema__: true,
  }),
}))

import { act, renderHook } from '@testing-library/react-native'
import { showError, showSuccess } from '@/utils/CommonUtils'
import { useAddInventoryAsset } from '../hooks/useAddInventoryAsset'

const unwrap = (v: any) => ({ unwrap: () => Promise.resolve(v) })
const reject = (m: string) => ({ unwrap: () => Promise.reject(new Error(m)) })

const asset: any = {
  id: 9,
  serial_number: 'SN',
  production_year: 2020,
  asset_type: { id: 1 },
  asset_model: { id: 2 },
  manufacture: { id: 3 },
  working_status: { id: 4 },
  ownership: { id: 2, qty: 3 },
  borrowed_from: { id: 8 },
  budget_source: { id: 5, year: 2024 },
  electricity: { id: 6 },
  warranty: {
    start_date: '2024-01-01',
    end_date: '2025-01-01',
    asset_vendor_id: 1,
  },
  calibration: { last_date: '2024-02-02', schedule_id: 2, asset_vendor_id: 2 },
  maintenance: { last_date: '2024-03-03', schedule_id: 3, asset_vendor_id: 3 },
  contact_person: {
    first: { name: 'a', number: '1' },
    second: { name: 'b', number: '2' },
    third: { name: 'c', number: '3' },
  },
}

beforeEach(() => {
  jest.clearAllMocks()
  mockLoading = { create: false, edit: false }
})

describe('useAddInventoryAsset', () => {
  it('nilai default dari data, entity dari program aktif', async () => {
    const { result } = await renderHook(() =>
      useAddInventoryAsset({ data: asset })
    )
    expect(result.current.form).toMatchObject({
      asset_type_id: 1,
      ownership_status: 2,
      ownership_qty: 3,
      entity_id: 77,
      entity_name: 'Ent',
      contact_person_user_2_name: 'b',
    })
    expect(result.current.form.warranty_start_date).toBeInstanceOf(Date)
  })

  it('nilai default tanpa data & other_* menjadi 0', async () => {
    const { result } = await renderHook(() => useAddInventoryAsset({}))
    expect(result.current.form.ownership_qty).toBe(1)
    expect(result.current.form.warranty_start_date).toBeNull()
    const other: any = {
      other_asset_type_name: 'x',
      other_asset_model_name: 'y',
      other_manufacture_name: 'z',
      other_budget_source_name: 'b',
      other_borrowed_from_entity_name: 'c',
    }
    const r2 = await renderHook(() => useAddInventoryAsset({ data: other }))
    expect(r2.result.current.form).toMatchObject({
      asset_type_id: 0,
      asset_model_id: 0,
      manufacture_id: 0,
      budget_source_id: 0,
      borrowed_from_entity_id: 0,
    })
  })

  it('handleSelect & handleDateChange mengisi form', async () => {
    const { result } = await renderHook(() => useAddInventoryAsset({}))
    await act(() => {
      result.current.handleSelect('asset_type_id')({
        label: 'a',
        value: 12,
      } as any)
      result.current.handleDateChange('warranty_start_date')(
        new Date('2025-05-05')
      )
    })
    expect(result.current.form.asset_type_id).toBe(12)
    expect(result.current.form.warranty_start_date).toBeInstanceOf(Date)
  })

  it('create sukses mengarahkan ke detail', async () => {
    mockCreate.mockReturnValue(unwrap({ id: 55 }))
    const { result } = await renderHook(() =>
      useAddInventoryAsset({ data: asset })
    )
    await act(async () => {
      await result.current.onSubmit({
        ...result.current.form,
        asset_type_id: 0,
        asset_model_id: 0,
        manufacture_id: 0,
        budget_source_id: 0,
        borrowed_from_entity_id: 0,
      } as any)
    })
    const payload = mockCreate.mock.calls[0][0]
    expect(payload.asset_type_id).toBeNull()
    expect(payload.budget_source_id).toBeNull()
    expect(payload.warranty_start_date).toBe('F:2024')
    expect(mockNav.replace).toHaveBeenCalledWith('AssetInventoryDetail', {
      id: 55,
    })
    expect(showSuccess).toHaveBeenCalled()
  })

  it('create tanpa tanggal & gagal menampilkan error; saat loading diabaikan', async () => {
    mockCreate.mockReturnValue(reject('boom'))
    const { result } = await renderHook(() => useAddInventoryAsset({}))
    await act(async () => {
      await result.current.onSubmit({
        ...result.current.form,
        warranty_start_date: null,
        warranty_end_date: null,
        calibration_last_date: null,
        maintenance_last_date: null,
      } as any)
    })
    expect(mockCreate.mock.calls[0][0].warranty_end_date).toBeNull()
    expect(showError).toHaveBeenCalledWith('ERR:boom')
    mockLoading.create = true
    const r2 = await renderHook(() => useAddInventoryAsset({}))
    await act(async () => {
      await r2.result.current.onSubmit({ ...r2.result.current.form } as any)
    })
    expect(mockCreate).toHaveBeenCalledTimes(1)
    expect(r2.result.current.isLoading).toBe(true)
  })

  it('edit membersihkan field other_* sesuai pilihan', async () => {
    mockEdit.mockReturnValue(unwrap({}))
    const { result } = await renderHook(() =>
      useAddInventoryAsset({ data: asset, isEdit: true })
    )
    await act(async () => {
      await result.current.onSubmit({
        ...result.current.form,
        asset_type_id: 1,
        asset_model_id: 2,
        manufacture_id: 3,
        budget_source_id: 5,
        ownership_status: 1,
        borrowed_from_entity_id: 8,
        other_asset_type_name: 'x',
        other_min_temperature: 1,
        other_max_temperature: 2,
        other_asset_model_name: 'y',
        other_net_capacity: 1,
        other_gross_capacity: 2,
        other_manufacture_name: 'z',
        other_budget_source_name: 'b',
        other_borrowed_from_entity_name: 'c',
      } as any)
    })
    const { id, data } = mockEdit.mock.calls[0][0]
    expect(id).toBe(9)
    expect(data).toMatchObject({
      other_asset_type_name: null,
      other_min_temperature: null,
      other_asset_model_name: null,
      other_net_capacity: null,
      other_manufacture_name: null,
      other_budget_source_name: null,
      borrowed_from_entity_id: null,
      other_borrowed_from_entity_name: null,
    })
    expect(mockNav.goBack).toHaveBeenCalled()
    expect(showSuccess).toHaveBeenCalled()
  })

  it('edit dengan pilihan "lainnya" mempertahankan nilai other_*, dan peminjam non-nol membersihkan nama lain', async () => {
    mockEdit.mockReturnValue(unwrap({}))
    const { result } = await renderHook(() =>
      useAddInventoryAsset({ isEdit: true })
    )
    await act(async () => {
      await result.current.onSubmit({
        ...result.current.form,
        asset_type_id: 0,
        asset_model_id: 0,
        manufacture_id: 0,
        budget_source_id: 0,
        ownership_status: 2,
        borrowed_from_entity_id: 0,
        other_asset_type_name: 'x',
        other_asset_model_name: 'y',
        other_manufacture_name: 'z',
        other_budget_source_name: 'b',
        other_borrowed_from_entity_name: 'c',
      } as any)
    })
    let call = mockEdit.mock.calls[0][0]
    expect(call.id).toBe(0)
    expect(call.data.other_asset_type_name).toBe('x')
    expect(call.data.other_borrowed_from_entity_name).toBe('c')
    await act(async () => {
      await result.current.onSubmit({
        ...result.current.form,
        ownership_status: 2,
        borrowed_from_entity_id: 8,
        other_borrowed_from_entity_name: 'c',
        asset_type_id: null,
        asset_model_id: null,
        manufacture_id: null,
        budget_source_id: null,
      } as any)
    })
    call = mockEdit.mock.calls[1][0]
    expect(call.data.other_borrowed_from_entity_name).toBeNull()
  })

  it('edit gagal & saat loading diabaikan', async () => {
    mockEdit.mockReturnValue(reject('nope'))
    const { result } = await renderHook(() =>
      useAddInventoryAsset({ isEdit: true })
    )
    await act(async () => {
      await result.current.onSubmit({ ...result.current.form } as any)
    })
    expect(showError).toHaveBeenCalledWith('ERR:nope')
    mockLoading.edit = true
    const r2 = await renderHook(() => useAddInventoryAsset({ isEdit: true }))
    await act(async () => {
      await r2.result.current.onSubmit({ ...r2.result.current.form } as any)
    })
    expect(mockEdit).toHaveBeenCalledTimes(1)
  })
})
