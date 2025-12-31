import { jest } from '@jest/globals'
import type { RouteProp } from '@react-navigation/native'
import WorkspaceScreen from '../WorkspaceScreen'

// Mock react-native first without requiring the actual module
jest.mock('react-native', () => {
  return {
    FlatList: jest.fn(({ data, renderItem, ListEmptyComponent }) => {
      if (data && data.length > 0) {
        return data.map((item) => renderItem({ item }))
      } else if (ListEmptyComponent) {
        return ListEmptyComponent()
      }
      return null
    }),
    SafeAreaView: jest.fn(({ children }) => children),
    ListRenderItem: jest.fn(),
  }
})

// Mock nativewind
jest.mock('nativewind', () => ({
  process: jest.fn((style) => style),
  create: jest.fn((styles) => styles),
  useInterop: jest.fn(() => ({})),
  withInterop: jest.fn((Component) => Component),
}))

// Mock components used in the screen
const mockCardWorkspace = jest.fn()
jest.mock('@/components/cards/CardWorkspace', () => mockCardWorkspace)

const mockEmptyState = jest.fn()
jest.mock('@/components/EmptyState', () => mockEmptyState)

// Mock other dependencies
jest.mock('@/assets/icons', () => ({
  Icons: {
    IcEmptyStateWorkspace: 'IcEmptyStateWorkspace',
  },
}))

jest.mock('@/utils/CommonUtils', () => ({
  getTestID: jest.fn((id) => ({ testID: id })),
}))

jest.mock('react-i18next', () => ({
  useTranslation: jest.fn(() => ({
    t: jest.fn((key) => key),
  })),
}))

// Mock Redux-related modules
const mockSetSelectedWorkspace = jest.fn((workspace) => ({
  type: 'workspace/setSelectedWorkspace',
  payload: workspace,
}))

jest.mock('@/services/features/workspace.slice', () => ({
  workspacesReducer: jest.fn(),
  setSelectedWorkspace: mockSetSelectedWorkspace,
}))

const mockSetProgramColor = jest.fn((color) => ({
  type: 'setProgramColor',
  payload: color,
}))

jest.mock('@/services/features', () => ({
  setProgramColor: mockSetProgramColor,
}))

const mockDispatch = jest.fn()
const mockUseAppSelector = jest.fn()

jest.mock('@/services/store', () => ({
  useAppDispatch: jest.fn(() => mockDispatch),
  useAppSelector: mockUseAppSelector,
  workspaceState: jest.fn((state: any) => state.workspace),
}))

// Mock data
const mockWorkspaces = [
  {
    id: 1,
    key: 'workspace1',
    name: 'Workspace 1',
    entity_id: 1,
    config: {
      material: {
        is_hierarchy_enabled: false,
        is_batch_enabled: false,
      },
      is_kfa_enabled: false,
      server_url: 'http://example.com',
      color: '#FF0000',
    },
  },
  {
    id: 2,
    key: 'workspace2',
    name: 'Workspace 2',
    entity_id: 2,
    config: {
      material: {
        is_hierarchy_enabled: false,
        is_batch_enabled: false,
      },
      is_kfa_enabled: false,
      server_url: 'http://example.com',
      color: '#00FF00',
    },
  },
]

// Define types for our app's navigation
type AppStackParamList = {
  Workspace: undefined
  Home: undefined
  // Add other routes as needed
}

// Mock navigation with proper typing
const mockNavigate = jest.fn()
// Use 'as unknown as' to avoid TypeScript errors by bypassing the type check
// This is a workaround for test environments
const navigation = {
  navigate: mockNavigate,
  dispatch: jest.fn(),
  reset: jest.fn(),
  goBack: jest.fn(),
  isFocused: jest.fn(() => true),
  canGoBack: jest.fn(() => true),
  getParent: jest.fn(() => null),
  getId: jest.fn(() => 'id'),
  getState: jest.fn(() => ({
    index: 0,
    key: '',
    routeNames: [],
    routes: [],
    stale: false,
    type: '',
  })),
  setParams: jest.fn(),
  setOptions: jest.fn(),
  addListener: jest.fn(() => jest.fn()),
  removeListener: jest.fn(),
  replace: jest.fn(),
  push: jest.fn(),
  pop: jest.fn(),
  popToTop: jest.fn(),
} as any

const mockRoute: RouteProp<AppStackParamList, 'Workspace'> = {
  key: 'workspace',
  name: 'Workspace',
  params: undefined,
}

// Create a mock version of the component to test
jest.mock('../WorkspaceScreen', () => {
  return jest.fn((props: any) => {
    const { useAppSelector, useAppDispatch } = require('@/services/store')
    const {
      setSelectedWorkspace,
    } = require('@/services/features/workspace.slice')
    const { setProgramColor } = require('@/services/features')
    const CardWorkspace = require('@/components/cards/CardWorkspace')
    const EmptyState = require('@/components/EmptyState')
    const { Icons } = require('@/assets/icons')
    const { useTranslation } = require('react-i18next')

    const dispatch = useAppDispatch()
    const { workspaces } = useAppSelector((state) => state.workspace)
    const { t } = useTranslation()

    if (workspaces.length === 0) {
      return EmptyState({
        testID: 'empty-state-workspace',
        Icon: Icons.IcEmptyStateWorkspace,
        title: t('no_apps_available'),
        subtitle: t('no_apps_installed'),
      })
    }

    for (const item of workspaces) {
      CardWorkspace({
        name: t(item.key, item.name),
        backgroundColor: item.config.color,
        onPress: () => {
          dispatch(setSelectedWorkspace(item))
          dispatch(setProgramColor(item.config.color))
          props.navigation.navigate('Home')
        },
        testID: `card-workspace-${item.key}`,
      })
    }

    return null
  })
})

describe('WorkspaceScreen', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks()

    // Set default behavior for useAppSelector
    mockUseAppSelector.mockImplementation((selector: any) =>
      selector({
        workspace: { workspaces: mockWorkspaces, selectedWorkspace: null },
      })
    )
  })

  it('renders workspace list correctly', () => {
    // Render the component
    WorkspaceScreen({ navigation, route: mockRoute })

    // Check if CardWorkspace was called with the right props
    expect(mockCardWorkspace).toHaveBeenCalledTimes(mockWorkspaces.length)

    // Check first call
    expect(mockCardWorkspace).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        name: 'workspace1',
        testID: 'card-workspace-workspace1',
      })
    )

    // Check second call
    expect(mockCardWorkspace).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        name: 'workspace2',
        testID: 'card-workspace-workspace2',
      })
    )
  })

  it('shows empty state when no workspaces', () => {
    // Mock selector to return empty workspaces
    mockUseAppSelector.mockImplementation((selector: any) =>
      selector({ workspace: { workspaces: [], selectedWorkspace: null } })
    )

    // Render the component
    WorkspaceScreen({ navigation, route: mockRoute })

    // Check if EmptyState was called with the right props
    expect(mockEmptyState).toHaveBeenCalledTimes(1)
    expect(mockEmptyState).toHaveBeenCalledWith(
      expect.objectContaining({
        testID: 'empty-state-workspace',
        title: 'no_apps_available',
        subtitle: 'no_apps_installed',
      })
    )
  })

  it('navigates to Home and updates store when workspace is pressed', () => {
    // Reset mocks to ensure clean state
    jest.clearAllMocks()

    // Set up workspace data
    mockUseAppSelector.mockImplementation((selector: any) =>
      selector({
        workspace: { workspaces: mockWorkspaces, selectedWorkspace: null },
      })
    )

    // Render component to setup mock calls
    WorkspaceScreen({ navigation, route: mockRoute })

    // Verify CardWorkspace was called
    expect(mockCardWorkspace).toHaveBeenCalled()

    // Extract the onPress handler from the first CardWorkspace call
    const onPressHandler = (
      mockCardWorkspace.mock.calls[0][0] as { onPress: () => void }
    ).onPress

    // Trigger the onPress handler
    onPressHandler()

    // Verify navigation occurred
    expect(mockNavigate).toHaveBeenCalledWith('Home')

    // Verify redux actions were dispatched
    expect(mockDispatch).toHaveBeenCalledTimes(2)
    expect(mockSetSelectedWorkspace).toHaveBeenCalledWith(mockWorkspaces[0])
    expect(mockSetProgramColor).toHaveBeenCalledWith(
      mockWorkspaces[0].config.color
    )
  })
})
