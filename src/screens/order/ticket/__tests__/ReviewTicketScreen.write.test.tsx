let mockHook: any
let mockSel: any
let mockControllerValue = false
const mockOnChange = jest.fn()

jest.mock('@/i18n/useLanguage', () => ({
  useLanguage: () => ({ t: (k: string) => k }),
}))
jest.mock('@/services/features/ticketReason.slice', () => ({
  getTicketMaterials: 'materials',
  getTicketFormData: 'formData',
  getReasons: 'reasons',
}))
jest.mock('@/services/store', () => ({
  useAppSelector: (s: string) => mockSel[s],
}))
jest.mock('../../hooks/useReviewTicket', () => ({
  useReviewTicket: () => mockHook,
}))
jest.mock('react-hook-form', () => ({
  Controller: ({ render }: any) =>
    render({ field: { onChange: mockOnChange, value: mockControllerValue } }),
}))
jest.mock('@/components/buttons', () => {
  const { Pressable, Text } = require('react-native')
  return {
    Button: ({ text, onPress }: any) => (
      <Pressable onPress={onPress}>
        <Text>{text}</Text>
      </Pressable>
    ),
    CheckBox: ({ text, onPress }: any) => (
      <Pressable onPress={onPress}>
        <Text>{text}</Text>
      </Pressable>
    ),
  }
})
jest.mock('@/components/dialog/ConfirmationDialog', () => {
  const { Pressable, Text } = require('react-native')
  return {
    ConfirmationDialog: ({
      modalVisible,
      title,
      onConfirm,
      onCancel,
      dismissDialog,
    }: any) =>
      modalVisible ? (
        <>
          <Pressable onPress={onConfirm}>
            <Text>{`ok:${title}`}</Text>
          </Pressable>
          <Pressable onPress={onCancel}>
            <Text>{`cancel:${title}`}</Text>
          </Pressable>
          <Pressable onPress={dismissDialog}>
            <Text>{`dismiss:${title}`}</Text>
          </Pressable>
        </>
      ) : null,
  }
})
jest.mock('@/components/LoadingDialog', () => {
  const { Text } = require('react-native')
  return {
    __esModule: true,
    default: ({ modalVisible }: any) => (
      <Text>loading:{String(modalVisible)}</Text>
    ),
  }
})
jest.mock('../../component/section/OrderCommentSection', () => {
  const { Text } = require('react-native')
  return { __esModule: true, default: () => <Text>comment-section</Text> }
})
jest.mock('../../component/ticket/ReviewTicketHeader', () => {
  const { Text } = require('react-native')
  return { __esModule: true, default: () => <Text>review-header</Text> }
})
jest.mock('../../component/ticket/ReviewTicketItem', () => {
  const { Pressable, Text } = require('react-native')
  return {
    __esModule: true,
    default: ({ item, handleDelete }: any) => (
      <Pressable onPress={() => handleDelete(item)}>
        <Text>item-{item.id}</Text>
      </Pressable>
    ),
  }
})

import React from 'react'
import { fireEvent, render } from '@testing-library/react-native'
import ReviewTicketScreen from '../ReviewTicketScreen'

const makeHook = (over: any = {}) => ({
  isLoading: false,
  showConfirm: false,
  setShowConfirm: jest.fn(),
  showDeleteAllConfirm: false,
  setShowDeleteAllConfirm: jest.fn(),
  handleDeleteMaterial: jest.fn(),
  handleDeleteAll: jest.fn(),
  confirmDeleteAll: jest.fn(),
  onSend: jest.fn(),
  control: {},
  errors: {},
  requestCancelValue: false,
  ...over,
})

beforeEach(() => {
  jest.clearAllMocks()
  mockControllerValue = false
  mockSel = {
    materials: [{ id: 1 }, { id: 2 }],
    formData: { isSubmitted: 0 },
    reasons: [],
  }
  mockHook = makeHook()
})

describe('ReviewTicketScreen', () => {
  it('render header, item, komentar; tanpa checkbox bila belum ada order', () => {
    const { getByText, queryByText } = render(<ReviewTicketScreen />)
    getByText('review-header')
    getByText('item-1')
    getByText('comment-section')
    expect(queryByText('label.request_to_cancel_the_order')).toBeNull()
  })

  it('hapus material dari item', () => {
    const { getByText } = render(<ReviewTicketScreen />)
    fireEvent.press(getByText('item-2'))
    expect(mockHook.handleDeleteMaterial).toHaveBeenCalledWith({ id: 2 })
  })

  it('tombol hapus semua dan kirim', () => {
    const { getByText } = render(<ReviewTicketScreen />)
    fireEvent.press(getByText('button.delete_all'))
    expect(mockHook.handleDeleteAll).toHaveBeenCalled()
    fireEvent.press(getByText('button.send'))
    expect(mockHook.setShowConfirm).toHaveBeenCalledWith(true)
  })

  it('dialog kirim: konfirmasi, batal, dismiss', () => {
    mockHook = makeHook({ showConfirm: true })
    const { getByText } = render(<ReviewTicketScreen />)
    fireEvent.press(getByText('ok:dialog.confirm_send_ticket'))
    expect(mockHook.onSend).toHaveBeenCalled()
    fireEvent.press(getByText('cancel:dialog.confirm_send_ticket'))
    fireEvent.press(getByText('dismiss:dialog.confirm_send_ticket'))
    expect(mockHook.setShowConfirm).toHaveBeenCalledTimes(2)
    expect(mockHook.setShowConfirm).toHaveBeenCalledWith(false)
  })

  it('dialog hapus semua: konfirmasi, batal, dismiss', () => {
    mockHook = makeHook({ showDeleteAllConfirm: true, isLoading: true })
    const { getByText } = render(<ReviewTicketScreen />)
    fireEvent.press(getByText('ok:dialog.confirm_delete_all_materials'))
    expect(mockHook.confirmDeleteAll).toHaveBeenCalled()
    fireEvent.press(getByText('cancel:dialog.confirm_delete_all_materials'))
    fireEvent.press(getByText('dismiss:dialog.confirm_delete_all_materials'))
    expect(mockHook.setShowDeleteAllConfirm).toHaveBeenCalledTimes(2)
    getByText('loading:true')
  })

  it('tiket terkirim: checkbox request cancel dan pesan wajib saat belum dicentang', () => {
    mockSel.formData = { isSubmitted: 1 }
    const { getByText } = render(<ReviewTicketScreen />)
    getByText('validation.required')
    fireEvent.press(getByText('label.request_to_cancel_the_order'))
    expect(mockOnChange).toHaveBeenCalledWith(true)
  })

  it('tiket terkirim dan sudah dicentang: tanpa pesan error', () => {
    mockSel.formData = { isSubmitted: 1 }
    mockHook = makeHook({ requestCancelValue: true })
    mockControllerValue = true
    const { queryByText, getByText } = render(<ReviewTicketScreen />)
    expect(queryByText('validation.required')).toBeNull()
    fireEvent.press(getByText('label.request_to_cancel_the_order'))
    expect(mockOnChange).toHaveBeenCalledWith(false)
  })
})
