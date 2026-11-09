const mockNavigate = jest.fn()
const mockDispatch = jest.fn()
const mockHook: any = {}
let mockLatest: any = {}

jest.mock('@react-navigation/native', () => ({ useNavigation: () => ({ navigate: mockNavigate }) }))
jest.mock('@/i18n/useLanguage', () => ({ useLanguage: () => ({ t: (k: string) => k }) }))
jest.mock('@/services/features', () => ({ getReasons: 'getReasons' }))
jest.mock('@/services/features/ticketReason.slice', () => ({
  setIgnoreConfirm: (v: boolean) => ({ type: 'ignore', payload: v }),
}))
jest.mock('@/services/store', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: () => [{ value: 1 }],
}))
jest.mock('../../hooks/useTicketDetail', () => ({
  useTicketDetail: () => mockHook,
  mapItemsToTicketMaterials: (items: any[]) => items.map((i) => ({ id: i.id })),
}))
jest.mock('../components/TicketCommentSection', () => {
  const { Text } = require('react-native')
  return { TicketCommentSection: ({ comments }: any) => <Text>comments:{comments.length}</Text> }
})
jest.mock('../../component/ticket/ReviewTicketItem', () => {
  const { Text } = require('react-native')
  return { __esModule: true, default: ({ item }: any) => <Text>item-{item.id}</Text> }
})
jest.mock('../../component/ticket/TicketDetailHeader', () => {
  const { Text } = require('react-native')
  return {
    __esModule: true,
    default: (p: any) => {
      mockLatest.header = p
      return <Text>header</Text>
    },
  }
})
jest.mock('@/components/LoadingDialog', () => {
  const { Text } = require('react-native')
  return { __esModule: true, default: ({ modalVisible }: any) => <Text>loading:{String(modalVisible)}</Text> }
})
jest.mock('@/components/buttons', () => {
  const { Pressable, Text } = require('react-native')
  return { Button: ({ text, onPress }: any) => <Pressable onPress={onPress}><Text>{text}</Text></Pressable> }
})
jest.mock('@/components/dialog/ConfirmationDialog', () => {
  const { Pressable, Text } = require('react-native')
  return {
    ConfirmationDialog: ({ modalVisible: visible, onConfirm, onCancel, dismissDialog }: any) =>
      visible ? (
        <>
          <Pressable onPress={onConfirm}><Text>dialog-ok</Text></Pressable>
          <Pressable onPress={onCancel ?? dismissDialog}><Text>dialog-cancel</Text></Pressable>
        </>
      ) : null,
  }
})

import React from 'react'
import { fireEvent, render } from '@testing-library/react-native'
import TicketDetailScreen from '../TicketDetailScreen'

const setHook = (over: any = {}) => {
  Object.keys(mockHook).forEach((k) => delete mockHook[k])
  Object.assign(mockHook, {
    ticketDetail: { items: [{ id: 1 }, { id: 2 }], comments: [{}, {}] },
    isLoading: false,
    isUpdating: false,
    refetch: jest.fn(),
    handleViewOrderDetail: jest.fn(),
    handleViewPackingSlip: jest.fn(),
    handleChangeStatus: jest.fn(),
    buttonVisibility: { showCancel: true, showComplete: true },
    ...over,
  })
}
const route: any = { params: { id: 12 } }

beforeEach(() => {
  jest.clearAllMocks()
  mockLatest = {}
  setHook()
})

describe('TicketDetailScreen', () => {
  it('render header, item, komentar dan refetch saat mount', () => {
    const { getByText } = render(<TicketDetailScreen route={route} navigation={{} as any} />)
    getByText('header')
    getByText('item-1')
    getByText('item-2')
    getByText('comments:2')
    expect(mockHook.refetch).toHaveBeenCalled()
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'ignore', payload: true })
  })

  it('batalkan tiket menavigasi ke CancelReport', () => {
    const { getByText } = render(<TicketDetailScreen route={route} navigation={{} as any} />)
    fireEvent.press(getByText('button.cancel_ticket'))
    expect(mockNavigate).toHaveBeenCalledWith('CancelReport', { ticketId: 12 })
  })

  it('selesaikan tiket: dialog konfirmasi lalu ubah status', () => {
    const { getByText, queryByText } = render(<TicketDetailScreen route={route} navigation={{} as any} />)
    expect(queryByText('dialog-ok')).toBeNull()
    fireEvent.press(getByText('button.complete_ticket'))
    fireEvent.press(getByText('dialog-ok'))
    expect(mockHook.handleChangeStatus).toHaveBeenCalled()
    expect(queryByText('dialog-ok')).toBeNull()
  })

  it('tutup dialog tanpa konfirmasi', () => {
    const { getByText, queryByText } = render(<TicketDetailScreen route={route} navigation={{} as any} />)
    fireEvent.press(getByText('button.complete_ticket'))
    fireEvent.press(getByText('dialog-cancel'))
    expect(queryByText('dialog-ok')).toBeNull()
    expect(mockHook.handleChangeStatus).not.toHaveBeenCalled()
  })

  it('tanpa tombol bila tidak ada aksi yang diizinkan', () => {
    setHook({ buttonVisibility: { showCancel: false, showComplete: false } })
    const { queryByText } = render(<TicketDetailScreen route={route} navigation={{} as any} />)
    expect(queryByText('button.cancel_ticket')).toBeNull()
    expect(queryByText('button.complete_ticket')).toBeNull()
  })

  it('hanya tombol batal bila tidak boleh selesai', () => {
    setHook({ buttonVisibility: { showCancel: true, showComplete: false } })
    const { queryByText } = render(<TicketDetailScreen route={route} navigation={{} as any} />)
    expect(queryByText('button.cancel_ticket')).not.toBeNull()
    expect(queryByText('button.complete_ticket')).toBeNull()
  })

  it('tanpa ticketDetail: tidak ada header dan loading terlihat', () => {
    setHook({ ticketDetail: undefined, isLoading: true })
    const { queryByText, getByText } = render(<TicketDetailScreen route={route} navigation={{} as any} />)
    expect(queryByText('header')).toBeNull()
    getByText('loading:true')
  })

  it('komentar kosong bila comments tidak ada; header meneruskan handler', () => {
    setHook({ ticketDetail: { items: [] } })
    const { getByText } = render(<TicketDetailScreen route={route} navigation={{} as any} />)
    getByText('comments:0')
    mockLatest.header.onViewOrderDetail()
    mockLatest.header.onViewPackingSlip()
    expect(mockHook.handleViewOrderDetail).toHaveBeenCalled()
    expect(mockHook.handleViewPackingSlip).toHaveBeenCalled()
  })

  it('unmount mengembalikan ignoreConfirm=false', () => {
    const { unmount } = render(<TicketDetailScreen route={route} navigation={{} as any} />)
    unmount()
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'ignore', payload: false })
  })
})
