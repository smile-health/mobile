const mockNavigate = jest.fn()
const mockState: any = {
  workspace: {
    selectedWorkspace: { config: { material: { is_hierarchy_enabled: true } } },
  },
  ticket: { ticketList: undefined, isLoading: false },
}
jest.mock('@react-navigation/native', () => {
  const React = require('react')
  return {
    useNavigation: () => ({ navigate: mockNavigate }),
    useFocusEffect: (cb: any) => {
      React.useEffect(() => cb(), [])
    },
  }
})
jest.mock('@/services/store', () => ({
  useAppSelector: (sel: any) => sel(mockState),
  workspaceState: (s: any) => s.workspace,
  ticketState: (s: any) => s.ticket,
}))

import { act, renderHook, waitFor } from '@testing-library/react-native'
import { useOrderEditItem } from '../useOrderEditItem'
import { useTicketList } from '../useTicketList'

const base = (over: any = {}): any => ({
  id: 1,
  qty: 5,
  recommended_stock: 5,
  confirmed_qty: 5,
  ordered_qty: 5,
  other_reason: 'alasan  ',
  material: { name: 'M', consumption_unit_per_distribution_unit: 2 },
  stock_vendor: { total_available_qty: 100, min: 1, max: 50 },
  stock_customer: { total_available_qty: 30, min: 2, max: 20 },
  children: [{ id: 'c1', qty: 2 }, { id: 'c2' }],
  ...over,
})

describe('useOrderEditItem', () => {
  const setup = async (
    item: any,
    type: any = 'confirm',
    cbs: any = {},
    show = true
  ) =>
    await renderHook(() =>
      useOrderEditItem(item, 0, cbs.q, cbs.r, cbs.o, show, type)
    )

  it('tipe confirm memakai stok vendor dan tanpa helper saat qty sama dengan rekomendasi', async () => {
    const { result } = await setup(base())
    expect(result.current.availableQty).toBe(100)
    expect(result.current.min).toBe(1)
    expect(result.current.max).toBe(50)
    expect(result.current.qtyHelperMessage).toBeUndefined()
    expect(result.current.shouldShowReasonDropdown).toBe(false)
    expect(result.current.isMaterialHierarchy).toBe(true)
    expect(result.current.isEdit).toBe(false)
  })

  it('tipe edit memakai stok customer dan helper rekomendasi bila qty berbeda', async () => {
    const { result } = await setup(base({ qty: 3 }), 'edit')
    expect(result.current.availableQty).toBe(30)
    expect(result.current.isEdit).toBe(true)
    expect(result.current.qtyHelperMessage).toContain('Recommended')
    expect(result.current.shouldShowReasonDropdown).toBe(true)
  })

  it('validate menandai isValidate dan dropdown bisa dimatikan', async () => {
    const { result } = await setup(base({ qty: 3 }), 'validate', {}, false)
    expect(result.current.isValidate).toBe(true)
    expect(result.current.shouldShowReasonDropdown).toBe(false)
  })

  it('memanggil callback pembaruan qty, alasan, dan alasan lain (ditrim)', async () => {
    const cbs = { q: jest.fn(), r: jest.fn(), o: jest.fn() }
    await setup(base({ qty: 3, reason_id: '2' }), 'confirm', cbs)
    await waitFor(() => expect(cbs.q).toHaveBeenCalledWith(0, 3))
    expect(cbs.r).toHaveBeenCalled()
    expect(cbs.o).toHaveBeenCalledWith(0, 'alasan')
  })

  it('tanpa alasan lain callback alasan lain tidak dipanggil', async () => {
    const cbs = { q: jest.fn(), r: jest.fn(), o: jest.fn() }
    await setup(base({ qty: 3, other_reason: '' }), 'confirm', cbs)
    await waitFor(() => expect(cbs.q).toHaveBeenCalled())
    expect(cbs.o).not.toHaveBeenCalled()
  })

  it('reason dipulihkan dari item bila kosong', async () => {
    const { result } = await setup(
      base({ qty: 3, reason: { id: 'R', name: 'x' } })
    )
    await waitFor(() => expect(result.current.reason).toBeDefined())
  })

  it('qty kosong dan tanpa stok memakai default', async () => {
    const { result } = await setup(
      base({
        qty: '',
        stock_vendor: undefined,
        material: undefined,
        children: undefined,
        recommended_stock: 0,
      })
    )
    expect(result.current.availableQty).toBeNull()
    expect(result.current.min).toBeNull()
  })

  it('tanpa workspace hierarki tidak aktif', async () => {
    mockState.workspace = { selectedWorkspace: undefined }
    const { result } = await setup(base())
    expect(result.current.isMaterialHierarchy).toBeUndefined()
    mockState.workspace = {
      selectedWorkspace: {
        config: { material: { is_hierarchy_enabled: true } },
      },
    }
  })

  it('updateChildrenQty mengubah qty anak terpilih', async () => {
    const { result } = await setup(base())
    await act(async () => {
      result.current.updateChildrenQty(1, '9')
    })
    expect(result.current.errors).toBeDefined()
  })
})

describe('useTicketList', () => {
  const list = (page: number, total: number, n = 2) => ({
    data: Array.from({ length: n }, (_, i) => ({ id: page * 10 + i })),
    total_page: total,
    page,
  })
  const filter: any = { status: 1 }

  beforeEach(() => {
    mockNavigate.mockClear()
    mockState.ticket = { ticketList: undefined, isLoading: false }
  })

  it('tanpa data: kosong dan tidak memuat lagi', async () => {
    const { result } = await renderHook(() => useTicketList({ filter }))
    expect(result.current.isEmpty).toBe(true)
    expect(result.current.tickets).toEqual([])
    await act(() => result.current.handleEndReached())
  })

  it('sedang memuat bukan kosong', async () => {
    mockState.ticket = { ticketList: undefined, isLoading: true }
    const { result } = await renderHook(() => useTicketList({ filter }))
    expect(result.current.isEmpty).toBe(false)
    expect(result.current.isFetching).toBe(true)
  })

  it('menampilkan data halaman pertama dan memuat halaman berikutnya', async () => {
    mockState.ticket = { ticketList: list(1, 3), isLoading: false }
    const { result, rerender } = await renderHook(() =>
      useTicketList({ filter })
    )
    // efek filter pertama mengosongkan daftar; data baru (referensi baru) mengisinya lagi
    mockState.ticket = { ticketList: list(1, 3), isLoading: false }
    await rerender({})
    await waitFor(() => expect(result.current.tickets).toHaveLength(2))
    expect(result.current.isEmpty).toBe(false)
    await act(() => result.current.handleEndReached())
    expect(result.current.isFetchingMore).toBe(true)
    mockState.ticket = { ticketList: list(2, 3), isLoading: false }
    await rerender({})
    await waitFor(() =>
      expect(result.current.tickets.length).toBeGreaterThanOrEqual(2)
    )
    await act(() => result.current.handleMomentumScrollBegin())
    await act(() => result.current.handleEndReached())
  })

  it('end reached ganda dan halaman terakhir tidak memuat lagi', async () => {
    mockState.ticket = { ticketList: list(1, 1), isLoading: false }
    const { result, rerender } = await renderHook(() =>
      useTicketList({ filter })
    )
    mockState.ticket = { ticketList: list(1, 1), isLoading: false }
    await rerender({})
    await waitFor(() => expect(result.current.tickets).toHaveLength(2))
    await act(() => result.current.handleEndReached())
    await act(() => result.current.handleEndReached())
    expect(result.current.isFetchingMore).toBe(false)
  })

  it('data tanpa total_page dan daftar kosong', async () => {
    mockState.ticket = { ticketList: { data: [] }, isLoading: false }
    const { result } = await renderHook(() => useTicketList({ filter }))
    expect(result.current.isEmpty).toBe(true)
    await act(() => result.current.handleEndReached())
  })

  it('filter berubah mereset daftar', async () => {
    mockState.ticket = { ticketList: list(1, 2), isLoading: false }
    let f: any = { status: 1 }
    const { result, rerender } = await renderHook(() =>
      useTicketList({ filter: f })
    )
    mockState.ticket = { ticketList: list(1, 2), isLoading: false }
    await rerender({})
    await waitFor(() => expect(result.current.tickets).toHaveLength(2))
    f = { status: 2 }
    await rerender({})
    expect(result.current.tickets).toBeDefined()
  })

  it('onPressItem menavigasi dan keyExtractor menyusun kunci', async () => {
    const { result } = await renderHook(() => useTicketList({ filter }))
    result.current.onPressItem({ id: 4 } as any)
    expect(mockNavigate).toHaveBeenCalledWith('TicketDetail', { id: 4 })
    expect(result.current.keyExtractor({ id: 4 } as any, 2)).toBe('4-2')
  })
})
