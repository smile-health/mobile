const mockDispatch = jest.fn()
const mockNavigate = jest.fn()
const mockRefetch = jest.fn()
const mockQuery: any = { data: undefined, isLoading: false, isFetching: false }
let mockQueryArgs: any
const mockState: any = {
  workspace: { selectedWorkspace: { id: 5, entity_id: 9 } },
  trx: {
    activity: { id: 2 },
    trxMaterial: { material: { id: 8 } },
    transactions: [
      { material_id: 8, stock_id: 1, transaction_ids: [10] },
      { material_id: 99, stock_id: 2 },
    ],
  },
  order: { filter: {} },
}

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
}))
jest.mock('@/services/store', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (sel: any) => sel(mockState),
  workspaceState: (s: any) => s.workspace,
  trxState: (s: any) => s.trx,
  orderState: (s: any) => s.order,
}))
jest.mock('@/services/apis/transaction.api', () => ({
  useGetTransactionDiscardsQuery: (args: any, opts: any) => {
    mockQueryArgs = { args, opts }
    return { ...mockQuery, refetch: mockRefetch }
  },
}))
jest.mock('@/services/features/transaction.slice', () => ({
  setTransaction: (p: any) => ({ type: 'setTransaction', payload: p }),
}))
jest.mock('@/services/features/order.slice', () => ({
  setOrderFilter: (p: any) => ({ type: 'setOrderFilter', payload: p }),
}))
jest.mock('@/i18n/useLanguage', () => ({
  useLanguage: () => ({ t: (k: string) => k }),
}))
jest.mock('@/utils/CommonUtils', () => ({ showError: jest.fn() }))
jest.mock('../../helpers/CancelDiscardHelpers', () => ({
  trxDiscardToCreateTransaction: (i: any) => ({
    material_id: 8,
    stock_id: i.stock_id,
    transaction_ids: [i.id],
  }),
  updateExistingTransaction: (e: any, i: any, has: boolean) => ({
    ...e,
    transaction_ids: has
      ? (e.transaction_ids ?? []).filter((x: number) => x !== i.id)
      : [...(e.transaction_ids ?? []), i.id],
  }),
  updateSelectedTransactions: (list: any[], u: any, empty: boolean) =>
    empty
      ? list.filter((x) => x.stock_id !== u.stock_id)
      : list.map((x) => (x.stock_id === u.stock_id ? u : x)),
}))

import { act, renderHook } from '@testing-library/react-native'
import { showError } from '@/utils/CommonUtils'
import { ORDER_TYPE } from '@/utils/Constants'
import { useRelocationFilter } from '../../../order/hooks/relocation/useRelocationFilter'
import useCancelDiscardTransaction from '../transactionCreate/useCancelDiscardTransaction'

beforeEach(() => {
  jest.clearAllMocks()
  mockQuery.data = undefined
  mockQuery.isLoading = false
  mockQuery.isFetching = false
  mockState.workspace = { selectedWorkspace: { id: 5, entity_id: 9 } }
  mockState.order = { filter: {} }
})

describe('useCancelDiscardTransaction', () => {
  it('state awal: trx material terpilih, filter terbuka, query di-skip', async () => {
    const { result } = await renderHook(() => useCancelDiscardTransaction())
    expect(result.current.isDisableSave).toBe(false)
    expect(result.current.isOpenFilter).toBe(true)
    expect(result.current.transactionList).toEqual([])
    expect(mockQueryArgs.opts.skip).toBe(true)
  })

  it('apply filter, toggle, reset, refresh', async () => {
    const { result } = await renderHook(() => useCancelDiscardTransaction())
    await act(() => result.current.handleApplyFilter({ a: 1 } as any))
    expect(result.current.filter).toEqual({ a: 1 })
    expect(result.current.isOpenFilter).toBe(false)
    expect(mockQueryArgs.opts.skip).toBe(false)
    await act(() => result.current.handleToggleFilter())
    expect(result.current.isOpenFilter).toBe(true)
    await act(() => result.current.handleRefreshList())
    expect(mockRefetch).toHaveBeenCalled()
    await act(() => result.current.handleResetFilter())
    expect(result.current.filter).toBeNull()
  })

  it('load more hanya bila ada halaman berikutnya dan tidak sedang fetching', async () => {
    mockQuery.data = { data: [{ id: 1 }], page: 1, total_page: 3 }
    const { result } = await renderHook(() => useCancelDiscardTransaction())
    expect(result.current.transactionList).toHaveLength(1)
    await act(() => result.current.handleLoadMore())
    expect(mockQueryArgs.args.page).toBe(2)
    mockQuery.isFetching = true
    const fetching = await renderHook(() => useCancelDiscardTransaction())
    await act(() => fetching.result.current.handleLoadMore())
    expect(fetching.result.current.shouldShowLoading).toBe(true)
    mockQuery.isFetching = false
    mockQuery.data = { data: [], page: 3, total_page: 3 }
    const last = await renderHook(() => useCancelDiscardTransaction())
    await act(() => last.result.current.handleLoadMore())
    mockQuery.data = undefined
    const none = await renderHook(() => useCancelDiscardTransaction())
    await act(() => none.result.current.handleLoadMore())
  })

  it('memilih item baru, item yang sama, dan membatalkan pilihan', async () => {
    const { result } = await renderHook(() => useCancelDiscardTransaction())
    await act(() =>
      result.current.handleSelectItem({ id: 20, stock_id: 3 } as any)
    )
    expect(result.current.checkIsSelected({ id: 20, stock_id: 3 } as any)).toBe(
      true
    )
    await act(() =>
      result.current.handleSelectItem({ id: 21, stock_id: 1 } as any)
    )
    expect(result.current.checkIsSelected({ id: 21, stock_id: 1 } as any)).toBe(
      true
    )
    await act(() =>
      result.current.handleSelectItem({ id: 10, stock_id: 1 } as any)
    )
    expect(result.current.checkIsSelected({ id: 10, stock_id: 1 } as any)).toBe(
      false
    )
    expect(
      result.current.checkIsSelected({ id: 1, stock_id: 404 } as any)
    ).toBe(false)
    await act(() =>
      result.current.handleSelectItem({ id: 20, stock_id: 3 } as any)
    )
  })

  it('submit menyimpan transaksi lalu navigasi; tanpa workspace diabaikan', async () => {
    const { result } = await renderHook(() => useCancelDiscardTransaction())
    await act(() => result.current.handleSubmit())
    expect(mockDispatch).toHaveBeenCalled()
    expect(mockNavigate).toHaveBeenCalledWith('TransactionMaterialSelect')
    mockDispatch.mockClear()
    mockNavigate.mockClear()
    mockState.workspace = { selectedWorkspace: undefined }
    const none = await renderHook(() => useCancelDiscardTransaction())
    await act(() => none.result.current.handleSubmit())
    expect(mockDispatch).not.toHaveBeenCalled()
  })
})

describe('useRelocationFilter', () => {
  const vendor: any = [{ id: 1, name: 'V1' }]
  const customer: any = [{ id: 2, name: 'C1' }]
  const setup = async (filter: any = {}) => {
    mockState.order = { filter }
    const toggleSheet = jest.fn()
    const hook = await renderHook(() =>
      useRelocationFilter({ vendor, customer, toggleSheet })
    )
    return { ...hook, toggleSheet }
  }

  it('mode non-sales memakai vendor', async () => {
    const { result } = await setup({})
    expect(result.current.entityConfig.name).toBe('vendor_id')
    expect(result.current.entityConfig.list).toEqual([
      { label: 'V1', value: 1 },
    ])
    expect(result.current.data.ORDER_TYPE_LIST.length).toBeGreaterThan(0)
    expect(result.current.data.ORDER_INTEGRATION_LIST.length).toBeGreaterThan(0)
  })

  it('mode sales memakai customer', async () => {
    const { result } = await setup({ purpose: 'sales' })
    expect(result.current.entityConfig.name).toBe('customer_id')
    await act(() =>
      result.current.actions.handleSelectEntity({ value: 2 } as any)
    )
    expect(result.current.form.customer_id).toBe('2')
  })

  it('memilih entitas vendor, tipe, integrasi, aktivitas, dan tanggal', async () => {
    const { result } = await setup({})
    await act(() =>
      result.current.actions.handleSelectEntity({ value: 1 } as any)
    )
    await act(() =>
      result.current.actions.handleSelectOrderType({
        value: ORDER_TYPE.RELOCATION,
      } as any)
    )
    await act(() =>
      result.current.actions.handleSelectOrderIntegration({ value: 'x' } as any)
    )
    await act(() =>
      result.current.actions.handleSelectActivity({ value: 3 } as any)
    )
    await act(() =>
      result.current.actions.handleApplyDateRange('2025-01-01', '2025-01-31')
    )
    expect(result.current.form.vendor_id).toBe('1')
    expect(result.current.form.activity_id).toBe(3)
    expect(result.current.flags.isRelocationDisabled).toBe(true)
  })

  it('apply dengan rentang valid dispatch dan menutup sheet', async () => {
    const { result, toggleSheet } = await setup({
      from_date: '2025-01-01',
      to_date: '2025-01-31',
    })
    await act(() => result.current.actions.onPressApply({ a: 1 } as any))
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'setOrderFilter',
      payload: { a: 1 },
    })
    expect(toggleSheet).toHaveBeenCalled()
  })

  it('apply dengan rentang terbalik menampilkan error', async () => {
    const { result, toggleSheet } = await setup({
      from_date: '2025-02-01',
      to_date: '2025-01-01',
    })
    await act(() => result.current.actions.onPressApply({} as any))
    expect(showError).toHaveBeenCalled()
    expect(toggleSheet).not.toHaveBeenCalled()
  })

  it('reset dan dismiss mengembalikan form', async () => {
    const { result, toggleSheet } = await setup({ customer_id: 'a', type: 2 })
    await act(() => result.current.actions.handleResetFilter())
    expect(result.current.form.type).toBeNull()
    await act(() => result.current.actions.dismissBottomSheet())
    expect(toggleSheet).toHaveBeenCalled()
  })
})
