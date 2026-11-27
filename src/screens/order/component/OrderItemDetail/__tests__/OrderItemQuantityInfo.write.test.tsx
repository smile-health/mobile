import '@/test-utils/inventory-mocks'
import React from 'react'
import { render, screen } from '@testing-library/react-native'
import { ORDER_STATUS } from '@/utils/Constants'
import OrderItemQuantityInfo from '../OrderItemQuantityInfo'

const setup = async (over: any = {}) =>
  await render(
    <OrderItemQuantityInfo
      orderStatus={ORDER_STATUS.PENDING}
      allocatedQty={null}
      shippedQty={null}
      receivedQty={null}
      {...over}
    />
  )

describe('OrderItemQuantityInfo', () => {
  it('tanpa qty tidak menampilkan baris apa pun', async () => {
    await setup()
    expect(screen.queryByText('label.ordered_qty')).toBeNull()
    expect(screen.queryByText('label.allocated_qty')).toBeNull()
  })

  it('menampilkan semua qty yang terisi', async () => {
    await setup({
      orderedQty: 10,
      confirmedQty: 8,
      allocatedQty: 6,
      shippedQty: 5,
    })
    expect(screen.getByText('label.ordered_qty')).toBeTruthy()
    expect(screen.getByText('label.confirmed_qty')).toBeTruthy()
    expect(screen.getByText('label.allocated_qty')).toBeTruthy()
    expect(screen.getByText('label.shipped_qty')).toBeTruthy()
  })

  it('terpenuhi menampilkan qty diterima', async () => {
    await setup({ orderStatus: ORDER_STATUS.FULFILLED, receivedQty: 4 })
    expect(screen.getByText('label.fulfilled_qty')).toBeTruthy()
  })

  it.each([
    [{ allocatedQty: 3, confirmedQty: 2, orderedQty: 1 }],
    [{ allocatedQty: null, confirmedQty: 2, orderedQty: 1 }],
    [{ allocatedQty: null, confirmedQty: undefined, orderedQty: 1 }],
    [{ allocatedQty: null }],
  ])('dibatalkan memakai qty cadangan %#', async (over) => {
    await setup({ orderStatus: ORDER_STATUS.CANCELLED, ...over })
    expect(screen.getByText('label.cancelled_qty')).toBeTruthy()
  })
})
