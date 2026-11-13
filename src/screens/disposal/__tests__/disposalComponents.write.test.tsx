jest.mock(
  '@react-navigation/native',
  () => require('@/test-utils/misc-nav').navModule
)
jest.mock(
  'react-native-safe-area-context',
  () => require('react-native-safe-area-context/jest/mock').default
)

import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react-native'
import { navMock } from '@/test-utils/misc-nav'
import DisposalMaterialList from '../component/DisposalMaterialList'
import DisposalStockBatchItem from '../component/DisposalStockBatchItem'
import DisposalStockDetailBatchSection from '../component/DisposalStockDetailBatchSection'
import DisposalMaterialBatchItem from '../components/DisposalMaterialBatchItem'

const stockItem = (id: number, name: string) => ({
  material_id: id,
  entity_id: 1,
  material: { name },
  total_disposal_discard_qty: 2,
  total_disposal_received_qty: 3,
  updated_at: '2025-01-01',
})
const detailItem = {
  material_id: 9,
  disposal_discard_qty: 1,
  disposal_received_qty: 1,
}

describe('DisposalMaterialList', () => {
  it('menampilkan item dan memanggil onPressMaterial', async () => {
    const onPress = jest.fn()
    const data = [stockItem(1, 'Alpha'), stockItem(2, 'Beta')]
    await render(
      <DisposalMaterialList data={data as any} onPressMaterial={onPress} />
    )
    await fireEvent.press(screen.getByText('Alpha'))
    expect(onPress).toHaveBeenCalledWith(data[0])
    expect(screen.getByText('Beta')).toBeTruthy()
  })

  it('mendukung item detail tanpa nama dan item tanpa material_id', async () => {
    const onPress = jest.fn()
    await render(
      <DisposalMaterialList
        data={
          [
            detailItem,
            { ...detailItem, material_id: 0 },
            { ...detailItem, material_id: 5, updated_at: 'x' },
          ] as any
        }
        onPressMaterial={onPress}
        title='T'
        type={undefined}
      />
    )
    expect(screen.toJSON()).toBeTruthy()
  })

  it('menampilkan teks kosong dan memicu onEndReach', async () => {
    const onEnd = jest.fn()
    await render(
      <DisposalMaterialList
        data={[]}
        onPressMaterial={jest.fn()}
        onEndReach={onEnd}
      />
    )
    expect(screen.getByText('no_items_found')).toBeTruthy()
    const list = screen.UNSAFE_getByProps({ onEndReachedThreshold: 0.1 })
    list.props.onEndReached()
    expect(onEnd).toHaveBeenCalled()
    list.props.onEndReached()
  })

  it('onEndReached aman tanpa callback', async () => {
    await render(
      <DisposalMaterialList
        data={[stockItem(1, 'A')] as any}
        onPressMaterial={jest.fn()}
      />
    )
    const list = screen.UNSAFE_getByProps({ onEndReachedThreshold: 0.1 })
    expect(() => list.props.onEndReached()).not.toThrow()
  })
})

const disposals = [
  {
    disposal_stock_id: 1,
    transaction_reason: { id: 1, title: 'Rusak' },
    disposal_discard_qty: 2,
    disposal_received_qty: 4,
  },
]
const batchStock: any = {
  id: 5,
  activity: { name: 'Rutin' },
  batch: {
    code: 'BX1',
    expired_date: '2030-01-01',
    production_date: '2029-01-01',
    manufacture: { name: 'Biofarma' },
  },
  disposal_discard_qty: 2,
  disposal_received_qty: 4,
  disposals,
}

describe('DisposalStockBatchItem', () => {
  it('menampilkan detail batch dan alasan', async () => {
    await render(
      <DisposalStockBatchItem disposalStock={batchStock} isManagedInBatch />
    )
    expect(screen.getByText('BX1')).toBeTruthy()
    expect(screen.getByText('Rutin')).toBeTruthy()
    expect(screen.getAllByText('disposal.reason_qty').length).toBe(2)
  })

  it('tanpa batch dan qty 0 menampilkan placeholder', async () => {
    await render(
      <DisposalStockBatchItem
        disposalStock={{
          ...batchStock,
          batch: null,
          disposal_discard_qty: undefined,
          disposal_received_qty: 0,
        }}
        isManagedInBatch={false}
      />
    )
    expect(screen.queryByText('BX1')).toBeNull()
    expect(screen.getAllByText('-').length).toBe(2)
  })

  it('batch ada tetapi tidak dikelola per batch dan tanpa manufaktur', async () => {
    await render(
      <DisposalStockBatchItem
        disposalStock={{
          ...batchStock,
          batch: { ...batchStock.batch, manufacture: null },
        }}
        isManagedInBatch={false}
      />
    )
    expect(screen.getByText('-')).toBeTruthy()
  })
})

describe('DisposalStockDetailBatchSection', () => {
  const detail: any = { material_id: 1, material: { name: 'M' } }
  it('render section batch dengan header section', async () => {
    await render(
      <DisposalStockDetailBatchSection
        isBatch
        detail={detail}
        sections={
          [
            { title: 'active_batch', data: [batchStock] },
            { title: 'empty', data: [] },
          ] as any
        }
      />
    )
    expect(screen.getByText('active_batch')).toBeTruthy()
    expect(screen.queryByText('empty')).toBeNull()
  })

  it('bukan batch tidak menampilkan header section', async () => {
    await render(
      <DisposalStockDetailBatchSection
        isBatch={false}
        detail={detail}
        parentMaterialName='P'
        parentStockQty={4}
        sections={[{ title: 'active_batch', data: [batchStock] }] as any}
      />
    )
    expect(screen.queryByText('active_batch')).toBeNull()
  })
})

describe('DisposalMaterialBatchItem', () => {
  const onToggle = jest.fn()
  const base = {
    type: 'self' as any,
    stock: batchStock,
    expanded: true,
    activity: 'Rutin',
    onToggleExpand: onToggle,
  }
  beforeEach(() => jest.clearAllMocks())

  it('tanpa quantities: tombol tambah menavigasi ke AddDisposal', async () => {
    await render(<DisposalMaterialBatchItem {...base} />)
    await fireEvent.press(screen.getByTestId('btn-add-disposal-qty-5'))
    expect(navMock.navigate).toHaveBeenCalledWith(
      'AddDisposal',
      expect.objectContaining({ disposalStock: batchStock })
    )
  })

  it('tombol tambah memakai onEdit jika ada', async () => {
    const onEdit = jest.fn()
    await render(<DisposalMaterialBatchItem {...base} onEdit={onEdit} />)
    await fireEvent.press(screen.getByTestId('btn-add-disposal-qty-5'))
    expect(onEdit).toHaveBeenCalled()
    expect(navMock.navigate).not.toHaveBeenCalled()
  })

  it('dengan quantities menampilkan discard dan received serta tombol edit', async () => {
    const onEdit = jest.fn()
    await render(
      <DisposalMaterialBatchItem
        {...base}
        onEdit={onEdit}
        quantities={
          {
            discard: [
              {
                disposal_stock_id: 1,
                transaction_reason_name: 'Rusak',
                disposal_qty: 2,
              },
            ],
            received: [
              {
                disposal_stock_id: 2,
                transaction_reason_name: 'Kadaluarsa',
                disposal_qty: 1,
              },
            ],
          } as any
        }
      />
    )
    await fireEvent.press(screen.getByTestId('btn-edit-disposal-qty-5'))
    expect(onEdit).toHaveBeenCalled()
  })

  it('quantities kosong tidak menampilkan section dan toggle expand bekerja', async () => {
    await render(
      <DisposalMaterialBatchItem
        {...base}
        expanded={false}
        stock={{
          ...batchStock,
          batch: null,
          disposal_discard_qty: undefined,
          disposal_received_qty: undefined,
        }}
        quantities={{ discard: [], received: [] } as any}
      />
    )
    await fireEvent.press(screen.getByText('Rutin'))
    expect(onToggle).toHaveBeenCalledWith(5)
    expect(screen.queryByTestId('btn-edit-disposal-qty-5')).toBeTruthy()
  })
})
