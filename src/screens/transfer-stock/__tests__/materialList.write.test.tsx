jest.mock(
  '@react-navigation/native',
  () => require('@/test-utils/misc-nav').navModule
)

import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react-native'
import { fiberGetByProps } from '@/test-utils/fiber'
import TransferStockMaterialList from '../components/TransferStockMaterialList'

const mat = (id: number, name: string, extra: any = {}) => ({
  material: { id, name },
  updated_at: '2025-01-01',
  aggregate: { total_qty: 5, min: 1, max: 9 },
  ...extra,
})

describe('TransferStockMaterialList', () => {
  it('menampilkan material, label transaksi dan memilih material', async () => {
    const onSelect = jest.fn()
    const materials: any = [
      mat(1, 'Alpha'),
      mat(2, 'Beta', { aggregate: undefined }),
    ]
    await render(
      <TransferStockMaterialList
        materials={materials}
        transactions={
          [
            { material_id: 1, change_qty: 2 },
            { material_id: 1, change_qty: null },
            { material_id: 1, change_qty: 3 },
          ] as any
        }
        isLoading={false}
        onSelectMaterial={onSelect}
      />
    )
    expect(screen.getByText('transfer_stock.alert_material')).toBeTruthy()
    await fireEvent.press(screen.getByText('Alpha'))
    expect(onSelect).toHaveBeenCalledWith(materials[0])
    await fireEvent.press(screen.getByText('Beta'))
    expect(onSelect).toHaveBeenCalledWith(materials[1])
    expect(
      screen.getAllByText('transaction.transaction_label.transfer_stock').length
    ).toBeGreaterThan(0)
  })

  it('sedang memuat awal hanya menampilkan loader jika isLoadMore', async () => {
    const { toJSON } = await render(
      <TransferStockMaterialList
        materials={[]}
        transactions={[]}
        isLoading
        isLoadMore
        onSelectMaterial={jest.fn()}
      />
    )
    expect(toJSON()).toBeTruthy()
  })

  it('memuat tanpa isLoadMore tidak merender apa pun', async () => {
    const { toJSON } = await render(
      <TransferStockMaterialList
        materials={[]}
        transactions={[]}
        isLoading
        onSelectMaterial={jest.fn()}
      />
    )
    expect(toJSON()).toBeNull()
  })

  it('kosong menampilkan empty state dan loader footer saat load more', async () => {
    await render(
      <TransferStockMaterialList
        materials={[]}
        transactions={[]}
        isLoading={false}
        isLoadMore
        onLoadMore={jest.fn()}
        onSelectMaterial={jest.fn()}
      />
    )
    expect(screen.getByTestId('empty-state-material')).toBeTruthy()
  })

  it('onEndReached memanggil onLoadMore', async () => {
    const onLoadMore = jest.fn()
    await render(
      <TransferStockMaterialList
        materials={[mat(1, 'A')] as any}
        transactions={[]}
        isLoading={false}
        onLoadMore={onLoadMore}
        onSelectMaterial={jest.fn()}
      />
    )
    fiberGetByProps(screen, { initialNumToRender: 10 }).props.onEndReached()
    expect(onLoadMore).toHaveBeenCalled()
  })
})
