let mockHook: any
let mockToolbar: any

jest.mock('@react-navigation/native', () => {
  const React = require('react')
  return {
    useFocusEffect: (cb: any) => React.useEffect(cb, [cb]),
    createNavigationContainerRef: () => ({ isReady: () => false }),
    CommonActions: {},
    StackActions: {},
  }
})
jest.mock('@/i18n/useLanguage', () => ({
  useLanguage: () => ({
    t: (k: string, o?: any) => (o ? `${k}:${o.count}` : k),
  }),
}))
jest.mock('@/components/toolbar/hooks/useToolbar', () => ({
  useToolbar: (p: any) => {
    mockToolbar = p
  },
}))
jest.mock('@/components/toolbar/actions/RefreshHomeAction', () => ({
  RefreshHomeAction: () => null,
}))
jest.mock('@/components/LoadingDialog', () => {
  const { Text } = require('react-native')
  return {
    __esModule: true,
    default: ({ modalVisible }: any) => (
      <Text>loading:{String(modalVisible)}</Text>
    ),
  }
})
jest.mock('@/components/buttons', () => {
  const { Pressable, Text } = require('react-native')
  return {
    Button: ({ text, onPress }: any) => (
      <Pressable onPress={onPress}>
        <Text>{text}</Text>
      </Pressable>
    ),
  }
})
jest.mock('../hooks/useOrderDetail', () => ({ useOrderDetail: () => mockHook }))
jest.mock('../component/detail/WarningBox', () => {
  const { Text } = require('react-native')
  return { __esModule: true, default: ({ title }: any) => <Text>{title}</Text> }
})
jest.mock('../component/detail', () => {
  const { Pressable, Text } = require('react-native')
  return {
    OrderInformation: () => <Text>info</Text>,
    OrderCommentItem: ({ data }: any) => <Text>comment-{data.id}</Text>,
    OrderDetailItem: ({ data, onPress }: any) => (
      <Pressable onPress={() => onPress(data)}>
        <Text>item-{data.id}</Text>
      </Pressable>
    ),
  }
})

import React from 'react'
import { fireEvent, render } from '@testing-library/react-native'
import OrderDetailScreen from '../OrderDetailScreen'

const makeHook = (over: any = {}) => ({
  SECTION_DATA: [
    { key: 'items', title: 'sec.items', data: [{ id: 1 }, { id: 2 }] },
    { key: 'comment', title: 'sec.comment', data: [{ id: 9 }] },
    { key: 'other', title: 'sec.other', data: [{ id: 5 }] },
  ],
  handleAddItem: jest.fn(),
  handleOrderDetailItem: jest.fn(),
  statusName: 'Pending',
  statusStyle: { background: 'bg', text: 'tx' },
  shouldShowAddItemButton: true,
  isVendor: true,
  isCustomer: false,
  orderDetailData: {
    status: 1,
    activity: { name: 'Act' },
    updated_at: '2025-01-01T00:00:00Z',
  },
  refetchOrderDetail: jest.fn(),
  FooterActionButtons: null,
  shouldShowLoading: false,
  isMaterialHierarchy: false,
  ...over,
})
const renderScreen = (type: any = 1) =>
  render(
    <OrderDetailScreen
      route={{ params: { id: 4, type } } as any}
      navigation={{} as any}
    />
  )

beforeEach(() => {
  mockHook = makeHook()
})

describe('OrderDetailScreen', () => {
  it('render header, item, komentar, tombol tambah item; refetch saat fokus', () => {
    const { getByText, queryByText } = renderScreen()
    getByText('info')
    getByText('item-1')
    getByText('comment-9')
    getByText('label.count_items:2')
    getByText(' (1)')
    getByText('Act')
    getByText('Pending')
    expect(queryByText(/other|-5/)).toBeNull()
    expect(mockHook.refetchOrderDetail).toHaveBeenCalled()
    expect(mockToolbar.title).toBe('order.type.request')
  })

  it('tombol tambah item dan tekan item memanggil handler', () => {
    const { getByText } = renderScreen()
    fireEvent.press(getByText('button.add_item'))
    expect(mockHook.handleAddItem).toHaveBeenCalled()
    fireEvent.press(getByText('item-2'))
    expect(mockHook.handleOrderDetailItem).toHaveBeenCalledWith({ id: 2 })
  })

  it('tanpa tombol tambah dan tipe tidak dikenal memakai judul default', () => {
    mockHook = makeHook({ shouldShowAddItemButton: false })
    const { queryByText } = renderScreen(99)
    expect(queryByText('button.add_item')).toBeNull()
    expect(mockToolbar.title).toBe('order.service.regular')
  })

  it('tanpa data order: header kosong dan section kosong aman', () => {
    mockHook = makeHook({
      orderDetailData: undefined,
      SECTION_DATA: undefined,
      shouldShowLoading: true,
    })
    const { queryByText, getByText } = renderScreen()
    expect(queryByText('info')).toBeNull()
    getByText('loading:true')
  })

  it('footer peringatan untuk customer saat order shipped', () => {
    mockHook = makeHook({
      isCustomer: true,
      orderDetailData: { status: 4, activity: {}, updated_at: null },
    })
    const { getByText } = renderScreen()
    getByText('order.accept_warning_title')
  })

  it('refresh dari toolbar memanggil refetch', () => {
    renderScreen()
    mockToolbar.actions.props.onRefresh()
    expect(mockHook.refetchOrderDetail.mock.calls.length).toBeGreaterThan(1)
  })
})
