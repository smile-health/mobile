const mockReceive = jest.fn()
const mockShowSuccess = jest.fn()
const mockShowError = jest.fn()
let mockWorkspace: any = { config: { material: { is_hierarchy_enabled: 0 } } }
let mockLoading = false

jest.mock('@/components/toolbar/hooks/useToolbar', () => ({
  useToolbar: jest.fn(),
}))
jest.mock('@/i18n/useLanguage', () => ({
  useLanguage: () => ({ t: (k: string) => k }),
}))
jest.mock('@/services/apis', () => ({
  useReceiveOrderMutation: () => [mockReceive, { isLoading: mockLoading }],
}))
jest.mock('@/services/store', () => ({
  authState: 'auth',
  workspaceState: 'workspace',
  useAppSelector: (s: string) =>
    s === 'auth' ? { user: { id: 1 } } : { selectedWorkspace: mockWorkspace },
}))
jest.mock('@/utils/CommonUtils', () => ({
  showSuccess: (...a: any[]) => mockShowSuccess(...a),
  showError: (...a: any[]) => mockShowError(...a),
}))
jest.mock('@/utils/helpers/ErrorHelpers', () => ({
  showFormattedError: (e: any) => `err:${e?.message ?? e?.status ?? 'x'}`,
}))

import { act, renderHook, waitFor } from '@testing-library/react-native'
import { useReceiveOrder } from '../useReceiveOrder'

const flatData = {
  order_items: [
    {
      id: 1,
      order_stocks: [
        { stock_id: 11, allocated_qty: 5, received_qty: 5, material_status: 2 },
        { stock_id: 12 },
      ],
    },
  ],
}
const hierData = {
  order_items: [
    {
      id: 1,
      children: [
        {
          id: 2,
          order_stocks: [
            {
              stock_id: 21,
              allocated_qty: 3,
              received_qty: 3,
              order_stock_status_id: 1,
            },
          ],
        },
      ],
    },
  ],
}

const setup = (
  data: any = flatData,
  navigation: any = { goBack: jest.fn() }
) => {
  const route = { params: { data, orderId: 77 } }
  const hook = renderHook(() => useReceiveOrder({ navigation, route }))
  return { ...hook, navigation }
}

const setItems = (r: any, items: any[]) =>
  act(() => r.current.setValue('order_items', items))

beforeEach(() => {
  jest.clearAllMocks()
  mockLoading = false
  mockWorkspace = { config: { material: { is_hierarchy_enabled: 0 } } }
  mockReceive.mockResolvedValue({ data: {} })
})

describe('useReceiveOrder', () => {
  it('seed form flat dari order_stocks', async () => {
    const { result } = setup()
    await waitFor(() => expect(result.current.form.order_items).toHaveLength(1))
    expect(result.current.form.order_items[0].receives[1]).toMatchObject({
      allocated_qty: 0,
      received_qty: 0,
      material_status: null,
    })
    expect(result.current.orderId).toBe(77)
    expect(result.current.isHierarchy).toBe(0)
  })

  it('seed form hierarki dan flag hierarchy dari workspace', async () => {
    mockWorkspace = { config: { material: { is_hierarchy_enabled: 1 } } }
    const { result } = setup(hierData)
    await waitFor(() =>
      expect(result.current.form.order_items[0].children).toHaveLength(1)
    )
    expect(result.current.isHierarchy).toBe(1)
  })

  it('workspace tanpa config => isHierarchy false; tanpa data tidak seed', () => {
    mockWorkspace = null
    const { result } = setup(null)
    expect(result.current.isHierarchy).toBe(false)
    expect(result.current.data).toBeNull()
  })

  it('tombol terima nonaktif tanpa tanggal, aktif setelah tanggal diisi dan qty sesuai', async () => {
    const { result } = setup({
      order_items: [
        {
          id: 1,
          order_stocks: [{ stock_id: 11, allocated_qty: 5, received_qty: 5 }],
        },
      ],
    })
    await waitFor(() => expect(result.current.form.order_items).toHaveLength(1))
    expect(result.current.isReceiveDisabled).toBe(true)
    act(() =>
      result.current.handleDateChange('fulfilled_at')(new Date(2025, 0, 2))
    )
    await waitFor(() =>
      expect(result.current.actualReceiptDate).toBeInstanceOf(Date)
    )
    expect(result.current.isReceiveDisabled).toBe(false)
  })

  it.each([
    ['partial', { allocated_qty: 5, received_qty: 2 }],
    ['over', { allocated_qty: 5, received_qty: 9 }],
    ['incomplete', { allocated_qty: 5, received_qty: '' }],
    ['undefined', { allocated_qty: 5 }],
  ])('qty %s menonaktifkan tombol', async (_n, receive) => {
    const { result } = setup()
    await waitFor(() => expect(result.current.form.order_items).toHaveLength(1))
    act(() =>
      result.current.handleDateChange('fulfilled_at')(new Date(2025, 0, 2))
    )
    setItems(result, [{ id: 1, receives: [{ stock_id: 1, ...receive }] }])
    await waitFor(() => expect(result.current.isReceiveDisabled).toBe(true))
  })

  it('semua nol menonaktifkan tombol (flat dan hierarki)', async () => {
    const { result } = setup()
    await waitFor(() => expect(result.current.form.order_items).toHaveLength(1))
    act(() =>
      result.current.handleDateChange('fulfilled_at')(new Date(2025, 0, 2))
    )
    setItems(result, [
      { id: 1, receives: [{ stock_id: 1, allocated_qty: 0, received_qty: 0 }] },
    ])
    await waitFor(() => expect(result.current.isReceiveDisabled).toBe(true))
    setItems(result, [
      {
        id: 1,
        children: [
          {
            id: 2,
            receives: [{ stock_id: 1, allocated_qty: 0, received_qty: 0 }],
          },
          { id: 3 },
        ],
      },
    ])
    await waitFor(() => expect(result.current.isReceiveDisabled).toBe(true))
  })

  it('submit tanpa tanggal memunculkan error field dan tidak memanggil API', async () => {
    const { result } = setup()
    await waitFor(() => expect(result.current.form.order_items).toHaveLength(1))
    await act(async () => {
      await result.current.onConfirmReceiveOrder()
    })
    expect(mockReceive).not.toHaveBeenCalled()
    expect(result.current.isDialogOpen).toBe(true)
    await waitFor(() =>
      expect(result.current.errors.fulfilled_at?.message).toBe(
        'validation.required'
      )
    )
    act(() => result.current.toggleDialog())
    expect(result.current.isDialogOpen).toBe(false)
  })

  it('submit sukses (flat): payload benar, snackbar, goBack', async () => {
    const { result, navigation } = setup()
    await waitFor(() => expect(result.current.form.order_items).toHaveLength(1))
    act(() =>
      result.current.handleDateChange('fulfilled_at')(new Date(2025, 0, 2))
    )
    await waitFor(() => expect(result.current.form.fulfilled_at).toBeTruthy())
    await act(async () => {
      await result.current.onConfirmReceiveOrder()
    })
    expect(mockReceive).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 77,
        order_items: [
          expect.objectContaining({ id: 1, receives: expect.any(Array) }),
        ],
      })
    )
    expect(mockShowSuccess).toHaveBeenCalledWith(
      'order.success_receive_order',
      'snackbar-success-receive-order'
    )
    expect(navigation.goBack).toHaveBeenCalled()
  })

  it('submit sukses (hierarki) membentuk children', async () => {
    const { result } = setup(hierData)
    await waitFor(() =>
      expect(result.current.form.order_items[0].children).toBeDefined()
    )
    act(() =>
      result.current.handleDateChange('fulfilled_at')(new Date(2025, 0, 2))
    )
    await waitFor(() => expect(result.current.form.fulfilled_at).toBeTruthy())
    await act(async () => {
      await result.current.onConfirmReceiveOrder()
    })
    const payload = mockReceive.mock.calls[0][0]
    expect(payload.order_items[0].children[0].id).toBe(2)
    expect(payload.order_items[0].children[0].receives[0]).toMatchObject({
      stock_id: 21,
      order_stock_status_id: 1,
    })
  })

  it('response error menampilkan pesan error dan tidak goBack', async () => {
    mockReceive.mockResolvedValue({ error: { status: 500 } })
    const { result, navigation } = setup()
    await waitFor(() => expect(result.current.form.order_items).toHaveLength(1))
    act(() =>
      result.current.handleDateChange('fulfilled_at')(new Date(2025, 0, 2))
    )
    await waitFor(() => expect(result.current.form.fulfilled_at).toBeTruthy())
    await act(async () => {
      await result.current.onConfirmReceiveOrder()
    })
    expect(mockShowError).toHaveBeenCalledWith('err:500')
    expect(navigation.goBack).not.toHaveBeenCalled()
  })

  it('exception dari mutation ditangani', async () => {
    mockReceive.mockRejectedValue(new Error('boom'))
    const { result } = setup()
    await waitFor(() => expect(result.current.form.order_items).toHaveLength(1))
    act(() =>
      result.current.handleDateChange('fulfilled_at')(new Date(2025, 0, 2))
    )
    await waitFor(() => expect(result.current.form.fulfilled_at).toBeTruthy())
    await act(async () => {
      await result.current.onConfirmReceiveOrder()
    })
    expect(mockShowError).toHaveBeenCalledWith('err:boom')
  })

  it('saat loading submit tidak memanggil API', async () => {
    mockLoading = true
    const { result } = setup()
    await waitFor(() => expect(result.current.form.order_items).toHaveLength(1))
    act(() =>
      result.current.handleDateChange('fulfilled_at')(new Date(2025, 0, 2))
    )
    await waitFor(() => expect(result.current.form.fulfilled_at).toBeTruthy())
    await act(async () => {
      await result.current.onConfirmReceiveOrder()
    })
    expect(mockReceive).not.toHaveBeenCalled()
    expect(result.current.isReceiveDisabled).toBe(true)
  })
})
