import React from 'react'
import { render, fireEvent } from '@testing-library/react-native'
import MaterialItem from '../MaterialItem'

// Mock icons
jest.mock('@/assets/icons', () => ({
  Icons: {
    IcFlag: () => <></>,
    IcChevronRight: () => <></>,
  },
}))

// Mock utility functions
jest.mock('@/utils/DateFormatUtils', () => ({
  convertString: jest.fn(() => '01/06/2024 19:00'),
}))
jest.mock('@/utils/CommonUtils', () => ({
  numberFormat: jest.fn((n) => `#${n}`),
  getTestID: (id: string) => ({ testID: id }),
}))

describe('MaterialItem', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const baseProps = {
    name: 'Material A',
    updatedAt: '2024-06-01T12:00:00Z',
    qty: 10,
    min: 5,
    max: 20,
    showQuantity: true,
  }

  it('renders with default props and shows correct name, date, and stock', () => {
    const { getByText, getByTestId } = render(<MaterialItem {...baseProps} />)
    expect(getByText('Material A')).toBeTruthy()
    expect(getByTestId('material-list-Material A')).toBeTruthy()
    // The label will be "label.updated_at 01/06/2024 19:00"
    expect(getByText(/updated_at 01\/06\/2024 19:00/)).toBeTruthy()
    expect(getByText(/available_stock/)).toBeTruthy()
    expect(getByText('#10')).toBeTruthy()
  })

  it('hide available_stock label when showQuantity is false', () => {
    const { queryByText } = render(
      <MaterialItem {...baseProps} showQuantity={false} />
    )
    expect(queryByText(/available_stock/)).toBeNull()
  })

  it('applies bg-softPink for qty === 0 (out of stock)', () => {
    const { toJSON } = render(<MaterialItem {...baseProps} qty={0} />)
    expect(toJSON()).toMatchSnapshot()
  })

  it('applies bg-softIvory for qty < min (low stock)', () => {
    const { toJSON } = render(<MaterialItem {...baseProps} qty={2} min={5} />)
    expect(toJSON()).toMatchSnapshot()
  })

  it('applies bg-mintGreen for qty >= min && qty <= max (normal stock)', () => {
    const { toJSON } = render(
      <MaterialItem {...baseProps} qty={10} min={5} max={20} />
    )
    expect(toJSON()).toMatchSnapshot()
  })

  it('applies bg-aliceBlue for qty > max (overstock)', () => {
    const { toJSON } = render(
      <MaterialItem {...baseProps} qty={25} min={5} max={20} />
    )
    expect(toJSON()).toMatchSnapshot()
  })

  it('applies bg-white for showQuantity is false', () => {
    const { toJSON } = render(
      <MaterialItem {...baseProps} showQuantity={false} />
    )
    expect(toJSON()).toMatchSnapshot()
  })

  it('renders TransactionLabel when transactionLabel is provided', () => {
    const { getByText } = render(
      <MaterialItem {...baseProps} transactionLabel='Transaction X' />
    )
    expect(getByText('Transaction X')).toBeTruthy()
  })

  it('does not render TransactionLabel when transactionLabel is not provided', () => {
    const { queryByText } = render(<MaterialItem {...baseProps} />)
    expect(queryByText('Transaction X')).toBeNull()
  })

  it('calls onPress when pressed', () => {
    const onPress = jest.fn()
    const { getByTestId } = render(
      <MaterialItem {...baseProps} onPress={onPress} />
    )
    fireEvent.press(getByTestId('material-list-Material A'))
    expect(onPress).toHaveBeenCalled()
  })

  it('does not call onPress when not provided', () => {
    const { getByTestId } = render(<MaterialItem {...baseProps} />)
    // Should not throw error when pressed
    fireEvent.press(getByTestId('material-list-Material A'))
  })

  it('shows empty date when updatedAt is missing', () => {
    const { getByText } = render(<MaterialItem {...baseProps} updatedAt={''} />)
    expect(getByText(/updated_at -/)).toBeTruthy()
  })

  it('does not show update label if withUpdateLabel is false', () => {
    const { queryByText } = render(
      <MaterialItem {...baseProps} withUpdateLabel={false} />
    )
    expect(queryByText(/updated_at/)).toBeNull()
  })
})
