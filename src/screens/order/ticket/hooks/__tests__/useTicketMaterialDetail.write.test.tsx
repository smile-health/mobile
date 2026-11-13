const mockDispatch = jest.fn()
let mockMaterials: any[] = []
let mockWatched: any = {}
let mockErrors: any = {}

jest.mock('@/screens/order/hooks/useTicketingAddMaterials', () => ({
  useTicketingAddMaterials: () => ({
    control: 'ctl',
    errors: mockErrors,
    detailReasonOptions: [{ value: 'd' }],
    watch: (n: string) => mockWatched[n],
  }),
}))
jest.mock('@/services/features/ticketReason.slice', () => ({
  getReasons: 'reasons',
  getTicketMaterials: 'materials',
  addTicketMaterial: (p: any) => ({ type: 'add', payload: p }),
  removeBatchFromTicketMaterial: (p: any) => ({
    type: 'removeBatch',
    payload: p,
  }),
  removeTicketMaterial: (p: any) => ({ type: 'remove', payload: p }),
}))
jest.mock('@/services/store', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (s: string) =>
    s === 'reasons' ? [{ value: 'r' }] : mockMaterials,
}))

import { BackHandler } from 'react-native'
import { act, renderHook } from '@testing-library/react-native'
import { useTicketMaterialDetail } from '../useTicketMaterialDetail'

let backCb: any
let removeSpy: jest.Mock

const makeNav = () => ({ navigate: jest.fn(), goBack: jest.fn() })
const setup = (material: any, nav: any = makeNav()) => ({
  nav,
  ...renderHook(() =>
    useTicketMaterialDetail({ material, navigation: nav as any })
  ),
})

beforeEach(() => {
  jest.clearAllMocks()
  mockMaterials = []
  mockWatched = {}
  mockErrors = {}
  removeSpy = jest.fn()
  jest.spyOn(BackHandler, 'addEventListener').mockImplementation(((
    _e: any,
    cb: any
  ) => {
    backCb = cb
    return { remove: removeSpy }
  }) as any)
})

describe('useTicketMaterialDetail', () => {
  it('material belum ada di store: ditambahkan dengan batches kosong', () => {
    const material = { id: 1, name: 'M', is_managed_in_batch: false }
    setup(material)
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'add',
      payload: { ...material, batches: [] },
    })
  })

  it('material sudah ada: tidak ditambahkan lagi', () => {
    const material = { id: 1, name: 'M' }
    mockMaterials = [material]
    setup(material)
    expect(mockDispatch).not.toHaveBeenCalled()
  })

  it('konfigurasi field: non-batch punya reason/detail, batch tidak', () => {
    const a = setup({ id: 1, name: 'M', is_managed_in_batch: false })
    expect(a.result.current.fieldConfigs.reasonField?.data).toEqual([
      { value: 'r' },
    ])
    expect(a.result.current.fieldConfigs.detailReasonField?.data).toEqual([
      { value: 'd' },
    ])
    const b = setup({ id: 2, name: 'B', is_managed_in_batch: true })
    expect(b.result.current.fieldConfigs.reasonField).toBeUndefined()
    expect(a.result.current.QUANTITY_FIELD_CONFIG.name).toBe('qty')
  })

  it('getFieldError mengembalikan pesan atau string kosong', () => {
    mockErrors = { qty: { message: 'wajib' } }
    const { result } = setup({ id: 1, name: 'M' })
    expect(result.current.getFieldError('qty')).toBe('wajib')
    expect(result.current.getFieldError('reason')).toBe('')
    mockErrors = { qty: undefined }
  })

  it('tombol nonaktif non-batch sampai qty, alasan, detail terisi', () => {
    const material = { id: 1, name: 'M', is_managed_in_batch: false }
    mockMaterials = [material]
    expect(setup(material).result.current.isButtonDisabled).toBeTruthy()
    mockWatched = { qty: 0, reason: 'r', detail_reason: 'd' }
    expect(setup(material).result.current.isButtonDisabled).toBeTruthy()
    mockWatched = { qty: 2, reason: '', detail_reason: 'd' }
    expect(setup(material).result.current.isButtonDisabled).toBeTruthy()
    mockWatched = { qty: 2, reason: 'r', detail_reason: '' }
    expect(setup(material).result.current.isButtonDisabled).toBeTruthy()
    mockWatched = { qty: 2, reason: 'r', detail_reason: 'd' }
    expect(setup(material).result.current.isButtonDisabled).toBeFalsy()
  })

  it('tombol batch aktif bila ada batch di store', () => {
    const material = { id: 3, name: 'B', is_managed_in_batch: true }
    mockMaterials = [{ ...material, batches: [{ batch_code: 'a' }] }]
    expect(setup(material).result.current.isButtonDisabled).toBe(false)
    mockMaterials = [{ ...material, batches: [] }]
    expect(setup(material).result.current.isButtonDisabled).toBe(true)
    mockMaterials = []
    expect(setup(material).result.current.currentMaterial).toBe(material)
  })

  it('navigasi tambah/ubah batch dan hapus batch', () => {
    const material = { id: 3, name: 'B', is_managed_in_batch: true }
    const { result, nav } = setup(material)
    act(() => result.current.handleAddBatch())
    expect(nav.navigate).toHaveBeenLastCalledWith('AddMaterialOrBatchScreen', {
      material,
      mode: 'batch',
      isEdit: false,
    })
    act(() => result.current.handleEditBatch({ batch_code: 'x' } as any))
    expect(nav.navigate).toHaveBeenLastCalledWith('AddMaterialOrBatchScreen', {
      material,
      mode: 'batch',
      isEdit: true,
      batch: { batch_code: 'x' },
    })
    act(() => result.current.handleDeleteBatch({ batch_code: 'x' } as any))
    act(() => result.current.handleDeleteBatch({} as any))
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'removeBatch',
      payload: { materialId: 3, batchCode: 'x' },
    })
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'removeBatch',
      payload: { materialId: 3, batchCode: '' },
    })

    const plain = setup({ id: 4, name: 'P', is_managed_in_batch: false })
    act(() => plain.result.current.handleAddBatch())
    expect(plain.nav.navigate).toHaveBeenLastCalledWith(
      'AddMaterialOrBatchScreen',
      expect.objectContaining({ mode: 'non-batch' })
    )
    act(() => plain.result.current.handleEditBatch({} as any))
    expect(plain.nav.navigate).toHaveBeenLastCalledWith(
      'AddMaterialOrBatchScreen',
      expect.objectContaining({ mode: 'non-batch', isEdit: true })
    )
  })

  it('back hardware: batch kosong menghapus material, lalu ke CreateTicket', () => {
    const material = { id: 3, name: 'B', is_managed_in_batch: true }
    mockMaterials = [{ ...material, batches: [] }]
    const { nav } = setup(material)
    let handled: any
    act(() => {
      handled = backCb()
    })
    expect(handled).toBe(true)
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'remove', payload: 3 })
    expect(nav.navigate).toHaveBeenCalledWith('CreateTicket', { section: 2 })
  })

  it('back: batch berisi tidak dihapus; non-batch tanpa nama/qty dihapus', () => {
    const batch = { id: 3, name: 'B', is_managed_in_batch: true }
    mockMaterials = [{ ...batch, batches: [{ batch_code: 'a' }] }]
    setup(batch)
    act(() => backCb())
    expect(mockDispatch).not.toHaveBeenCalledWith(
      expect.objectContaining({ type: 'remove' })
    )

    mockWatched = { qty: 5 }
    const ok = { id: 5, name: 'Ok', is_managed_in_batch: false }
    mockMaterials = [ok]
    setup(ok)
    act(() => backCb())
    expect(mockDispatch).not.toHaveBeenCalledWith(
      expect.objectContaining({ type: 'remove' })
    )

    mockWatched = { qty: 0 }
    const blank = { id: 6, name: '  ', is_managed_in_batch: false }
    mockMaterials = [blank]
    setup(blank)
    act(() => backCb())
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'remove', payload: 6 })
  })

  it('non-batch dengan nama ada tapi qty nol juga dihapus; nama kosong (undefined)', () => {
    mockWatched = { qty: 0 }
    const m = { id: 7, name: 'Ada', is_managed_in_batch: false }
    mockMaterials = [m]
    setup(m)
    act(() => backCb())
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'remove', payload: 7 })
    const n = { id: 8, is_managed_in_batch: false } as any
    mockMaterials = [n]
    setup(n)
    act(() => backCb())
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'remove', payload: 8 })
  })

  it('goBack navigasi dioverride dan dikembalikan saat unmount', () => {
    const material = { id: 9, name: 'N', is_managed_in_batch: false }
    mockMaterials = [material]
    const nav = makeNav()
    const original = nav.goBack
    const { unmount } = setup(material, nav)
    expect(nav.goBack).not.toBe(original)
    act(() => nav.goBack())
    expect(nav.navigate).toHaveBeenCalledWith('CreateTicket', { section: 2 })
    unmount()
    expect(nav.goBack).toBe(original)
    expect(removeSpy).toHaveBeenCalled()
  })

  it('simpan batch: qty dijumlah dan alasan dikosongkan', () => {
    const material = { id: 3, name: 'B', is_managed_in_batch: true }
    mockMaterials = [
      {
        ...material,
        batches: [{ batch_code: 'a', qty: 2 }, { batch_code: 'b' }],
      },
    ]
    const { result, nav } = setup(material)
    act(() => result.current.handleSaveMaterial())
    const saved = mockDispatch.mock.calls.at(-1)[0].payload
    expect(saved).toMatchObject({
      qty: 2,
      reason: undefined,
      detail_reason: undefined,
    })
    expect(nav.navigate).toHaveBeenCalledWith('CreateTicket', { section: 2 })
  })

  it('simpan batch tanpa batches memakai array kosong', () => {
    const material = { id: 3, name: 'B', is_managed_in_batch: true }
    mockMaterials = [{ ...material }]
    const { result } = setup(material)
    act(() => result.current.handleSaveMaterial())
    expect(mockDispatch.mock.calls.at(-1)[0].payload).toMatchObject({
      qty: 0,
      batches: [],
    })
  })

  it('simpan non-batch: qty bukan nol disimpan, qty nol hanya navigasi', () => {
    const material = { id: 5, name: 'N', is_managed_in_batch: false }
    mockMaterials = [material]
    mockWatched = { qty: 4, reason: 'r', detail_reason: 'd' }
    const a = setup(material)
    jest.clearAllMocks()
    act(() => a.result.current.handleSaveMaterial())
    expect(mockDispatch.mock.calls.at(-1)[0].payload).toMatchObject({
      qty: 4,
      reason: 'r',
      detail_reason: 'd',
      batches: [],
    })

    mockWatched = { qty: 0 }
    const b = setup(material)
    jest.clearAllMocks()
    act(() => b.result.current.handleSaveMaterial())
    expect(mockDispatch).not.toHaveBeenCalled()
    expect(b.nav.navigate).toHaveBeenCalledWith('CreateTicket', { section: 2 })
  })

  it('simpan tanpa material di store hanya navigasi', () => {
    const { result, nav } = setup({
      id: 99,
      name: 'x',
      is_managed_in_batch: false,
    })
    jest.clearAllMocks()
    act(() => result.current.handleSaveMaterial())
    expect(mockDispatch).not.toHaveBeenCalled()
    expect(nav.navigate).toHaveBeenCalledWith('CreateTicket', { section: 2 })
  })
})
