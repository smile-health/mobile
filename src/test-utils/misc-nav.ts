/** Mock navigasi bersama untuk test domain. Pakai: jest.mock('@react-navigation/native', () => require('@/test-utils/misc-nav').navModule) */
export const navMock = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  push: jest.fn(),
  replace: jest.fn(),
  reset: jest.fn(),
  setOptions: jest.fn(),
  dispatch: jest.fn(),
  canGoBack: jest.fn(() => true),
  addListener: jest.fn(() => jest.fn()),
  getParent: jest.fn(),
  isFocused: jest.fn(() => true),
}

export const routeState: { params: any } = { params: {} }

export const navModule = {
  useNavigation: () => navMock,
  useRoute: () => ({ key: 'k', name: 'n', params: routeState.params }),
  useFocusEffect: (cb: any) => {
    const React = require('react')
    React.useEffect(() => cb(), [])
  },
  useIsFocused: () => true,
  createNavigationContainerRef: () => ({
    isReady: () => false,
    navigate: jest.fn(),
    current: null,
  }),
  NavigationContainer: ({ children }: any) => children,
  CommonActions: { navigate: jest.fn(), reset: jest.fn() },
  StackActions: { replace: jest.fn(), push: jest.fn(), popToTop: jest.fn() },
}
