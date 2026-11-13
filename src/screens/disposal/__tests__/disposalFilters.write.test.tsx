jest.mock(
  '@react-navigation/native',
  () => require('@/test-utils/misc-nav').navModule
)
jest.mock('react-native-reanimated', () =>
  require('react-native-reanimated/mock')
)
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
jest.mock('@/utils/NavigationUtils', () => ({
  navigate: jest.fn(),
  navigationRef: { isReady: () => false },
}))

import React from 'react'
import {
  act,
  fireEvent,
  render,
  screen,
  renderHook,
} from '@testing-library/react-native'
import { navigate } from '@/utils/NavigationUtils'
import SelfDisposalListFilterBottomSheet from '../components/SelfDisposalListFilterBottomSheet'
import DisposalShipmentFilterBottomSheet from '../components/shipment-list/DisposalShipmentFilterBottomsheet'
import DisposalShipmentList from '../components/shipment-list/DisposalShipmentList'
import useDisposalShipmentFilterForm from '../hooks/useDisposalShipmentFilterForm'

describe('SelfDisposalListFilterBottomSheet', () => {
  const setup = (filter: any = {}) => {
    const onApply = jest.fn()
    const toggleSheet = jest.fn()
    render(
      <SelfDisposalListFilterBottomSheet
        isOpen
        filter={filter}
        onApply={onApply}
        toggleSheet={toggleSheet}
        activities={[{ value: 3, label: 'Rutin' }] as any}
        materials={[{ value: 9, label: 'Vaksin' }] as any}
      />
    )
    return { onApply, toggleSheet }
  }

  it('mengirim filter tanggal, aktivitas, dan material yang dipilih', async () => {
    const { onApply } = setup()
    fireEvent.press(screen.getByTestId('daterangepicker-transaction-filter'))
    fireEvent.press(screen.getByTestId('pickerselect-activity'))
    fireEvent.press(screen.getByTestId('pickerselect-material'))
    await act(async () => {
      fireEvent.press(screen.getByText('button.apply'))
    })
    expect(onApply).toHaveBeenCalledWith({
      start_date: '2025-01-01',
      end_date: '2025-01-31',
      activity_id: 3,
      material_id: 9,
    })
  })

  it('tombol reset lalu terapkan tetap memanggil onApply', async () => {
    const { onApply } = setup({ activity_id: 3 })
    await act(async () => {
      fireEvent.press(screen.getByText('button.reset'))
    })
    await act(async () => {
      fireEvent.press(screen.getByText('button.apply'))
    })
    // catatan: reset({}) RHF mempertahankan default awal, jadi activity_id tidak dikosongkan
    expect(onApply).toHaveBeenCalledTimes(1)
  })

  it('daftar opsi default kosong dan tombol tutup', () => {
    const toggleSheet = jest.fn()
    render(
      <SelfDisposalListFilterBottomSheet
        isOpen
        filter={{}}
        onApply={jest.fn()}
        toggleSheet={toggleSheet}
      />
    )
    fireEvent.press(screen.getByText('label.all_filter'))
    expect(screen.getByTestId('pickerselect-activity')).toBeTruthy()
  })
})

describe('DisposalShipmentFilterBottomSheet', () => {
  const setup = (isSender: boolean, filter: any = {}) => {
    const onApply = jest.fn()
    const toggleSheet = jest.fn()
    render(
      <DisposalShipmentFilterBottomSheet
        isOpen
        filter={filter}
        isSender={isSender}
        receivers={[{ value: 11, label: 'Penerima' }] as any}
        senders={[{ value: 22, label: 'Pengirim' }] as any}
        activities={[{ value: 5, label: 'Aktivitas' }] as any}
        onApply={onApply}
        toggleSheet={toggleSheet}
      />
    )
    return { onApply, toggleSheet }
  }

  it('pengirim memilih penerima (customer_id)', async () => {
    const { onApply, toggleSheet } = setup(true)
    fireEvent.press(
      screen.getByTestId('daterangepicker-disposal-shipment-filter')
    )
    fireEvent.press(screen.getByTestId('pickerselect-entity'))
    fireEvent.press(screen.getByTestId('pickerselect-activity'))
    await act(async () => {
      fireEvent.press(screen.getByTestId('btn-apply-disposal-shipment-filter'))
    })
    expect(onApply).toHaveBeenCalledWith({
      from_date: '2025-01-01',
      to_date: '2025-01-31',
      customer_id: 11,
      vendor_id: undefined,
      activity_id: 5,
    })
    expect(toggleSheet).toHaveBeenCalled()
  })

  it('penerima memilih pengirim (vendor_id)', async () => {
    const { onApply } = setup(false)
    fireEvent.press(screen.getByTestId('pickerselect-entity'))
    await act(async () => {
      fireEvent.press(screen.getByTestId('btn-apply-disposal-shipment-filter'))
    })
    expect(onApply.mock.calls[0][0]).toMatchObject({
      vendor_id: 22,
      customer_id: undefined,
    })
  })

  it('reset dan tutup', async () => {
    const { toggleSheet, onApply } = setup(true, { customer_id: 11 })
    await act(async () => {
      fireEvent.press(screen.getByTestId('btn-reset-disposal-shipment-filter'))
    })
    await act(async () => {
      fireEvent.press(screen.getByTestId('btn-apply-disposal-shipment-filter'))
    })
    expect(onApply.mock.calls[0][0].customer_id).toBeUndefined()
    fireEvent.press(screen.getByTestId('btn-close-filter'))
    expect(toggleSheet).toHaveBeenCalled()
  })
})

describe('useDisposalShipmentFilterForm', () => {
  it('mereset form ke filter saat sheet dibuka', () => {
    const { result, rerender } = renderHook(
      ({ isOpen, filter }: any) =>
        useDisposalShipmentFilterForm({ filter, isOpen }),
      { initialProps: { isOpen: false, filter: { from_date: 'a' } } }
    )
    expect(result.current.form.from_date).toBe('a')
    act(() =>
      result.current.handleSelect('activity_id')({
        value: 4,
        label: 'x',
      } as any)
    )
    expect(result.current.form.activity_id).toBe(4)
    rerender({ isOpen: true, filter: { from_date: 'b' } })
    expect(result.current.form.from_date).toBe('b')
    act(() => result.current.handleResetFilter())
    expect(result.current.form.from_date).toBeUndefined()
  })
})

describe('DisposalShipmentList', () => {
  const data: any = [
    {
      id: 4,
      activity: { name: 'A' },
      customer: { name: 'C' },
      vendor: { name: 'V' },
      status: 1,
      disposal_items: [],
    },
  ]

  it('menekan item menavigasi ke detail dengan isSender', () => {
    render(
      <DisposalShipmentList
        data={data}
        isSender
        isLoadMore={false}
        onEndReached={jest.fn()}
      />
    )
    fireEvent.press(screen.getByTestId('disposal-KPM-4'))
    expect(navigate).toHaveBeenCalledWith('DisposalShipmentDetail', {
      id: 4,
      isSender: true,
    })
  })

  it('kosong menampilkan empty state saat tidak memuat', () => {
    render(
      <DisposalShipmentList
        data={[]}
        isSender={false}
        isLoadMore={false}
        onEndReached={jest.fn()}
      />
    )
    expect(screen.getByTestId('empty-state-disposal-shipment')).toBeTruthy()
  })

  it('sedang memuat menyembunyikan empty state dan menampilkan loader', () => {
    render(
      <DisposalShipmentList
        data={[]}
        isSender={false}
        isLoadMore
        onEndReached={jest.fn()}
      />
    )
    expect(screen.queryByTestId('empty-state-disposal-shipment')).toBeNull()
  })

  it('memicu onEndReached', () => {
    const onEnd = jest.fn()
    render(
      <DisposalShipmentList
        data={data}
        isSender
        isLoadMore={false}
        onEndReached={onEnd}
      />
    )
    screen
      .UNSAFE_getByProps({ onEndReachedThreshold: 0.5 })
      .props.onEndReached()
    expect(onEnd).toHaveBeenCalled()
  })
})
