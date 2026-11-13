const mockHook: { value: any } = { value: {} }
jest.mock('@/i18n/useLanguage', () => ({
  useLanguage: () => ({
    t: (k: string) => (k === 'order.order_reasons' ? [{ value: 'r', reason_id: 1 }] : k),
  }),
}))
jest.mock('../../hooks/useOrderEditItem', () => ({
  useOrderEditItem: () => mockHook.value,
}))
jest.mock('@/components/dropdown/Dropdown', () => {
  const { Text } = require('react-native')
  return { __esModule: true, default: () => <Text>dropdown</Text> }
})
jest.mock('@/components/forms', () => {
  const { Text } = require('react-native')
  return { TextField: ({ name }: any) => <Text>{`field:${name}`}</Text> }
})
jest.mock('../pending/ChildMaterialItem', () => {
  const { Text } = require('react-native')
  return { ChildMaterialItem: ({ child }: any) => <Text>{`child:${child.id}`}</Text> }
})
jest.mock('../confirm/StockRange', () => {
  const { Text } = require('react-native')
  return { __esModule: true, default: ({ min, max }: any) => <Text>{`range:${min}:${max}`}</Text> }
})

import React from 'react'
import { render, screen } from '@testing-library/react-native'
import { ORDER_EDIT_TYPE, OTHER_REASON_ID } from '@/utils/Constants'
import { OrderEditItem } from '../OrderEditItem'

const hook = (over: any = {}) => ({
  control: {},
  qty: 5,
  errors: {},
  qtyHelperMessage: 'helper',
  shouldShowReasonDropdown: true,
  min: 1,
  max: 9,
  reason: 1,
  otherReasonText: 'lainnya',
  isMaterialHierarchy: false,
  watch: jest.fn(),
  updateChildrenQty: jest.fn(),
  isEdit: false,
  isValidate: false,
  ...over,
})

const item = (over: any = {}): any => ({
  material: { name: 'Vaksin' },
  ordered_qty: 4,
  reason: { name: 'Alasan A' },
  stock_customer: { total_available_qty: 10 },
  stock_vendor: { total_available_qty: 20 },
  children: [],
  ...over,
})

const setup = (h: any = {}, it: any = {}, props: any = {}) => {
  mockHook.value = hook(h)
  return render(
    <OrderEditItem
      item={item(it)}
      index={0}
      updateQuantity={jest.fn()}
      updateReason={jest.fn()}
      updateOtherReasonText={jest.fn()}
      updateChildQuantity={jest.fn()}
      type={ORDER_EDIT_TYPE.CONFIRM as any}
      {...props}
    />
  )
}

describe('OrderEditItem', () => {
  it('tampilan non-hierarki: qty, stok vendor, dan dropdown alasan', () => {
    setup()
    expect(screen.getByText('Vaksin')).toBeTruthy()
    expect(screen.getByText('field:qty')).toBeTruthy()
    expect(screen.getByText('dropdown')).toBeTruthy()
    expect(screen.getByText('range:1:9')).toBeTruthy()
    expect(screen.queryByText('label.active_ingredient_material')).toBeNull()
  })

  it('min/max null tampil tanda -', () => {
    setup({ min: null, max: null })
    expect(screen.getByText('range:-:-')).toBeTruthy()
  })

  it('tipe validate memakai stok customer dan label validasi', () => {
    setup({ isValidate: true }, {}, { type: ORDER_EDIT_TYPE.VALIDATE })
    expect(screen.getByText('field:qty')).toBeTruthy()
  })

  it('mode edit memakai label order dan menyembunyikan error', () => {
    setup({ isEdit: true, errors: { qty: { message: 'x' } } })
    expect(screen.getByText('field:qty')).toBeTruthy()
  })

  it('alasan lainnya menampilkan field teks', () => {
    setup({ reason: OTHER_REASON_ID })
    expect(screen.getByText('field:other_reason_text')).toBeTruthy()
  })

  it('tanpa dropdown alasan dan alasan item kosong', () => {
    setup({ shouldShowReasonDropdown: false, qty: 0 }, { reason: undefined, stock_vendor: undefined })
    expect(screen.queryByText('dropdown')).toBeNull()
  })

  it('stok null diganti tanda -', () => {
    setup({}, { stock_vendor: { total_available_qty: null }, ordered_qty: null })
    expect(screen.getByText('field:qty')).toBeTruthy()
  })

  it('hierarki dengan anak: mode edit menampilkan dropdown dan anak', () => {
    setup(
      { isMaterialHierarchy: true, isEdit: true },
      { children: [{ id: 11 }, { id: 12 }] }
    )
    expect(screen.getByText('label.active_ingredient_material')).toBeTruthy()
    expect(screen.getByText('child:11')).toBeTruthy()
    expect(screen.getByText('dropdown')).toBeTruthy()
  })

  it('hierarki edit dengan alasan lainnya menampilkan field teks', () => {
    setup(
      { isMaterialHierarchy: true, isEdit: true, reason: OTHER_REASON_ID },
      { children: [{ id: 11 }] },
      { dataReason: [{ value: 'x', reason_id: 2 }] }
    )
    expect(screen.getByText('field:other_reason_text')).toBeTruthy()
  })

  it('hierarki non-edit menampilkan baris alasan saja', () => {
    setup(
      { isMaterialHierarchy: true, isEdit: false, reason: OTHER_REASON_ID },
      { children: [{ id: 11 }] }
    )
    expect(screen.getByText('lainnya')).toBeTruthy()
    expect(screen.queryByText('dropdown')).toBeNull()
  })

  it('hierarki tanpa anak jatuh ke tampilan biasa', () => {
    setup({ isMaterialHierarchy: true }, { children: undefined })
    expect(screen.getByText('field:qty')).toBeTruthy()
  })
})
