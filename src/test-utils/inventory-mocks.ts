/* Import paling awal di test komponen inventory: mendaftarkan mock bersama. */
jest.mock('@/services/apis/asset-inventory.api', () =>
  require('@/test-utils/rtkMock').wrapApiModule(
    jest.requireActual('@/services/apis/asset-inventory.api')
  )
)
jest.mock('@/services/apis/asset.api', () =>
  require('@/test-utils/rtkMock').wrapApiModule(
    jest.requireActual('@/services/apis/asset.api')
  )
)
jest.mock('@/services/apis/auth.api', () =>
  require('@/test-utils/rtkMock').wrapApiModule(
    jest.requireActual('@/services/apis/auth.api')
  )
)
jest.mock('@/services/apis/budget-source.api', () =>
  require('@/test-utils/rtkMock').wrapApiModule(
    jest.requireActual('@/services/apis/budget-source.api')
  )
)
jest.mock('@/services/apis/cva.api', () =>
  require('@/test-utils/rtkMock').wrapApiModule(
    jest.requireActual('@/services/apis/cva.api')
  )
)
jest.mock('@/services/apis/disposal.api', () =>
  require('@/test-utils/rtkMock').wrapApiModule(
    jest.requireActual('@/services/apis/disposal.api')
  )
)
jest.mock('@/services/apis/entity.api', () =>
  require('@/test-utils/rtkMock').wrapApiModule(
    jest.requireActual('@/services/apis/entity.api')
  )
)
jest.mock('@/services/apis/event-report-count.api', () =>
  require('@/test-utils/rtkMock').wrapApiModule(
    jest.requireActual('@/services/apis/event-report-count.api')
  )
)
jest.mock('@/services/apis/event-report-detail.api', () =>
  require('@/test-utils/rtkMock').wrapApiModule(
    jest.requireActual('@/services/apis/event-report-detail.api')
  )
)
jest.mock('@/services/apis/event-report.api', () =>
  require('@/test-utils/rtkMock').wrapApiModule(
    jest.requireActual('@/services/apis/event-report.api')
  )
)
jest.mock('@/services/apis/inventory.api', () =>
  require('@/test-utils/rtkMock').wrapApiModule(
    jest.requireActual('@/services/apis/inventory.api')
  )
)
jest.mock('@/services/apis/materials.api', () =>
  require('@/test-utils/rtkMock').wrapApiModule(
    jest.requireActual('@/services/apis/materials.api')
  )
)
jest.mock('@/services/apis/notification.api', () =>
  require('@/test-utils/rtkMock').wrapApiModule(
    jest.requireActual('@/services/apis/notification.api')
  )
)
jest.mock('@/services/apis/order.api', () =>
  require('@/test-utils/rtkMock').wrapApiModule(
    jest.requireActual('@/services/apis/order.api')
  )
)
jest.mock('@/services/apis/profile.api', () =>
  require('@/test-utils/rtkMock').wrapApiModule(
    jest.requireActual('@/services/apis/profile.api')
  )
)
jest.mock('@/services/apis/reason.api', () =>
  require('@/test-utils/rtkMock').wrapApiModule(
    jest.requireActual('@/services/apis/reason.api')
  )
)
jest.mock('@/services/apis/reconciliation.api', () =>
  require('@/test-utils/rtkMock').wrapApiModule(
    jest.requireActual('@/services/apis/reconciliation.api')
  )
)
jest.mock('@/services/apis/setting.api', () =>
  require('@/test-utils/rtkMock').wrapApiModule(
    jest.requireActual('@/services/apis/setting.api')
  )
)
jest.mock('@/services/apis/stock-taking.api', () =>
  require('@/test-utils/rtkMock').wrapApiModule(
    jest.requireActual('@/services/apis/stock-taking.api')
  )
)
jest.mock('@/services/apis/ticket-material.api', () =>
  require('@/test-utils/rtkMock').wrapApiModule(
    jest.requireActual('@/services/apis/ticket-material.api')
  )
)
jest.mock('@/services/apis/transaction-types.api', () =>
  require('@/test-utils/rtkMock').wrapApiModule(
    jest.requireActual('@/services/apis/transaction-types.api')
  )
)
jest.mock('@/services/apis/transaction.api', () =>
  require('@/test-utils/rtkMock').wrapApiModule(
    jest.requireActual('@/services/apis/transaction.api')
  )
)
jest.mock('@/services/apis/transfer-stock.api', () =>
  require('@/test-utils/rtkMock').wrapApiModule(
    jest.requireActual('@/services/apis/transfer-stock.api')
  )
)
jest.mock('@/services/apis/vaccine-sequence.api', () =>
  require('@/test-utils/rtkMock').wrapApiModule(
    jest.requireActual('@/services/apis/vaccine-sequence.api')
  )
)
jest.mock('@/services/apis/workspaces.api', () =>
  require('@/test-utils/rtkMock').wrapApiModule(
    jest.requireActual('@/services/apis/workspaces.api')
  )
)

jest.mock('i18next', () => {
  const t = (k: string) => k
  const i18n = {
    t,
    language: 'en',
    changeLanguage: jest.fn(),
    exists: () => true,
  }
  return { __esModule: true, default: i18n, t, ...i18n }
})
jest.mock(
  'react-native-safe-area-context',
  () => require('react-native-safe-area-context/jest/mock').default
)
jest.mock('react-native-gesture-handler', () => {
  const RN = require('react-native')
  return {
    __esModule: true,
    FlatList: RN.FlatList,
    ScrollView: RN.ScrollView,
    TouchableOpacity: RN.TouchableOpacity,
    GestureHandlerRootView: RN.View,
    gestureHandlerRootHOC: (c: any) => c,
    Swipeable: RN.View,
    State: {},
  }
})
jest.mock('react-native-pager-view', () => {
  const { View } = require('react-native')
  return { __esModule: true, default: View }
})
jest.mock('react-redux', () => ({
  Provider: ({ children }: any) => children,
  useSelector: (sel: any) => sel(require('@/services/store').store.getState()),
  useDispatch: () => require('@/services/store').store.dispatch,
  useStore: () => require('@/services/store').store,
}))
jest.mock('@react-navigation/native', () => {
  const nav = {
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
  const route: any = { key: 'k', name: 'n', params: {} }
  return {
    useNavigation: () => nav,
    useRoute: () => route,
    __nav: nav,
    __route: route,
    useFocusEffect: (cb: any) => {
      require('react').useEffect(() => cb(), [])
    },
    useIsFocused: () => true,
    useNavigationState: (sel: any) =>
      sel({ index: 0, routes: [{ name: 'n' }] }),
    CommonActions: { navigate: jest.fn(), reset: jest.fn() },
    StackActions: { replace: jest.fn(), push: jest.fn(), popToTop: jest.fn() },
  }
})
jest.mock('@/utils/NavigationUtils', () => ({
  navigateToLogin: jest.fn(),
  navigate: jest.fn(),
  goBack: jest.fn(),
  navigationRef: { isReady: () => false, navigate: jest.fn() },
}))

export {}

// Peringatan act() dari react-hook-form (update async di luar act) bukan temuan.
const origError = console.error
beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation((...args: any[]) => {
    if (String(args[0]).includes('not wrapped in act')) return
    origError(...args)
  })
})
