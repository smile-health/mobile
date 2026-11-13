const mockNavigate = jest.fn()
const mockDispatch = jest.fn()
let mockBeforeRemove: any
let mockMaterials: any[] = []
const mockReasons = [
  { value: 'r1', label: 'Rusak', children: [{ value: 'd1', label: 'Pecah' }] },
]

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
    addListener: (_e: string, cb: any) => {
      mockBeforeRemove = cb
      return () => {}
    },
  }),
}))
jest.mock('@/services/features/ticketReason.slice', () => ({
  getReasons: 'reasons',
  getTicketMaterials: 'materials',
  addTicketMaterial: (p: any) => ({ type: 'add', payload: p }),
  removeTicketMaterial: (p: any) => ({ type: 'remove', payload: p }),
  removeBatchFromTicketMaterial: (p: any) => ({
    type: 'removeBatch',
    payload: p,
  }),
}))
jest.mock('@/services/store', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (sel: string) =>
    sel === 'reasons' ? mockReasons : mockMaterials,
}))

import { act, renderHook, waitFor } from '@testing-library/react-native'
import { useTicketingAddMaterials } from '../useTicketingAddMaterials'

const TEMP_ID = 1_700_000_000_000

beforeEach(() => {
  jest.clearAllMocks()
  mockMaterials = []
  mockBeforeRemove = undefined
})

describe('useTicketingAddMaterials', () => {
  it('opsi alasan detail mengikuti alasan terpilih', async () => {
    const initial: any = {
      id: 1,
      name: 'Mat',
      qty: 2,
      reason: 'r1',
      detail_reason: 'd1',
      is_managed_in_batch: false,
    }
    mockMaterials = [initial]
    const { result } = await renderHook(() => useTicketingAddMaterials(initial))
    await waitFor(() => expect(result.current.materialName).toBe('Mat'))
    expect(result.current.detailReasonOptions).toEqual([
      { value: 'd1', label: 'Pecah' },
    ])
    expect(result.current.currentMaterial.id).toBe(1)
    expect(result.current.isBatch).toBe(0)
  })

  it('initial batch: isBatch=1; tombol valid bila ada batch dan nama', async () => {
    const initial: any = {
      id: 1,
      name: 'Mat',
      is_managed_in_batch: true,
      batches: [{ batch_code: 'B', qty: 4 }],
    }
    mockMaterials = [initial]
    const { result } = await renderHook(() => useTicketingAddMaterials(initial))
    await waitFor(() => expect(result.current.isBatch).toBe(1))
    expect(result.current.isButtonValid).toBeTruthy()
  })

  it('batch tanpa batch/nama membuat tombol tidak valid', async () => {
    const initial: any = {
      id: 2,
      name: '',
      is_managed_in_batch: true,
      batches: [],
    }
    mockMaterials = [initial]
    const { result } = await renderHook(() => useTicketingAddMaterials(initial))
    await waitFor(() => expect(result.current.isBatch).toBe(1))
    expect(result.current.isButtonValid).toBeFalsy()
  })

  it('tanpa initial: currentMaterial sementara; tambah batch menyimpan material sementara lalu navigasi', async () => {
    const { result } = await renderHook(() => useTicketingAddMaterials())
    expect(result.current.currentMaterial.name).toBe('')
    await act(() => result.current.handleAddBatch())
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'add' })
    )
    expect(mockNavigate).toHaveBeenCalledWith(
      'AddMaterialOrBatchScreen',
      expect.objectContaining({ mode: 'batch', isEdit: false })
    )
  })

  it('tambah batch pada material bernama sama memakai material yang ada tanpa dispatch', async () => {
    const existing: any = { id: 5, name: 'Dup', batches: [] }
    mockMaterials = [existing]
    const initial: any = { id: 5, name: 'Dup' }
    const { result } = await renderHook(() => useTicketingAddMaterials(initial))
    await waitFor(() => expect(result.current.materialName).toBe('Dup'))
    await act(() => result.current.handleAddBatch())
    expect(mockDispatch).not.toHaveBeenCalled()
    expect(mockNavigate).toHaveBeenCalledWith(
      'AddMaterialOrBatchScreen',
      expect.objectContaining({ material: existing })
    )
  })

  it('material sementara sudah ada di store: tidak dispatch ulang', async () => {
    const temp: any = {
      id: TEMP_ID,
      name: '',
      batches: [{ batch_code: 'x', qty: 1 }],
    }
    mockMaterials = [temp]
    const { result } = await renderHook(() => useTicketingAddMaterials())
    expect(result.current.currentMaterial.id).toBe(TEMP_ID)
    await act(() => result.current.handleAddBatch())
    expect(mockDispatch).not.toHaveBeenCalled()
  })

  it('edit dan hapus batch', async () => {
    const initial: any = {
      id: 3,
      name: 'M',
      is_managed_in_batch: true,
      batches: [{ batch_code: 'A', qty: 1 }],
    }
    mockMaterials = [initial]
    const { result } = await renderHook(() => useTicketingAddMaterials(initial))
    await waitFor(() => expect(result.current.isBatch).toBe(1))
    await act(() => result.current.handleEditBatch({ batch_code: 'A' } as any))
    expect(mockNavigate).toHaveBeenCalledWith(
      'AddMaterialOrBatchScreen',
      expect.objectContaining({ isEdit: true, batch: { batch_code: 'A' } })
    )
    await act(() =>
      result.current.handleDeleteBatch({ batch_code: 'A' } as any)
    )
    await act(() => result.current.handleDeleteBatch({} as any))
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'removeBatch',
      payload: { materialId: 3, batchCode: 'A' },
    })
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'removeBatch',
      payload: { materialId: 3, batchCode: '' },
    })
  })

  it('simpan non-batch pada material yang ada memperbarui qty/alasan', async () => {
    const initial: any = {
      id: 1,
      name: 'Mat',
      qty: 2,
      reason: 'r1',
      detail_reason: 'd1',
      is_managed_in_batch: false,
      batches: [],
    }
    mockMaterials = [initial]
    const { result } = await renderHook(() => useTicketingAddMaterials(initial))
    await waitFor(() => expect(result.current.materialName).toBe('Mat'))
    await act(() =>
      result.current.handleSave({
        materialName: 'Mat2',
        isBatch: 0,
        qty: 9,
        reason: 'r1',
        detail_reason: 'd1',
      } as any)
    )
    const saved = mockDispatch.mock.calls.at(-1)[0].payload
    expect(saved).toMatchObject({
      id: 1,
      name: 'Mat2',
      qty: 9,
      reason: 'r1',
      detail_reason: 'd1',
      batches: [],
      is_managed_in_batch: false,
    })
    expect(mockNavigate).toHaveBeenCalledWith('CreateTicket', { section: 2 })
  })

  it('simpan batch pada material yang ada menjumlah qty dan menghapus alasan', async () => {
    const initial: any = {
      id: 1,
      name: 'Mat',
      is_managed_in_batch: true,
      reason: 'x',
      detail_reason: 'y',
      batches: [{ batch_code: 'A', qty: 2 }, { batch_code: 'B' }],
    }
    mockMaterials = [initial]
    const { result } = await renderHook(() => useTicketingAddMaterials(initial))
    await waitFor(() => expect(result.current.isBatch).toBe(1))
    await act(() =>
      result.current.handleSave({ materialName: 'Mat', isBatch: 1 } as any)
    )
    const saved = mockDispatch.mock.calls.at(-1)[0].payload
    expect(saved.qty).toBe(2)
    expect(saved.reason).toBeUndefined()
    expect(saved.batches).toHaveLength(2)
  })

  it('simpan material baru (tanpa yang cocok): non-batch dan batch', async () => {
    const { result } = await renderHook(() => useTicketingAddMaterials())
    await act(() =>
      result.current.handleSave({
        materialName: 'Baru',
        isBatch: 0,
        qty: undefined,
        reason: 'r1',
        detail_reason: 'd1',
      } as any)
    )
    let saved = mockDispatch.mock.calls.at(-1)[0].payload
    expect(saved).toMatchObject({
      name: 'Baru',
      qty: 0,
      reason: 'r1',
      batches: [],
      isSubmitted: 0,
    })
    await act(() =>
      result.current.handleSave({ materialName: 'Baru', isBatch: 1 } as any)
    )
    saved = mockDispatch.mock.calls.at(-1)[0].payload
    expect(saved).toMatchObject({ qty: 0, is_managed_in_batch: true })
    expect('reason' in saved).toBe(false)
  })

  it('beforeRemove: batch kosong atau nama/qty kosong menghapus material', async () => {
    const initial: any = {
      id: 8,
      name: 'M',
      is_managed_in_batch: true,
      batches: [],
    }
    mockMaterials = [initial]
    const batchHook = await renderHook(() => useTicketingAddMaterials(initial))
    await waitFor(() => expect(batchHook.result.current.isBatch).toBe(1))
    await act(() => mockBeforeRemove())
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'remove', payload: 8 })

    jest.clearAllMocks()
    const empty = await renderHook(() => useTicketingAddMaterials())
    await act(() => mockBeforeRemove())
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'remove' })
    )
    expect(empty.result.current.isBatch).toBe(0)
  })

  it('beforeRemove: material batch berisi tidak dihapus', async () => {
    const initial: any = {
      id: 8,
      name: 'M',
      is_managed_in_batch: true,
      batches: [{ batch_code: 'A', qty: 1 }],
    }
    mockMaterials = [initial]
    const { result } = await renderHook(() => useTicketingAddMaterials(initial))
    await waitFor(() => expect(result.current.isBatch).toBe(1))
    await act(() => mockBeforeRemove())
    expect(mockDispatch).not.toHaveBeenCalled()
  })

  it('beforeRemove non-batch dengan nama terisi dan qty bukan nol tidak menghapus', async () => {
    const initial: any = {
      id: 9,
      name: 'Ok',
      qty: 3,
      is_managed_in_batch: false,
    }
    mockMaterials = [initial]
    const { result } = await renderHook(() => useTicketingAddMaterials(initial))
    await waitFor(() => expect(result.current.materialName).toBe('Ok'))
    await act(() => mockBeforeRemove())
    expect(mockDispatch).not.toHaveBeenCalled()
  })

  it('material sementara tanpa nama memakai ulang id tersimpan dan mengikuti isBatch', async () => {
    mockMaterials = [
      { id: TEMP_ID, name: '', batches: [{ batch_code: 'Z', qty: 1 }] } as any,
    ]
    const { result } = await renderHook(() => useTicketingAddMaterials())
    expect(result.current.currentMaterial.batches).toHaveLength(1)
  })
})
