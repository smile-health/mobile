# Unit Testing Guidelines

## Overview

This document outlines our unit testing practices and provides guidance for writing effective, maintainable tests for our React Native application.

## Unit Testing Setup

Our testing environment uses:

- Jest as the test runner
- React Native Testing Library for component testing
- Mock implementations for native modules and services

## Test File Organization

- Test files should be co-located with the components they test
- Test files should be named `*.test.tsx` or `*.test.js`
- Common mocks are available in automatically use from `jest.setup.js`

## Best Practices for Testing

### 1. Add common mock into jest.setup.js and avoid double mocking

Please check initial mocking in jest.setup.js before add another mocking. A common issue is mocking the same module multiple times or in different ways. This can lead to confusing test behavior.

❌ **Bad Practice**:

```typescript
// In one file
jest.mock('module', () => ({ func: jest.fn() }))

// In another file or test
jest.mock('module', () => ({ func: () => 'value' }))
```

✅ **Good Practice**:

```typescript
// Create commonTestMocks.js if necessary
export const setupModuleMocks = () => {
  jest.mock('module', () => ({ func: jest.fn() }))
}

// In test files
import { setupModuleMocks } from '@/test/commonTestMocks'
setupModuleMocks()
```

### 2. Reset Mocks Between Tests

Always clear mocks between tests to prevent test interference:

```javascript
beforeEach(() => {
  jest.clearAllMocks()
})
```

### 3. Mock APIs Consistently

For API mocks, create references to the mock functions that you can control in individual tests:

```javascript
const mockApiFunction = jest.fn()

jest.mock('@/services/apis', () => ({
  useApiFunction: () => [mockApiFunction, { isLoading: false }],
}))

// In a test
it('calls API correctly', () => {
  mockApiFunction.mockResolvedValueOnce({ data: 'result' })
  // Test implementation
})
```

### 4. Test Component Interactions

When testing component interactions, focus on user behavior:

```javascript
it('shows error when form is submitted with invalid data', async () => {
  const { getByTestId } = render(<MyForm />)

  // Fill form with invalid data
  fireEvent.changeText(getByTestId('input-email'), 'invalid-email')

  // Submit form
  fireEvent.press(getByTestId('btn-submit'))

  // Verify error is shown
  await waitFor(() => {
    expect(getByTestId('error-message')).toBeVisible()
  })
})
```

### 5. Use TestIDs for Component Selection

Prefer testID for component selection instead of text content:

```javascript
// In component
;<Button testID='btn-submit'>Submit</Button>

// In test
const submitButton = getByTestId('btn-submit')
```

## Common Testing Scenarios

### Testing Redux-Connected Components

```javascript
// Get references to mock functions
const { mockDispatch, mockSelector } = setupReduxMocks()

// Configure selector responses
mockSelector.mockImplementation((selector) => {
  if (selector === myStateSelector) {
    return { data: 'mockData' }
  }
  return {}
})

// Test dispatch calls
expect(mockDispatch).toHaveBeenCalledWith({
  type: 'myAction',
  payload: 'someValue',
})
```

### Testing Navigation

```javascript
const mockNavigation = { navigate: jest.fn() }

render(<MyComponent navigation={mockNavigation} />)

// Test navigation calls
expect(mockNavigation.navigate).toHaveBeenCalledWith('ScreenName')
```

### Testing Async Operations

```javascript
it('loads data asynchronously', async () => {
  // Configure mock to return promise
  mockFetchData.mockResolvedValueOnce({ result: 'data' })

  const { getByTestId } = render(<AsyncComponent />)

  // Verify loading state appears
  expect(getByTestId('loading-indicator')).toBeTruthy()

  // Wait for loading to complete
  await waitFor(() => {
    expect(getByTestId('data-display')).toBeTruthy()
  })
})
```

## Running Tests

- Run all tests: `npm run test`
- Run tests for a specific file: `npm run test -- path/to/file.test.js`
- Run tests with coverage: `npm runt test -- --coverage`
