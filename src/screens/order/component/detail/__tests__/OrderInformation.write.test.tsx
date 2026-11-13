let mockHistoryProps: any
jest.mock('@/i18n/useLanguage', () => ({
  useLanguage: () => ({ t: (k: string) => k }),
}))
jest.mock('@/components/list/FieldValue', () => {
  const { Text } = require('react-native')
  return {
    FieldValue: ({ label, value }: any) => <Text>{`${label}=${value}`}</Text>,
  }
})
jest.mock('../BadgeIntegrationOrder', () => {
  const { Text } = require('react-native')
  return {
    __esModule: true,
    default: ({ type }: any) => <Text>badge-{type}</Text>,
  }
})
jest.mock('../OrderHistorySection', () => {
  const { Text } = require('react-native')
  return {
    OrderHistorySection: (p: any) => {
      mockHistoryProps = p
      return <Text>history</Text>
    },
  }
})
jest.mock('../../section/VendorCustomerSection', () => {
  const { Text } = require('react-native')
  return { __esModule: true, default: () => <Text>vendor-customer</Text> }
})

import React from 'react'
import { fireEvent, render } from '@testing-library/react-native'
import { OrderInformation } from '../OrderInformation'

const base: any = {
  id: 55,
  type: 1,
  status: 1,
  delivery_type: 'Truck',
  po_no: 'PO1',
  required_date: '2025-02-03',
  estimated_date: '2025-02-05',
  shipped_at: '2025-02-06T10:00:00Z',
  fulfilled_at: '2025-02-07T10:00:00Z',
  created_at: '2025-02-01T10:00:00Z',
  user_created_by: { firstname: 'Ann', lastname: 'Lee' },
  confirmed_at: null,
  taken_by_customer: 1,
  vendor: {},
  customer: {},
}

const open = (order: any) => {
  const r = render(<OrderInformation order={order} />)
  fireEvent.press(r.getByTestId('btn-toggle-show-detail'))
  return r
}

describe('OrderInformation', () => {
  it('judul memuat id; detail tersembunyi sebelum toggle', () => {
    const { getByText, queryByText } = render(<OrderInformation order={base} />)
    getByText(/55/)
    getByText('vendor-customer')
    getByText('button.show_all')
    expect(queryByText('history')).toBeNull()
  })

  it('badge integrasi tampil bila client_key ada', () => {
    const { getByText } = render(
      <OrderInformation order={{ ...base, metadata: { client_key: 'sap' } }} />
    )
    getByText('badge-sap')
  })

  it('toggle menampilkan detail lalu menyembunyikannya', () => {
    const { getByText, queryByText, getByTestId } = open(base)
    getByText('history')
    getByText('button.show_less')
    fireEvent.press(getByTestId('btn-toggle-show-detail'))
    expect(queryByText('history')).toBeNull()
  })

  it('status pending: tanggal pengiriman/penerimaan tetap tampil karena kondisi OR', () => {
    const { getByText } = open(base)
    getByText('label.delivery_type=Truck')
    getByText(/label.actual_shipment_date=/)
    getByText(/label.actual_receipt_date=/)
  })

  it('status fulfilled: ada estimasi tiba dan pengambilan customer (ya/tidak)', () => {
    const { getByText } = open({ ...base, status: 5 })
    getByText(/label.estimated_arrival_date=/)
    getByText('label.customer_picked_up=common.yes')
  })

  it('fulfilled tanpa pengambilan customer dan tanpa tanggal memakai "-"', () => {
    const { getByText } = open({
      ...base,
      status: 5,
      delivery_type: undefined,
      required_date: undefined,
      estimated_date: undefined,
      shipped_at: undefined,
      fulfilled_at: undefined,
      taken_by_customer: 0,
    })
    getByText('label.customer_picked_up=common.no')
    getByText('label.delivery_type=-')
    getByText('label.required_by_date=-')
    getByText('label.actual_shipment_date=-')
  })

  it('timestamp: tanpa tanggal "-", dengan user diformat, user kosong aman', () => {
    open({ ...base, user_created_by: undefined })
    expect(mockHistoryProps.timestamps.confirmedAt).toBe('-')
    expect(mockHistoryProps.timestamps.createdAt).toMatch(/label\.by/)
    expect(mockHistoryProps.timestamps.createdAt).toMatch(/-$/)
    open(base)
    expect(mockHistoryProps.timestamps.createdAt).toMatch(/Ann Lee$/)
  })
})
