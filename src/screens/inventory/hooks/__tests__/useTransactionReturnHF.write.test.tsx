const mockDispatch = jest.fn()
const mockNavigate = jest.fn()
const mockRefetch = jest.fn()
const mockQuery: any = { data: undefined, isLoading: false, isFetching: false }
let mockQueryArgs: any
const mockState: any = {
  workspace: { selectedWorkspace: { id: 5, entity_id: 9 } },
  trx: {
    activity: { id: 2 },
    trxMaterial: { material: { id: 8, is_open_vial: 1 } },
    customer: { id: 3, entity_tag: { is_open_vial: 1 } },
    transactions: [
      { material_id: 8, transaction_id: 100, change_qty: 1 },
      { material_id: 99, transaction_id: 200 },
    ],
  },
}

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
}))
jest.mock('@/services/store', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (sel: any) => sel(mockState),
  workspaceState: (s: any) => s.workspace,
  trxState: (s: any) => s.trx,
}))
jest.mock('@/services/apis/transaction.api', () => ({
  useGetTransactionConsumptionQuery: (args: any) => {
    mockQueryArgs = args
    return { ...mockQuery, refetch: mockRefetch }
  },
}))
jest.mock('@/services/features/transaction.slice', () => ({
  setTransaction: (p: any) => ({ type: 'setTransaction', payload: p }),
}))
jest.mock('@/i18n/useLanguage', () => ({
  useLanguage: () => ({ t: (k: string) => k }),
}))
jest.mock('../../helpers/ReturnHFHelpers', () => ({
  trxConsumptionToCreateTransaction: (item: any, open: boolean) => ({
    material_id: 8,
    transaction_id: item.id,
    change_qty: 1,
    is_open_vial: open,
  }),
}))
jest.mock('../../schema/ReturnHealthFacilitySchema', () => {
  const yup = require('yup')
  return { ReturnHealthFacilitySchema: () => yup.object().shape({}) }
})

import { act, renderHook } from '@testing-library/react-native'
import useReturnHFTransaction from '../transactionCreate/useTransactionReturnHF'

beforeEach(() => {
  jest.clearAllMocks()
  mockQuery.data = undefined
  mockQuery.isLoading = false
  mockQuery.isFetching = false
  mockState.workspace = { selectedWorkspace: { id: 5, entity_id: 9 } }
  mockState.trx.customer = { id: 3, entity_tag: { is_open_vial: 1 } }
  mockState.trx.trxMaterial = { material: { id: 8, is_open_vial: 1 } }
})

describe('useReturnHFTransaction', () => {
  it('state awal mengambil trx material terpilih dan memfilter daftar yang sudah tersimpan', () => {
    mockQuery.data = {
      data: [{ id: 100 }, { id: 101 }],
      page: 1,
      total_page: 2,
    }
    const { result } = renderHook(() => useReturnHFTransaction())
    expect(result.current.savedTrxIds).toEqual([100])
    expect(result.current.transactionList).toEqual([{ id: 101 }])
    expect(mockQueryArgs.customer_id).toBe(3)
    expect(result.current.checkIsSelected(100)).toBe(true)
    expect(result.current.checkIsSelected(555)).toBe(false)
    expect(result.current.isDisableSave).toBe(false)
  })

  it('tanpa data dan tanpa customer', () => {
    mockState.trx.customer = undefined
    const { result } = renderHook(() => useReturnHFTransaction())
    expect(result.current.transactionList).toEqual([])
    expect(mockQueryArgs.customer_id).toBeUndefined()
    expect(result.current.shouldShowLoading).toBe(false)
  })

  it('loading atau fetching menampilkan loading', () => {
    mockQuery.isFetching = true
    const { result } = renderHook(() => useReturnHFTransaction())
    expect(result.current.shouldShowLoading).toBe(true)
  })

  it('refresh, apply filter, dan load more bersyarat', () => {
    mockQuery.data = { data: [], page: 1, total_page: 3 }
    const { result } = renderHook(() => useReturnHFTransaction())
    act(() => result.current.handleRefreshList())
    expect(mockRefetch).toHaveBeenCalled()
    act(() =>
      result.current.handleApplyFilter({
        start_date: 'a',
        end_date: 'b',
      } as any)
    )
    expect(result.current.filter).toEqual({ start_date: 'a', end_date: 'b' })
    act(() => result.current.handleLoadMore())
    expect(mockQueryArgs.page).toBe(2)
    mockQuery.isFetching = true
    const fetching = renderHook(() => useReturnHFTransaction())
    act(() => fetching.result.current.handleLoadMore())
    mockQuery.isFetching = false
    mockQuery.data = { data: [], page: 3, total_page: 3 }
    const last = renderHook(() => useReturnHFTransaction())
    act(() => last.result.current.handleLoadMore())
    mockQuery.data = undefined
    const none = renderHook(() => useReturnHFTransaction())
    act(() => none.result.current.handleLoadMore())
  })

  it('memilih item baru lalu membatalkannya', () => {
    const { result } = renderHook(() => useReturnHFTransaction())
    act(() => result.current.handleSelectItem({ id: 300 } as any))
    expect(result.current.currentTrxIds).toEqual([300])
    expect(result.current.checkIsSelected(300)).toBe(true)
    act(() => result.current.handleSelectItem({ id: 300 } as any))
    expect(result.current.currentTrxIds).toEqual([])
    expect(result.current.checkIsSelected(300)).toBe(false)
  })

  it('memilih ulang item tersimpan melepasnya; customer non open vial', () => {
    mockState.trx.customer = { id: 3, entity_tag: { is_open_vial: 0 } }
    const { result } = renderHook(() => useReturnHFTransaction())
    act(() => result.current.handleSelectItem({ id: 100 } as any))
    expect(result.current.savedTrxIds).toEqual([])
    act(() => result.current.handleSelectItem({ id: 301 } as any))
    expect(result.current.checkIsSelected(301)).toBe(true)
  })

  it('material tidak open vial', () => {
    mockState.trx.trxMaterial = { material: { id: 8, is_open_vial: 0 } }
    const { result } = renderHook(() => useReturnHFTransaction())
    act(() => result.current.handleSelectItem({ id: 302 } as any))
    expect(result.current.checkIsSelected(302)).toBe(true)
  })

  it('menghapus item menghapus dari semua daftar', () => {
    const { result } = renderHook(() => useReturnHFTransaction())
    act(() => result.current.handleSelectItem({ id: 303 } as any))
    act(() => result.current.handleDeleteItem(303))
    act(() => result.current.handleDeleteItem(100))
    act(() => result.current.handleDeleteItem())
    expect(result.current.currentTrxIds).toEqual([])
    expect(result.current.savedTrxIds).toEqual([])
  })

  it('submit menyimpan transaksi dan navigasi; tanpa workspace diabaikan', () => {
    const { result } = renderHook(() => useReturnHFTransaction())
    act(() => result.current.handleSubmit())
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'setTransaction' })
    )
    expect(mockNavigate).toHaveBeenCalledWith('TransactionMaterialSelect')
    mockDispatch.mockClear()
    mockState.workspace = { selectedWorkspace: undefined }
    const none = renderHook(() => useReturnHFTransaction())
    act(() => none.result.current.handleSubmit())
    expect(mockDispatch).not.toHaveBeenCalled()
  })
})
