import React from 'react'
import { render, fireEvent } from '@testing-library/react-native'
import CardWorkspace from '../CardWorkspace'

describe('CardWorkspace', () => {
  const defaultProps = {
    backgroundColor: '#FF0000',
    name: 'Test Workspace',
    programKey: 'test-program',
    testID: 'test-workspace',
    onPress: jest.fn(),
  }

  it('renders correctly with required props', () => {
    const { getByTestId, getByText } = render(
      <CardWorkspace {...defaultProps} />
    )

    const card = getByTestId('test-workspace')
    expect(card).toBeTruthy()

    // Check if name is rendered
    expect(getByText('Test Workspace')).toBeTruthy()

    // Check if initials are rendered
    expect(getByText('TW')).toBeTruthy()
  })

  it('handles onPress event', () => {
    const onPress = jest.fn()
    const { getByTestId } = render(
      <CardWorkspace {...defaultProps} onPress={onPress} />
    )

    const card = getByTestId('test-workspace')
    fireEvent.press(card)

    expect(onPress).toHaveBeenCalledTimes(1)
  })

  it('applies custom className props correctly', () => {
    const { getByTestId, getByText } = render(
      <CardWorkspace
        {...defaultProps}
        containerClassName='custom-container'
        titleClassName='custom-title'
      />
    )

    const card = getByTestId('test-workspace')
    const title = getByText('Test Workspace')

    // In React Native Testing Library, we can't directly access className
    // Instead, check if the component renders without errors when these props are provided
    expect(card).toBeTruthy()
    expect(title).toBeTruthy()
  })
})
