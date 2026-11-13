jest.mock('../../BatchItemCard', () => {
  const { Text } = require('react-native')
  return {
    __esModule: true,
    default: ({ batch }: any) => <Text>batch-{batch.batch_code}</Text>,
  }
})

import React from 'react'
import { fireEvent, render } from '@testing-library/react-native'
import ReviewTicketItem from '../ReviewTicketItem'

const t: any = (k: string) => k
const reasons: any = [
  { value: '1', label: 'Rusak', children: [{ value: '2', label: 'Pecah' }] },
]

describe('ReviewTicketItem', () => {
  it('non-batch: tampil alasan dan hapus', () => {
    const handleDelete = jest.fn()
    const item: any = {
      id: 5,
      custom_material: null,
      name: 'Mat',
      qty: 3,
      reason: '1',
      detail_reason: '2',
    }
    const { getByText, queryByText } = render(
      <ReviewTicketItem
        item={item}
        t={t}
        reasonOptions={reasons}
        handleDelete={handleDelete}
      />
    )
    getByText('Mat')
    getByText('Rusak')
    getByText('Pecah')
    expect(queryByText('ticket.new_material_label')).toBeNull()
    fireEvent.press(getByText('button.delete'))
    expect(handleDelete).toHaveBeenCalledWith(item)
  })

  it('tanpa handleDelete tidak ada tombol hapus; detail dari child_reason', () => {
    const item: any = {
      id: 5,
      custom_material: null,
      material_name: 'MN',
      name: 'n',
      qty: 1,
      reason: '1',
      child_reason: '2',
    }
    const { queryByText, getByText } = render(
      <ReviewTicketItem item={item} t={t} reasonOptions={reasons} />
    )
    expect(queryByText('button.delete')).toBeNull()
    getByText('MN')
    getByText('Pecah')
  })

  it('material custom ditandai baru dan memakai nama custom', () => {
    const item: any = { id: 7, custom_material: 'Custom', name: 'n', qty: 1 }
    const { getByText } = render(
      <ReviewTicketItem item={item} t={t} reasonOptions={reasons} />
    )
    getByText('Custom')
    getByText('ticket.new_material_label')
  })

  it('id material baru (timestamp besar) juga ditandai baru; reason kosong aman', () => {
    const item: any = {
      id: 1_700_000_000,
      custom_material: null,
      name: 'Baru',
      qty: 1,
    }
    const { getByText } = render(
      <ReviewTicketItem item={item} t={t} reasonOptions={[]} />
    )
    getByText('ticket.new_material_label')
  })

  it('batch: daftar BatchItemCard', () => {
    const item: any = {
      id: 5,
      custom_material: null,
      name: 'Mat',
      qty: 3,
      batches: [{ batch_code: 'A' }, { batch_code: 'B' }],
    }
    const { getByText, queryByText } = render(
      <ReviewTicketItem
        item={item}
        t={t}
        reasonOptions={reasons}
        handleDelete={jest.fn()}
      />
    )
    getByText('batch-A')
    getByText('batch-B')
    getByText('ticket.material_batch')
    expect(queryByText('label.reason')).toBeNull()
  })
})
