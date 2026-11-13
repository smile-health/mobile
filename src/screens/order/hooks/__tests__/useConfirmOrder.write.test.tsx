const mockConfirm = jest.fn()
const mockValidate = jest.fn()
const mockShowError = jest.fn()
const mockShowSuccess = jest.fn()
const mockShowFormatted = jest.fn()
const mockReset = jest.fn()

jest.mock('@/services/apis', () => ({
  useConfirmOrderMutation: () => [mockConfirm, { isLoading: false }],
  useValidateOrderMutation: () => [mockValidate, { isLoading: true }],
}))
jest.mock('@/utils/CommonUtils', () => ({
  showError: (...a: any[]) => mockShowError(...a),
  showSuccess: (...a: any[]) => mockShowSuccess(...a),
}))
jest.mock('@/utils/helpers/ErrorHelpers', () => ({
  getErrorMessage: (e: any, t: any) =>
    e?.message ? e.message : t('error.network_response'),
  showFormattedError: (...a: any[]) => mockShowFormatted(...a),
}))
jest.mock('@/utils/NavigationUtils', () => ({
  navigateAndReset: (...a: any[]) => mockReset(...a),
}))

import { act, renderHook } from '@testing-library/react-native'
import { useConfirmOrder } from '../useConfirmOrder'

const t = (k: string) => k
const makeData = () => ({
  id: 5,
  type: 1,
  created_at: '2025-01-05T00:00:00.000Z',
  vendor: { id: 3 },
  activity: { name: 'Act' },
  order_items: [
    {
      id: 1,
      qty: 4,
      ordered_qty: 4,
      material: { id: 10, name: 'M1' },
      reason_id: 9,
      other_reason_text: 'lain',
    },
    {
      id: 2,
      qty: 0,
      ordered_qty: 6,
      material: { id: 11, name: 'M2' },
      reason_id: 2,
      children: [
        { id: 21, qty: 2, confirmed_qty: 0, material: { name: 'C1' } },
        { id: 22, qty: 4, confirmed_qty: 5, material: { name: 'C2' } },
      ],
    },
    { id: 3, qty: 1, ordered_qty: 1, material: undefined, reason_id: 'x' },
  ],
})

const setup = (navigation: any = { navigate: jest.fn() }) => {
  const data = makeData()
  const hook = renderHook(() =>
    useConfirmOrder({ data: data as any, orderId: 5, t: t as any, navigation })
  )
  return { ...hook, navigation, data }
}

beforeEach(() => {
  jest.clearAllMocks()
  mockConfirm.mockResolvedValue({ data: {} })
  mockValidate.mockResolvedValue({ data: {} })
})

describe('useConfirmOrder', () => {
  it('state awal: tanggal dari created_at dan flag loading', () => {
    const { result } = setup()
    expect(result.current.formattedDate).toBeInstanceOf(Date)
    expect(result.current.isLoadingValidate ?? true).toBe(true)
  })

  it('updateItem mengubah item dan mengabaikan nilai sama', () => {
    const { result } = setup()
    const before = result.current.orderItems
    act(() => result.current.updateItem(0, 'qty', 4))
    expect(result.current.orderItems).toBe(before)
    act(() => result.current.updateItem(0, 'qty', 9))
    expect(result.current.orderItems[0].qty).toBe(9)
  })

  it('updateChildrenQty menghitung ulang ordered_qty parent; non-parent diabaikan', () => {
    const { result } = setup()
    act(() => result.current.updateChildrenQty(1, 21, '7'))
    expect(result.current.orderItems[1].ordered_qty).toBe(12)
    act(() => result.current.updateChildrenQty(0, 1, '3'))
    expect(result.current.orderItems[0].ordered_qty).toBe(4)
  })

  it('handleDateChange mengubah tanggal form', () => {
    const { result } = setup()
    act(() => result.current.handleDateChange(new Date(2025, 5, 1)))
    expect(result.current.formattedDate?.getMonth()).toBe(5)
  })

  it('toggle dialog', () => {
    const { result } = setup()
    const open = () => result.current.dialogOpen
    expect(open()).toBe(false)
    act(() => result.current.toggleConfirmOrderDialog())
    expect(open()).toBe(true)
  })

  it('confirm sukses mengirim payload confirm dan reset navigasi', async () => {
    const { result } = setup()
    await act(async () => {
      await result.current.onPressConfirmOrder()
    })
    const payload = mockConfirm.mock.calls[0][0]
    expect(payload.id).toBe(5)
    expect(payload.order_items[0]).toEqual({ id: 1, confirmed_qty: 4 })
    expect(payload.order_items[1]).toEqual({
      id: 2,
      confirmed_qty: 6,
      children: [
        { id: 21, confirmed_qty: 2 },
        { id: 22, confirmed_qty: 5 },
      ],
    })
    expect(mockShowSuccess).toHaveBeenCalledWith(
      'order.success_confirm_order',
      'snackbar-success-confirm-order'
    )
    expect(mockReset).toHaveBeenCalledWith(expect.any(Array), 1)
  })

  it('confirm dengan error response memanggil showFormattedError', async () => {
    mockConfirm.mockResolvedValue({ error: { message: 'bad' } })
    const { result } = setup()
    await act(async () => {
      await result.current.onPressConfirmOrder()
    })
    expect(mockShowFormatted).toHaveBeenCalledWith({ message: 'bad' })
    expect(mockReset).not.toHaveBeenCalled()
  })

  it('confirm exception: pesan error dan dialog tertutup (dengan/ tanpa message)', async () => {
    mockConfirm.mockRejectedValueOnce(new Error('net'))
    const { result } = setup()
    await act(async () => {
      await result.current.onPressConfirmOrder()
    })
    expect(mockShowError).toHaveBeenCalledWith('net')
    mockConfirm.mockRejectedValueOnce(null)
    await act(async () => {
      await result.current.onPressConfirmOrder()
    })
    expect(mockShowError).toHaveBeenLastCalledWith('error.network_response')
  })

  it('validate sukses, error response, dan exception', async () => {
    const { result } = setup()
    await act(async () => {
      await result.current.onPressValidateOrder()
    })
    const payload = mockValidate.mock.calls[0][0]
    expect(payload.order_items[1].children[0]).toEqual({
      id: 21,
      validated_qty: 2,
    })
    expect(payload.order_items[0].validated_qty).toBe(4)
    expect(mockShowSuccess).toHaveBeenCalledWith(
      'order.success_validate_order',
      'snackbar-success-validate-order'
    )

    mockValidate.mockResolvedValueOnce({ error: { message: 'e' } })
    await act(async () => {
      await result.current.onPressValidateOrder()
    })
    expect(mockShowFormatted).toHaveBeenCalled()

    mockValidate.mockRejectedValueOnce(new Error('x'))
    await act(async () => {
      await result.current.onPressValidateOrder()
    })
    expect(mockShowError).toHaveBeenCalledWith('x')
  })

  it('review menavigasi dengan data ter-map', () => {
    const { result, navigation, data } = setup()
    act(() => result.current.onPressReviewOrder())
    const [route, params] = navigation.navigate.mock.calls[0]
    expect(route).toBe('EditOrderReview')
    expect(params.orderId).toBe(data.id)
    expect(params.activityName).toBe('Act')
    const items = params.datas.order_items
    expect(items[0]).toMatchObject({
      material_id: 10,
      order_reason_id: 9,
      other_reason: 'lain',
    })
    expect(items[1].children).toEqual([
      { id: 21, ordered_qty: 2, material_name: 'C1' },
      { id: 22, ordered_qty: 5, material_name: 'C2' },
    ])
    expect(items[2]).toMatchObject({
      order_reason_id: null,
      material_name: undefined,
    })
  })
})
