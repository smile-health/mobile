import '@/test-utils/inventory-mocks'
import React from 'react'
import { render, screen } from '@testing-library/react-native'
import TransactionItemBatchDetail from '../transactionList/TransactionItemBatchDetail'

const batch: any = {
  code: 'B-01',
  expired_date: '2030-01-31',
  production_date: '2029-01-01',
  manufacture: { name: 'Bio Farma' },
}
const activity: any = { id: 1, name: 'Imunisasi' }
const patient = (over: any = {}): any => ({
  identity_number: '123',
  identity_type: 1,
  phone_number: '0812',
  vaccine_sequence: { id: 1, title: 'Dosis 1' },
  vaccine_method: { id: 2, title: 'Metode' },
  ...over,
})

const setup = (over: any = {}) =>
  render(
    <TransactionItemBatchDetail
      batch={batch}
      activity={activity}
      changeQty={2}
      purchase={{} as any}
      patients={[]}
      isBatch
      {...over}
    />
  )

describe('TransactionItemBatchDetail', () => {
  it('mode batch menampilkan kode, tanggal, dan produsen', () => {
    setup()
    expect(screen.getByText('B-01')).toBeTruthy()
    expect(screen.getByText('label.production_by')).toBeTruthy()
    expect(screen.getByText('Bio Farma')).toBeTruthy()
  })

  it('mode batch tanpa data batch memakai nilai kosong', () => {
    setup({ batch: null })
    expect(screen.getByText('label.expired_date')).toBeTruthy()
    expect(screen.queryByText('B-01')).toBeNull()
  })

  it('batch tanpa manufacture tetap tampil', () => {
    setup({ batch: { ...batch, manufacture: undefined } })
    expect(screen.getByText('label.production_by')).toBeTruthy()
  })

  it('non-batch menampilkan stok aktivitas', () => {
    setup({ isBatch: false })
    expect(screen.getByText('label.taken_from_activity_stock')).toBeTruthy()
    expect(screen.getByText('Imunisasi')).toBeTruthy()
    expect(screen.queryByText('label.production_by')).toBeNull()
  })

  it('menampilkan pasien dengan urutan vaksin bila lengkap', () => {
    setup({ patients: [patient()] })
    expect(screen.getByText('123')).toBeTruthy()
    expect(screen.getByText('Metode (Dosis 1)')).toBeTruthy()
  })

  it('pasien tanpa urutan vaksin tidak menampilkan baris vaksin', () => {
    setup({
      patients: [
        patient({ vaccine_sequence: undefined, identity_number: '999' }),
        patient({ vaccine_method: { id: 0 }, identity_number: '888' }),
      ],
    })
    expect(screen.getByText('999')).toBeTruthy()
    expect(screen.queryByText('label.vaccine_sequence')).toBeNull()
  })

  it('pembelian menampilkan sumber dana, tahun, harga total dan satuan', () => {
    setup({
      purchase: {
        id: 1,
        year: 2025,
        price: 1000,
        budget_source: { name: 'APBN' },
      },
      changeQty: -3,
    })
    expect(screen.getByText('APBN')).toBeTruthy()
    expect(screen.getByText('2025')).toBeTruthy()
    expect(screen.getByText('label.total_price')).toBeTruthy()
  })

  it('pembelian tanpa harga, tahun, dan sumber dana memakai tanda -', () => {
    setup({ purchase: { id: 2 } })
    expect(screen.getAllByText('-').length).toBeGreaterThanOrEqual(2)
  })
})
