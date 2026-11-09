const mockDispatch = jest.fn()
const mockState: any = {
  workspace: { selectedWorkspace: { id: 3, entity_id: 9 } },
  activity: { activeActivity: { id: 1 } },
  orders: { orders: [] },
  activities: [{ id: 1, name: 'A1' }, { id: 2, name: 'A2' }],
}
let mockStockByActivity: any = { data: [] }

jest.mock('@/services/store', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (sel: any) => sel(mockState),
  ordersState: (s: any) => s.orders,
  workspaceState: (s: any) => s.workspace,
  activityState: (s: any) => s.activity,
}))
jest.mock('@/services/features', () => ({
  getActivities: (s: any) => s.activities,
  setOrder: jest.fn((p: any) => ({ type: 'setOrder', payload: p })),
  setOrderMaterials: jest.fn((p: any) => ({ type: 'setOrderMaterials', payload: p })),
}))
jest.mock('@/services/apis', () => ({
  useGetStocksDetailsOrderQuery: () => ({ data: mockStockByActivity }),
}))
jest.mock('../hooks/useSetOrder', () => ({ rehydrateDraftFromStorage: jest.fn() }))
jest.mock('@/utils/CommonUtils', () => ({ showError: jest.fn() }))
jest.mock('@/i18n', () => ({ __esModule: true, default: { t: (k: string) => k } }))

import { act, renderHook, waitFor } from '@testing-library/react-native'
import { setOrder, setOrderMaterials } from '@/services/features'
import { showError } from '@/utils/CommonUtils'
import { rehydrateDraftFromStorage } from '../hooks/useSetOrder'
import { useMaterialDetailDistReturn } from '../hooks/useMaterialDetailDistReturn'

const stock = (id: number, activity_id: number, available = 10): any => ({ stock_id: id, activity_id, available })
const data: any = {
  id: 7, name: 'Mat', program_id: 3, reason_id: 1, material_companion: null, is_managed_in_batch: 1,
  stocks: [stock(1, 1), stock(2, 2), stock(3, 3)],
}
const baseSection: any = [
  { title: 'T', data: [{ stock_id: 1, activity_id: 1 }, { stock_id: 2, activity_id: 2 }] },
  { data: [{ stock_id: 3, activity_id: 3 }] },
]
const nav = { goBack: jest.fn() }
const setup = (over: Partial<{ data: any; added: any[] }> = {}) =>
  renderHook(() => useMaterialDetailDistReturn(over.data ?? data, 1, over.added ?? [], baseSection, nav))

beforeEach(() => {
  jest.clearAllMocks()
  mockState.orders = { orders: [] }
  mockStockByActivity = { data: [] }
})

describe('useMaterialDetailDistReturn', () => {
  it('rehydrate saat belum ada draft, tidak saat sudah ada', () => {
    setup()
    expect(rehydrateDraftFromStorage).toHaveBeenCalledWith(3, mockDispatch)
    jest.clearAllMocks()
    mockState.orders = { orders: [{ material_id: 7, data: [] }] }
    setup()
    expect(rehydrateDraftFromStorage).not.toHaveBeenCalled()
  })

  it('default value dari draft & enrichedStocks menyaring stok sendiri/ditambahkan', () => {
    mockState.orders = { orders: [{ material_id: 7, data: [{ stock_id: 1, allocated: 4, stock_quality_id: 2 }] }] }
    const { result } = setup({ added: [{ stock_id: 3 }] })
    expect(result.current.quantityByStock[1]).toEqual({ quantity: '4', stock_quality_id: 2 })
    expect(result.current.quantityByStock[2]).toEqual({ quantity: '', stock_quality_id: null })
    expect(result.current.enrichedStocks.map((s: any) => s.stock_id)).toEqual([2])
    expect((result.current.enrichedStocks[0] as any).activity_name).toBe('A2')
    expect(result.current.transformed).toHaveLength(1)
    expect(result.current.orderDraft).toMatchObject({ ordered_qty: 4, material_id: 7 })
  })

  it('submit tanpa qty menampilkan error', () => {
    const { result } = setup()
    act(() => result.current.handleSubmit())
    expect(showError).toHaveBeenCalledWith('error.complete_data')
    expect(mockDispatch).not.toHaveBeenCalled()
  })

  it('submit dengan qty mendispatch order dan kembali', async () => {
    mockState.orders = { orders: [{ material_id: 7, data: [{ stock_id: 2, allocated: 5, stock_quality_id: null }] }] }
    const { result } = setup()
    await waitFor(() => expect(result.current.transformed).toHaveLength(1))
    act(() => result.current.handleSubmit())
    expect(setOrder).toHaveBeenCalledWith(expect.objectContaining({ programId: 3, orders: expect.objectContaining({ ordered_qty: 5 }) }))
    expect(setOrderMaterials).toHaveBeenCalled()
    expect(nav.goBack).toHaveBeenCalled()
    // draft mengubah activityIds -> sectionData memuat aktivitas 2
    const sec = result.current.sectionData as any[]
    expect(sec[0].title).toBe('T')
    expect(sec[1].title).toBeUndefined()
    expect(sec[0].data.map((d: any) => d.stock_id)).toContain(2)
    expect(sec[0].data[0].activity_name).toBeDefined()
  })

  it('setValue memperbarui draft; stok tak dikenal & qty 0 disaring', async () => {
    const { result } = setup()
    act(() => {
      result.current.setValue('quantityByStock.1.quantity' as any, '3')
      result.current.setValue('quantityByStock.2.quantity' as any, '0')
      result.current.setValue('quantityByStock.99' as any, { quantity: '2', stock_quality_id: null } as any)
    })
    await waitFor(() => expect(result.current.transformed.length).toBe(2))
    expect(result.current.transformed.map((t: any) => t.stock_id).sort()).toEqual([1, 99])
    expect((result.current.transformed.find((t: any) => t.stock_id === 99) as any).activity_name).toBe('')
  })

  it('toggle batch, bottom sheet & aktivitas lain', () => {
    mockStockByActivity = { data: [{ activity: { id: 1 } }, { activity: { id: 5 } }] }
    const { result } = setup()
    act(() => result.current.handleToggleBatch('a'))
    expect(result.current.selectedStockId).toBe('a')
    act(() => result.current.handleToggleBatch('a'))
    expect(result.current.selectedStockId).toBeNull()
    expect(result.current.stockOtherActivity).toEqual([{ activity: { id: 5 } }])
    act(() => result.current.setIsOpenActivityBottomSheet(true))
    expect(result.current.isOpenActivityBottomSheet).toBe(true)
    act(() => result.current.handleSelectOtherActivtyStock({ activity: { id: 5 } } as any))
    expect(result.current.isOpenActivityBottomSheet).toBe(false)
    expect(result.current.stockOtherActivity).toEqual([])
  })

  it('isAnyQtyExceedStock', async () => {
    const { result } = setup()
    expect(result.current.isAnyQtyExceedStock).toBe(false)
    act(() => {
      result.current.setValue('quantityByStock.1' as any, { quantity: '5', stock_quality_id: null } as any)
    })
    await waitFor(() => expect(typeof result.current.isAnyQtyExceedStock).toBe('boolean'))
  })

  it('tanpa data stockByActivity', () => {
    mockStockByActivity = undefined
    const { result } = setup()
    expect(result.current.stockOtherActivity).toBeUndefined()
  })
})
