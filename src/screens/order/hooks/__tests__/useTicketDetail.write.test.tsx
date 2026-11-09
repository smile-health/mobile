const mockNavigate = jest.fn()
const mockRefetch = jest.fn()
const mockUpdate = jest.fn()
const mockShowError = jest.fn()
let mockDetail: any
let mockQueryLoading = false

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
}))
jest.mock('@/utils/CommonUtils', () => ({ showError: (...a: any[]) => mockShowError(...a) }))
jest.mock('@/services/apis/event-report-detail.api', () => ({
  useGetEventReportDetailQuery: () => ({
    data: mockDetail,
    isLoading: mockQueryLoading,
    error: undefined,
    refetch: mockRefetch,
  }),
  useUpdateEventReportMutation: () => [mockUpdate, { isLoading: false }],
}))

import { Linking } from 'react-native'
import { act, renderHook } from '@testing-library/react-native'
import { mapItemsToTicketMaterials, useTicketDetail } from '../useTicketDetail'

beforeEach(() => {
  jest.clearAllMocks()
  jest.useRealTimers()
  mockQueryLoading = false
  mockDetail = { order_id: 9, slip_link: 'http://slip', status_id: 5 }
  mockRefetch.mockResolvedValue({ data: 1 })
  mockUpdate.mockReturnValue({ unwrap: () => Promise.resolve({ ok: true }) })
})

describe('mapItemsToTicketMaterials', () => {
  it('menggabungkan batch pada material yang sama dan menjumlah qty', () => {
    const out = mapItemsToTicketMaterials([
      { material_id: 1, material_name: 'A', batch_code: 'b1', qty: 2, expired_date: 'x', reason: 'r', child_reason: 'cr' },
      { material_id: 1, material_name: 'A', batch_code: 'b2', qty: 3, detail_reason: 'dr' },
      { material_name: 'A', qty: 9 },
    ])
    expect(out).toHaveLength(1)
    expect(out[0].batches).toHaveLength(2)
    expect(out[0].qty).toBe(5)
    expect(out[0].batches[0].detail_reason).toBe('cr')
    expect(out[0].batches[1].detail_reason).toBe('dr')
  })

  it('material custom tanpa batch', () => {
    const out = mapItemsToTicketMaterials([
      { id: 4, custom_material: 'Cust', qty: 1, reason: 'r', child_reason: 'c', has_order: 1 },
      { id: 5, qty: 1 },
    ])
    expect(out).toHaveLength(2)
    expect(out[0]).toMatchObject({ id: 4, name: 'Cust', isSubmitted: 1, reason: 'r', detail_reason: 'c', batches: [] })
    expect(out[1]).toMatchObject({ name: '-', isSubmitted: 0, detail_reason: '' })
  })
})

describe('useTicketDetail', () => {
  it('visibilitas tombol berdasar status', () => {
    const { result, rerender } = renderHook(() => useTicketDetail(1))
    expect(result.current.buttonVisibility).toEqual({ showCancel: true, showComplete: true })
    mockDetail = { status_id: 1 }
    rerender({})
    expect(result.current.buttonVisibility).toEqual({ showCancel: true, showComplete: false })
    mockDetail = { status_id: 3 }
    rerender({})
    expect(result.current.buttonVisibility.showCancel).toBe(false)
    mockDetail = undefined
    rerender({})
    expect(result.current.buttonVisibility).toEqual({ showCancel: false, showComplete: false })
  })

  it('navigasi ke order dan buka packing slip bila tersedia', () => {
    const open = jest.spyOn(Linking, 'openURL').mockResolvedValue(true as any)
    const { result, rerender } = renderHook(() => useTicketDetail(1))
    act(() => { result.current.handleViewOrderDetail(); result.current.handleViewPackingSlip() })
    expect(mockNavigate).toHaveBeenCalledWith('OrderDetail', { id: 9, preview: true })
    expect(open).toHaveBeenCalledWith('http://slip')
    mockDetail = {}
    rerender({})
    act(() => { result.current.handleViewOrderDetail(); result.current.handleViewPackingSlip() })
    expect(mockNavigate).toHaveBeenCalledTimes(1)
    expect(open).toHaveBeenCalledTimes(1)
  })

  it('refetch sukses mengembalikan hasil dan melepas loading', async () => {
    const { result } = renderHook(() => useTicketDetail(1))
    let r: any
    await act(async () => { r = await result.current.refetch() })
    expect(r).toEqual({ data: 1 })
    expect(result.current.isLoading).toBe(false)
  })

  it('refetch gagal melempar ulang error', async () => {
    mockRefetch.mockRejectedValue(new Error('x'))
    const { result } = renderHook(() => useTicketDetail(1))
    await act(async () => {
      await expect(result.current.refetch()).rejects.toThrow('x')
    })
    expect(result.current.isLoading).toBe(false)
  })

  it('update event report sukses dan gagal', async () => {
    const { result } = renderHook(() => useTicketDetail(3))
    let r: any
    await act(async () => { r = await result.current.handleUpdateEventReport({ update_status_id: 2 } as any) })
    expect(mockUpdate).toHaveBeenCalledWith({ id: 3, data: { update_status_id: 2 } })
    expect(r).toEqual({ ok: true })

    const err = new Error('fail')
    mockUpdate.mockReturnValue({ unwrap: () => Promise.reject(err) })
    await act(async () => { r = await result.current.handleUpdateEventReport({} as any) })
    expect(r).toBe(err)
    expect(mockShowError).toHaveBeenCalledWith(err)
    expect(result.current.isUpdating).toBe(false)
  })

  it('ubah status memanggil update lalu refetch', async () => {
    const { result } = renderHook(() => useTicketDetail(3))
    await act(async () => { await result.current.handleChangeStatus(4) })
    expect(mockUpdate).toHaveBeenCalledWith({ id: 3, data: { update_status_id: 4 } })
    expect(mockRefetch).toHaveBeenCalled()
  })

  it('ubah status: error dari refetch ditampilkan', async () => {
    mockRefetch.mockRejectedValue(new Error('r'))
    const { result } = renderHook(() => useTicketDetail(3))
    await act(async () => { await result.current.handleChangeStatus(4) })
    expect(mockShowError).toHaveBeenCalled()
  })

  it('timeout loading berjalan tanpa merusak state', async () => {
    jest.useFakeTimers()
    let resolve: any
    mockRefetch.mockReturnValue(new Promise((r) => { resolve = r }))
    const { result } = renderHook(() => useTicketDetail(1))
    let p: any
    act(() => { p = result.current.refetch() })
    act(() => { jest.advanceTimersByTime(120000) })
    await act(async () => { resolve(1); await p })
    expect(result.current.isLoading).toBe(false)
  })

  it('loading query diteruskan', () => {
    mockQueryLoading = true
    const { result } = renderHook(() => useTicketDetail(1))
    expect(result.current.isLoading).toBe(true)
  })
})
