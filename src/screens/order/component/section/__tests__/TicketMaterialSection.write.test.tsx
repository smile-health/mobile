const mockNavigate = jest.fn()
const mockDispatch = jest.fn()
let mockTicketMaterials: any[] = []
let mockPickerProps: any = {}

jest.mock('@react-navigation/native', () => {
  const React = require('react')
  return {
    useNavigation: () => ({ navigate: mockNavigate }),
    useFocusEffect: (cb: any) => React.useEffect(cb, [cb]),
  }
})
jest.mock('@/services/features/ticketReason.slice', () => ({
  getTicketMaterials: 'getTicketMaterials',
  removeTicketMaterial: (id: any) => ({ type: 'remove', payload: id }),
}))
jest.mock('@/services/store', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: () => mockTicketMaterials,
}))
jest.mock('@/utils/helpers/MaterialHelpers', () => ({
  isNewMaterial: (id: any) => String(id).startsWith('new'),
}))
jest.mock('@/components/bottomsheet/PickerSelectBottomSheet', () => {
  return {
    __esModule: true,
    default: (p: any) => {
      mockPickerProps = p
      const { Text } = require('react-native')
      return <Text>picker-open</Text>
    },
  }
})
jest.mock('../../ticket/TicketMaterialItem', () => {
  const { Pressable, Text } = require('react-native')
  return {
    __esModule: true,
    default: ({ item, handlePress }: any) => (
      <Pressable onPress={handlePress}><Text>row-{item.id}</Text></Pressable>
    ),
  }
})
jest.mock('../../detail/WarningBox', () => ({ __esModule: true, default: () => null }))
jest.mock('@/components/EmptyState', () => {
  const { Text } = require('react-native')
  return { __esModule: true, default: () => <Text>empty</Text> }
})

import React from 'react'
import { act, fireEvent, render } from '@testing-library/react-native'
import TicketMaterialSection from '../TicketMaterialSection'

const t: any = (k: string) => k
const materials: any = [{ label: 'Mat', value: 5, isBatch: true }]

beforeEach(() => {
  jest.clearAllMocks()
  mockTicketMaterials = []
  mockPickerProps = {}
})

describe('TicketMaterialSection', () => {
  it('kosong: tampil empty state dan tombol tambah di header', () => {
    const { getByText } = render(<TicketMaterialSection t={t} materials={materials} />)
    getByText('empty')
    getByText('ticket.add_material(s)')
  })

  it('membuka picker dan memilih material baru (value 0)', () => {
    const { getByText, queryByText } = render(<TicketMaterialSection t={t} materials={materials} />)
    fireEvent.press(getByText('ticket.add_material(s)'))
    expect(mockPickerProps.isOpen).toBe(true)
    expect(mockPickerProps.data).toHaveLength(2)
    act(() => mockPickerProps.onSelect({ value: 0, label: 'n', isBatch: false }))
    expect(mockNavigate).toHaveBeenCalledWith('TicketingAddNewMaterial')
    expect(queryByText('picker-open')).toBeNull()
  })

  it('memilih material existing menuju detail', () => {
    const { getByText } = render(<TicketMaterialSection t={t} materials={materials} />)
    fireEvent.press(getByText('ticket.add_material(s)'))
    act(() => mockPickerProps.onSelect({ value: 5, label: 'Mat', isBatch: true }))
    expect(mockNavigate).toHaveBeenCalledWith('TicketMaterialDetail', {
      material: { id: 5, name: 'Mat', is_managed_in_batch: true, isSubmitted: 0 },
    })
  })

  it('toggleSheet menutup picker', () => {
    const { getByText, queryByText } = render(<TicketMaterialSection t={t} materials={materials} />)
    fireEvent.press(getByText('ticket.add_material(s)'))
    act(() => mockPickerProps.toggleSheet())
    expect(queryByText('picker-open')).toBeNull()
  })

  it('menekan baris: material baru vs existing, batch vs non-batch', () => {
    mockTicketMaterials = [
      { id: 'new1', name: 'A', qty: 1, is_managed_in_batch: false },
      { id: 7, name: 'B', qty: 1, is_managed_in_batch: true, batches: [{}] },
    ]
    const { getByText } = render(<TicketMaterialSection t={t} materials={materials} />)
    fireEvent.press(getByText('row-new1'))
    expect(mockNavigate).toHaveBeenLastCalledWith('TicketingAddNewMaterial', expect.objectContaining({ mode: 'non-batch', isEdit: true }))
    fireEvent.press(getByText('row-7'))
    expect(mockNavigate).toHaveBeenLastCalledWith('TicketMaterialDetail', expect.objectContaining({ mode: 'batch', isEdit: true }))
    expect(mockDispatch).not.toHaveBeenCalled()
  })

  it('membersihkan material tidak lengkap saat fokus', () => {
    mockTicketMaterials = [
      { id: 1, is_managed_in_batch: true, batches: [] },
      { id: 2, is_managed_in_batch: false, name: '  ', qty: 3 },
      { id: 3, is_managed_in_batch: false, name: 'ok', qty: 0 },
      { id: 4, is_managed_in_batch: false, name: 'ok', qty: 2 },
    ]
    render(<TicketMaterialSection t={t} materials={materials} />)
    expect(mockDispatch.mock.calls.map((c) => c[0].payload)).toEqual([1, 2, 3])
  })
})
