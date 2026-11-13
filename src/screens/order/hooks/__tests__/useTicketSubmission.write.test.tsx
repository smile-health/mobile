const mockSend = jest.fn()
const mockDispatch = jest.fn()
const mockShowFormatted = jest.fn()
let mockLoading = false

jest.mock('@/services/apis/ticket-material.api', () => ({
  useSendTicketMaterialMutation: () => [mockSend, { isLoading: mockLoading }],
}))
jest.mock('@/services/features/ticketReason.slice', () => ({
  clearTicketFormData: () => ({ type: 'clearForm' }),
  clearTicketMaterials: () => ({ type: 'clearMaterials' }),
  setIgnoreConfirm: (v: boolean) => ({ type: 'ignore', payload: v }),
}))
jest.mock('@/services/store', () => ({
  workspaceState: 'ws',
  useAppDispatch: () => mockDispatch,
  useAppSelector: () => ({ selectedWorkspace: { entity_id: 4 } }),
}))
jest.mock('@/utils/helpers/ErrorHelpers', () => ({
  showFormattedError: (...a: any[]) => mockShowFormatted(...a),
}))
jest.mock('@/utils/helpers/MaterialHelpers', () => ({
  isNewMaterial: (id: any) => typeof id === 'string',
}))

import { act, renderHook } from '@testing-library/react-native'
import { useTicketSubmission } from '../useTicketSubmission'

const materials: any[] = [
  {
    id: 1,
    name: 'Batchy',
    is_managed_in_batch: true,
    batches: [
      {
        batch_code: 'B1',
        expired_date: '2030-01-02',
        qty: 3,
        reason: '2',
        detail_reason: '5',
      },
      { batch_code: 'B2', expired_date: '', qty: 3 },
      { batch_code: ' ', expired_date: '2030-01-02', qty: 3 },
      { batch_code: 'B3', expired_date: '2030-01-02', qty: 0 },
    ],
  },
  {
    id: 2,
    name: 'Plain',
    is_managed_in_batch: false,
    qty: '4',
    reason: '1',
    detail_reason: '9',
  },
  { id: 'new-1', name: 'Custom', qty: 0 },
  { id: 0, name: '' },
  { id: 3, name: 'Empty batches', is_managed_in_batch: true, batches: [] },
]

const setup = async (extra: any = {}) =>
  await renderHook(() =>
    useTicketSubmission({
      ticketMaterials: materials,
      ticketFormData: {
        isSubmitted: 0,
        doNumber: 'DO-1',
        arrivalDate: '2025-01-01',
        comment: 'form',
      } as any,
      ...extra,
    })
  )

beforeEach(() => {
  jest.clearAllMocks()
  mockLoading = false
  mockSend.mockReturnValue({ unwrap: () => Promise.resolve({ id: 99 }) })
})

describe('useTicketSubmission', () => {
  it('membangun payload: batch valid, non-batch, material baru', async () => {
    const { result } = await setup()
    await act(async () => {
      await result.current.handleSend()
    })
    const p = mockSend.mock.calls[0][0]
    expect(p).toMatchObject({
      entity_id: 4,
      has_order: 0,
      order_id: null,
      do_number: 'DO-1',
      arrived_date: '2025-01-01',
      comment: 'form',
      request_cancel: 0,
    })
    const items = p.items
    expect(items.filter((i: any) => i.batch_code === 'B1')).toHaveLength(1)
    expect(items.find((i: any) => i.batch_code === 'B1')).toMatchObject({
      material_id: 1,
      qty: 3,
      reason_id: 2,
      child_reason_id: 5,
    })
    // `hasValidId ?? hasValidName` bernilai boolean, jadi id string (material baru) tersaring
    expect(
      items.find((i: any) => i.custom_material === 'Custom')
    ).toBeUndefined()
    expect(items.find((i: any) => i.material_id === 2)).toMatchObject({
      qty: 4,
      reason_id: 1,
      child_reason_id: 9,
      batch_code: null,
    })
    expect(
      items.some((i: any) => i.batch_code === 'B2' || i.batch_code === 'B3')
    ).toBe(false)
  })

  it('sukses: bersihkan state, ignore confirm, panggil onSuccess', async () => {
    const onSuccess = jest.fn()
    const { result } = await setup()
    await act(async () => {
      await result.current.handleSend(onSuccess)
    })
    expect(mockDispatch.mock.calls.map((c) => c[0].type)).toEqual([
      'clearForm',
      'clearMaterials',
      'ignore',
    ])
    expect(onSuccess).toHaveBeenCalledWith(99)
  })

  it('sukses tanpa onSuccess dan tanpa id respons tidak membersihkan', async () => {
    const { result } = await setup()
    await act(async () => {
      await result.current.handleSend()
    })
    expect(mockDispatch).toHaveBeenCalled()
    jest.clearAllMocks()
    mockSend.mockReturnValue({ unwrap: () => Promise.resolve({}) })
    await act(async () => {
      await result.current.handleSend(jest.fn())
    })
    expect(mockDispatch).not.toHaveBeenCalled()
  })

  it('terkirim dengan order: order_id dan request_cancel', async () => {
    const { result } = await setup({
      ticketFormData: { isSubmitted: 1, doNumber: '15' },
      requestCancel: true,
      comment: 'override',
    })
    await act(async () => {
      await result.current.handleSend()
    })
    expect(mockSend.mock.calls[0][0]).toMatchObject({
      has_order: 1,
      order_id: 15,
      do_number: null,
      request_cancel: 1,
      comment: 'override',
      arrived_date: '',
    })
  })

  it('tanpa form data: nilai default', async () => {
    const { result } = await setup({ ticketFormData: undefined })
    await act(async () => {
      await result.current.handleSend()
    })
    expect(mockSend.mock.calls[0][0]).toMatchObject({
      has_order: 0,
      order_id: null,
      comment: null,
      request_cancel: 0,
    })
  })

  it('error: tampilkan pesan dan panggil onError', async () => {
    const err = { message: 'x' }
    mockSend.mockReturnValue({ unwrap: () => Promise.reject(err) })
    const onError = jest.fn()
    const { result } = await setup()
    await act(async () => {
      await result.current.handleSend(undefined, onError)
    })
    expect(mockShowFormatted).toHaveBeenCalledWith(err)
    expect(onError).toHaveBeenCalled()
    await act(async () => {
      await result.current.handleSend()
    })
  })

  it('loading mencegah kirim ganda', async () => {
    mockLoading = true
    const { result } = await setup()
    expect(result.current.isLoading).toBe(true)
    await act(async () => {
      await result.current.handleSend()
    })
    expect(mockSend).not.toHaveBeenCalled()
  })
})
