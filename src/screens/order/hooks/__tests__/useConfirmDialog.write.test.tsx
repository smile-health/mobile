const mockDispatch = jest.fn()
let mockStoreIgnore = false
let mockBeforeRemove: any
const mockUnsub = jest.fn()
const mockNav: any = { addListener: jest.fn(), goBack: jest.fn() }

jest.mock('@react-navigation/native', () => ({ useNavigation: () => mockNav }))
jest.mock('@/services/features/ticketReason.slice', () => ({
  removeTicketMaterial: (p: any) => ({ type: 'remove', payload: p }),
  setIgnoreConfirm: (p: any) => ({ type: 'ignore', payload: p }),
}))
jest.mock('@/services/store', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (sel: any) =>
    sel({ ticketReason: { ignoreConfirm: mockStoreIgnore } }),
}))

import { BackHandler } from 'react-native'
import { act, renderHook } from '@testing-library/react-native'
import { useConfirmDialog } from '../useConfirmDialog'

let hwBack: any
const hwRemove = jest.fn()

beforeEach(() => {
  jest.clearAllMocks()
  mockStoreIgnore = false
  mockNav.addListener.mockImplementation((_e: string, cb: any) => {
    mockBeforeRemove = cb
    return mockUnsub
  })
  jest.spyOn(BackHandler, 'addEventListener').mockImplementation(((
    _e: any,
    cb: any
  ) => {
    hwBack = cb
    return { remove: hwRemove }
  }) as any)
})

describe('useConfirmDialog', () => {
  it('langkah pertama dan kotor: tampilkan dialog dan tahan navigasi', async () => {
    const { result } = await renderHook(() =>
      useConfirmDialog({ isDirty: true })
    )
    const e = { preventDefault: jest.fn() }
    await act(() => mockBeforeRemove(e))
    expect(e.preventDefault).toHaveBeenCalled()
    expect(result.current.showConfirm).toBe(true)
    await act(() => result.current.handleCancelLeave())
    expect(result.current.showConfirm).toBe(false)
  })

  it('tidak kotor atau ignore store: back diteruskan', async () => {
    const clean = await renderHook(() => useConfirmDialog({ isDirty: false }))
    const e = { preventDefault: jest.fn() }
    await act(() => mockBeforeRemove(e))
    expect(e.preventDefault).not.toHaveBeenCalled()
    expect(clean.result.current.showConfirm).toBe(false)

    mockStoreIgnore = true
    const ignored = await renderHook(() => useConfirmDialog({ isDirty: true }))
    let handled: any
    await act(() => {
      handled = hwBack()
    })
    expect(handled).toBe(false)
    expect(ignored.result.current.showConfirm).toBe(false)
  })

  it('multi-langkah: langkah pertama tidak menahan; langkah lanjut menahan bila kotor', async () => {
    const first = await renderHook(() =>
      useConfirmDialog({ isDirty: true, totalSteps: 3, currentStep: 1 })
    )
    let r: any
    await act(() => {
      r = first.result.current.handleBackPress()
    })
    expect(r).toBe(false)

    const later = await renderHook(() =>
      useConfirmDialog({ isDirty: true, totalSteps: 3, currentStep: 2 })
    )
    await act(() => {
      r = later.result.current.handleBackPress()
    })
    expect(r).toBe(true)
    expect(later.result.current.showConfirm).toBe(true)
  })

  it('langkah lanjut bersih: clearDataOnBack dipanggil', async () => {
    const clearDataOnBack = jest.fn()
    const { result } = await renderHook(() =>
      useConfirmDialog({
        isDirty: false,
        totalSteps: 3,
        currentStep: 2,
        clearDataOnBack,
      })
    )
    let r: any
    await act(() => {
      r = result.current.handleBackPress()
    })
    expect(r).toBe(false)
    expect(clearDataOnBack).toHaveBeenCalled()
    const noCb = await renderHook(() =>
      useConfirmDialog({ isDirty: false, totalSteps: 3, currentStep: 2 })
    )
    await act(() => {
      r = noCb.result.current.handleBackPress()
    })
    expect(r).toBe(false)
  })

  it('langkah di luar rentang: tidak menahan', async () => {
    const { result } = await renderHook(() =>
      useConfirmDialog({ isDirty: true, currentStep: 5, totalSteps: 2 })
    )
    let r: any
    await act(() => {
      r = result.current.handleBackPress()
    })
    expect(r).toBe(false)
  })

  it('customBackAction diprioritaskan', async () => {
    const customBackAction = jest.fn(() => true)
    const { result } = await renderHook(() =>
      useConfirmDialog({ isDirty: false, customBackAction })
    )
    let r: any
    await act(() => {
      r = result.current.handleBackPress()
    })
    expect(r).toBe(true)
  })

  it('layar batch: material tidak lengkap dihapus saat back tanpa perubahan', async () => {
    const material: any = { id: 7, name: 'M', batches: [] }
    await renderHook(() =>
      useConfirmDialog({ isDirty: false, isBatchScreen: true, material })
    )
    await act(() => {
      hwBack()
    })
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'remove', payload: 7 })
  })

  it('layar batch: nama kosong dihapus; lengkap tidak; tanpa material tidak', async () => {
    const noName = await renderHook(() =>
      useConfirmDialog({
        isDirty: false,
        isBatchScreen: true,
        material: { id: 1, name: ' ', batches: [{}] } as any,
      })
    )
    let r: any
    await act(() => {
      r = noName.result.current.checkAndRemoveIncompleteMaterial()
    })
    expect(r).toBe(true)
    jest.clearAllMocks()
    const full = await renderHook(() =>
      useConfirmDialog({
        isDirty: false,
        isBatchScreen: true,
        material: { id: 2, name: 'ok', batches: [{}] } as any,
      })
    )
    await act(() => {
      r = full.result.current.checkAndRemoveIncompleteMaterial()
    })
    expect(r).toBe(false)
    const none = await renderHook(() =>
      useConfirmDialog({ isDirty: false, isBatchScreen: true })
    )
    await act(() => {
      r = none.result.current.checkAndRemoveIncompleteMaterial()
    })
    expect(r).toBe(false)
    expect(mockDispatch).not.toHaveBeenCalled()
  })

  it('ignoreConfirm prop menyalakan ignore di store saat mount', async () => {
    await renderHook(() =>
      useConfirmDialog({ isDirty: false, ignoreConfirm: true })
    )
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'ignore', payload: true })
  })

  it('konfirmasi keluar: ignore, onConfirm, lepas listener, goBack', async () => {
    const onConfirm = jest.fn()
    const { result } = await renderHook(() =>
      useConfirmDialog({ isDirty: true, onConfirm })
    )
    await act(() => result.current.handleConfirmLeave())
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'ignore', payload: true })
    expect(onConfirm).toHaveBeenCalled()
    expect(mockUnsub).toHaveBeenCalled()
    expect(hwRemove).toHaveBeenCalled()
    expect(mockNav.goBack).toHaveBeenCalled()
  })

  it('konfirmasi keluar tanpa onConfirm dan removeAllListeners dua kali aman', async () => {
    const { result } = await renderHook(() =>
      useConfirmDialog({ isDirty: true })
    )
    await act(() => result.current.handleConfirmLeave())
    await act(() => result.current.removeAllListeners())
    expect(mockNav.goBack).toHaveBeenCalledTimes(1)
  })
})
