const mockDispatch = jest.fn()
const mockNavigate = jest.fn()
const mockState: any = {
  relocation: { activity: { id: 1 }, vendor: { id: 2 }, relocations: [] },
}
jest.mock('@react-navigation/native', () => ({ useNavigation: () => ({ navigate: mockNavigate }) }))
jest.mock('@/services/store', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (sel: any) => sel(mockState),
  relocationState: (s: any) => s.relocation,
}))
jest.mock('@/services/features/relocation.slice', () => ({
  setParentMaterial: (p: any) => ({ type: 'setParent', payload: p }),
  setRelocations: (p: any) => ({ type: 'setRelocations', payload: p }),
}))
jest.mock('@/utils/hooks/useProgramId', () => ({ __esModule: true, default: () => 5 }))
jest.mock('@/i18n/useLanguage', () => ({ useLanguage: () => ({ t: (k: string, o?: any) => (o ? `${k}:${o.num}` : k) }) }))

import { act, renderHook, waitFor } from '@testing-library/react-native'
import { OTHER_REASON_ID } from '@/utils/Constants'
import useRelocationMaterialDetailForm from '../relocation/useRelocationMaterialDetailForm'

const material = (over: any = {}): any => ({
  id: 10,
  name: 'Vaksin',
  activityMinMax: [{ activity_id: 1, min: 5, max: 20 }],
  consumption_unit_per_distribution_unit: 2,
  total_qty: 5,
  total_available_qty: 40,
  ...over,
})

beforeEach(() => {
  jest.clearAllMocks()
  mockState.relocation = { activity: { id: 1 }, vendor: { id: 2 }, relocations: [] }
})

describe('useRelocationMaterialDetailForm', () => {
  it('menghitung rekomendasi stok dari max, stok, dan unit distribusi', async () => {
    const { result } = renderHook(() => useRelocationMaterialDetailForm({ data: material() }))
    // (20 - 5) / 2 dibulatkan ke atas = 8 -> 16
    expect(result.current.recommendedStock).toBe(16)
    expect(result.current.currentMinMax).toMatchObject({ max: 20 })
    expect(result.current.qtyMaterial).toBe(40)
    await waitFor(() => expect(result.current.quantity).toBe(0))
  })

  it('tanpa min max aktivitas rekomendasi nol dan tidak ada teks rekomendasi', () => {
    const { result } = renderHook(() =>
      useRelocationMaterialDetailForm({ data: material({ activityMinMax: [] }) })
    )
    expect(result.current.recommendedStock).toBe(0)
    expect(result.current.getOrderRecommendation).toBe('')
  })

  it('unit kosong memakai 1 dan stok melebihi max menghasilkan 0', () => {
    const { result } = renderHook(() =>
      useRelocationMaterialDetailForm({
        data: material({ consumption_unit_per_distribution_unit: undefined, total_qty: undefined }),
      })
    )
    expect(result.current.recommendedStock).toBe(20)
    const over = renderHook(() =>
      useRelocationMaterialDetailForm({ data: material({ total_qty: 99 }) })
    )
    expect(over.result.current.recommendedStock).toBe(0)
  })

  it('material yang sudah direlokasi mengisi form dan menampilkan rekomendasi', async () => {
    mockState.relocation.relocations = [
      { material_id: 10, ordered_qty: 6, reason_id: 3, material_hierarchy: [{ material_id: 1 }] },
    ]
    const { result } = renderHook(() => useRelocationMaterialDetailForm({ data: material() }))
    await waitFor(() => expect(result.current.quantity).toBe(6))
    expect(result.current.reason).toBe(3)
    expect(result.current.shouldShowDropdownReason).toBe(true)
    expect(result.current.getOrderRecommendation).toContain('order.recommended_num')
    expect(result.current.isSaveDisabled).toBe(false)
  })

  it('simpan menyusun payload, menyertakan companion, lalu navigasi', async () => {
    mockState.relocation.relocations = [
      { material_id: 10, ordered_qty: 6, reason_id: 3, material_hierarchy: [{ material_id: 1 }] },
    ]
    const { result } = renderHook(() =>
      useRelocationMaterialDetailForm({ data: material({ material_companion: [{ id: 1 }] }) })
    )
    await waitFor(() => expect(result.current.quantity).toBe(6))
    act(() => result.current.handleSave())
    const call = mockDispatch.mock.calls.find((c) => c[0].type === 'setRelocations')
    expect(call?.[0].payload).toMatchObject({
      programId: 5,
      relocation: { material_id: 10, ordered_qty: 6, reason_id: 3, material_companion: [{ id: 1 }] },
    })
    expect(mockNavigate).toHaveBeenCalledWith('RelocationMaterialSelect')
  })

  it('simpan tanpa data relokasi lama memakai hierarki kosong dan id nol', async () => {
    const { result } = renderHook(() =>
      useRelocationMaterialDetailForm({ data: material({ id: undefined, name: undefined }) })
    )
    act(() => result.current.handleSave())
    const call = mockDispatch.mock.calls.find((c) => c[0].type === 'setRelocations')
    expect(call?.[0].payload.relocation).toMatchObject({ material_id: 0, material_hierarchy: [] })
    expect(call?.[0].payload.relocation).not.toHaveProperty('material_companion')
  })

  it('tombol simpan nonaktif tanpa qty, tanpa alasan, atau alasan lain kosong', async () => {
    const { result } = renderHook(() => useRelocationMaterialDetailForm({ data: material() }))
    await waitFor(() => expect(result.current.isSaveDisabled).toBe(true))
    mockState.relocation.relocations = [{ material_id: 10, ordered_qty: 4, reason_id: OTHER_REASON_ID }]
    const other = renderHook(() => useRelocationMaterialDetailForm({ data: material() }))
    await waitFor(() => expect(other.result.current.reason).toBe(OTHER_REASON_ID))
    expect(other.result.current.isSaveDisabled).toBe(true)
  })

  it('navigasi ke merek dagang menyimpan material induk', () => {
    const data = material()
    const { result } = renderHook(() => useRelocationMaterialDetailForm({ data }))
    act(() => result.current.handleNavigateToTrademark())
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'setParent', payload: data })
    expect(mockNavigate).toHaveBeenCalledWith('RelocationTrademarkMaterial', { material: data })
  })
})
