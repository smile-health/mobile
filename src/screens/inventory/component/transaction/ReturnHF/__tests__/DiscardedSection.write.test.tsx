const mockReasons: any[] = [{ value: 1, label: 'Rusak', is_other: false }]
jest.mock('@/services/store', () => ({
  useAppSelector: () => mockReasons,
  useAppDispatch: () => jest.fn(),
}))
jest.mock('@/theme/colors', () => ({ __esModule: true, default: { main: () => '#000' } }))
jest.mock('@/i18n/useLanguage', () => ({ useLanguage: () => ({ t: (k: string) => k }) }))
jest.mock('@/services/features', () => ({ getTrxReasons: () => mockReasons }))
jest.mock('@/components/dropdown/Dropdown', () => {
  const { Pressable, Text } = require('react-native')
  return {
    __esModule: true,
    default: ({ name, onChangeValue }: any) => (
      <Pressable testID="dd-reason" onPress={() => onChangeValue({ id: 1, is_other: true })}>
        <Text>{`dd:${name}`}</Text>
      </Pressable>
    ),
  }
})
jest.mock('@/components/forms', () => {
  const { Pressable, Text } = require('react-native')
  return {
    InputNumber: ({ name, onChangeText, errors }: any) => (
      <Pressable testID={`in:${name}`} onPress={() => onChangeText('3')} onLongPress={() => onChangeText('')}>
        <Text>{`in:${name}|${errors ?? ''}`}</Text>
      </Pressable>
    ),
    TextField: ({ name }: any) => <Text>{`tf:${name}`}</Text>,
  }
})

import React from 'react'
import { act, fireEvent, render, screen } from '@testing-library/react-native'
import { FormWrapper } from '@/test-utils/misc-form'
import DiscardedSection from '../DiscardedSection'

const Text = require('react-native').Text

const setup = (trx: any = {}) => {
  let methods: any
  render(
    <FormWrapper
      defaultValues={{
        selectedTrx: [
          { change_qty: 10, open_vial_qty: 0, close_vial_qty: 0, ...trx },
        ],
      }}
      onForm={(m) => {
        methods = m
      }}>
      <DiscardedSection index={0} />
    </FormWrapper>
  )
  return () => methods
}

describe('DiscardedSection', () => {
  it('qty kembali 0 menyembunyikan tombol pertanyaan', () => {
    setup({ change_qty: 0 })
    expect(screen.queryByTestId('btn-is-any-discarded')).toBeNull()
  })

  it('menekan tombol menandai ada yang dibuang dan menampilkan input', async () => {
    const m = setup()
    await act(async () => {
      fireEvent.press(screen.getByTestId('btn-is-any-discarded'))
    })
    expect(m().getValues('selectedTrx.0.is_any_discard')).toBe(true)
    expect(screen.getByTestId('in:selectedTrx.0.broken_qty')).toBeTruthy()
  })

  it('mengubah jumlah rusak dan mengosongkannya', async () => {
    const m = setup({ is_any_discard: true })
    await act(async () => {
      fireEvent.press(screen.getByTestId('in:selectedTrx.0.broken_qty'))
    })
    expect(m().getValues('selectedTrx.0.broken_qty')).toBe(3)
    await act(async () => {
      fireEvent(screen.getByTestId('in:selectedTrx.0.broken_qty'), 'longPress')
    })
    expect(m().getValues('selectedTrx.0.broken_qty')).toBeUndefined()
  })

  it('hapus menandai tidak ada yang dibuang', async () => {
    const m = setup({ is_any_discard: true, broken_qty: 2 })
    await act(async () => {
      fireEvent.press(screen.getByTestId('btn-remove-is-any-discarded'))
    })
    expect(m().getValues('selectedTrx.0.is_any_discard')).toBeUndefined()
  })

  it('open vial menampilkan dua input dan total retur', () => {
    setup({
      is_any_discard: true,
      is_open_vial: true,
      open_vial_qty: 4,
      close_vial_qty: 6,
      broken_open_vial: 1,
      broken_close_vial: 2,
    })
    expect(screen.getByTestId('in:selectedTrx.0.broken_open_vial')).toBeTruthy()
    expect(screen.getByTestId('in:selectedTrx.0.broken_close_vial')).toBeTruthy()
    expect(screen.getByText(/7/)).toBeTruthy()
  })

  it('open vial tanpa nilai memakai nol', () => {
    setup({ is_any_discard: true, is_open_vial: true, open_vial_qty: undefined, close_vial_qty: undefined })
    expect(screen.getByText(/transaction.helpers.number_of_return/)).toBeTruthy()
  })

  it('memilih alasan lainnya menampilkan field teks', async () => {
    const m = setup({ is_any_discard: true, broken_qty: 4 })
    await act(async () => {
      fireEvent.press(screen.getByTestId('dd-reason'))
    })
    expect(m().getValues('selectedTrx.0.transaction_reason')).toMatchObject({ is_other: true })
    expect(screen.getByText('tf:selectedTrx.0.other_reason')).toBeTruthy()
  })
})
