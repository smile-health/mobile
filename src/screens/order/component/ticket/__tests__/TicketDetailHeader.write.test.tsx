jest.mock('@/components/buttons', () => {
  const { Pressable, Text } = require('react-native')
  return { Button: ({ text, onPress }: any) => <Pressable onPress={onPress}><Text>{text}</Text></Pressable> }
})

import React from 'react'
import { fireEvent, render } from '@testing-library/react-native'
import TicketDetailHeader from '../TicketDetailHeader'

const t: any = (k: string, d?: any) => (typeof d === 'object' ? `${k}:${d.count}` : k)
const base: any = {
  id: 12,
  status_id: 9,
  status_label: 'Fallback',
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T01:00:00Z',
  entity: { name: 'Puskesmas', address: 'Jl A' },
  history_change_status: [
    { status_id: 9, status_label: 'Selesai', created_at: '2025-01-01T01:00:00Z', created_by: { firstname: 'Budi' } },
    { status_id: 1, status_label: 'Baru', created_at: '2025-01-01T00:00:00Z' },
  ],
  items: [{}, {}],
}

describe('TicketDetailHeader', () => {
  it('DO number bila tidak ada order; riwayat status dan jumlah item', () => {
    const { getByText, getAllByText, queryByText } = render(
      <TicketDetailHeader ticketDetail={{ ...base, do_number: 'DO-9' }} t={t} onViewOrderDetail={jest.fn()} onViewPackingSlip={jest.fn()} />
    )
    getByText('ticket.do_number')
    getByText('DO-9')
    expect(getAllByText('Selesai')).toHaveLength(2)
    getByText(/Budi/)
    getByText('Total: label.count_items:2')
    getByText('Puskesmas')
    expect(queryByText('ticket.cancel_inquiry')).toBeNull()
    expect(queryByText('ticket.view_order_detail')).toBeNull()
    expect(queryByText('ticket.view_packing_slip_link')).toBeNull()
  })

  it('dengan order dan slip: tombol aktif dan baris cancel inquiry', () => {
    const onOrder = jest.fn()
    const onSlip = jest.fn()
    const { getByText } = render(
      <TicketDetailHeader
        ticketDetail={{ ...base, order_id: 77, slip_link: 'http://x', entity: { name: 'E' } }}
        t={t}
        onViewOrderDetail={onOrder}
        onViewPackingSlip={onSlip}
      />
    )
    getByText('ticket.order_number')
    getByText('77')
    getByText('ticket.cancel_inquiry')
    fireEvent.press(getByText('ticket.view_order_detail'))
    fireEvent.press(getByText('ticket.view_packing_slip_link'))
    expect(onOrder).toHaveBeenCalled()
    expect(onSlip).toHaveBeenCalled()
    getByText('-')
  })

  it('status label jatuh ke string kosong bila riwayat tidak memuat status; tanpa items', () => {
    const { getByText } = render(
      <TicketDetailHeader
        ticketDetail={{ ...base, history_change_status: undefined, items: undefined, status_id: undefined }}
        t={t}
        onViewOrderDetail={jest.fn()}
        onViewPackingSlip={jest.fn()}
      />
    )
    getByText('Total: label.count_items:0')
  })
})
