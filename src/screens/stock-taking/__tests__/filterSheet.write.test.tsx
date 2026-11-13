jest.mock(
  '@/components/bottomsheet/BottomSheet',
  () => require('@/test-utils/misc-sheet').bottomSheetModule
)
jest.mock(
  '@/components/filter/DateRangePicker',
  () => require('@/test-utils/misc-sheet').dateRangeModule
)

import React from 'react'
import { fireEvent, render, screen, act } from '@testing-library/react-native'
import StockTakingFilterBottomSheet from '../components/StockTakingFilterBottomSheet'

describe('StockTakingFilterBottomSheet', () => {
  const setup = async (filter: any = { only_have_qty: 1 }, isOpen = true) => {
    const onApplyFilter = jest.fn()
    const toggleSheet = jest.fn()
    const view = await render(
      <StockTakingFilterBottomSheet
        isOpen={isOpen}
        filter={filter}
        onApplyFilter={onApplyFilter}
        toggleSheet={toggleSheet}
      />
    )
    return { onApplyFilter, toggleSheet, ...view }
  }

  it('menerapkan rentang tanggal dibuat lalu mengirim filter', async () => {
    const { onApplyFilter, toggleSheet } = await setup()
    await fireEvent.press(screen.getByTestId('daterangepicker-created-filter'))
    await act(async () => {
      await fireEvent.press(screen.getByTestId('btn-apply-filter'))
    })
    expect(onApplyFilter).toHaveBeenCalledWith(
      expect.objectContaining({
        only_have_qty: 1,
        created_from: '2025-01-01',
        created_to: '2025-01-31',
      })
    )
    expect(toggleSheet).toHaveBeenCalled()
  })

  it('menerapkan rentang tanggal kedaluwarsa', async () => {
    const { onApplyFilter } = await setup()
    await fireEvent.press(screen.getByTestId('daterangepicker-expired-filter'))
    await act(async () => {
      await fireEvent.press(screen.getByTestId('btn-apply-filter'))
    })
    expect(onApplyFilter).toHaveBeenCalledWith(
      expect.objectContaining({
        expired_start_date: '2025-01-01',
        expired_end_date: '2025-01-31',
      })
    )
  })

  it('reset hanya menyisakan only_have_qty', async () => {
    const { onApplyFilter } = await setup({
      only_have_qty: 1,
      created_from: 'a',
      created_to: 'b',
    })
    await act(async () => {
      await fireEvent.press(screen.getByTestId('btn-reset-filter'))
    })
    await act(async () => {
      await fireEvent.press(screen.getByTestId('btn-apply-filter'))
    })
    const arg = onApplyFilter.mock.calls[0][0]
    expect(arg.created_from).toBeUndefined()
    expect(arg.only_have_qty).toBe(1)
  })

  it('tombol tutup mengembalikan form dan menutup sheet', async () => {
    const { toggleSheet } = await setup()
    await fireEvent.press(screen.getByTestId('btn-close-filter'))
    expect(toggleSheet).toHaveBeenCalled()
  })

  it('tidak mereset form saat sheet tertutup', async () => {
    await setup({ only_have_qty: 0 }, false)
    expect(screen.getByTestId('btn-apply-filter')).toBeTruthy()
  })
})
