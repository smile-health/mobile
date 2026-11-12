const mockDispatch = jest.fn()
const mockNavigate = jest.fn()
const mockGoBack = jest.fn()
let mockFormData: any = { doNumber: 'DO', arrivalDate: '2025-01-01', isSubmitted: 1 }

jest.mock('@react-navigation/native', () => ({ useNavigation: () => ({ navigate: mockNavigate, goBack: mockGoBack }) }))
jest.mock('@/services/features/ticketReason.slice', () => ({
  getTicketFormData: 'formData',
  addBatchToTicketMaterial: (p: any) => ({ type: 'addBatch', payload: p }),
  addTicketMaterial: (p: any) => ({ type: 'addMaterial', payload: p }),
  removeBatchFromTicketMaterial: (p: any) => ({ type: 'removeBatch', payload: p }),
  setIgnoreConfirm: (p: any) => ({ type: 'ignore', payload: p }),
}))
jest.mock('@/services/store', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: () => mockFormData,
}))

import { act, renderHook, waitFor } from '@testing-library/react-native'
import { useAddMaterialOrBatch } from '../useAddMaterialOrBatch'

beforeEach(() => {
  jest.clearAllMocks()
  jest.useFakeTimers()
  mockFormData = { doNumber: 'DO', arrivalDate: '2025-01-01', isSubmitted: 1 }
})
afterEach(() => jest.useRealTimers())

// Override harus stabil antar render: hook mereset form tiap referensinya berubah.
const overrideOld: any = { batch_code: 'OLD' }
const overrideSame: any = { batch_code: 'B2' }
const material: any = { id: 5, name: 'Mat', is_managed_in_batch: true, batches: [] }
const batchData: any = { batch_code: 'B2', expired_date: '2030-01-01', qty: 4, reason: 'r', detail_reason: 'd' }

describe('useAddMaterialOrBatch', () => {
  it('mode batch: simpan batch dan kembali ke detail untuk material existing', () => {
    const { result } = renderHook(() => useAddMaterialOrBatch(material, 'batch'))
    act(() => result.current.handleSubmitToStore(batchData))
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'addBatch', payload: { materialId: 5, batch: { batch_code: 'B2', expired_date: '2030-01-01', qty: 4, reason: 'r', detail_reason: 'd' } } })
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'ignore', payload: true })
    act(() => { jest.runAllTimers() })
    expect(mockNavigate).toHaveBeenCalledWith('TicketMaterialDetail', { material, mode: 'batch', isEdit: true })
    expect(mockGoBack).not.toHaveBeenCalled()
  })

  it('material baru (id timestamp): goBack; qty non-angka jadi 0; alasan kosong default', () => {
    const fresh = { ...material, id: 1_800_000_000 }
    const { result } = renderHook(() => useAddMaterialOrBatch(fresh, 'batch'))
    act(() => result.current.handleSubmitToStore({ batch_code: 'X', expired_date: 'd', qty: undefined } as any))
    expect(mockDispatch.mock.calls[0][0].payload.batch).toMatchObject({ qty: 0, reason: '', detail_reason: '' })
    act(() => { jest.runAllTimers() })
    expect(mockGoBack).toHaveBeenCalled()
  })

  it('edit batch dengan kode berubah menghapus batch lama', () => {
    const { result } = renderHook(() => useAddMaterialOrBatch(material, 'batch', overrideOld))
    act(() => result.current.handleSubmitToStore(batchData))
    expect(mockDispatch.mock.calls[0][0]).toEqual({ type: 'removeBatch', payload: { materialId: 5, batchCode: 'OLD' } })
  })

  it('edit batch dengan kode sama tidak menghapus', () => {
    const { result } = renderHook(() => useAddMaterialOrBatch(material, 'batch', overrideSame))
    act(() => result.current.handleSubmitToStore(batchData))
    expect(mockDispatch.mock.calls[0][0].type).toBe('addBatch')
  })

  it('mode non-batch: simpan material dengan data form tiket', () => {
    const plain = { id: 6, name: 'P', is_managed_in_batch: false, batches: [] } as any
    const { result } = renderHook(() => useAddMaterialOrBatch(plain, 'non-batch'))
    act(() => result.current.handleSubmitToStore({ qty: 9 } as any))
    expect(mockDispatch.mock.calls[0][0].payload).toMatchObject({ id: 6, qty: 9, doNumber: 'DO', arrivalDate: '2025-01-01', isSubmitted: 1 })
    act(() => { jest.runAllTimers() })
    expect(mockNavigate).toHaveBeenCalledWith('CreateTicket', { section: 2 })
  })

  it('non-batch tanpa form data memakai string kosong', () => {
    mockFormData = undefined
    const plain = { id: 6, name: 'P', is_managed_in_batch: false } as any
    const { result } = renderHook(() => useAddMaterialOrBatch(plain, 'non-batch'))
    act(() => result.current.handleSubmitToStore({ qty: 1 } as any))
    expect(mockDispatch.mock.calls[0][0].payload).toMatchObject({ doNumber: '', arrivalDate: '' })
  })

  it('tanggal diubah menjadi string terformat; getFieldError', async () => {
    const { result } = renderHook(() => useAddMaterialOrBatch(material, 'batch'))
    act(() => result.current.handleDateChange('expired_date')(new Date(2030, 0, 15)))
    await waitFor(() => expect(result.current.watch('expired_date')).toMatch(/2030/))
    expect(result.current.getFieldError('nope')).toBe('')
    await act(async () => { await result.current.handleSubmit(() => {})() })
    expect(typeof result.current.getFieldError('batch_code')).toBe('string')
  })

  it('default override mereset form', async () => {
    const override: any = { batch_code: 'Z', expired_date: '2031-01-01', qty: 3, reason: '', detail_reason: '' }
    const { result } = renderHook(() => useAddMaterialOrBatch(material, 'batch', override))
    await waitFor(() => expect(result.current.watch('batch_code')).toBe('Z'))
  })

  it('mode non-batch memakai schema non-batch', async () => {
    const plain = { id: 6, name: 'P' } as any
    const { result } = renderHook(() => useAddMaterialOrBatch(plain, 'non-batch'))
    await act(async () => { await result.current.handleSubmit(() => {})() })
    expect(result.current.isValid).toBe(false)
  })
})
