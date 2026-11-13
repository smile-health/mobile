const mockState: any = {
  workspace: { selectedWorkspace: { id: 5 } },
  activity: { activeActivity: { id: 1 } },
  order: { detailOrder: { id: 'd' }, drafts: {} },
}
const mockHandleSave = jest.fn()
const mockToggle = jest.fn()
const mockValidate = jest.fn()
jest.mock('@/services/store', () => ({
  useAppSelector: (sel: any) => sel(mockState),
  workspaceState: (s: any) => s.workspace,
  activityState: (s: any) => s.activity,
  orderState: (s: any) => s.order,
}))
jest.mock('@/i18n/useLanguage', () => ({
  useLanguage: () => ({ t: (k: string, o?: any) => (o?.returnObjects ? [] : o ? `${k}:${o.num}` : k) }),
}))
jest.mock('../hooks/useOrderMaterialDetail', () => ({
  useOrderMaterialDetail: () => ({ handleSave: mockHandleSave, toggleDialog: mockToggle, validate: mockValidate }),
}))

import { act, renderHook, waitFor } from '@testing-library/react-native'
import { OTHER_REASON_ID } from '@/utils/Constants'
import { useMaterialDetailForm } from '../hooks/useMaterialDetailForm'

const material = (over: any = {}): any => ({
  id: 10,
  activityMinMax: [{ activity_id: 1, min: 2, max: 20 }],
  consumption_unit_per_distribution_unit: 2,
  total_qty: 5,
  total_available_qty: 33,
  stocks: [{ activity_id: 1, qty: 3 }, { activity_id: 2, qty: 4 }],
  ...over,
})

const setup = (data: any = material(), parent?: any, isOrderItem = false, type: any = 'regular') => {
  const navigation: any = { navigate: jest.fn() }
  const dispatchAction = jest.fn()
  const hook = renderHook(() =>
    useMaterialDetailForm(data, navigation, dispatchAction, type, parent, isOrderItem)
  )
  return { ...hook, navigation }
}

beforeEach(() => {
  jest.clearAllMocks()
  mockState.workspace = { selectedWorkspace: { id: 5 } }
  mockState.activity = { activeActivity: { id: 1 } }
  mockState.order = { detailOrder: { id: 'd' }, drafts: {} }
})

describe('useMaterialDetailForm', () => {
  it('menghitung rekomendasi dan memilih stok aktivitas aktif', async () => {
    const { result } = setup()
    // (20 - 5) / 2 -> 8 -> 16
    expect(result.current.recommendedStock).toBe(16)
    expect(result.current.currentMinMax).toMatchObject({ max: 20 })
    expect(result.current.filteredStocks).toMatchObject({ qty: 3 })
    expect(result.current.qtyMaterial).toBe(33)
    expect(result.current.totalQty).toBe(5)
    await waitFor(() => expect(result.current.quantity).toBe(16))
    expect(result.current.shouldShowDropdownReason).toBe(false)
    expect(result.current.getOrderRecommendation).toBe('')
  })

  it('tanpa min max rekomendasi nol dan simpan langsung', () => {
    const { result } = setup(material({ activityMinMax: [] }))
    expect(result.current.recommendedStock).toBe(0)
    act(() => result.current.handleSubmit())
    expect(mockHandleSave).toHaveBeenCalled()
    expect(mockValidate).not.toHaveBeenCalled()
  })

  it('ada rekomendasi memanggil validate', () => {
    const { result } = setup()
    act(() => result.current.handleSubmit())
    expect(mockValidate).toHaveBeenCalled()
  })

  it('unit kosong memakai 1; stok melebihi max menghasilkan 0', () => {
    const a = setup(material({ consumption_unit_per_distribution_unit: undefined, total_qty: undefined }))
    expect(a.result.current.recommendedStock).toBe(20)
    const b = setup(material({ total_qty: 99 }))
    expect(b.result.current.recommendedStock).toBe(0)
  })

  it('qty berbeda dari rekomendasi menampilkan dropdown alasan dan teks rekomendasi', async () => {
    const { result } = setup(material({ ordered_qty: 4 }))
    await waitFor(() => expect(result.current.quantity).toBe(4))
    expect(result.current.shouldShowDropdownReason).toBe(true)
    expect(result.current.getOrderRecommendation).toContain('order.recommended_num')
    expect(result.current.isSaveDisabled).toBe(true)
  })

  it('induk material menyembunyikan dropdown dan tidak mewajibkan alasan', async () => {
    const { result } = setup(material({ ordered_qty: 4 }), { id: 99 })
    await waitFor(() => expect(result.current.quantity).toBe(4))
    expect(result.current.shouldShowDropdownReason).toBe(false)
    expect(result.current.isSaveDisabled).toBe(false)
  })

  it('alasan lainnya tanpa teks menonaktifkan simpan', async () => {
    const { result } = setup(material({ ordered_qty: 4, reason_id: OTHER_REASON_ID }))
    await waitFor(() => expect(result.current.reason).toBe(OTHER_REASON_ID))
    expect(result.current.isSaveDisabled).toBe(true)
  })

  it('draft yang ada mengisi form (induk dan non-induk)', async () => {
    mockState.order.drafts = {
      regular: {
        5: [
          { material_id: 10, ordered_qty: 6, reason_id: 3, other_reason: 'x' },
          { material_id: 99, material_hierarchy: [{ material_id: 10, ordered_qty: 7, reason_id: 4 }] },
        ],
      },
    }
    const plain = setup()
    await waitFor(() => expect(plain.result.current.quantity).toBe(6))
    expect(plain.result.current.reason).toBe(3)
    const child = setup(material(), { id: 99 })
    await waitFor(() => expect(child.result.current.quantity).toBe(7))
  })

  it('draft tanpa qty memakai rekomendasi; tanpa workspace tidak ada draft', async () => {
    mockState.order.drafts = { regular: { 5: [{ material_id: 10 }] } }
    const a = setup()
    await waitFor(() => expect(a.result.current.quantity).toBe(16))
    mockState.workspace = { selectedWorkspace: undefined }
    const b = setup()
    expect(b.result.current.recommendedStock).toBe(16)
  })

  it('tanpa aktivitas aktif tidak ada min max maupun stok', () => {
    mockState.activity = { activeActivity: undefined }
    const { result } = setup()
    expect(result.current.currentMinMax).toBeUndefined()
    expect(result.current.recommendedStock).toBe(0)
    expect(result.current.filteredStocks).toBeUndefined()
  })

  it('navigasi merek dagang: item order vs regular', () => {
    const a = setup(material(), undefined, true)
    act(() => a.result.current.handleTrademark())
    expect(a.navigation.navigate).toHaveBeenCalledWith('OrderItemTrademarkMaterial', expect.anything())
    const b = setup()
    act(() => b.result.current.handleTrademark())
    expect(b.navigation.navigate).toHaveBeenCalledWith('RegularTrademarkMaterialScreen', expect.anything())
  })
})
