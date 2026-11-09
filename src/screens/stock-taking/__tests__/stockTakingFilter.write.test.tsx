jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'))
jest.mock('@/components/bottomsheet/BottomSheet', () => require('@/test-utils/misc-sheet').bottomSheetModule)
jest.mock('@/components/filter/DateRangePicker', () => require('@/test-utils/misc-sheet').dateRangeModule)

import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react-native'
import StockTakingFilter from '../components/StockTakingFilter'

describe('StockTakingFilter', () => {
  it('toggle batch kosong membalik only_have_qty', () => {
    const onApply = jest.fn()
    render(<StockTakingFilter filter={{ only_have_qty: 1 }} onApplyFilter={onApply} />)
    fireEvent.press(screen.getByText('label.show_empty_batch'))
    expect(onApply).toHaveBeenCalledWith({ only_have_qty: 0 })
  })

  it('toggle kembali ke 1 saat sebelumnya 0', () => {
    const onApply = jest.fn()
    render(<StockTakingFilter filter={{ only_have_qty: 0 }} onApplyFilter={onApply} />)
    fireEvent.press(screen.getByText('label.show_empty_batch'))
    expect(onApply).toHaveBeenCalledWith({ only_have_qty: 1 })
  })

  it('menampilkan ringkasan filter tanggal dan bisa dihapus', () => {
    const onApply = jest.fn()
    render(
      <StockTakingFilter
        filter={{
          only_have_qty: 1,
          created_from: '2025-01-01',
          created_to: '2025-01-31',
          expired_start_date: '2026-01-01',
          expired_end_date: '2026-01-31',
        } as any}
        onApplyFilter={onApply}
      />
    )
    expect(screen.getByText('label.created', { exact: false })).toBeTruthy()
    expect(screen.getByText('label.expired', { exact: false })).toBeTruthy()
    fireEvent.press(screen.getByTestId('btn-reset-filters'))
    expect(onApply).toHaveBeenCalledWith({ only_have_qty: 1 })
  })

  it('hanya rentang dibuat: tidak menampilkan baris kedaluwarsa', () => {
    render(
      <StockTakingFilter
        filter={{ only_have_qty: 1, created_from: '2025-01-01', created_to: '2025-01-31' } as any}
        onApplyFilter={jest.fn()}
      />
    )
    expect(screen.queryByText('label.expired', { exact: false })).toBeNull()
  })

  it('tanpa filter tidak menampilkan ringkasan; tombol filter membuka sheet', () => {
    render(<StockTakingFilter filter={{ only_have_qty: 1 }} onApplyFilter={jest.fn()} />)
    expect(screen.queryByTestId('btn-reset-filters')).toBeNull()
    fireEvent.press(screen.getByTestId('btn-open-filter'))
    expect(screen.getByTestId('btn-apply-filter')).toBeTruthy()
  })
})
