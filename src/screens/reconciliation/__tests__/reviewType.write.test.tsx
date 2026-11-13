import React from 'react'
import { render, screen } from '@testing-library/react-native'
import ReviewReconciliationTypeItem from '../components/ReviewReconciliationTypeItem'

describe('ReviewReconciliationTypeItem', () => {
  it('menampilkan alasan dan aksi', () => {
    render(
      <ReviewReconciliationTypeItem
        item={
          {
            actual_qty: 3,
            recorded_qty: 5,
            reconciliation_category_label: 'Batch',
            action_reasons: [
              {
                reason_id: 1,
                action_id: 2,
                reason_title: 'Hilang',
                action_title: 'Catat',
              },
            ],
          } as any
        }
      />
    )
    expect(screen.getByText('Batch')).toBeTruthy()
    expect(screen.getByText('reconciliation.reason_action')).toBeTruthy()
  })

  it('memakai default saat qty dan alasan tidak ada', () => {
    render(
      <ReviewReconciliationTypeItem
        item={{ recorded_qty: 5, reconciliation_category_label: 'B' } as any}
      />
    )
    expect(screen.queryByText('reconciliation.reason_action')).toBeNull()
    expect(screen.getByText('0')).toBeTruthy()
  })

  it('daftar alasan kosong tidak menampilkan blok alasan', () => {
    render(
      <ReviewReconciliationTypeItem
        item={
          {
            actual_qty: 1,
            recorded_qty: 1,
            reconciliation_category_label: 'B',
            action_reasons: [],
          } as any
        }
      />
    )
    expect(screen.queryByText('reconciliation.reason_action')).toBeNull()
  })
})
