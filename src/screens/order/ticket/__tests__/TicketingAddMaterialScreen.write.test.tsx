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
  getReasons: 'reasons',
  setIgnoreConfirm: (v: boolean) => ({ type: 'ignore', payload: v }),
}))
jest.mock('@/services/store', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: () => [{ value: 'r' }],
}))
jest.mock('@/components/buttons', () => {
  const { Pressable, Text } = require('react-native')
  return {
    Button: ({ text, onPress, disabled }: any) => (
      <Pressable onPress={disabled ? undefined : onPress}>
        <Text>{`${text}${disabled ? ':disabled' : ''}`}</Text>
      </Pressable>
    ),
    RadioButtonGroup: () => <Text>radio</Text>,
  }
})
jest.mock('@/components/forms/TextField', () => ({ TextField: () => null }))
jest.mock('@/screens/shared/component/BaseForm', () => ({
  BaseForm: (p: any) => {
    mockBaseForm = p
    return null
  },
}))
jest.mock('../../component/BatchItemCard', () => {
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
jest.mock('../../helpers/TicketHelpers', () => ({ getRadioOptions: () => [] }))
jest.mock('../../hooks/useTicketingAddMaterials', () => ({
  useTicketingAddMaterials: () => mockHook,
}))

import React from 'react'
import { fireEvent, render } from '@testing-library/react-native'
import TicketingAddMaterialScreen from '../TicketingAddMaterialScreen'

const makeHook = (over: any = {}) => ({
  control: {},
  errors: {},
  isButtonValid: true,
  isBatch: 0,
  detailReasonOptions: [{ value: 'd' }],
  currentMaterial: {
    batches: [{ batch_code: 'A', isSubmitted: 0 }, { batch_code: 'B' }],
  },
  handleSave: jest.fn(),
  handleAddBatch: jest.fn(),
  handleEditBatch: jest.fn(),
  handleDeleteBatch: jest.fn(),
  handleSubmit: jest.fn((fn: any) => () => fn({ ok: 1 })),
  ...over,
})
const renderScreen = async (params: any = {}) =>
  await render(
    <TicketingAddMaterialScreen
      route={{ params } as any}
      navigation={{} as any}
    />
  )

beforeEach(() => {
  jest.clearAllMocks()
  mockHook = makeHook()
})

describe('TicketingAddMaterialScreen', () => {
  it('non-batch: BaseForm dengan opsi alasan dan radio batch ditampilkan tanpa material', async () => {
    const { getByText } = await renderScreen()
    getByText('radio')
    expect(mockBaseForm.reasonField.data).toEqual([{ value: 'r' }])
    expect(mockBaseForm.detailReasonField.data).toEqual([{ value: 'd' }])
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'ignore',
      payload: false,
    })
  })

  it('radio disembunyikan saat mengedit material yang ada', async () => {
    const { queryByText } = await renderScreen({ material: { id: 1 } })
    expect(queryByText('radio')).toBeNull()
  })

  it('route tanpa params aman', async () => {
    const { queryByText } = await render(
      <TicketingAddMaterialScreen route={{} as any} navigation={{} as any} />
    )
    expect(queryByText('radio')).not.toBeNull()
  })

  it('simpan memanggil handleSubmit(handleSave); tombol nonaktif bila tidak valid', async () => {
    const { getByText, rerender } = await renderScreen()
    await fireEvent.press(getByText('button.save'))
    expect(mockHook.handleSave).toHaveBeenCalledWith({ ok: 1 })
    mockHook = makeHook({ isButtonValid: false })
    await rerender(
      <TicketingAddMaterialScreen
        route={{ params: {} } as any}
        navigation={{} as any}
      />
    )
    getByText('button.save:disabled')
  })

  it('batch: daftar batch, edit, hapus, tambah batch', async () => {
    mockHook = makeHook({ isBatch: 1 })
    const { getByText } = await renderScreen()
    await fireEvent.press(getByText('edit-A'))
    await fireEvent.press(getByText('del-B'))
    await fireEvent.press(getByText('+ ticket.add_batch'))
    expect(mockHook.handleEditBatch).toHaveBeenCalledWith(
      expect.objectContaining({ batch_code: 'A' })
    )
    expect(mockHook.handleDeleteBatch).toHaveBeenCalledWith(
      expect.objectContaining({ batch_code: 'B' })
    )
    expect(mockHook.handleAddBatch).toHaveBeenCalled()
  })
})
