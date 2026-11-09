import { act, renderHook } from '@testing-library/react-native'
import {
  getFormQuantity,
  getFormattedFormQuantity,
  getFormattedQuantity,
  getQuantity,
  getRadioOptions,
  useCalculateTotalLeadTime,
} from '../TicketHelpers'

describe('quantity helpers', () => {
  it('getQuantity: non-batch memakai qty, batch menjumlah', () => {
    expect(getQuantity({ qty: 4 } as any)).toBe(4)
    expect(getQuantity({} as any)).toBe(0)
    expect(getQuantity({ is_managed_in_batch: true, batches: [], qty: 6 } as any)).toBe(6)
    expect(getQuantity({ is_managed_in_batch: true, batches: [{ qty: 2 }, {}, { qty: 3 }] } as any)).toBe(5)
  })

  it('format dan qty form', () => {
    expect(getFormattedQuantity({ qty: 1500 } as any)).toBe('1,500')
    expect(getFormQuantity(undefined)).toBe(0)
    expect(getFormQuantity(3)).toBe(3)
    expect(getFormattedFormQuantity(undefined)).toBe('0')
    expect(getRadioOptions().map((o) => o.value)).toEqual([1, 0])
  })
})

describe('useCalculateTotalLeadTime', () => {
  beforeEach(() => jest.useFakeTimers().setSystemTime(new Date('2025-01-01T01:00:00Z')))
  afterEach(() => jest.useRealTimers())

  it('tanpa createdAt atau tanggal invalid', () => {
    expect(renderHook(() => useCalculateTotalLeadTime(undefined)).result.current).toBe('00:00:00')
    expect(renderHook(() => useCalculateTotalLeadTime('bukan-tanggal')).result.current).toBe('00:00:00')
  })

  it('tiket berjalan: durasi dihitung dari sekarang dan bertambah tiap detik', () => {
    const { result } = renderHook(() => useCalculateTotalLeadTime('2025-01-01T00:00:00Z', undefined, 1))
    const first = result.current
    expect(first).not.toBe('00:00:00')
    act(() => { jest.advanceTimersByTime(2000) })
    expect(result.current).not.toBe(first)
  })

  it('tiket selesai/batal memakai updatedAt dan tidak berdetak', () => {
    const { result } = renderHook(() => useCalculateTotalLeadTime('2025-01-01T00:00:00Z', '2025-01-01T00:00:30Z', 9))
    const v = result.current
    act(() => { jest.advanceTimersByTime(5000) })
    expect(result.current).toBe(v)
    expect(renderHook(() => useCalculateTotalLeadTime('2025-01-01T00:00:00Z', undefined, 10)).result.current).toBe('00:00:00')
    expect(renderHook(() => useCalculateTotalLeadTime('2025-01-01T00:00:00Z', 'x', 10)).result.current).toBe('00:00:00')
  })

  it('createdAt di masa depan memberi 00:00:00', () => {
    const { result } = renderHook(() => useCalculateTotalLeadTime('2030-01-01T00:00:00Z', undefined, 1))
    expect(result.current).toBe('00:00:00')
  })
})
