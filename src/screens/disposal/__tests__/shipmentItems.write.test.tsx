jest.mock('@react-navigation/native', () => require('@/test-utils/misc-nav').navModule)
jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'))

import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react-native'
import { FormWrapper } from '@/test-utils/misc-form'
import {
  createReceivePayload,
  getReceiveShipmentItems,
  getReceiverShipmentStocks,
  getStatusQtyList,
} from '../helper/DisposalShipmentListHelper'
import DisposalShipmentStockItem from '../components/shipment-list/DisposalShipmentStockItem'
import ReceiveShipmentStockItem from '../components/shipment-list/ReceiveShipmentStockItem'
import SelfDisposalListItem, { getUserNameString } from '../components/SelfDisposalListItem'
import { DISPOSAL_STATUS } from '../disposal-constant'

const t: any = (k: string) => k

describe('DisposalShipmentListHelper', () => {
  it('getStatusQtyList membuang qty kosong', () => {
    expect(
      getStatusQtyList({ shippedQty: 5, receivedQty: null, cancelledQty: 0 })
    ).toEqual([{ label: 'disposal.shipped_qty', qty: 5 }])
    expect(
      getStatusQtyList({ shippedQty: 5, receivedQty: 5, cancelledQty: 2 })
    ).toHaveLength(3)
  })

  const stocks: any = [
    {
      id: 1,
      stock_id: 10,
      disposal_discard_qty: 2,
      disposal_received_qty: 0,
      transaction_reasons: { id: 7, title: 'Rusak' },
      stock: {
        batch: { code: 'B', manufacture_name: 'Bio', expired_date: '2030-01-01' },
        activity: { name: 'Rutin' },
      },
    },
    {
      id: 2,
      stock_id: 10,
      disposal_discard_qty: 0,
      disposal_received_qty: 3,
      transaction_reasons: { id: 8, title: 'Kadaluarsa' },
      stock: { batch: null, activity: { name: 'Rutin' } },
    },
    {
      id: 3,
      stock_id: 11,
      transaction_reasons: { id: 8, title: 'x' },
      stock: { batch: { code: 'C' }, activity: { name: 'Lain' } },
    },
  ]

  it('getReceiverShipmentStocks mengelompokkan per stock_id', () => {
    const r = getReceiverShipmentStocks(stocks)
    expect(r).toHaveLength(2)
    expect(r[0]).toMatchObject({
      id: 1,
      batch_code: 'B',
      manufacture: 'Bio',
      qty: 5,
      discard: [{ qty: 2, reason_id: 7, reason_title: 'Rusak' }],
      received: [{ qty: 3, reason_id: 8, reason_title: 'Kadaluarsa' }],
    })
    expect(r[1]).toMatchObject({ qty: 0, discard: [], received: [], manufacture: undefined })
  })

  it('getReceiveShipmentItems memetakan material', () => {
    const r = getReceiveShipmentItems([
      {
        id: 1,
        shipped_qty: 5,
        master_material: { managed_in_batch: 1, name: 'M' },
        disposal_shipment_stocks: stocks,
      },
      {
        id: 2,
        shipped_qty: 1,
        master_material: { managed_in_batch: 0, name: 'N' },
        disposal_shipment_stocks: [],
      },
    ] as any)
    expect(r.map((i) => i.is_batch)).toEqual([true, false])
    expect(r[0].stocks).toHaveLength(2)
  })

  it('createReceivePayload mengisi default received_qty dan comment', () => {
    const payload = createReceivePayload({
      id: 1,
      comment: '',
      items: [
        {
          confirmed_qty: 2,
          disposal_shipment_item_id: 3,
          stocks: [
            { disposal_shipment_stock_id: 4, received_qty: null, shipped_qty: 2 },
            { disposal_shipment_stock_id: 5, received_qty: 2, shipped_qty: 2 },
          ],
        },
      ],
    } as any)
    expect(payload.comment).toBeUndefined()
    expect(payload.items[0].stocks).toEqual([
      { disposal_shipment_stock_id: 4, received_qty: 0 },
      { disposal_shipment_stock_id: 5, received_qty: 2 },
    ])
    expect(createReceivePayload({ id: 1, comment: 'c', items: [] } as any).comment).toBe('c')
  })
})

const shipStock: any = {
  disposal_received_qty: 2,
  disposal_discard_qty: 3,
  transaction_reasons: { title: 'Rusak' },
  stock: {
    batch: { code: 'B1', expired_date: '2030-01-01', manufacture: { name: 'Bio' } },
    activity: { name: 'Rutin' },
  },
}

describe('DisposalShipmentStockItem', () => {
  it.each([
    [DISPOSAL_STATUS.CANCELLED, 'disposal.cancelled_qty'],
    [DISPOSAL_STATUS.RECEIVED, 'disposal.received_qty'],
  ])('status %s menampilkan label qty terkait', (status, label) => {
    render(<DisposalShipmentStockItem item={shipStock} status={status as number} />)
    expect(screen.getByText(label)).toBeTruthy()
    expect(screen.getByText('B1')).toBeTruthy()
  })

  it('tanpa batch dan qty undefined', () => {
    render(
      <DisposalShipmentStockItem
        item={{
          ...shipStock,
          disposal_received_qty: undefined,
          disposal_discard_qty: undefined,
          stock: { batch: null, activity: { name: 'A' } },
        }}
        status={0}
      />
    )
    expect(screen.queryByText('label.manufacturer')).toBeNull()
  })

  it('manufaktur kosong memakai tanda strip', () => {
    render(
      <DisposalShipmentStockItem
        item={{ ...shipStock, stock: { ...shipStock.stock, batch: { code: 'B', manufacture: null } } }}
        status={0}
      />
    )
    expect(screen.getByText('-')).toBeTruthy()
  })
})

describe('ReceiveShipmentStockItem', () => {
  const item: any = {
    id: 9,
    activity_name: 'Rutin',
    qty: 5,
    batch_code: 'BC',
    expired_date: '2030-01-01',
    manufacture: 'Bio',
    discard: [{ reason_id: 1, reason_title: 'Rusak', qty: 2 }],
    received: [{ reason_id: 2, reason_title: 'Exp', qty: 3 }],
  }
  const wrap = (it: any, onForm?: any) =>
    render(
      <FormWrapper
        defaultValues={{ items: [{ stocks: [{ received_qty: null }] }] }}
        onForm={onForm}>
        <ReceiveShipmentStockItem item={it} parentIndex={0} index={0} t={t} />
      </FormWrapper>
    )

  it('menampilkan section discard/received dan mengubah qty form', () => {
    let methods: any
    wrap(item, (m: any) => (methods = m))
    expect(screen.getAllByText('disposal.reason_qty').length).toBe(2)
    fireEvent.changeText(screen.getByTestId('textfield-9-received-qty'), '5')
    expect(methods.getValues('items.0.stocks.0.received_qty')).toBe(5)
    fireEvent.changeText(screen.getByTestId('textfield-9-received-qty'), '')
    expect(methods.getValues('items.0.stocks.0.received_qty')).toBeNull()
  })

  it('tanpa batch dan tanpa alasan menyembunyikan blok terkait', () => {
    wrap({ ...item, batch_code: undefined, discard: [], received: [], manufacture: undefined })
    expect(screen.queryByText('label.expired_date')).toBeNull()
    expect(screen.queryAllByText('disposal.reason_qty')).toHaveLength(0)
  })

  it('manufaktur kosong menampilkan strip', () => {
    wrap({ ...item, manufacture: undefined })
    expect(screen.getByText('-')).toBeTruthy()
  })
})

describe('SelfDisposalListItem', () => {
  const record: any = {
    id: 3,
    created_at: '2025-01-02 10:00:00',
    material: { name: 'Mat' },
    activity: { name: 'Rutin' },
    change_qty: -5,
    disposal_discard_qty: 3,
    disposal_received_qty: 2,
    transaction_reason: { title: 'Alasan A' },
    report_number: 'R1',
    disposal_method: { title: 'Bakar' },
    comment: 'catatan',
    user_created: { firstname: 'Budi', lastname: 'S' },
    opening_qty: 10,
    closing_qty: -5,
    disposal_stock: {
      batch: { code: 'BT', expired_date: '2030-01-01', production_date: '2029-01-01', manufacture: { name: 'Bio' } },
      activity: { name: 'Rutin' },
      transaction_reason: { title: 'Alasan Stok' },
    },
  }

  it('menampilkan data lengkap dengan batch', () => {
    render(<SelfDisposalListItem item={record} />)
    expect(screen.getByText('Mat')).toBeTruthy()
    expect(screen.getByText('PMM-3')).toBeTruthy()
    expect(screen.getByText('Budi S')).toBeTruthy()
    expect(screen.getByText('Alasan A')).toBeTruthy()
    expect(screen.getByText('BT')).toBeTruthy()
  })

  it('tanpa batch, tanpa komentar, alasan jatuh ke alasan stok', () => {
    render(
      <SelfDisposalListItem
        item={{
          ...record,
          comment: '',
          report_number: null,
          disposal_discard_qty: undefined,
          disposal_received_qty: undefined,
          transaction_reason: { title: '' },
          disposal_stock: { ...record.disposal_stock, batch: null },
        }}
      />
    )
    expect(screen.getByText('Alasan Stok')).toBeTruthy()
    expect(screen.getByText('label.taken_from_activity_stock')).toBeTruthy()
    expect(screen.queryByText('label.created_by')).toBeNull()
  })

  it('komentar null tetap ditampilkan dengan strip', () => {
    render(<SelfDisposalListItem item={{ ...record, comment: null }} />)
    expect(screen.getByText('label.comment')).toBeTruthy()
  })

  it('getUserNameString menggabung dan memangkas nama', () => {
    expect(getUserNameString('A', 'B')).toBe('A B')
    expect(getUserNameString('A', '')).toBe('A')
  })
})
