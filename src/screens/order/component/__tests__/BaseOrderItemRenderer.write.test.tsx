jest.mock('@/components/dropdown/Dropdown', () => {
  const { Text } = require('react-native')
  return { __esModule: true, default: ({ name }: any) => <Text>{`dd:${name}`}</Text> }
})
jest.mock('@/components/forms', () => {
  const { Pressable, Text } = require('react-native')
  return {
    InputNumber: ({ name, value, onChangeText, errors }: any) => (
      <Pressable testID={`in:${name}`} onPress={() => onChangeText('7')}>
        <Text>{`${name}=${value}|${JSON.stringify(errors ?? null)}`}</Text>
      </Pressable>
    ),
  }
})
jest.mock('@/components/ActivityLabel', () => {
  const { Text } = require('react-native')
  return { __esModule: true, default: ({ name }: any) => <Text>{`act:${name}`}</Text> }
})

import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react-native'
import BaseOrderItemRenderer from '../BaseOrderItemRenderer'

const stocks: any[] = [
  { id: 1, batch: { code: 'B1' }, activity_name: 'Rutin', allocated_qty: 5 },
  { id: 2, batch: { code: 'B2' }, activity: { name: 'Tambahan' }, allocated_qty: 3 },
  { id: 3, allocated_qty: 1 },
]
const form: any = {
  order_items: [
    {
      receives: [{ received_qty: 4 }, { received_qty: 3 }],
      children: [{ receives: [{ received_qty: 2 }] }],
    },
  ],
}

const setup = (props: any = {}) => {
  const setValue = jest.fn()
  render(
    <BaseOrderItemRenderer
      stocks={stocks}
      index={0}
      control={{} as any}
      form={form}
      setValue={setValue}
      t={(k: string) => k}
      {...props}
    />
  )
  return setValue
}

describe('BaseOrderItemRenderer', () => {
  it('non-hierarki memakai receives index stok dan setValue saat diubah', () => {
    const setValue = setup()
    expect(screen.getByText(/order_items.0.receives.0.received_qty=4/)).toBeTruthy()
    fireEvent.press(screen.getByTestId('in:order_items.0.receives.0.received_qty'))
    expect(setValue).toHaveBeenCalledWith('order_items.0.receives.0.received_qty', 7)
    expect(screen.getByText('act:Rutin')).toBeTruthy()
    expect(screen.getByText('act:Tambahan')).toBeTruthy()
  })

  it('hierarki memakai receives milik anak', () => {
    setup({ isHierarchy: true, childIdx: 0, stocks: [stocks[0]] })
    expect(screen.getByText(/children.0.receives.0.received_qty=2/)).toBeTruthy()
  })

  it('inputProps menggantikan nilai, nama field, dan perubahan', () => {
    const onValueChange = jest.fn()
    const setValue = setup({
      stocks: [stocks[0]],
      inputProps: {
        getValue: () => 9,
        getFieldName: () => 'custom.field',
        onValueChange,
      },
    })
    fireEvent.press(screen.getByTestId('in:custom.field'))
    expect(onValueChange).toHaveBeenCalledWith('7', 0, 0)
    expect(setValue).not.toHaveBeenCalled()
    expect(screen.getByText(/custom.field=9/)).toBeTruthy()
  })

  it('material sensitif menampilkan dropdown status dan info tambahan', () => {
    setup({
      isMaterialSensitive: true,
      stocks: [stocks[0]],
      renderAdditionalInfo: (s: any) => {
        const { Text } = require('react-native')
        return <Text>{`extra:${s.id}`}</Text>
      },
    })
    expect(screen.getByText('dd:order_items.0.receives.0.material_status')).toBeTruthy()
    expect(screen.getByText('extra:1')).toBeTruthy()
  })

  it('form tanpa order_items tetap dirender', () => {
    setup({ form: {}, stocks: [stocks[2]] })
    expect(screen.getByText(/received_qty=NaN/)).toBeTruthy()
  })
})
