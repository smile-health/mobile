let mockHook: any
let mockBaseForm: any
const mockDispatch = jest.fn()

jest.mock('@react-navigation/native', () => {
  const React = require('react')
  return { useFocusEffect: (cb: any) => React.useEffect(cb, [cb]) }
})
jest.mock('@/i18n/useLanguage', () => ({
  useLanguage: () => ({ t: (k: string) => k }),
}))
jest.mock('@/services/features/ticketReason.slice', () => ({
  setIgnoreConfirm: (v: boolean) => ({ type: 'ignore', payload: v }),
}))
jest.mock('@/services/store', () => ({ useAppDispatch: () => mockDispatch }))
jest.mock('@/components/buttons', () => {
  const { Pressable, Text } = require('react-native')
  return {
    Button: ({ text, onPress, disabled }: any) => (
      <Pressable onPress={onPress}>
        <Text>{`${text}${disabled ? ':disabled' : ''}`}</Text>
      </Pressable>
    ),
  }
})
jest.mock('@/screens/order/component/BatchItemCard', () => {
  const { Pressable, Text } = require('react-native')
  return {
    __esModule: true,
    default: ({ batch, onEdit, onDelete }: any) => (
      <>
        <Pressable onPress={onEdit}>
          <Text>edit-{batch.batch_code}</Text>
        </Pressable>
        <Pressable onPress={onDelete}>
          <Text>del-{batch.batch_code}</Text>
        </Pressable>
      </>
    ),
  }
})
jest.mock('@/screens/order/ticket/hooks/useTicketMaterialDetail', () => ({
  useTicketMaterialDetail: () => mockHook,
}))
jest.mock('@/screens/shared/component/BaseForm', () => ({
  BaseForm: (p: any) => {
    mockBaseForm = p
    return null
  },
}))

import React from 'react'
import { fireEvent, render } from '@testing-library/react-native'
import TicketMaterialDetailScreen from '../TicketMaterialDetailScreen'

const makeHook = (over: any = {}) => ({
  currentMaterial: { batches: [{ batch_code: 'A' }] },
  fieldConfigs: { reasonField: { name: 'reason' } },
  QUANTITY_FIELD_CONFIG: { name: 'qty' },
  control: {},
  getFieldError: { qty: 'err' },
  isButtonDisabled: false,
  handleAddBatch: jest.fn(),
  handleEditBatch: jest.fn(),
  handleDeleteBatch: jest.fn(),
  handleSaveMaterial: jest.fn(),
  ...over,
})
const renderScreen = async (material: any) =>
  await render(
    <TicketMaterialDetailScreen
      route={{ params: { material } } as any}
      navigation={{} as any}
    />
  )

beforeEach(() => {
  jest.clearAllMocks()
  mockHook = makeHook()
})

describe('TicketMaterialDetailScreen', () => {
  it('non-batch: BaseForm menerima konfigurasi dan error', async () => {
    const { getByText } = await renderScreen({
      id: 1,
      name: 'Mat',
      is_managed_in_batch: false,
    })
    getByText('Mat')
    expect(mockBaseForm.quantityField.name).toBe('qty')
    expect(mockBaseForm.errors).toEqual({ qty: 'err' })
    expect(mockBaseForm.reasonField.name).toBe('reason')
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'ignore',
      payload: false,
    })
  })

  it('batch: daftar batch dengan edit, hapus, dan tambah batch', async () => {
    const { getByText } = await renderScreen({
      id: 1,
      name: 'Mat',
      is_managed_in_batch: true,
      isSubmitted: 0,
    })
    await fireEvent.press(getByText('edit-A'))
    await fireEvent.press(getByText('del-A'))
    await fireEvent.press(getByText('+ ticket.add_batch'))
    expect(mockHook.handleEditBatch).toHaveBeenCalledWith({ batch_code: 'A' })
    expect(mockHook.handleDeleteBatch).toHaveBeenCalledWith({ batch_code: 'A' })
    expect(mockHook.handleAddBatch).toHaveBeenCalled()
  })

  it('simpan dan status nonaktif', async () => {
    mockHook = makeHook({ isButtonDisabled: true })
    const { getByText } = await renderScreen({
      id: 1,
      name: 'Mat',
      is_managed_in_batch: false,
    })
    await fireEvent.press(getByText('button.save:disabled'))
    expect(mockHook.handleSaveMaterial).toHaveBeenCalled()
  })

  it('currentMaterial tanpa batches aman pada mode batch', async () => {
    mockHook = makeHook({ currentMaterial: undefined })
    const { queryByText } = await renderScreen({
      id: 1,
      name: 'Mat',
      is_managed_in_batch: true,
    })
    expect(queryByText(/edit-/)).toBeNull()
  })
})
