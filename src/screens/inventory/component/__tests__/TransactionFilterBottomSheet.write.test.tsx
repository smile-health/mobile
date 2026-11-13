jest.mock(
  '@/components/bottomsheet/BottomSheet',
  () => require('@/test-utils/misc-sheet').bottomSheetModule
)
jest.mock(
  '@/components/filter/DateRangePicker',
  () => require('@/test-utils/misc-sheet').dateRangeModule
)
jest.mock(
  '@/components/filter/PickerSelect',
  () => require('@/test-utils/misc-sheet').pickerModule
)

import React from 'react'
import { act, fireEvent, render, screen } from '@testing-library/react-native'
import TransactionFilterBottomSheet from '../transactionList/TransactionFilterBottomSheet'

const setup = async (over: any = {}) => {
  const onApply = jest.fn()
  const toggleSheet = jest.fn()
  const utils = await render(
    <TransactionFilterBottomSheet
      isOpen
      isHierarchy={false}
      filter={null}
      activities={[{ value: 3, label: 'Rutin' }] as any}
      transactionTypes={[{ value: 5, label: 'Penerimaan' }] as any}
      materials={[{ value: 9, label: 'Vaksin' }] as any}
      onApply={onApply}
      toggleSheet={toggleSheet}
      {...over}
    />
  )
  return { onApply, toggleSheet, ...utils }
}

const apply = async () => {
  await act(async () => {
    await fireEvent.press(screen.getByTestId('btn-apply-filter'))
  })
}

describe('TransactionFilterBottomSheet', () => {
  it('apply tanpa filter mengirim id kosong menjadi undefined', async () => {
    const { onApply } = await setup()
    await apply()
    const arg = onApply.mock.calls[0][0]
    expect(arg.material_id).toBeUndefined()
    expect(arg.activity_id).toBeUndefined()
    expect(arg.transaction_type_id).toBeUndefined()
  })

  it('memilih material, aktivitas, jenis transaksi, dan tanggal', async () => {
    const { onApply } = await setup({ isHierarchy: true })
    await fireEvent.press(
      screen.getByTestId('daterangepicker-transaction-filter')
    )
    await fireEvent.press(screen.getByTestId('pickerselect-material'))
    await fireEvent.press(screen.getByTestId('pickerselect-activity'))
    await fireEvent.press(screen.getByTestId('pickerselect-transaction-type'))
    await apply()
    const arg = onApply.mock.calls[0][0]
    expect(arg.start_date).toBe('2025-01-01')
    expect(arg.end_date).toBe('2025-01-31')
    expect(arg).toHaveProperty('start_date')
  })

  it('filter awal ikut terisi', async () => {
    const { onApply } = await setup({
      filter: { activity_id: 3, material_id: 9, transaction_type_id: 5 },
    })
    await apply()
    expect(onApply.mock.calls[0][0]).toMatchObject({
      activity_id: 3,
      material_id: 9,
      transaction_type_id: 5,
    })
  })

  it('reset mengosongkan pilihan', async () => {
    const { onApply } = await setup({
      filter: { activity_id: 3, material_id: 9, transaction_type_id: 5 },
    })
    await act(async () => {
      await fireEvent.press(screen.getByTestId('btn-reset-transaction-filter'))
    })
    await apply()
    expect(onApply.mock.calls[0][0].activity_id).toBeUndefined()
  })

  it('tombol tutup mengembalikan form dan menutup sheet', async () => {
    const { toggleSheet } = await setup({ filter: { activity_id: 3 } })
    await fireEvent.press(screen.getByTestId('btn-close-filter'))
    expect(toggleSheet).toHaveBeenCalled()
  })

  it('sheet tertutup tidak mereset form dari filter', async () => {
    await setup({ isOpen: false, filter: { activity_id: 3 } })
    expect(screen.getByTestId('btn-apply-filter')).toBeTruthy()
  })
})
