import React from 'react'
import { render, fireEvent, waitFor, act } from '@testing-library/react-native'
import { useSelector } from 'react-redux'
import PortalProvider from '@/components/portals/PortalProvider'
import * as CommonUtils from '@/utils/CommonUtils'
import LoginScreen from '../LoginScreen'

// Mock useSelector, useDispatch, and useStore
jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
  useDispatch: jest.fn(() => jest.fn()),
  useStore: jest.fn(() => ({})),
}))

// Jest timeout is configured in jest.config.js

// Silence the React Animation warnings completely
// This approach disables the specific warning type entirely
jest.spyOn(console, 'error').mockImplementation((message, ...args) => {
  if (
    typeof message === 'string' &&
    (message.includes('Warning: An update to Animated') ||
      message.includes('Consider adding an error boundary') ||
      message.includes('The above error occurred in the'))
  ) {
    return
  }

  const originalConsoleError = jest.requireActual('console').error
  originalConsoleError(message, ...args)
})

// Mock the entire APIs module
jest.mock('@/services/apis', () => {
  const mockLoginFn = jest.fn(() => ({
    unwrap: jest.fn(async () => ({ token: 'fake-token' })),
  }))

  const mockFetchProfileFn = jest.fn(() => ({
    unwrap: jest.fn().mockResolvedValue({ id: '123', name: 'Test User' }),
  }))

  return {
    authApi: {
      endpoints: {
        loginUser: {
          matchFulfilled: jest.fn(),
        },
      },
    },
    profileApi: {
      endpoints: {
        fetchProfile: {
          matchFulfilled: jest.fn(),
        },
      },
    },
    materialsApi: {
      endpoints: {
        getMaterials: {
          matchFulfilled: jest.fn(),
        },
      },
    },
    useLoginUserMutation: jest.fn(() => [mockLoginFn, { isLoading: false }]),
    useFetchProfileQuery: jest.fn(() => ({ refetch: mockFetchProfileFn })),
    useLazyFetchProfileQuery: jest.fn(() => [
      mockFetchProfileFn,
      { isLoading: false },
    ]),
  }
})

jest.mock('@/assets/icons', () => ({
  Icons: {
    IcVisibilityOff: () => 'IcVisibilityOff',
    IcVisibilityOn: () => 'IcVisibilityOn',
    IcExpandMore: () => 'IcExpandMore',
  },
}))

jest.mock('@/assets/images', () => ({
  Images: {
    ImgLogoSmile: 'ImgLogoSmile',
    ImgLogoHealtMinistry: 'ImgLogoHealtMinistry',
    ImgLogoUndp: 'ImgLogoUndp',
  },
}))

jest.mock('@/utils/CommonUtils', () => ({
  ...jest.requireActual('@/utils/CommonUtils'),
  showError: jest.fn(),
  showSuccess: jest.fn(),
  getTestID: jest.fn((id) => ({ testID: id })),
}))

jest.mock('@/storage', () => ({
  loadLocalData: jest.fn().mockResolvedValue('mock-fcm-token'),
}))

const mockNavigation: any = { replace: jest.fn() }
const mockRoute: any = {}

const renderLoginScreen = () => {
  return render(
    <PortalProvider>
      <LoginScreen navigation={mockNavigation} route={mockRoute} />
    </PortalProvider>
  )
}

describe('LoginScreen', () => {
  // Setup mock state before each test
  beforeEach(() => {
    jest.clearAllMocks()

    // Setup mock state for useSelector
    const mockState = {
      pushNotification: {
        fcm_token: 'mock-fcm-token',
        isPermissionGranted: true,
        isInitialized: true,
        notificationCount: 0,
        lastNotification: null,
        isLoading: false,
        error: null,
      },
    }

    // Setup useSelector mock implementation
    ;(useSelector as unknown as jest.Mock).mockImplementation((selector) =>
      selector(mockState)
    )
  })

  it('should render screen correctly with all required elements', () => {
    const { getByTestId, getByText, getByPlaceholderText } = renderLoginScreen()

    // Test header elements
    expect(getByTestId('btn-openlanguage')).toBeTruthy()
    expect(getByTestId('text-version')).toBeTruthy()
    expect(getByText('v1.0.0')).toBeTruthy()

    // Test logo and branding
    expect(getByTestId('image-logo')).toBeTruthy()
    expect(getByTestId('image-healthministry')).toBeTruthy()
    expect(getByTestId('image-undp')).toBeTruthy()

    // Test form elements
    const usernameField = getByTestId('textfield-username')
    const passwordField = getByTestId('textfield-password')
    expect(usernameField).toBeTruthy()
    expect(passwordField).toBeTruthy()
    expect(getByPlaceholderText('common.username')).toBeTruthy()
    expect(getByPlaceholderText('common.password')).toBeTruthy()

    // Test form labels
    expect(getByTestId('label-textfield-username')).toBeTruthy()
    expect(getByTestId('label-textfield-password')).toBeTruthy()

    // Test password visibility toggle
    expect(getByTestId('pressable-secure-password')).toBeTruthy()

    // Test buttons
    const loginButton = getByTestId('btn-login')
    expect(loginButton).toBeTruthy()
    expect(loginButton.props.accessibilityState.disabled).toBe(true) // Should be disabled initially
    expect(getByTestId('btn-helpcenter')).toBeTruthy()

    // Test initial form state
    expect(usernameField.props.value).toBe('')
    expect(passwordField.props.value).toBe('')
    expect(passwordField.props.secureTextEntry).toBe(true) // Password should be hidden by default
  })
})

describe('When password visibility eye-icon pressed', () => {
  it('toggles password visibility', async () => {
    const { getByPlaceholderText, getByTestId } = renderLoginScreen()
    const passwordInput = getByPlaceholderText('common.password')
    expect(passwordInput.props.secureTextEntry).toBe(true)

    fireEvent.press(getByTestId('pressable-secure-password'))
    await waitFor(() => {
      expect(passwordInput.props.secureTextEntry).toBe(false)
    })

    fireEvent.press(getByTestId('pressable-secure-password'))
    await waitFor(() => {
      expect(passwordInput.props.secureTextEntry).toBe(true)
    })
  })
})

describe('When valid username and password are provided', () => {
  it('submits the form and shows loading dialog', async () => {
    const mockLoginFn = jest.fn(() => ({
      unwrap: jest.fn().mockResolvedValue({ token: 'fake-token' }),
    }))

    const mockFetchProfileFn = jest.fn(() => ({
      unwrap: jest.fn().mockResolvedValue({ id: '123', name: 'Test User' }),
    }))

    require('@/services/apis').useLoginUserMutation.mockReturnValue([
      mockLoginFn,
      { isLoading: true },
    ])

    require('@/services/apis').useLazyFetchProfileQuery.mockReturnValue([
      mockFetchProfileFn,
      { isLoading: true },
    ])

    const { getByTestId } = renderLoginScreen()

    // Fill in form fields and wait for state updates
    const usernameInput = getByTestId('textfield-username')
    const passwordInput = getByTestId('textfield-password')

    await act(async () => {
      fireEvent.changeText(usernameInput, 'validuser')
      fireEvent.changeText(passwordInput, 'password123*')
    })

    // Verify form values are set correctly
    expect(usernameInput.props.value).toBe('validuser')
    expect(passwordInput.props.value).toBe('password123*')

    // Submit form
    await act(async () => {
      fireEvent.press(getByTestId('btn-login'))
    })

    // Wait for async operations to complete with increased timeout
    await waitFor(
      () => {
        expect(getByTestId('loadingdialog-login')).toBeTruthy()
      },
      { timeout: 10_000 }
    )
  }, 15_000) // Increase test timeout to 15 seconds for CI environments
})

describe('When username and password are blank', () => {
  it('disables the login button and does not allow submission', async () => {
    const { getByTestId } = renderLoginScreen()

    expect(getByTestId('textfield-username').props.value).toBe('')
    expect(getByTestId('textfield-password').props.value).toBe('')

    const loginButton = getByTestId('btn-login')
    expect(loginButton.props.onPress).toBeUndefined()

    fireEvent.press(loginButton)

    await waitFor(() => {
      expect(getByTestId('textfield-username').props.value).toBe('')
      expect(getByTestId('textfield-password').props.value).toBe('')
    })
  })
})

describe('When simulating API login response', () => {
  it('navigates to Workspace screen after fetching profile', async () => {
    // Create mock functions with proper implementation
    const mockLoginFn = jest.fn().mockImplementation((credentials) => {
      // Verify credentials include fcmToken
      expect(credentials).toEqual({
        username: 'validuser',
        password: 'password123*', //NOSONAR
        fcm_token: 'mock-fcm-token',
      })
      return {
        unwrap: jest.fn().mockResolvedValue({ token: 'fake-token' }),
      }
    })

    const mockFetchProfileFn = jest.fn().mockImplementation(() => ({
      unwrap: jest.fn().mockResolvedValue({ id: '123', name: 'Test User' }),
    }))

    // Setup mocks with proper implementation
    const apisModule = require('@/services/apis')
    apisModule.useLoginUserMutation.mockReturnValue([
      mockLoginFn,
      { isLoading: false },
    ])

    apisModule.useLazyFetchProfileQuery.mockReturnValue([
      mockFetchProfileFn,
      { isLoading: false },
    ])

    const { getByTestId } = renderLoginScreen()

    // Fill in form fields
    const usernameInput = getByTestId('textfield-username')
    const passwordInput = getByTestId('textfield-password')

    fireEvent.changeText(usernameInput, 'validuser')
    fireEvent.changeText(passwordInput, 'password123*')

    // Verify form values
    expect(usernameInput.props.value).toBe('validuser')
    expect(passwordInput.props.value).toBe('password123*')

    // Submit form
    await act(async () => {
      fireEvent.press(getByTestId('btn-login'))
    })

    // Wait for async operations to complete
    await waitFor(() => {
      expect(mockLoginFn).toHaveBeenCalled()
      expect(mockFetchProfileFn).toHaveBeenCalled()
      expect(mockNavigation.replace).toHaveBeenCalledWith('Workspace')
      expect(CommonUtils.showSuccess).toHaveBeenCalledWith(
        'login_success',
        'snackbar-success-login'
      )
    })
  })
})
