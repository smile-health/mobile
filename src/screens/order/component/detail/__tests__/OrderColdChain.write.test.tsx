jest.mock('@/i18n/useLanguage', () => ({
  useLanguage: () => ({ t: (k: string, o?: any) => (o ? `${k}(${o.status})` : k) }),
}))
jest.mock('@/components/buttons/CheckBox', () => {
  const { Pressable, Text } = require('react-native')
  return { CheckBox: ({ text, onPress, checked }: any) => <Pressable onPress={onPress}><Text>{`${text}:${checked}`}</Text></Pressable> }
})

import React from 'react'
import { fireEvent, render } from '@testing-library/react-native'
import { OrderColdChain } from '../OrderColdChain'

const data = [
  { is_confirm: 0, total_volume: 10, capacity_asset: 100, percent_capacity: 10 },
  { is_confirm: 1, total_volume: 20, capacity_asset: 200, percent_capacity: 20 },
]

describe('OrderColdChain', () => {
  it('pending: status "ordered", memakai data unconfirmed, tanpa checkbox', () => {
    const { getByText, queryByText } = render(<OrderColdChain orderStatus={1} data={[data[0]]} />)
    getByText('order.coldchain_capacity_status(order.ordered)')
    getByText('10%')
    expect(queryByText(/show_ordered_coldchain/)).toBeNull()
  })

  it('status lain: memakai data terkonfirmasi dan checkbox menampilkan data awal', () => {
    const { getByText, queryByText } = render(<OrderColdChain orderStatus={2} data={data} />)
    getByText('order.coldchain_capacity_status(order.confirmed)')
    getByText('20%')
    expect(queryByText('10%')).toBeNull()
    fireEvent.press(getByText('order.show_ordered_coldchain:false'))
    getByText('10%')
    fireEvent.press(getByText('order.show_ordered_coldchain:true'))
    expect(queryByText('10%')).toBeNull()
  })

  it('data kosong menampilkan "-%"', () => {
    const { getAllByText } = render(<OrderColdChain orderStatus={2} data={[]} />)
    expect(getAllByText('-%').length).toBeGreaterThan(0)
  })

  it('checkbox dengan data awal kosong memakai tanda strip', () => {
    const { getByText, getAllByText } = render(<OrderColdChain orderStatus={3} data={[data[1]]} />)
    fireEvent.press(getByText('order.show_ordered_coldchain:false'))
    expect(getAllByText('-%')).toHaveLength(1)
  })
})
