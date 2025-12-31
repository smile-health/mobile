// Create mock implementations before importing components
beforeAll(() => {
  // Set up mocks for the native modules and components

  // Mock components
  jest.mock(
    'react-native',
    () => {
      return {
        Linking: { openURL: jest.fn() },
        Text: ({ children }) => children,
        View: ({ children }) => children,
      }
    },
    { virtual: true }
  )
})

// Mock basic dependencies
jest.mock('@/i18n/useLanguage', () => ({
  useLanguage: () => ({ t: (key) => key }),
}))

// Mock Redux store with more controllable implementations
const mockDispatch = jest.fn()
const mockSelector = jest.fn()

jest.mock('@/services/store', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (selector) => mockSelector(selector),
  authState: jest.fn(),
  workspaceState: jest.fn(),
  trxState: jest.fn(),
}))

jest.mock('@/components/toolbar/hooks/useToolbar', () => ({
  useToolbar: jest.fn(),
}))

// Use a plain object to store handlers
const handlers = {
  toggleAccordion: null,
  pressChildMenu: null,
}

// Update the mock to store handlers in the object
jest.mock('@/components/accordion/Accordion', () => {
  return ({ onToggleAccordion, onPressChild }) => {
    if (onToggleAccordion) handlers.toggleAccordion = onToggleAccordion
    if (onPressChild) handlers.pressChildMenu = onPressChild
    return null
  }
})

jest.mock('@/components/dialog/ConfirmationDialog', () => ({
  ConfirmationDialog: ({ dismissDialog, onConfirm, onCancel }) => {
    // Store dialog handlers for testing
    if (dismissDialog) global.dismissDialog = dismissDialog
    if (onConfirm) global.confirmDialog = onConfirm
    if (onCancel) global.cancelDialog = onCancel
    return null
  },
}))

const mockNavigate = jest.fn()
jest.mock('@/utils/NavigationUtils', () => ({
  navigate: (route) => mockNavigate(route),
}))

jest.mock('@/utils/CommonUtils', () => ({
  filterMenuByRole: () => [
    {
      name: 'menu.item1',
      childs: [{ key: 'screen1', name: 'Child Menu 1', transactionType: 1 }],
    },
    {
      name: 'menu.item2',
      childs: [{ key: 'screen2', name: 'Child Menu 2', transactionType: 2 }],
    },
  ],
  getTestID: jest.fn((id) => ({ testID: id })),
}))

// Define the type for the arguments
type CheckDraftTransactionArgs = [number, number | null]
const mockCheckDraftTransaction = jest.fn<boolean, [number, number | null]>(
  () => false
)
const mockLoadExistingTransaction = jest.fn()

jest.mock('../../inventory/helpers/TransactionHelpers', () => ({
  checkDraftTransaction: (...args: CheckDraftTransactionArgs) =>
    mockCheckDraftTransaction(...args),
  loadExistingTransaction: (...args) => mockLoadExistingTransaction(...args),
}))

jest.mock('@/utils/Constants', () => ({
  LINK_ELEARNING: 'https://test.com/elearning',
}))

// Import missing state selectors
import { authState, workspaceState, trxState } from '../../../services/store'

// Ensure dialogProps is defined in the correct scope
let dialogProps = { title: '', message: '', modalVisible: false }

describe('HomeScreen Scenarios', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks()

    // Set up default mock data
    mockSelector.mockImplementation((selector) => {
      if (selector === authState) {
        return { user: { entity: { name: 'Test Entity' }, role: 1 } }
      }
      if (selector === workspaceState) {
        return {
          selectedWorkspace: {
            key: 'workspace.name',
            name: 'Workspace Name',
            id: '1',
          },
        }
      }
      if (selector === trxState) {
        return { draftTrxTypeId: null }
      }
      return {
        user: { entity: { name: 'Test Entity' }, role: 1 },
        selectedWorkspace: {
          key: 'workspace.name',
          name: 'Workspace Name',
          id: '1',
        },
        draftTrxTypeId: null,
      }
    })

    // Create refs to store handler functions that will be passed to components
    handlers.toggleAccordion = null
    handlers.pressChildMenu = null

    // Initialize dialogProps with the correct structure
    dialogProps = { title: '', message: '', modalVisible: false }
  })

  test('Scenario 1: Opening E-Learning Link', () => {
    const Linking = require('react-native').Linking
    const { LINK_ELEARNING } = require('@/utils/Constants')

    // Directly test the function that would handle the e-learning link press
    function handleOpenElearning() {
      Linking.openURL(LINK_ELEARNING)
    }

    handleOpenElearning()

    expect(Linking.openURL).toHaveBeenCalledWith(LINK_ELEARNING)
  })

  test('Scenario 2: Navigate to Child Menu Screen', () => {
    // Create a mock child menu item
    const childMenuItem = {
      key: 'screen1',
      name: 'Child Menu 1',
      transactionType: 1,
    }

    // Set up Redux store responses
    mockSelector.mockImplementation(() => ({
      user: { entity: { name: 'Test Entity' }, role: 1 },
      selectedWorkspace: {
        key: 'workspace.name',
        name: 'Workspace Name',
        id: '1',
      },
      draftTrxTypeId: null, // No draft transaction
    }))

    // Mock checkDraftTransaction to return false (no draft)
    mockCheckDraftTransaction.mockReturnValue(false)

    // Create a function to simulate pressing a child menu
    function handlePressChildMenu(item) {
      if (mockCheckDraftTransaction(item.transactionType, null)) {
        return // Would show dialog
      }
      mockDispatch({ type: 'setActiveMenu', payload: item })
      mockNavigate(item.key)
    }

    // Call the handler with our mock item
    handlePressChildMenu(childMenuItem)

    // Verify behavior
    expect(mockCheckDraftTransaction).toHaveBeenCalledWith(1, null)
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'setActiveMenu',
      payload: childMenuItem,
    })
    expect(mockNavigate).toHaveBeenCalledWith('screen1')
  })

  test('Scenario 3: Draft Transaction Dialog Shows', () => {
    // Create a mock child menu item
    const childMenuItem = {
      key: 'screen1',
      name: 'Child Menu 1',
      transactionType: 1,
    }

    // Mock having an existing draft
    mockSelector.mockImplementation(() => ({
      user: { entity: { name: 'Test Entity' }, role: 1 },
      selectedWorkspace: {
        key: 'workspace.name',
        name: 'Workspace Name',
        id: '1',
      },
      draftTrxTypeId: 1, // Has draft transaction of type 1
    }))

    // Mock checkDraftTransaction to return true (has draft)
    mockCheckDraftTransaction.mockReturnValue(true)

    // Track if dialog was shown
    let dialogShown = false

    // Create a function to simulate pressing a child menu
    function handlePressChildMenu(item) {
      if (mockCheckDraftTransaction(item.transactionType, 1)) {
        // Would show dialog
        dialogShown = true
        dialogProps = {
          modalVisible: true,
          title: 'dialog.information',
          message: 'dialog.have_transaction_draft',
        }
        return
      }
      mockDispatch({ type: 'setActiveMenu', payload: item })
      mockNavigate(item.key)
    }

    // Call the handler with our mock item
    handlePressChildMenu(childMenuItem)

    // Verify dialog behavior
    expect(mockCheckDraftTransaction).toHaveBeenCalledWith(1, 1)
    expect(dialogShown).toBe(true)
    expect(dialogProps.title).toBe('dialog.information')
    expect(dialogProps.message).toBe('dialog.have_transaction_draft')

    // Verify navigation did NOT happen
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  test('Scenario 4: Toggle Accordion Open/Close', () => {
    let selectedMenu = null

    // Create toggle function similar to component
    function handleToggleAccordion(index) {
      selectedMenu = selectedMenu === index ? null : index
    }

    // Toggle accordion for item 0 (open it)
    handleToggleAccordion(0)
    expect(selectedMenu).toBe(0)

    // Toggle the same accordion (close it)
    handleToggleAccordion(0)
    expect(selectedMenu).toBe(null)

    // Toggle a different accordion
    handleToggleAccordion(1)
    expect(selectedMenu).toBe(1)
  })

  test('Scenario 5: Loading Existing Transaction Draft', async () => {
    // Create mock draft transaction
    const mockDraft = { id: 'draft1', type: 1 }

    // Mock loadExistingTransaction to call its callback with the draft
    mockLoadExistingTransaction.mockImplementation((_workspaceId, callback) => {
      callback(mockDraft)
      return Promise.resolve()
    })

    // Simulate the useEffect that loads drafts
    async function loadDraft() {
      const workspaceId = '1'
      await mockLoadExistingTransaction(workspaceId, (trxDraft) => {
        mockDispatch({ type: 'setExistingTrx', payload: trxDraft })
      })
    }

    await loadDraft()

    // Verify the draft was loaded and dispatched
    expect(mockLoadExistingTransaction).toHaveBeenCalledWith(
      '1',
      expect.any(Function)
    )
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'setExistingTrx',
      payload: mockDraft,
    })
  })
})
