jest.mock(
  '@react-navigation/native',
  () => require('@/test-utils/misc-nav').navModule
)
jest.mock('react-redux', () => require('@/test-utils/misc-store').reduxModule)

const mockInfinite = jest.fn()
const mockCreate = jest.fn()
jest.mock('@/services/apis', () => ({
  ...jest.requireActual('@/services/apis'),
  useGetSelfDisposalListInfiniteQuery: (...a: any[]) => mockInfinite(...a),
}))
jest.mock('@/services/apis/disposal.api', () => ({
  ...jest.requireActual('@/services/apis/disposal.api'),
  useCreateSelfDisposalMutation: () => [
    mockCreate,
    { isLoading: mockCreate.isLoadingFlag },
  ],
}))
jest.mock('@/utils/NavigationUtils', () => ({
  navigateAndReset: jest.fn(),
  navigateToLogin: jest.fn(),
  navigationRef: { isReady: () => false },
}))
jest.mock('@/utils/CommonUtils', () => ({
  ...jest.requireActual('@/utils/CommonUtils'),
  showError: jest.fn(),
  showSuccess: jest.fn(),
}))

import { act, renderHook } from '@testing-library/react-native'
import {
  setActivity,
  setDisposalMethod,
  setBatchDisposal,
  clearDisposal,
  setMaterial,
  saveMaterialDisposal,
} from '@/services/features'
import { store } from '@/services/store'
import { navMock } from '@/test-utils/misc-nav'
import { showError, showSuccess } from '@/utils/CommonUtils'
import { navigateAndReset } from '@/utils/NavigationUtils'
import useAddDisposalForm from '../hooks/useAddDisposalForm'
import useReviewSelfDisposal from '../hooks/useReviewSelfDisposal'
import useSelfDisposalList from '../hooks/useSelfDisposalList'

const stock: any = {
  id: 11,
  disposals: [
    {
      disposal_stock_id: 1,
      transaction_reason: { id: 4, title: 'Rusak' },
      disposal_discard_qty: 5,
      disposal_received_qty: 2,
    },
  ],
}

describe('useAddDisposalForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    store.dispatch(clearDisposal())
  })

  it('membangun section dan nilai default dari stok', async () => {
    const { result } = await renderHook(() =>
      useAddDisposalForm({ disposalStock: stock, type: 'self' as any })
    )
    expect(result.current.sections).toHaveLength(2)
    expect(result.current.sections[0].data[0]).toMatchObject({
      disposal_qty: 5,
    })
    expect(result.current.sections[1].data[0]).toMatchObject({
      disposal_qty: 2,
    })
    expect(result.current.methods.getValues().discard[0]).toMatchObject({
      max_qty: 5,
      transaction_reason_id: 4,
      disposal_qty: 0,
    })
    expect(result.current.isSaveEnabled).toBe(false)
  })

  it('stok tanpa disposals menghasilkan section kosong', async () => {
    const { result } = await renderHook(() =>
      useAddDisposalForm({
        disposalStock: { id: 1 } as any,
        type: 'self' as any,
      })
    )
    expect(result.current.sections[0].data).toEqual([])
    expect(result.current.methods.getValues().discard).toEqual([])
  })

  it('menyimpan hanya qty > 0 ke store lalu kembali', async () => {
    const { result } = await renderHook(() =>
      useAddDisposalForm({ disposalStock: stock, type: 'self' as any })
    )
    await act(async () => {
      result.current.methods.setValue('discard.0.disposal_qty', 3, {
        shouldValidate: true,
      })
    })
    expect(result.current.isSaveEnabled).toBe(true)
    await act(async () => {
      await result.current.handleSave()
    })
    expect(store.getState().disposal.batchDisposalData[11]).toMatchObject({
      discard: [{ disposal_qty: 3 }],
      received: [],
    })
    expect(navMock.goBack).toHaveBeenCalled()
  })

  it('qty melebihi max membuat save tidak aktif dan tidak tersimpan', async () => {
    const { result } = await renderHook(() =>
      useAddDisposalForm({ disposalStock: stock, type: 'self' as any })
    )
    await act(async () => {
      result.current.methods.setValue('received.0.disposal_qty', 99, {
        shouldValidate: true,
      })
    })
    expect(result.current.isSaveEnabled).toBe(false)
    await act(async () => {
      await result.current.handleSave()
    })
    expect(navMock.goBack).not.toHaveBeenCalled()
  })

  it('memuat data yang sudah tersimpan di store', async () => {
    store.dispatch(
      setBatchDisposal({
        stockId: 11,
        disposalData: {
          discard: [
            {
              max_qty: 5,
              disposal_stock_id: 1,
              transaction_reason_id: 4,
              transaction_reason_name: 'Rusak',
              disposal_qty: 2,
            },
          ],
          received: [],
        },
      } as any)
    )
    const { result } = await renderHook(() =>
      useAddDisposalForm({ disposalStock: stock, type: 'self' as any })
    )
    await act(async () => {})
    expect(result.current.methods.getValues().discard[0].disposal_qty).toBe(2)
    expect(result.current.methods.getValues().received[0].disposal_qty).toBe(0)
  })
})

describe('useReviewSelfDisposal', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockCreate.isLoadingFlag = false
    store.dispatch(clearDisposal())
    store.dispatch(setActivity({ id: 3, name: 'Rutin' } as any))
    store.dispatch(setDisposalMethod({ id: 8 } as any))
  })

  it('mengirim payload teragregasi dan reset navigasi saat sukses', async () => {
    store.dispatch(
      setMaterial({
        material_id: 1,
        material: { id: 1, name: 'M' },
        details: [{ stocks: [{ id: 21, activity: { id: 3 }, batch: null }] }],
      } as any)
    )
    store.dispatch(
      setBatchDisposal({
        stockId: 21,
        disposalData: {
          discard: [
            { disposal_stock_id: 1, transaction_reason_id: 2, disposal_qty: 3 },
          ],
          received: [
            { disposal_stock_id: 1, transaction_reason_id: 2, disposal_qty: 1 },
          ],
        },
      } as any)
    )
    store.dispatch(saveMaterialDisposal({ selectedActivityStocks: [21] }))
    store.dispatch(
      setMaterial({
        material_id: 2,
        material: { id: 2 },
        details: [{ stocks: [] }],
      } as any)
    )
    store.dispatch(saveMaterialDisposal({ selectedActivityStocks: [] }))
    mockCreate.mockReturnValue({ unwrap: () => Promise.resolve({}) })
    const { result } = await renderHook(() => useReviewSelfDisposal())
    expect(result.current.disposalItems).toHaveLength(2)
    await act(async () => {
      await result.current.submitData('RPT-1', '')
    })
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        disposal_method_id: 8,
        activity_id: 3,
        report_number: 'RPT-1',
        comment: undefined,
        disposal_items: [
          {
            disposal_stock_id: 1,
            transaction_reason_id: 2,
            disposal_discard_qty: 3,
            disposal_received_qty: 1,
          },
        ],
      })
    )
    expect(showSuccess).toHaveBeenCalled()
    expect(navigateAndReset).toHaveBeenCalled()
  })

  it('menampilkan error saat API gagal', async () => {
    mockCreate.mockReturnValue({
      unwrap: () => Promise.reject(new Error('gagal')),
    })
    const { result } = await renderHook(() => useReviewSelfDisposal())
    await act(async () => {
      await result.current.submitData('R', 'catatan')
    })
    expect(showError).toHaveBeenCalled()
    expect(navigateAndReset).not.toHaveBeenCalled()
  })

  it('tidak mengirim saat masih loading', async () => {
    mockCreate.isLoadingFlag = true
    const { result } = await renderHook(() => useReviewSelfDisposal())
    await act(async () => {
      await result.current.submitData('R', 'c')
    })
    expect(mockCreate).not.toHaveBeenCalled()
  })
})

describe('useSelfDisposalList', () => {
  const fetchNextPage = jest.fn()
  const refetch = jest.fn()
  const base = {
    data: {
      pages: [
        {
          data: [
            { id: 1, created_at: '2025-01-02 10:00:00' },
            { id: 2, created_at: '2025-01-02 11:00:00' },
            { id: 3, created_at: '2025-03-05 11:00:00' },
            { id: 4, created_at: null },
          ],
        },
        { data: [] },
      ],
    },
    isLoading: false,
    isFetching: false,
    isFetchingNextPage: false,
    fetchNextPage,
    refetch,
    hasNextPage: true,
  }
  beforeEach(() => {
    jest.clearAllMocks()
    mockInfinite.mockReturnValue(base)
  })

  it('mengelompokkan per tanggal dan mengurutkan menurun', async () => {
    const { result } = await renderHook(() => useSelfDisposalList())
    const titles = result.current.sections.map((s) => s.title)
    expect(titles).toHaveLength(3)
    expect(titles).toContain('Unknown Date')
    expect([...titles].sort((a, b) => (a < b ? 1 : -1))).toEqual(titles)
    expect(result.current.page).toBe(2)
    expect(result.current.shouldShowLoading).toBe(false)
  })

  it('tanpa data menghasilkan section kosong dan page 1', async () => {
    mockInfinite.mockReturnValue({ ...base, data: undefined, isLoading: true })
    const { result } = await renderHook(() => useSelfDisposalList())
    expect(result.current.sections).toEqual([])
    expect(result.current.page).toBe(1)
    expect(result.current.shouldShowLoading).toBe(true)
  })

  it('handler filter, refresh, dan load more', async () => {
    const { result } = await renderHook(() => useSelfDisposalList())
    await act(() => result.current.handleToggleFilter())
    expect(result.current.isOpenFilter).toBe(true)
    await act(() => result.current.handleApplyFilter({ material_id: 1 } as any))
    expect(result.current.isOpenFilter).toBe(false)
    expect(result.current.filter).toEqual({ material_id: 1 })
    await act(() => result.current.handleResetFilter())
    expect(result.current.filter).toEqual({})
    await act(() => result.current.handleRefreshList())
    expect(refetch).toHaveBeenCalled()
    await act(() => result.current.handleLoadMore())
    expect(fetchNextPage).toHaveBeenCalledTimes(1)
  })

  it('load more tidak jalan saat tidak ada halaman berikut atau sedang fetch', async () => {
    mockInfinite.mockReturnValue({ ...base, hasNextPage: false })
    const { result, rerender } = await renderHook(() => useSelfDisposalList())
    await act(() => result.current.handleLoadMore())
    mockInfinite.mockReturnValue({ ...base, isFetchingNextPage: true })
    await rerender({})
    await act(() => result.current.handleLoadMore())
    expect(fetchNextPage).not.toHaveBeenCalled()
  })
})
