jest.mock('@react-navigation/native', () => require('@/test-utils/misc-nav').navModule)
jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'))
jest.mock('react-native-safe-area-context', () =>
  require('react-native-safe-area-context/jest/mock').default
)
jest.mock('@/components/bottomsheet/BottomSheet', () => require('@/test-utils/misc-sheet').bottomSheetModule)
jest.mock('@/components/filter/DateRangePicker', () => require('@/test-utils/misc-sheet').dateRangeModule)
jest.mock('@/components/portals/Portal', () => ({ __esModule: true, default: ({ children }: any) => children }))
jest.mock('@/utils/NavigationUtils', () => ({
  navigate: jest.fn(),
  navigateAndReset: jest.fn(),
  navigationRef: { isReady: () => false },
}))
const mockReview = jest.fn()
jest.mock('../hooks/useReviewReconciliation', () => ({
  __esModule: true,
  default: (...a: any[]) => mockReview(...a),
}))

import React from 'react'
import { act, fireEvent, render, screen } from '@testing-library/react-native'
import { FormWrapper } from '@/test-utils/misc-form'
import { navigate } from '@/utils/NavigationUtils'
import ReconciliationFilterBottomSheet from '../components/ReconciliationFilterBottomSheet'
import ReconciliationFormItem from '../components/ReconciliationFormItem'
import ReconciliationPeriodBottomSheet from '../components/ReconciliationPeriodBottomSheet'
import ReviewReconciliationScreen from '../ReviewReconciliationScreen'

describe('ReconciliationFilterBottomSheet', () => {
  const setup = (filter: any = {}, isOpen = true) => {
    const onApplyFilter = jest.fn()
    const toggleSheet = jest.fn()
    render(
      <ReconciliationFilterBottomSheet
        isOpen={isOpen}
        filter={filter}
        onApplyFilter={onApplyFilter}
        toggleSheet={toggleSheet}
      />
    )
    return { onApplyFilter, toggleSheet }
  }

  it('menerapkan rentang tanggal dibuat dan periode', async () => {
    const { onApplyFilter, toggleSheet } = setup()
    fireEvent.press(screen.getByTestId('daterangepicker-created-filter'))
    fireEvent.press(screen.getByTestId('daterangepicker-period-filter'))
    await act(async () => {
      fireEvent.press(screen.getByTestId('btn-apply-filter'))
    })
    expect(onApplyFilter).toHaveBeenCalledWith(
      expect.objectContaining({
        created_from: '2025-01-01',
        created_to: '2025-01-31',
        start_date: '2025-01-01',
        end_date: '2025-01-31',
      })
    )
    expect(toggleSheet).toHaveBeenCalled()
  })

  it('reset mengosongkan filter, close menutup sheet', async () => {
    const { onApplyFilter, toggleSheet } = setup({ created_from: 'x' })
    await act(async () => {
      fireEvent.press(screen.getByTestId('btn-reset-filter'))
    })
    await act(async () => {
      fireEvent.press(screen.getByTestId('btn-apply-filter'))
    })
    expect(onApplyFilter.mock.calls[0][0].created_from).toBeUndefined()
    fireEvent.press(screen.getByTestId('btn-close-filter'))
    expect(toggleSheet).toHaveBeenCalled()
  })

  it('sheet tertutup tidak mereset form', () => {
    setup({ created_from: 'x' }, false)
    expect(screen.getByTestId('btn-apply-filter')).toBeTruthy()
  })
})

describe('ReconciliationPeriodBottomSheet', () => {
  const setup = (startDate?: string, endDate?: string) => {
    const onSelectDate = jest.fn()
    const toggleSheet = jest.fn()
    render(
      <ReconciliationPeriodBottomSheet
        isOpen
        startDate={startDate}
        endDate={endDate}
        onSelectDate={onSelectDate}
        toggleSheet={toggleSheet}
      />
    )
    return { onSelectDate, toggleSheet }
  }

  it('apply nonaktif tanpa tanggal, aktif setelah memilih rentang', async () => {
    const { onSelectDate, toggleSheet } = setup()
    expect(screen.getByTestId('btn-apply-period').props.accessibilityState?.disabled).toBe(true)
    fireEvent.press(screen.getByTestId('daterangepicker-reconciliation-period'))
    await act(async () => {
      fireEvent.press(screen.getByTestId('btn-apply-period'))
    })
    expect(onSelectDate).toHaveBeenCalledWith('2025-01-01', '2025-01-31')
    expect(toggleSheet).toHaveBeenCalled()
  })

  it('reset mengosongkan tanggal awal', async () => {
    setup('2025-02-01', '2025-02-10')
    expect(screen.getByText('2025-02-01|2025-02-10')).toBeTruthy()
    await act(async () => {
      fireEvent.press(screen.getByTestId('btn-reset-period'))
    })
    expect(screen.getByText('|')).toBeTruthy()
  })

  it('tombol tutup menutup sheet', () => {
    const { toggleSheet } = setup('a', 'b')
    fireEvent.press(screen.getByTestId('btn-close-filter'))
    expect(toggleSheet).toHaveBeenCalled()
  })
})

describe('ReconciliationFormItem', () => {
  const renderItem = (item: any) =>
    render(
      <FormWrapper defaultValues={{ items: [item] }}>
        <ReconciliationFormItem index={0} />
      </FormWrapper>
    )

  it('belum ada qty aktual menampilkan tombol isi nilai riil', () => {
    renderItem({ reconciliation_category_label: 'Batch', recorded_qty: 4, actual_qty: null })
    fireEvent.press(screen.getByTestId('btn-add-enter-real-value'))
    expect(navigate).toHaveBeenCalledWith(
      'AddReconciliationType',
      expect.objectContaining({ path: 'items.0' })
    )
  })

  it('qty aktual 0 dianggap sudah diisi dan menampilkan alasan serta aksi', () => {
    renderItem({
      reconciliation_category_label: 'Batch',
      recorded_qty: 4,
      actual_qty: 0,
      action_reasons: [
        { reason_id: 1, action_id: 2, reason_title: 'Hilang', action_title: 'Catat' },
      ],
    })
    expect(screen.getByText('reconciliation.reason_action')).toBeTruthy()
    fireEvent.press(screen.getByTestId('btn-edit-add-actual-qty'))
    expect(navigate).toHaveBeenCalled()
  })

  it('actual_qty terisi tanpa alasan tidak menampilkan blok alasan', () => {
    renderItem({ reconciliation_category_label: 'B', recorded_qty: 1, actual_qty: 3, action_reasons: [] })
    expect(screen.queryByText('reconciliation.reason_action')).toBeNull()
  })

  it('actual_qty undefined diperlakukan belum diisi', () => {
    renderItem({ reconciliation_category_label: 'B', recorded_qty: 1 })
    expect(screen.getByTestId('btn-add-enter-real-value')).toBeTruthy()
  })
})

describe('ReviewReconciliationScreen', () => {
  const hook = (over: any = {}) => ({
    t: (k: string) => k,
    activityName: 'Rutin',
    isLoading: false,
    reviewItems: [],
    handleSubmitReconciliation: jest.fn(),
    handleDeleteAll: jest.fn(),
    ...over,
  })
  const route: any = { params: { x: 1 } }

  it('mengirim rekonsiliasi dari tombol kirim', () => {
    const h = hook()
    mockReview.mockReturnValue(h)
    render(<ReviewReconciliationScreen {...({ route } as any)} />)
    fireEvent.press(screen.getByTestId('btn-submit-reconciliation'))
    expect(h.handleSubmitReconciliation).toHaveBeenCalled()
    expect(mockReview).toHaveBeenCalledWith(route.params)
  })

  it('hapus semua membuka dialog lalu konfirmasi', () => {
    const h = hook()
    mockReview.mockReturnValue(h)
    render(<ReviewReconciliationScreen {...({ route } as any)} />)
    fireEvent.press(screen.getByTestId('btn-delete-all-reconciliation'))
    fireEvent.press(screen.getByText('button.yes'))
    expect(h.handleDeleteAll).toHaveBeenCalled()
  })

  it('menampilkan item review', () => {
    mockReview.mockReturnValue(
      hook({
        reviewItems: [
          { materialName: 'Vaksin X', createdAt: '2025-01-01', period: 'Jan', items: [] },
        ],
      })
    )
    render(<ReviewReconciliationScreen {...({ route } as any)} />)
    expect(screen.getByText('Vaksin X')).toBeTruthy()
  })
})
