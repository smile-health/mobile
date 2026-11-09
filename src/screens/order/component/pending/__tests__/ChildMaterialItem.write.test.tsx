const mockInputs: any[] = []
jest.mock('@/components/forms', () => ({ InputNumber: (p: any) => { mockInputs.push(p); return null } }))
jest.mock('@/components/list/InfoRow', () => {
  const { Text } = require('react-native')
  return { InfoRow: ({ label, value }: any) => <Text>{`${label}=${value}`}</Text> }
})
jest.mock('@/components/separator/Separator', () => ({ __esModule: true, default: () => null }))
jest.mock('../../confirm/StockRange', () => ({ __esModule: true, default: () => null }))

import React from 'react'
import { render } from '@testing-library/react-native'
import { ChildMaterialItem } from '../ChildMaterialItem'

const t: any = (k: string) => k
const child: any = {
  id: 4,
  material: { name: 'Anak' },
  ordered_qty: 12,
  stock_vendor: { total_available_qty: 20, min: 1, max: 30 },
  stock_customer: { total_available_qty: 7 },
}

const setup = (type: any, over: any = {}, qty: any = 5) => {
  const updateChildQuantity = jest.fn()
  const updateChildrenQty = jest.fn()
  const watch = jest.fn(() => qty)
  const utils = render(
    <ChildMaterialItem
      child={{ ...child, ...over }}
      childIndex={1}
      control={{} as any}
      t={t}
      watch={watch}
      updateChildQuantity={updateChildQuantity}
      updateChildrenQty={updateChildrenQty}
      parentIndex={2}
      type={type}
    />
  )
  return { updateChildQuantity, updateChildrenQty, watch, ...utils }
}

beforeEach(() => { mockInputs.length = 0 })

describe('ChildMaterialItem', () => {
  it('mode edit: stok vendor dan input tanpa error', () => {
    const { getByText } = setup('edit')
    getByText('Anak')
    getByText('label.available_stock=20')
    expect(mockInputs[0].errors).toBeUndefined()
    expect(mockInputs[0].value).toBe('5')
  })

  it('mode edit: onChangeText memperbarui qty parent dan form', () => {
    const { updateChildQuantity, updateChildrenQty } = setup('edit')
    mockInputs[0].onChangeText('9')
    expect(updateChildQuantity).toHaveBeenCalledWith(2, 4, '9')
    expect(updateChildrenQty).toHaveBeenCalledWith(1, '9')
  })

  it('mode confirm: tampil ordered qty dan error bila melebihi stok vendor', () => {
    const { getByText } = setup('confirm', {}, 50)
    getByText('label.ordered_qty=12')
    getByText('label.available_stock=20')
    expect(mockInputs[0].errors).toBe('transaction.validation.max_qty')
  })

  it('mode validate memakai stok customer', () => {
    const { getByText } = setup('validate', {}, 1)
    getByText('label.available_stock=7')
    expect(mockInputs[0].errors).toBe('')
  })

  it('data stok kosong memakai strip', () => {
    const { getByText } = setup('confirm', { stock_vendor: undefined, stock_customer: undefined, ordered_qty: undefined })
    getByText('label.available_stock=-')
    getByText('label.ordered_qty=-')
  })

  it('validate tanpa stok customer memakai strip', () => {
    const { getByText } = setup('validate', { stock_customer: undefined })
    getByText('label.available_stock=-')
  })
})
