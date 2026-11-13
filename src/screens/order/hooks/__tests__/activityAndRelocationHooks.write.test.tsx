const mockDispatch = jest.fn()
const mockNavigate = jest.fn()
const mockState: any = {
  relocation: {},
  workspace: { selectedWorkspace: { id: 5, entity_id: 9 } },
  order: { activities: {} },
}
let mockRouteParams: any = { date: '2025-02-01', comment: 'c' }
const mockUnwrap = jest.fn()
const mockCreate = jest.fn(() => ({ unwrap: mockUnwrap }))
const mockProgramId: { value: any } = { value: 5 }

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
  useRoute: () => ({ params: mockRouteParams }),
}))
jest.mock('@/services/store', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (sel: any) => sel(mockState),
  relocationState: (s: any) => s.relocation,
  workspaceState: (s: any) => s.workspace,
  orderState: (s: any) => s.order,
}))
jest.mock('@/services/apis', () => ({
  useCreateRelocationMutation: () => [
    mockCreate,
    { isLoading: mockLoading.value },
  ],
}))
const mockLoading = { value: false }
jest.mock('@/i18n/useLanguage', () => ({
  useLanguage: () => ({ t: (k: string) => k }),
}))
jest.mock('@/utils/hooks/useProgramId', () => ({
  __esModule: true,
  default: () => mockProgramId.value,
}))
jest.mock('@/utils/CommonUtils', () => ({ showError: jest.fn() }))
jest.mock('@/utils/helpers/ErrorHelpers', () => ({
  getErrorMessage: () => 'pesan error',
}))
jest.mock('@/services/features/relocation.slice', () => ({
  clearRelocations: (p: any) => ({ type: 'clearRelocations', payload: p }),
}))
jest.mock('@/services/features/activity.slice', () => ({
  setActiveActivity: (p: any) => ({ type: 'setActive', payload: p }),
}))
jest.mock('@/services/features/order.slice', () => ({
  setOrderActivity: (p: any) => ({ type: 'setOrderActivity', payload: p }),
  setDraft: (p: any) => ({ type: 'setDraft', payload: p }),
}))
const mockMissing = {
  value: { uniqueMissingCompanions: [] as any[], message: '' },
}
jest.mock('../../helpers/OrderHelpers', () => ({
  getMissingCompanionMaterials: () => mockMissing.value,
  showSuccessAndNavigateToDetail: jest.fn(),
  loadExistingRegularActivity: jest.fn(),
  loadExistingOrderDraft: jest.fn(),
  loadExistingDistributionActivity: jest.fn(),
  loadExistingDistributionDraft: jest.fn(),
}))

import { act, renderHook, waitFor } from '@testing-library/react-native'
import { showError } from '@/utils/CommonUtils'
import { ORDER_KEY } from '@/utils/Constants'
import * as helpers from '../../helpers/OrderHelpers'
import useRelocationFinalReview from '../relocation/useRelocationFinalReview'
import { useActivityDraft } from '../useActivityDraft'
import { useActivityNavigation } from '../useActivityNavigation'

beforeEach(() => {
  jest.clearAllMocks()
  mockLoading.value = false
  mockProgramId.value = 5
  mockRouteParams = { date: '2025-02-01', comment: 'c' }
  mockMissing.value = { uniqueMissingCompanions: [], message: '' }
  mockState.workspace = { selectedWorkspace: { id: 5, entity_id: 9 } }
  mockState.order = { activities: {} }
  mockState.relocation = {
    activity: { id: 3 },
    vendor: { id: 4 },
    relocations: [
      {
        ordered_qty: '2',
        material_id: 1,
        recommended_stock: 7,
        reason_id: 2,
        other_reason: 'x',
      },
      {
        ordered_qty: 1,
        material_id: 2,
        material_hierarchy: [{ material_id: 21, ordered_qty: '3' }],
      },
      { ordered_qty: 1, material_id: 3, material_hierarchy: [] },
    ],
  }
})

describe('useRelocationFinalReview', () => {
  it('membuat relokasi, mengosongkan draft, dan menavigasi ke detail', async () => {
    mockUnwrap.mockResolvedValue({ createdOrderId: 77 })
    const { result } = renderHook(() => useRelocationFinalReview())
    await act(async () => {
      await result.current.handleCreateRelocation()
    })
    const payload = (mockCreate.mock.calls[0] as any[])[0]
    expect(payload).toMatchObject({
      customer_id: 9,
      vendor_id: 4,
      activity_id: 3,
      required_date: '2025-02-01',
    })
    expect(payload.order_items[0]).toMatchObject({
      ordered_qty: 2,
      recommended_stock: 7,
      order_reason_id: 2,
      other_reason: 'x',
    })
    expect(payload.order_items[1].children).toEqual([
      { material_id: 21, ordered_qty: 3 },
    ])
    expect(payload.order_items[2]).toMatchObject({
      recommended_stock: 0,
      order_reason_id: 0,
      other_reason: null,
    })
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'clearRelocations',
      payload: { programId: 5 },
    })
    expect(helpers.showSuccessAndNavigateToDetail).toHaveBeenCalled()
  })

  it('tanggal kosong tidak mengirim required_date dan tanpa respons tidak apa-apa', async () => {
    mockRouteParams = { date: '', comment: 'c' }
    mockUnwrap.mockResolvedValue(null)
    const { result } = renderHook(() => useRelocationFinalReview())
    await act(async () => {
      await result.current.handleCreateRelocation()
    })
    expect((mockCreate.mock.calls[0] as any[])[0]).not.toHaveProperty(
      'required_date'
    )
    expect(mockDispatch).not.toHaveBeenCalled()
  })

  it('workspace dan vendor kosong memakai nilai default', async () => {
    mockState.workspace = { selectedWorkspace: undefined }
    mockState.relocation = {
      activity: undefined,
      vendor: undefined,
      relocations: [],
    }
    mockUnwrap.mockResolvedValue(null)
    const { result } = renderHook(() => useRelocationFinalReview())
    await act(async () => {
      await result.current.handleCreateRelocation()
    })
    expect((mockCreate.mock.calls[0] as any[])[0]).toMatchObject({
      customer_id: 0,
      activity_id: 0,
    })
  })

  it('bahan pendamping hilang dan setuju: buka dialog, tidak submit', async () => {
    mockMissing.value = { uniqueMissingCompanions: [{ id: 1 }], message: 'm' }
    const { result } = renderHook(() => useRelocationFinalReview())
    await act(async () => {
      await result.current.handleCreateRelocation(true)
    })
    expect(result.current.dialogOpen).toBe(true)
    expect(mockCreate).not.toHaveBeenCalled()
    act(() => result.current.toggleCancelDialog())
    expect(result.current.dialogOpen).toBe(false)
  })

  it('bahan pendamping hilang tanpa setuju tetap submit', async () => {
    mockMissing.value = { uniqueMissingCompanions: [{ id: 1 }], message: 'm' }
    mockUnwrap.mockResolvedValue(null)
    const { result } = renderHook(() => useRelocationFinalReview())
    await act(async () => {
      await result.current.handleCreateRelocation(false)
    })
    expect(mockCreate).toHaveBeenCalled()
  })

  it('sedang loading tidak submit ganda', async () => {
    mockLoading.value = true
    const { result } = renderHook(() => useRelocationFinalReview())
    await act(async () => {
      await result.current.handleCreateRelocation()
    })
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it('error API menampilkan pesan', async () => {
    mockUnwrap.mockRejectedValue(new Error('x'))
    const { result } = renderHook(() => useRelocationFinalReview())
    await act(async () => {
      await result.current.handleCreateRelocation()
    })
    expect(showError).toHaveBeenCalledWith('pesan error')
  })
})

describe('useActivityNavigation', () => {
  const run = (type: any, activities: any = {}) => {
    mockState.order = { activities }
    return renderHook(() => useActivityNavigation(type))
  }

  it.each([
    [ORDER_KEY.REGULAR, 'RegularVendorSelect'],
    [ORDER_KEY.DISTRIBUTION, 'DistributionCustomerSelect'],
    [ORDER_KEY.RETURN, 'ReturnCustomerSelect'],
  ])('tipe %s menavigasi ke %s', async (type, screen) => {
    const { result } = run(type)
    await act(async () => {
      await result.current.handleSelectActivity({ id: 1 } as any)
    })
    expect(mockNavigate).toHaveBeenCalledWith(screen)
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'setActive',
      payload: { id: 1 },
    })
  })

  it('tipe tak dikenal hanya menyimpan aktivitas', async () => {
    const { result } = run('lain')
    await act(async () => {
      await result.current.handleSelectActivity({ id: 1 } as any)
    })
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('tanpa workspace tidak melakukan apa pun', async () => {
    mockState.workspace = { selectedWorkspace: undefined }
    const { result } = run(ORDER_KEY.REGULAR)
    await act(async () => {
      await result.current.handleSelectActivity({ id: 1 } as any)
    })
    expect(mockDispatch).not.toHaveBeenCalled()
  })

  it('draft dari aktivitas lain membuka modal dan bisa ditutup', async () => {
    const { result } = run(ORDER_KEY.REGULAR, {
      [ORDER_KEY.REGULAR]: { 5: { id: 99 } },
    })
    await act(async () => {
      await result.current.handleSelectActivity({ id: 1 } as any)
    })
    expect(result.current.isOpenModalExistOrder).toBe(true)
    act(() => result.current.closeModalExistOrder())
    expect(result.current.isOpenModalExistOrder).toBe(false)
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('draft aktivitas sama atau kosong tetap lanjut', async () => {
    const same = run(ORDER_KEY.REGULAR, {
      [ORDER_KEY.REGULAR]: { 5: { id: 1 } },
    })
    await act(async () => {
      await same.result.current.handleSelectActivity({ id: 1 } as any)
    })
    const empty = run(ORDER_KEY.REGULAR, { [ORDER_KEY.REGULAR]: { 5: {} } })
    await act(async () => {
      await empty.result.current.handleSelectActivity({ id: 1 } as any)
    })
    expect(mockNavigate).toHaveBeenCalledTimes(2)
  })
})

describe('useActivityDraft', () => {
  it('tanpa programId tidak memuat apa pun', () => {
    mockProgramId.value = 0
    renderHook(() => useActivityDraft(ORDER_KEY.REGULAR as any))
    expect(helpers.loadExistingRegularActivity).not.toHaveBeenCalled()
  })

  it('reguler memuat aktivitas dan draft lalu dispatch', async () => {
    ;(helpers.loadExistingRegularActivity as jest.Mock).mockResolvedValue({
      id: 1,
    })
    ;(helpers.loadExistingOrderDraft as jest.Mock).mockResolvedValue([
      { a: 1 },
      { a: 2 },
    ])
    renderHook(() => useActivityDraft(ORDER_KEY.REGULAR as any))
    await waitFor(() => expect(mockDispatch).toHaveBeenCalledTimes(3))
  })

  it('distribusi tanpa aktivitas dan draft bukan array tidak dispatch', async () => {
    ;(helpers.loadExistingDistributionActivity as jest.Mock).mockResolvedValue(
      null
    )
    ;(helpers.loadExistingDistributionDraft as jest.Mock).mockResolvedValue({})
    renderHook(() => useActivityDraft(ORDER_KEY.DISTRIBUTION as any))
    await waitFor(() =>
      expect(helpers.loadExistingDistributionDraft).toHaveBeenCalled()
    )
    expect(mockDispatch).not.toHaveBeenCalled()
  })
})
