jest.mock(
  '@react-navigation/native',
  () => require('@/test-utils/misc-nav').navModule
)

import React from 'react'
import { fireEvent, render, screen, act } from '@testing-library/react-native'
import { FormWrapper } from '@/test-utils/misc-form'
import DisposalInputItem from '../components/DisposalInputItem'
import ReviewDisposalStockItem from '../components/ReviewDisposalStockItem'
import ReviewItemDisposal from '../components/ReviewItemDisposal'
import DisposalShipmentItem from '../components/shipment-list/DisposalShipmentItem'

const t: any = (k: string) => k
const label: any = {
  qty: 'q',
  stockDiscard: 'discard',
  stockReceived: 'received',
}
const qty = (id: number) => ({
  disposal_stock_id: id,
  transaction_reason_id: id,
  transaction_reason_name: 'R' + id,
  disposal_qty: 1,
})

const stockOf = (extra: any = {}) => ({
  stock_id: 1,
  activity: { name: 'Rutin' },
  batch: {
    code: 'BT',
    expired_date: '2030-01-01',
    manufacture: { name: 'Bio' },
  },
  discard: [qty(1)],
  received: [qty(2)],
  ...extra,
})

describe('ReviewDisposalStockItem', () => {
  it('menampilkan batch, discard dan received', async () => {
    await render(
      <ReviewDisposalStockItem
        stock={stockOf() as any}
        qty={2}
        t={t}
        label={label}
      />
    )
    expect(screen.getByText('BT')).toBeTruthy()
    expect(screen.getByText('discard')).toBeTruthy()
    expect(screen.getByText('received')).toBeTruthy()
  })

  it('tanpa batch dan tanpa qty tidak menampilkan blok terkait', async () => {
    await render(
      <ReviewDisposalStockItem
        stock={
          stockOf({ batch: undefined, discard: [], received: undefined }) as any
        }
        qty={0}
        t={t}
        label={label}
      />
    )
    expect(screen.queryByText('label.expired_date')).toBeNull()
    expect(screen.queryByText('discard')).toBeNull()
    expect(screen.queryByText('received')).toBeNull()
  })

  it('manufaktur kosong menampilkan strip', async () => {
    await render(
      <ReviewDisposalStockItem
        stock={stockOf({ batch: { code: 'B', manufacture: null } }) as any}
        qty={1}
        t={t}
        label={label}
      />
    )
    expect(screen.getByText('-')).toBeTruthy()
  })
})

describe('ReviewItemDisposal', () => {
  it('menjumlahkan qty dan menampilkan label batch jika dikelola per batch', async () => {
    const item: any = {
      material: { name: 'Vaksin', is_managed_in_batch: 1 },
      disposal: [stockOf(), stockOf({ stock_id: 2 })],
    }
    await render(<ReviewItemDisposal item={item} type={'self' as any} />)
    expect(screen.getByText('Vaksin')).toBeTruthy()
    expect(screen.getByText('disposal.material_batch')).toBeTruthy()
    expect(screen.getByText('4')).toBeTruthy()
  })

  it('tanpa batch tidak menampilkan label batch', async () => {
    const item: any = {
      material: { name: 'V', is_managed_in_batch: 0 },
      disposal: [],
    }
    await render(<ReviewItemDisposal item={item} type={'self' as any} />)
    expect(screen.queryByText('disposal.material_batch')).toBeNull()
  })
})

describe('DisposalInputItem', () => {
  const sectionItem: any = { title: 'Rusak', disposal_qty: 5 }
  const setup = async (item: any, errors?: string) => {
    let methods: any
    await render(
      <FormWrapper
        defaultValues={{ discard: [{ disposal_qty: 0 }] }}
        onForm={(m: any) => (methods = m)}>
        <DisposalInputItemHarness item={item} errors={errors} />
      </FormWrapper>
    )
    return () => methods
  }
  function DisposalInputItemHarness({ item, errors }: any) {
    const { useFormContext } = require('react-hook-form')
    const { control } = useFormContext()
    return (
      <DisposalInputItem
        item={item}
        name='discard.0.disposal_qty'
        type={'self' as any}
        qtyType={'discard' as any}
        control={control}
        errors={errors}
      />
    )
  }

  it('mengubah qty menjadi angka di form', async () => {
    const get = await setup(sectionItem)
    expect(screen.getByText('Rusak')).toBeTruthy()
    const input = screen.getByDisplayValue('0')
    await act(async () => {
      await fireEvent.changeText(input, '4')
    })
    expect(get().getValues('discard.0.disposal_qty')).toBe(4)
  })

  it('input tidak bisa diedit jika qty maksimum 0', async () => {
    await setup({ ...sectionItem, disposal_qty: 0 }, 'pesan error')
    expect(screen.getByDisplayValue('0').props.editable).toBe(false)
  })
})

describe('DisposalShipmentItem', () => {
  const item: any = {
    id: 12,
    activity: { name: 'Rutin' },
    customer: { name: 'Pelanggan' },
    vendor: { name: 'Vendor' },
    status: 1,
    created_at: '2025-01-01 10:00:00',
    disposal_items: [{}, {}],
  }
  it('pengirim melihat nama customer', async () => {
    const onPress = jest.fn()
    await render(
      <DisposalShipmentItem item={item} isSender onPress={onPress} />
    )
    expect(screen.getByText('Pelanggan')).toBeTruthy()
    await fireEvent.press(screen.getByTestId('disposal-KPM-12'))
    expect(onPress).toHaveBeenCalled()
  })
  it('penerima melihat vendor; tanpa activity dan item', async () => {
    await render(
      <DisposalShipmentItem
        item={{ ...item, activity: undefined, disposal_items: undefined }}
        isSender={false}
        onPress={jest.fn()}
      />
    )
    expect(screen.getByText('Vendor')).toBeTruthy()
    expect(screen.getByText('0')).toBeTruthy()
  })
})
