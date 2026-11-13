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

const setup = (props: any = {}, defaults: any = {}) => {
  const form = renderHook(() => useForm<any>({ defaultValues: defaults }))
  const methods = form.result.current
  const spySet = jest.spyOn(methods, 'setValue')
  const spyClear = jest.spyOn(methods, 'clearErrors')
  render(
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
  it('nilai awal undefined diinisialisasi ke string kosong', () => {
    const { spySet } = setup()
    expect(spySet).toHaveBeenCalledWith('quantityByStock.9.quantity', '', {
      shouldValidate: true,
    })
  })

  it('nilai yang sudah ada tidak ditimpa', () => {
    const { spySet, last } = setup(
      {},
      { quantityByStock: { 9: { quantity: 3 } } }
    )
    expect(spySet).not.toHaveBeenCalled()
    expect(last().value).toBe(3)
    expect(last().errors).toBe('')
  })

  it('melebihi maxQty menampilkan error max_qty; maxQty default 0', () => {
    expect(
      setup({}, { quantityByStock: { 9: { quantity: 8 } } }).last().errors
    ).toBe('transaction.validation.max_qty')
    expect(
      setup(
        { maxQty: undefined },
        { quantityByStock: { 9: { quantity: 1 } } }
      ).last().errors
    ).toBe('transaction.validation.max_qty')
  })

  it('pesan error form diprioritaskan', () => {
    const { last } = setup({
      errors: { quantityByStock: { 9: { message: 'wajib' } } },
    })
    expect(last().errors).toBe('wajib')
  })

  it('ubah teks: angka disimpan numerik; kosong membersihkan error', () => {
    const { spySet, spyClear, last } = setup()
    act(() => last().onChangeText('4'))
    expect(spySet).toHaveBeenCalledWith('quantityByStock.9.quantity', 4, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    })
    act(() => last().onChangeText(''))
    expect(spySet).toHaveBeenLastCalledWith('quantityByStock.9.quantity', '', {
      shouldValidate: true,
    })
    expect(spyClear).toHaveBeenCalledWith('quantityByStock.9.quantity')
  })
})
