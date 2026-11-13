import '@/test-utils/inventory-mocks'
import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react-native'
import { renderWithForm } from '@/test-utils/inventory-render'
import { TRANSACTION_TYPE } from '@/utils/Constants'
import DefaultChangeQtyInput from '../form/input/DefaultChangeQtyInput'
import ReviewTransactionItem from '../transaction/ReviewTransactionItem'

const stock = (over: any = {}): any => ({
  stock_id: 1,
  change_qty: 5,
  open_vial_qty: 0,
  close_vial_qty: 0,
  is_open_vial: false,
  is_any_discard: false,
  batch: null,
  activity: { id: 1, name: 'Act' },
  created_at: '2025-01-01T08:00:00.000Z',
  transactionTypeId: TRANSACTION_TYPE.ADD_STOCK,
  ...over,
})

const item = (stocks: any[]): any => ({
  materialName: 'Vaksin',
  transactionName: 'Penerimaan',
  activityName: 'Act',
  stocks,
})

describe('ReviewTransactionItem', () => {
  const onDelete = jest.fn()
  const onPressDetailPatient = jest.fn()
  const setup = (stocks: any[]) =>
    render(
      <ReviewTransactionItem
        item={item(stocks)}
        testID='rti'
        onDelete={onDelete}
        onPressDetailPatient={onPressDetailPatient}
      />
    )

  beforeEach(() => jest.clearAllMocks())

  it('menampilkan header dan memanggil onDelete dengan stok terkait', () => {
    const s = stock()
    setup([s])
    expect(screen.getByText('Vaksin')).toBeTruthy()
    expect(screen.getByText('Penerimaan')).toBeTruthy()
    fireEvent.press(screen.getByTestId('btn-delete-transaction-item-0'))
    expect(onDelete).toHaveBeenCalledWith(s)
  })

  it('open vial menampilkan label vial dan info discard + alasan', () => {
    setup([
      stock({
        is_open_vial: true,
        open_vial_qty: 2,
        close_vial_qty: 3,
        is_any_discard: true,
        broken_open_vial: 1,
        broken_close_vial: 1,
        transaction_reason: { label: 'Rusak', is_other: false },
      }),
    ])
    expect(screen.getAllByText('label.vial_qty').length).toBeGreaterThanOrEqual(
      2
    )
    expect(screen.getByText('label.discard_reason')).toBeTruthy()
    expect(screen.getAllByText('Rusak')).toHaveLength(2)
  })

  it('alasan lainnya memakai other_reason, pelanggan, batch, status non-batch', () => {
    setup([
      stock({
        transaction_reason: { label: 'Lainnya', is_other: true },
        other_reason: 'alasan bebas',
        customer: { name: 'Pelanggan A' },
        batch: {
          code: 'B1',
          expired_date: '2030-01-01',
          manufacture: { name: 'M' },
        },
        stock_quality: { label: 'VVM A' },
      }),
      stock({ stock_id: 2, batch: null, stock_quality: { label: 'VVM B' } }),
    ])
    expect(screen.getByText('alasan bebas')).toBeTruthy()
    expect(screen.getByText('Pelanggan A')).toBeTruthy()
    expect(screen.getByText('VVM B')).toBeTruthy()
  })

  it('vaksin sequence menampilkan tombol detail pasien', () => {
    setup([stock({ vaccineTypeName: 'BCG', vaccineMethodName: 'Intra' })])
    expect(screen.getByText('BCG')).toBeTruthy()
    expect(screen.getByText('Intra')).toBeTruthy()
    fireEvent.press(screen.getByTestId('btn-detail-patient-0'))
    expect(onPressDetailPatient).toHaveBeenCalledWith(
      expect.objectContaining({ materialName: 'Vaksin', activityName: 'Act' })
    )
  })

  it('return menampilkan asal entitas dan akumulasi', () => {
    setup([
      stock({
        transactionTypeId: TRANSACTION_TYPE.RETURN,
        is_any_discard: true,
        broken_qty: 1,
        change_qty: 5,
      }),
    ])
    expect(screen.getByText('label.from')).toBeTruthy()
    expect(
      screen.getByText('transaction.helpers.number_of_return 4')
    ).toBeTruthy()
  })

  it('cancel discard menampilkan dropdown alasan pembatalan dan akumulasi', () => {
    setup([stock({ transactionTypeId: TRANSACTION_TYPE.CANCEL_DISCARDS })])
    expect(
      screen.getAllByText('label.reason_cancellation_of_discards').length
    ).toBeGreaterThan(0)
    expect(
      screen.getByText('label.accumulated_discard_cancellation')
    ).toBeTruthy()
  })

  it('sumber dana tampil bila ada anggaran, tahun, atau harga', () => {
    setup([
      stock({
        budget_source: { label: 'APBN' },
        year: 2024,
        price: 100,
        change_qty: 5,
      }),
    ])
    expect(screen.getByText('APBN')).toBeTruthy()
    expect(screen.getByText('2024')).toBeTruthy()
  })
})

describe('DefaultChangeQtyInput', () => {
  const form = (qty: number, change: number) => ({
    activeBatch: [{ qty, change_qty: change }],
  })

  it('menampilkan helper stok akhir untuk reduce stock', () => {
    renderWithForm(
      <DefaultChangeQtyInput
        batchType='activeBatch'
        index={0}
        type='reduce_stock'
      />,
      form(10, 3)
    )
    expect(screen.getByText('transaction.helpers.stock_amount')).toBeTruthy()
  })

  it('tanpa helper bila change_qty 0', () => {
    renderWithForm(
      <DefaultChangeQtyInput
        batchType='activeBatch'
        index={0}
        type='add_stock'
      />,
      form(10, 0)
    )
    expect(screen.queryByText('transaction.helpers.stock_amount')).toBeNull()
  })

  it('mengubah nilai memperbarui form; kosong menghapus error', () => {
    let f: any
    renderWithForm(
      <DefaultChangeQtyInput
        batchType='activeBatch'
        index={0}
        type='add_stock'
      />,
      form(10, 1),
      (x) => (f = x)
    )
    const input = screen.getByTestId('textfield-add_stock-qty')
    fireEvent.changeText(input, '7')
    expect(f.getValues('activeBatch.0.change_qty')).toBe(7)
    fireEvent.changeText(input, '')
    expect(f.getValues('activeBatch.0.change_qty')).toBe(0)
  })
})
