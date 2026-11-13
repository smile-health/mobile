import '@/test-utils/inventory-mocks'
import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react-native'
import { ORDER_STATUS, ORDER_TYPE } from '@/utils/Constants'
import { OrderReviewItem } from '../../OrderReviewItem'
import { OrderDetailItem } from '../OrderDetailItem'

const data = (over: any = {}): any => ({
  id: 1,
  material: { name: 'Vaksin' },
  qty: 10,
  confirmed_qty: 8,
  allocated_qty: 6,
  shipped_qty: 5,
  fulfilled_qty: 4,
  children: [],
  ...over,
})

const setup = (status: number, over: any = {}, props: any = {}) => {
  const onPress = jest.fn()
  render(
    <OrderDetailItem
      data={data(over)}
      orderStatus={status}
      onPress={onPress}
      {...props}
    />
  )
  return onPress
}

describe('OrderDetailItem', () => {
  it.each([
    ORDER_STATUS.PENDING,
    ORDER_STATUS.CONFIRMED,
    ORDER_STATUS.ALLOCATED,
    ORDER_STATUS.SHIPPED,
    ORDER_STATUS.FULFILLED,
    ORDER_STATUS.DRAFT,
    999,
  ])('status %s menampilkan jumlah sesuai status', (status) => {
    setup(status)
    expect(screen.getByText('Vaksin')).toBeTruthy()
  })

  it('draft memakai label confirmed_qty', () => {
    setup(ORDER_STATUS.DRAFT)
    expect(screen.getByText('label.confirmed_qty')).toBeTruthy()
  })

  it.each([
    [{ fulfilled_qty: 4 }],
    [{ fulfilled_qty: 0, allocated_qty: 6 }],
    [{ fulfilled_qty: null, allocated_qty: 0, confirmed_qty: 8 }],
    [{ fulfilled_qty: 0, allocated_qty: 0, confirmed_qty: 0 }],
    [
      {
        fulfilled_qty: undefined,
        allocated_qty: null,
        confirmed_qty: undefined,
        qty: 0,
      },
    ],
  ])('dibatalkan memilih qty pertama yang terisi %#', (over) => {
    setup(ORDER_STATUS.CANCELLED, over)
    expect(screen.getByText('Vaksin')).toBeTruthy()
  })

  it('menekan item memanggil onPress dengan data', () => {
    const onPress = setup(ORDER_STATUS.PENDING)
    fireEvent.press(screen.getByTestId('order_item_1'))
    expect(onPress).toHaveBeenCalled()
  })

  it('tanpa onPress dan tanpa detail tidak error', () => {
    render(
      <OrderDetailItem
        data={data()}
        orderStatus={ORDER_STATUS.PENDING}
        withDetail={false}
      />
    )
    fireEvent.press(screen.getByTestId('order_item_1'))
    expect(screen.queryByText('order.detail')).toBeNull()
  })

  it('bahan aktif hierarki menampilkan label bahan aktif', () => {
    setup(
      ORDER_STATUS.PENDING,
      {},
      { isHierarchy: true, type: ORDER_TYPE.REQUEST }
    )
    expect(screen.getByText('label.active_ingredient_material')).toBeTruthy()
  })

  it.each([ORDER_TYPE.DISTRIBUTION, ORDER_TYPE.RETURN])(
    'hierarki tipe %s tidak memakai bahan aktif',
    (type) => {
      setup(ORDER_STATUS.PENDING, {}, { isHierarchy: true, type })
      expect(screen.queryByText('label.active_ingredient_material')).toBeNull()
    }
  )

  it('menampilkan anak merek dagang', () => {
    setup(ORDER_STATUS.PENDING, {
      children: [
        { id: 2, material: { name: 'Merek A' }, qty: 3 },
        { id: 3, qty: 1 },
      ],
    })
    expect(screen.getByText('label.trademark_material')).toBeTruthy()
  })
})

describe('OrderReviewItem', () => {
  const reasons: any = [{ reason_id: 2, value: 'Stok habis' }]
  const base: any = { material_name: 'Vaksin', ordered_qty: 5, children: [] }

  it('dasar tanpa alasan dan tanpa anak', () => {
    render(<OrderReviewItem item={base} />)
    expect(screen.getByText('Vaksin')).toBeTruthy()
    expect(screen.queryByText('label.reason')).toBeNull()
  })

  it('hierarki menampilkan label bahan aktif', () => {
    render(
      <OrderReviewItem
        item={{ ...base, material_name: undefined }}
        isHierarchy
      />
    )
    expect(screen.getByText('label.active_ingredient_material')).toBeTruthy()
  })

  it('alasan dari daftar', () => {
    render(
      <OrderReviewItem
        item={{ ...base, reason_id: 2 }}
        isReason
        dataReason={reasons}
      />
    )
    expect(screen.getByText('Stok habis')).toBeTruthy()
  })

  it('alasan lainnya memakai teks bebas', () => {
    render(
      <OrderReviewItem
        item={{ ...base, reason_id: 9, other_reason: 'Rusak' }}
        isReason
        dataReason={reasons}
      />
    )
    expect(screen.getByText('Rusak')).toBeTruthy()
  })

  it('alasan dari order_reason_id dan tidak ketemu', () => {
    render(
      <OrderReviewItem
        item={{ ...base, order_reason_id: '77' }}
        isReason
        dataReason={reasons}
      />
    )
    expect(screen.getByText('label.reason')).toBeTruthy()
  })

  it('tanpa reason sama sekali dan tanpa dataReason', () => {
    render(<OrderReviewItem item={base} isReason />)
    expect(screen.getByText('label.reason')).toBeTruthy()
  })

  it('menampilkan anak dan hierarki material', () => {
    render(
      <OrderReviewItem
        item={{
          ...base,
          material_hierarchy: [
            {
              material_id: 1,
              material_name: 'H1',
              ordered_qty: 2,
              reason_id: 2,
            },
          ],
          children: [{ id: 5, ordered_qty: 3, material_name: 'C1' }],
        }}
        isReason
        dataReason={reasons}
      />
    )
    expect(screen.getByText('label.trademark_material')).toBeTruthy()
  })

  it('hanya anak tanpa hierarki', () => {
    render(
      <OrderReviewItem
        item={{
          ...base,
          children: [{ id: 5, ordered_qty: 3, material_name: 'C1' }],
        }}
      />
    )
    expect(screen.getByText('label.trademark_material')).toBeTruthy()
  })

  it('item tanpa children dan nama kosong', () => {
    render(<OrderReviewItem item={{ ordered_qty: undefined } as any} />)
    expect(screen.getByText('label.order_qty')).toBeTruthy()
  })
})
