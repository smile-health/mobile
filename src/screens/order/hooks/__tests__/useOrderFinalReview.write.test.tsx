const mockDispatch = jest.fn()
const mockM: any = {
  createOrder: jest.fn(),
  edit: jest.fn(),
  dist: jest.fn(),
  ret: jest.fn(),
}
const mockShowError = jest.fn()
const mockShowSuccess = jest.fn()
const mockShowFormatted = jest.fn()
const mockNavDetail = jest.fn()
const mockSuccessNav = jest.fn()
let mockMissing: any = { uniqueMissingCompanions: [], message: '' }
let mockState: any
let mockLoading = { create: false, edit: false, dist: false, ret: false }

jest.mock('@/i18n/useLanguage', () => ({
  useLanguage: () => ({ t: (k: string) => k }),
}))
jest.mock('@/services/apis', () => ({
  useCreateOrderMutation: () => [
    mockM.createOrder,
    { isLoading: mockLoading.create },
  ],
  useEditOrderItemStocksMutation: () => [
    mockM.edit,
    { isLoading: mockLoading.edit },
  ],
  useCreateDistributionMutation: () => [
    mockM.dist,
    { isLoading: mockLoading.dist },
  ],
  useCreateReturnMutation: () => [mockM.ret, { isLoading: mockLoading.ret }],
}))
jest.mock('@/services/features', () => ({
  clearOrderState: (p: any) => ({ type: 'clearOrder', payload: p }),
}))
jest.mock('@/services/features/order.slice', () => ({
  resetDraft: (p: any) => ({ type: 'resetDraft', payload: p }),
  resetOrderActivity: (p: any) => ({ type: 'resetActivity', payload: p }),
  setOrderFilter: (p: any) => ({ type: 'filter', payload: p }),
}))
jest.mock('@/services/store', () => ({
  activityState: 'activity',
  ordersState: 'orders',
  orderState: 'order',
  workspaceState: 'workspace',
  useAppDispatch: () => mockDispatch,
  useAppSelector: (sel: string) => mockState[sel],
}))
jest.mock('@/utils/CommonUtils', () => ({
  showError: (...a: any[]) => mockShowError(...a),
  showSuccess: (...a: any[]) => mockShowSuccess(...a),
}))
jest.mock('@/utils/helpers/ErrorHelpers', () => ({
  getErrorMessage: (e: any) => `msg:${e?.message}`,
  showFormattedError: (...a: any[]) => mockShowFormatted(...a),
}))
jest.mock('@/utils/hooks/useProgramId', () => ({
  __esModule: true,
  default: () => 7,
}))
jest.mock('../../helpers/NavigationHelpers', () => ({
  navigateToOrderDetail: (...a: any[]) => mockNavDetail(...a),
}))
jest.mock('../../helpers/OrderHelpers', () => ({
  getMissingCompanionMaterials: () => mockMissing,
  showSuccessAndNavigateToDetail: (...a: any[]) => mockSuccessNav(...a),
}))

import { act, renderHook } from '@testing-library/react-native'
import { useOrderFinalReview } from '../useOrderFinalReview'

const draftItems = [
  {
    material_id: 1,
    ordered_qty: '5',
    reason_id: 0,
    other_reason: '',
    recommended_stock: undefined,
  },
  {
    material_id: 2,
    ordered_qty: 3,
    reason_id: 4,
    other_reason: 'lain',
    recommended_stock: 2,
    material_hierarchy: [
      { material_id: 21, ordered_qty: '1' },
      { material_id: 22 },
    ],
  },
]

const makeState = (hier: any = 1) => ({
  order: {
    drafts: { regular: { 7: draftItems } },
    activities: { regular: { 7: { id: 99 } } },
    entities: {
      regular: { id: 10 },
      distribution: { id: 20 },
      return: { id: 30 },
    },
  },
  activity: { activeActivity: { id: 55 } },
  workspace: {
    selectedWorkspace: {
      entity_id: 3,
      config: { material: { is_hierarchy_enabled: hier } },
    },
  },
  orders: {
    orders: [
      {
        material_id: 5,
        data: [
          {
            stock_id: 's1',
            activity_id: 'a1',
            allocated: 4,
            stock_quality_id: 2,
          },
          { stock_id: 's2', activity_id: 'a2', allocated: 1 },
        ],
      },
      { material_id: 6 },
    ],
  },
})

const setup = (type = 'regular', params: any = {}) =>
  renderHook(() =>
    useOrderFinalReview(
      {
        params: {
          date: '2025-01-01',
          comment: 'c',
          orderId: 8,
          datas: { order_items: [{ id: 1 }] },
          ...params,
        },
      },
      type
    )
  )

beforeEach(() => {
  jest.clearAllMocks()
  mockState = makeState()
  mockMissing = { uniqueMissingCompanions: [], message: '' }
  mockLoading = { create: false, edit: false, dist: false, ret: false }
  mockM.createOrder.mockReturnValue({
    unwrap: () => Promise.resolve({ createdOrderId: 123 }),
  })
  mockM.dist.mockReturnValue({ unwrap: () => Promise.resolve({ id: 321 }) })
  mockM.ret.mockReturnValue({ unwrap: () => Promise.resolve({ id: 654 }) })
  mockM.edit.mockResolvedValue({ data: {} })
})

describe('useOrderFinalReview', () => {
  it('buat order reguler: payload hierarkis, reset draft, navigasi', async () => {
    const { result } = setup()
    await act(async () => {
      await result.current.handleCreateOrder()
    })
    const payload = mockM.createOrder.mock.calls[0][0]
    expect(payload).toMatchObject({
      customer_id: 3,
      vendor_id: 10,
      activity_id: 99,
      required_date: '2025-01-01',
      order_comment: 'c',
      is_hierarchy: true,
    })
    expect(payload.order_items[0]).toEqual({
      material_id: 1,
      ordered_qty: 5,
      recommended_stock: 0,
      order_reason_id: null,
      other_reason: null,
    })
    expect(payload.order_items[1]).toMatchObject({
      order_reason_id: 4,
      other_reason: 'lain',
      children: [
        { material_id: 21, ordered_qty: 1 },
        { material_id: 22, ordered_qty: 0 },
      ],
    })
    expect(mockDispatch.mock.calls.map((c) => c[0].type)).toEqual([
      'resetDraft',
      'resetActivity',
      'filter',
    ])
    expect(mockSuccessNav).toHaveBeenCalledWith(
      'order.success_create_order',
      'snackbar-success-create-order',
      123,
      1
    )
  })

  it('tanpa hierarki: payload tidak memuat is_hierarchy', async () => {
    mockState = makeState(0)
    const { result } = setup()
    await act(async () => {
      await result.current.handleCreateOrder()
    })
    expect(mockM.createOrder.mock.calls[0][0].is_hierarchy).toBeUndefined()
    expect(result.current.isHierarchy).toBe(0)
  })

  it('respons kosong tidak melakukan apa-apa; error ditampilkan', async () => {
    const { result } = setup()
    mockM.createOrder.mockReturnValueOnce({
      unwrap: () => Promise.resolve(null),
    })
    await act(async () => {
      await result.current.handleCreateOrder()
    })
    expect(mockDispatch).not.toHaveBeenCalled()
    mockM.createOrder.mockReturnValueOnce({
      unwrap: () => Promise.reject(new Error('gagal')),
    })
    await act(async () => {
      await result.current.handleCreateOrder()
    })
    expect(mockShowError).toHaveBeenCalledWith('msg:gagal')
  })

  it('loading mencegah submit ganda untuk semua jenis order', async () => {
    mockLoading = { create: true, edit: false, dist: true, ret: true }
    const { result } = setup()
    await act(async () => {
      await result.current.handleCreateOrder()
      await result.current.handleCreateDistributionOrder()
      await result.current.handleCreateReturnOrder()
    })
    expect(mockM.createOrder).not.toHaveBeenCalled()
    expect(mockM.dist).not.toHaveBeenCalled()
    expect(mockM.ret).not.toHaveBeenCalled()
    expect(result.current.isLoadingCreateOrder).toBe(true)
  })

  it('proses order: dialog bila ada material pendamping hilang, langsung buat bila tidak', async () => {
    mockMissing = { uniqueMissingCompanions: [{ id: 1 }], message: 'kurang' }
    const { result } = setup()
    act(() => result.current.handleProcessOrder())
    expect(result.current.dialogOpen).toBe(true)
    expect(result.current.message).toBe('kurang')
    expect(mockM.createOrder).not.toHaveBeenCalled()
    act(() => result.current.toogleCancelOrderDialog())
    expect(result.current.dialogOpen).toBe(false)

    mockMissing = { uniqueMissingCompanions: [], message: '' }
    const second = setup()
    await act(async () => {
      second.result.current.handleProcessOrder()
    })
    expect(mockM.createOrder).toHaveBeenCalled()
  })

  it('distribusi: payload dari orders, reset state, sales filter', async () => {
    const { result } = setup('distribution')
    await act(async () => {
      await result.current.handleCreateDistributionOrder()
    })
    const payload = mockM.dist.mock.calls[0][0]
    expect(payload).toMatchObject({
      customer_id: 20,
      vendor_id: 3,
      activity_id: 55,
    })
    expect(payload.order_items[0].stocks[0]).toEqual({
      stock_id: 's1',
      activity_id: 'a1',
      allocated_qty: 4,
      order_stock_status_id: 2,
    })
    expect(payload.order_items[0].stocks[1].order_stock_status_id).toBeNull()
    expect(payload.order_items[1].stocks).toEqual([])
    expect(mockDispatch.mock.calls.map((c) => c[0].type)).toContain(
      'clearOrder'
    )
    expect(mockSuccessNav).toHaveBeenCalledWith(
      'order.success_create_distribution_order',
      'snackbar-success-create-distribution',
      321,
      2
    )
  })

  it('distribusi: respons kosong dan error', async () => {
    const { result } = setup('distribution')
    mockM.dist.mockReturnValueOnce({ unwrap: () => Promise.resolve() })
    await act(async () => {
      await result.current.handleCreateDistributionOrder()
    })
    expect(mockSuccessNav).not.toHaveBeenCalled()
    mockM.dist.mockReturnValueOnce({
      unwrap: () => Promise.reject(new Error('d')),
    })
    await act(async () => {
      await result.current.handleCreateDistributionOrder()
    })
    expect(mockShowError).toHaveBeenCalledWith('msg:d')
  })

  it('retur: sukses, kosong, error, tanpa activeActivity', async () => {
    const { result } = setup('return')
    await act(async () => {
      await result.current.handleCreateReturnOrder()
    })
    expect(mockM.ret.mock.calls[0][0]).toMatchObject({
      customer_id: 30,
      vendor_id: 3,
    })
    expect(mockSuccessNav).toHaveBeenCalledWith(
      'order.success_create_return_order',
      'snackbar-success-create-return',
      654,
      3
    )
    mockM.ret.mockReturnValueOnce({ unwrap: () => Promise.resolve(null) })
    await act(async () => {
      await result.current.handleCreateReturnOrder()
    })
    mockM.ret.mockReturnValueOnce({
      unwrap: () => Promise.reject(new Error('r')),
    })
    await act(async () => {
      await result.current.handleCreateReturnOrder()
    })
    expect(mockShowError).toHaveBeenCalledWith('msg:r')

    mockState.activity = { activeActivity: undefined }
    const again = setup('return')
    await act(async () => {
      await again.result.current.handleCreateReturnOrder()
    })
    expect(mockM.ret.mock.calls.at(-1)[0].activity_id).toBe(0)
  })

  it('edit item order: sukses, error respons, exception', async () => {
    const { result } = setup()
    await act(async () => {
      await result.current.handleEditOrderItem()
    })
    expect(mockM.edit).toHaveBeenCalledWith({ id: 8, order_items: [{ id: 1 }] })
    expect(mockShowSuccess).toHaveBeenCalledWith(
      'order.success_edit_order',
      'snackbar-success-edit-order'
    )
    expect(mockNavDetail).toHaveBeenCalledWith(8)

    mockM.edit.mockResolvedValueOnce({ error: { message: 'e' } })
    await act(async () => {
      await result.current.handleEditOrderItem()
    })
    expect(mockShowFormatted).toHaveBeenCalledWith({ message: 'e' })

    mockM.edit.mockRejectedValueOnce(new Error('boom'))
    await act(async () => {
      await result.current.handleEditOrderItem()
    })
    expect(mockShowError).toHaveBeenCalledWith('msg:boom')
  })

  it('tanpa datas memakai default order_items kosong', async () => {
    const { result } = renderHook(() =>
      useOrderFinalReview({ params: { orderId: 1 } }, 'regular')
    )
    await act(async () => {
      await result.current.handleEditOrderItem()
    })
    expect(mockM.edit).toHaveBeenCalledWith({ id: 1, order_items: [] })
  })
})
