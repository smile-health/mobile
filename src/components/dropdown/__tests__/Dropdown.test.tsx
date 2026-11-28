import React from 'react'
import { I18nManager } from 'react-native'
import { fireEvent, render, screen } from '@testing-library/react-native'
import { useForm } from 'react-hook-form'
import Dropdown, { DropdownProps } from '../Dropdown'

// Render the real library, but record the props it receives.
const mockBaseProps = jest.fn()
jest.mock('react-native-element-dropdown', () => {
  const ReactActual = jest.requireActual('react')
  const actual = jest.requireActual('react-native-element-dropdown')
  return {
    ...actual,
    Dropdown: ReactActual.forwardRef((props: any, ref: any) => {
      mockBaseProps(props)
      return ReactActual.createElement(actual.Dropdown, { ...props, ref })
    }),
  }
})

const options = [
  { value: 1, label: 'VVM A' },
  { value: 2, label: 'VVM B' },
]

type Option = (typeof options)[number]

function Harness(
  props: Partial<DropdownProps<Option>> & { defaultValue?: number }
) {
  const { defaultValue, ...rest } = props
  const { control } = useForm({ defaultValues: { status: defaultValue } })
  return (
    <Dropdown<Option>
      name='status'
      control={control}
      data={options}
      label='Material Status'
      placeholder='Material Status'
      testID='dropdown-status'
      {...rest}
    />
  )
}

function hasPointerEventsNone(node: any): boolean {
  for (let n = node; n; n = n.parent) {
    if (n.props?.pointerEvents === 'none') return true
  }
  return false
}

const setRTL = (value: boolean) =>
  Object.defineProperty(I18nManager, 'isRTL', {
    configurable: true,
    get: () => value,
  })

const lastBaseProps = () => mockBaseProps.mock.calls.at(-1)[0]

describe('Dropdown', () => {
  afterEach(() => {
    setRTL(false)
    mockBaseProps.mockClear()
  })

  it.each([false, true])(
    'opens when the empty mandatory field is pressed (isRTL=%s)',
    async (rtl) => {
      setRTL(rtl)
      const onFocus = jest.fn()
      await render(<Harness isMandatory onFocus={onFocus} />)

      // Static label above the field plus the floating one drawn over it.
      // The floating label covers the field, so it must let taps through.
      const labels = screen.getAllByTestId('label-dropdown-status')
      expect(labels).toHaveLength(2)
      expect(labels.filter((l) => hasPointerEventsNone(l))).toHaveLength(1)

      await fireEvent.press(screen.getByTestId('dropdown-status'))
      expect(onFocus).toHaveBeenCalledTimes(1)
    }
  )

  it('hides the floating label once a value is chosen', async () => {
    await render(<Harness isMandatory defaultValue={2} />)
    expect(screen.getByText('VVM B')).toBeTruthy()
    // Only the static label above the field is left, not the overlay.
    expect(screen.getAllByTestId('label-dropdown-status')).toHaveLength(1)
  })

  it('puts the chevron in the right icon slot in LTR', async () => {
    await render(<Harness />)
    const props = lastBaseProps()
    expect(props.renderLeftIcon).toBeUndefined()
    expect(props.renderRightIcon()).not.toBeNull()
  })

  // The library lays the row out with `row-reverse` in RTL on top of React
  // Native's own mirroring, so its left slot is the visual end of the field.
  it('puts the chevron in the left icon slot in RTL', async () => {
    setRTL(true)
    await render(<Harness />)
    const props = lastBaseProps()
    expect(props.renderLeftIcon()).not.toBeNull()
    expect(props.renderRightIcon()).toBeNull()
  })
})
