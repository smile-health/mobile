const mockDispatch = jest.fn()
const mockNavigate = jest.fn()
const mockShowError = jest.fn()
let mockForm: any = { order_items: [] }
let mockStockDetails: any = { data: [] }
let mockWorkspace: any = {
  entity_id: 5,
  config: { material: { is_hierarchy_enabled: 0 } },
}
let mockAllocatedItem: any = {}

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
}))
jest.mock('@/i18n/useLanguage', () => ({
  useLanguage: () => ({ t: (k: string) => k }),
}))
jest.mock('@/utils/CommonUtils', () => ({
  showError: (...a: any[]) => mockShowError(...a),
}))
jest.mock('@/services/apis', () => ({
  useGetStocksDetailsOrderQuery: () => ({
    data: mockStockDetails,
    isLoading: false,
  }),
}))
jest.mock('@/services/apis/inventory.api', () => ({
  useGetStocksQuery: () => ({
    data: { data: ['m'] },
    isLoading: false,
    isFetching: false,
  }),
}))
jest.mock('@/services/features', () => ({
  setAllocatedDraft: (p: any) => ({ type: 'draft', payload: p }),
  setAllocatedOrderItem: (p: any) => ({ type: 'item', payload: p }),
}))
jest.mock('@/services/store', () => ({
  allocateState: 'allocate',
  workspaceState: 'workspace',
  useAppDispatch: () => mockDispatch,
  useAppSelector: (sel: string) =>
    sel === 'workspace'
      ? { selectedWorkspace: mockWorkspace }
      : {
          allocatedDraft: [{ id: 'd' }],
          allocatedOrderItem: mockAllocatedItem,
        },
}))
jest.mock('../useAllocatedOrder', () => ({
  useAllocatedOrder: () => ({
    control: 'c',
    setValue: jest.fn(),
    form: mockForm,
    watch: jest.fn(),
  }),
}))

import { act, renderHook } from '@testing-library/react-native'
import { useAllocatedDetailOrder } from '../useAllocatedDetailOrder'

const detail = {
  id: 10,
  activity: { id: 1 },
  order_items: [{ material: { id: 7 } }, { material: { id: 8 } }],
}
const data = (over: any = {}) => ({
  material: {
    id: 7,
    name: 'Mat',
    is_managed_in_batch: 1,
    is_temperature_sensitive: 0,
  },
  qty: 5,
  recommended_stock: 2,
  ...over,
})

const fullAlloc = (qty: any = 3, extra: any = {}) => ({
  draft_allocated_qty: qty,
  draft_order_stock_status_id: 1,
  draft_order_stock_status: { id: 1 },
  stock_id: 11,
  material_child_id: 21,
  material_parent_id: 7,
  material: { id: 21 },
  stock: { id: 11 },
  ...extra,
})

let base: any
beforeEach(() => {
  base = data()
  jest.clearAllMocks()
  mockForm = { order_items: [] }
  mockAllocatedItem = {}
  mockWorkspace = {
    entity_id: 5,
    config: { material: { is_hierarchy_enabled: 0 } },
  }
  mockStockDetails = {
    data: [
      { activity: { id: 1 }, stocks: [{ id: 11 }, { id: 12 }] },
      {
        activity: { id: 2 },
        details: [{ material: { id: 7 } }, { material: { id: 99 } }],
        stocks: [],
      },
    ],
  }
})

describe('useAllocatedDetailOrder', () => {
  it('memisahkan stok aktivitas sendiri dan aktivitas lain, plus merge draft', async () => {
    const d = data({
      orderAllocations: [
        {
          allocations: [
            { stock_id: 11, allocated_qty: 4, material_status: 'ok' },
          ],
        },
      ],
    })
    const { result } = await renderHook(() =>
      useAllocatedDetailOrder(detail, d)
    )
    expect(result.current.uiState.stockListData).toEqual([
      { id: 11, draft_allocated_qty: 4, draft_material_status: 'ok' },
      { id: 12 },
    ])
    expect(result.current.uiState.activityStockData).toHaveLength(1)
    expect(result.current.status.isBatch).toBe(true)
    expect(result.current.status.isHierarchy).toBe(false)
    expect(result.current.datas.materialList).toEqual(['m'])
  })

  it('toggle info modal', async () => {
    const { result } = await renderHook(() =>
      useAllocatedDetailOrder(detail, base)
    )
    await act(() => result.current.actions.handleOpenInfoModal())
    expect(result.current.uiState.isOpenInfoModal).toBe(true)
    await act(() => result.current.actions.handleCloseInfoModal())
    expect(result.current.uiState.isOpenInfoModal).toBe(false)
  })

  it('memilih stok dari aktivitas lain non-hierarki menambah semua detail', async () => {
    const { result } = await renderHook(() =>
      useAllocatedDetailOrder(detail, base)
    )
    const item = result.current.uiState.activityStockData[0]
    await act(() => result.current.uiState.setIsActivitySheetOpen(true))
    await act(() =>
      result.current.actions.handleSelectStockFromOtherActivity(item)
    )
    expect(result.current.datas.additionalStockDetails).toHaveLength(2)
    expect(result.current.datas.additionalStockDetails[0].activity).toEqual({
      id: 2,
    })
    expect(result.current.uiState.activityStockData).toHaveLength(0)
    expect(result.current.uiState.isActivitySheetOpen).toBe(false)
  })

  it('hierarki memfilter detail berdasar children', async () => {
    mockWorkspace = {
      entity_id: 5,
      config: { material: { is_hierarchy_enabled: 1 } },
    }
    const d = data({ children: [{ material: { id: 7 } }] })
    const { result } = await renderHook(() =>
      useAllocatedDetailOrder(detail, d)
    )
    expect(result.current.status.isHierarchy).toBe(true)
    const item = result.current.uiState.activityStockData[0]
    await act(() =>
      result.current.actions.handleSelectStockFromOtherActivity(item)
    )
    expect(result.current.datas.additionalStockDetails).toHaveLength(1)
  })

  it('item tanpa details hanya menutup sheet', async () => {
    const { result } = await renderHook(() =>
      useAllocatedDetailOrder(detail, base)
    )
    await act(() =>
      result.current.actions.handleSelectStockFromOtherActivity({
        activity: { id: 2 },
      })
    )
    expect(result.current.datas.additionalStockDetails).toHaveLength(0)
  })

  it('simpan gagal bila tidak ada alokasi valid', async () => {
    const { result } = await renderHook(() =>
      useAllocatedDetailOrder(detail, base)
    )
    await act(() => result.current.actions.handleSaveAllocateStock())
    expect(mockShowError).toHaveBeenCalledWith('error.complete_data')
    expect(mockDispatch).not.toHaveBeenCalled()
  })

  it('simpan sukses: dispatch draft dan navigasi', async () => {
    mockForm = {
      order_items: [
        {
          children: [
            { allocations: [fullAlloc(3), fullAlloc(2, { stock_id: 12 })] },
          ],
        },
      ],
    }
    mockAllocatedItem = {
      10: [
        {
          children: [{ allocations: [{ stock_id: 99 }, { stock_id: 11 }, {}] }],
        },
      ],
    }
    const { result } = await renderHook(() =>
      useAllocatedDetailOrder(detail, base)
    )
    await act(() => result.current.actions.handleSaveAllocateStock())
    expect(mockDispatch).toHaveBeenCalledTimes(2)
    const draft = mockDispatch.mock.calls[1][0].payload
    expect(draft.total_draft_allocated_qty).toBe(5)
    expect(draft.children[0].total_allocated_qty).toBe(5)
    expect(draft.children[0].stock).toHaveLength(2)
    expect(mockNavigate).toHaveBeenCalledWith('AllocatedOrder', {
      data: detail,
    })
  })

  it('material sensitif butuh status stok', async () => {
    mockForm = {
      order_items: [
        { children: [{ allocations: [{ draft_allocated_qty: 2 }] }] },
      ],
    }
    const d = data({
      material: { id: 7, name: 'M', is_temperature_sensitive: 1 },
    })
    const { result } = await renderHook(() =>
      useAllocatedDetailOrder(detail, d)
    )
    expect(result.current.status.isMaterialSensitive).toBe(true)
    await act(() => result.current.actions.handleSaveAllocateStock())
    expect(mockShowError).toHaveBeenCalled()
  })

  it('alokasi valid tapi tanpa id lengkap tidak mengubah state', async () => {
    mockForm = {
      order_items: [
        { children: [{ allocations: [{ draft_allocated_qty: 2 }] }] },
      ],
    }
    const { result } = await renderHook(() =>
      useAllocatedDetailOrder(detail, base)
    )
    await act(() => result.current.actions.handleSaveAllocateStock())
    expect(mockDispatch).not.toHaveBeenCalled()
    expect(mockShowError).not.toHaveBeenCalled()
  })

  it('stockCustomerData kosong menghasilkan list kosong', async () => {
    mockStockDetails = {}
    const { result } = await renderHook(() =>
      useAllocatedDetailOrder(detail, base)
    )
    expect(result.current.uiState.stockListData).toEqual([])
    expect(result.current.uiState.activityStockData).toEqual([])
  })
})
