const mockInputs: any[] = []
jest.mock('@/components/forms', () => ({
  InputNumber: (p: any) => {
    mockInputs.push(p)
    return null
  },
}))

import React from 'react'
import { render, renderHook, act } from '@testing-library/react-native'
import { useForm } from 'react-hook-form'
import OrderQtyInput from '../OrderQtyInput'

const t: any = (k: string) => k

const setup = async (props: any = {}, defaults: any = {}) => {
  const form = await renderHook(() => useForm<any>({ defaultValues: defaults }))
  const methods = form.result.current
  const spySet = jest.spyOn(methods, 'setValue')
  const spyClear = jest.spyOn(methods, 'clearErrors')
  await render(
    <OrderQtyInput
      stockId={9}
      methods={methods}
      errors={{} as any}
      t={t}
      maxQty={5}
      {...props}
    />
  )
  return { methods, spySet, spyClear, last: () => mockInputs.at(-1) }
}

beforeEach(() => {
  mockInputs.length = 0
})

describe('OrderQtyInput', () => {
  it('nilai awal undefined diinisialisasi ke string kosong', async () => {
    const { spySet } = await setup()
    expect(spySet).toHaveBeenCalledWith('quantityByStock.9.quantity', '', {
      shouldValidate: true,
    })
  })

  it('nilai yang sudah ada tidak ditimpa', async () => {
    const { spySet, last } = await setup(
      {},
      { quantityByStock: { 9: { quantity: 3 } } }
    )
    expect(spySet).not.toHaveBeenCalled()
    expect(last().value).toBe(3)
    expect(last().errors).toBe('')
  })

  it('melebihi maxQty menampilkan error max_qty; maxQty default 0', async () => {
    expect(
      (await setup({}, { quantityByStock: { 9: { quantity: 8 } } })).last()
        .errors
    ).toBe('transaction.validation.max_qty')
    expect(
      (
        await setup(
          { maxQty: undefined },
          { quantityByStock: { 9: { quantity: 1 } } }
        )
      ).last().errors
    ).toBe('transaction.validation.max_qty')
  })

  it('pesan error form diprioritaskan', async () => {
    const { last } = await setup({
      errors: { quantityByStock: { 9: { message: 'wajib' } } },
    })
    expect(last().errors).toBe('wajib')
  })

  it('ubah teks: angka disimpan numerik; kosong membersihkan error', async () => {
    const { spySet, spyClear, last } = await setup()
    await act(() => last().onChangeText('4'))
    expect(spySet).toHaveBeenCalledWith('quantityByStock.9.quantity', 4, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    })
    await act(() => last().onChangeText(''))
    expect(spySet).toHaveBeenLastCalledWith('quantityByStock.9.quantity', '', {
      shouldValidate: true,
    })
    expect(spyClear).toHaveBeenCalledWith('quantityByStock.9.quantity')
  })
})
