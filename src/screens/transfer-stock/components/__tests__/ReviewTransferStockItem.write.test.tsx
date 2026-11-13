import '@/test-utils/inventory-mocks'
import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react-native'
import ReviewTransferStockItem from '../ReviewTransferStockItem'

const base: any = {
  stock_id: 7,
  change_qty: 3,
  destination_activity: { label: 'Aktivitas Tujuan' },
  program_name: 'Program X',
  batch: {
    id: 1,
    code: 'B1',
    expired_date: '2030-01-01',
    production_date: '2029-01-01',
    manufacture: { name: 'Pabrik' },
  },
  activity: { name: 'Imunisasi' },
  budget_source: { label: 'APBN' },
  price: 1000,
  total_price: 3000,
}

const setup = (over: any = {}, onDelete = jest.fn()) => {
  render(
    <ReviewTransferStockItem
      index={2}
      item={{ ...base, ...over }}
      onDelete={onDelete}
    />
  )
  return onDelete
}

describe('ReviewTransferStockItem', () => {
  it('menampilkan detail lengkap dan menghapus lewat tombol', () => {
    const onDelete = setup()
    expect(screen.getByText('Program X')).toBeTruthy()
    expect(screen.getByText('Aktivitas Tujuan')).toBeTruthy()
    expect(screen.getByText('label.expired_date')).toBeTruthy()
    fireEvent.press(screen.getByTestId('btn-delete-transfer-stock-item-2'))
    expect(onDelete).toHaveBeenCalled()
  })

  it('tanpa batch id menyembunyikan info batch', () => {
    setup({ batch: { code: 'X' } })
    expect(screen.queryByText('label.expired_date')).toBeNull()
  })

  it('tanpa batch sama sekali tetap tampil', () => {
    setup({ batch: undefined })
    expect(screen.queryByText('label.expired_date')).toBeNull()
  })

  it('nilai kosong memakai tanda -', () => {
    setup({
      program_name: undefined,
      destination_activity: undefined,
      budget_source: undefined,
      activity: undefined,
      price: 0,
      total_price: 0,
    })
    expect(screen.getAllByText('-').length).toBeGreaterThanOrEqual(4)
  })
})
