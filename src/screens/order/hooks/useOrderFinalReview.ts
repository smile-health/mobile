import { useState, useMemo } from 'react'
import { useLanguage } from '@/i18n/useLanguage'
import { OrderItem } from '@/models/order/OrderItem'
import {
  useCreateDistributionMutation,
  useCreateOrderMutation,
  useCreateReturnMutation,
  useEditOrderItemStocksMutation,
} from '@/services/apis'
import { clearOrderState } from '@/services/features'
import {
  resetDraft,
  resetOrderActivity,
  setOrderFilter,
} from '@/services/features/order.slice'
import {
  activityState,
  ordersState,
  orderState,
  useAppDispatch,
  useAppSelector,
  workspaceState,
} from '@/services/store'
import { showError, showSuccess } from '@/utils/CommonUtils'
import { ORDER_KEY, ORDER_TYPE } from '@/utils/Constants'
import {
  getErrorMessage,
  showFormattedError,
} from '@/utils/helpers/ErrorHelpers'
import useProgramId from '@/utils/hooks/useProgramId'
import { navigateToOrderDetail } from '../helpers/NavigationHelpers'
import {
  getMissingCompanionMaterials,
  showSuccessAndNavigateToDetail,
} from '../helpers/OrderHelpers'
import { OrderType } from '../types/order'

type FormattedOrderItem = {
  material_id: number
  stocks: {
    stock_id: string
    activity_id: string
    allocated_qty: number
    order_stock_status_id: number | null
  }[]
}

export const useOrderFinalReview = (route, type) => {
  const { t } = useLanguage()

  const { date, comment, datas = { order_items: [] }, orderId } = route.params

  const [dialogOpen, setDialogOpen] = useState(false)

  const [createOrder, { isLoading: isLoadingCreateOrder }] =
    useCreateOrderMutation()
  const [editOrderItemStocks, { isLoading: isLoadingEditOrderItem }] =
    useEditOrderItemStocksMutation()
  const [createDistribution, { isLoading: isLoadingAllocation }] =
    useCreateDistributionMutation()
  const [createReturn, { isLoading: isLoadingCreateReturn }] =
    useCreateReturnMutation()

  const { drafts, activities } = useAppSelector(orderState)
  const { entities } = useAppSelector(orderState)
  const { activeActivity } = useAppSelector(activityState)
  const { selectedWorkspace } = useAppSelector(workspaceState)
  const isHierarchy = selectedWorkspace?.config.material.is_hierarchy_enabled

  const programId = useProgramId()

  const orderDraft = drafts[type]?.[programId]
  const orderActivity = activities[type]?.[programId]

  const { orders } = useAppSelector(ordersState)

  const dispatch = useAppDispatch()

  const { uniqueMissingCompanions, message } = useMemo(() => {
    return getMissingCompanionMaterials(orderDraft, t)
  }, [orderDraft, t])

  const buildPayload = ({
    type,
    activity_id,
    order_items,
  }: {
    type: OrderType
    activity_id: number
    order_items: OrderItem[] | FormattedOrderItem[]
  }) => {
    const isOrderRegular = type === ORDER_KEY.REGULAR
    const isOrderDistribution = type === ORDER_KEY.DISTRIBUTION
    const isOrderReturn = type === ORDER_KEY.RETURN

    const getCustomerId = () => {
      if (isOrderReturn) return entities?.return.id
      if (isOrderDistribution) return entities?.distribution.id
      return selectedWorkspace?.entity_id
    }

    const getVendorId = () => {
      if (isOrderRegular) return entities?.regular.id
      return selectedWorkspace?.entity_id
    }

    const payload = {
      customer_id: getCustomerId(),
      vendor_id: getVendorId(),
      activity_id,
      required_date: date,
      order_comment: comment,
      order_items,
    }

    if (isHierarchy) {
      return { ...payload, is_hierarchy: true }
    }

    return payload
  }

  const formatOrderItems = (orders: OrderItem[]) =>
    orders.map(({ material_id, data = [] }) => ({
      material_id,
      stocks: data.map((stock) => ({
        stock_id: stock.stock_id,
        activity_id: stock.activity_id,
        allocated_qty: stock.allocated,
        order_stock_status_id: stock?.stock_quality_id ?? null,
      })),
    }))

  function formatOrderDraft(orderDraft: OrderItem[]) {
    return orderDraft.map(
      ({
        reason_id,
        material_hierarchy,
        material_id,
        ordered_qty,
        other_reason,
        recommended_stock = 0,
      }) => {
        const children =
          material_hierarchy?.map((child) => ({
            material_id: child.material_id,
            ordered_qty: Number(child.ordered_qty) || 0,
          })) || []

        const payload = {
          material_id,
          ordered_qty: Number(ordered_qty) || 0,
          recommended_stock: Number(recommended_stock) || 0,
          order_reason_id: reason_id === 0 ? null : reason_id,
          other_reason: other_reason === '' ? null : other_reason,
        }

        // if has children, return payload with children
        if (children.length > 0) {
          return { ...payload, children }
        }

        return payload
      }
    )
  }

  const handleProcessOrder = () => {
    if (uniqueMissingCompanions.length > 0) {
      setDialogOpen(true)
    } else {
      handleCreateOrder()
    }
  }

  const handleCreateOrder = async () => {
    if (isLoadingCreateOrder) return

    try {
      setDialogOpen(false)
      const payload = buildPayload({
        type: ORDER_KEY.REGULAR,
        activity_id: orderActivity.id,
        order_items: formatOrderDraft(orderDraft),
      })

      const response = await createOrder(payload).unwrap()
      if (response) {
        dispatch(
          resetDraft({
            type: ORDER_KEY.REGULAR,
            programId,
          })
        )
        dispatch(resetOrderActivity({ type: ORDER_KEY.REGULAR, programId }))
        dispatch(setOrderFilter({ purpose: 'purchase' }))

        const id = response.createdOrderId

        showSuccessAndNavigateToDetail(
          t('order.success_create_order'),
          'snackbar-success-create-order',
          id,
          ORDER_TYPE.REQUEST
        )
      }
    } catch (error) {
      setDialogOpen(false)
      showError(getErrorMessage(error, t))
    }
  }

  const handleCreateDistributionOrder = async () => {
    if (isLoadingAllocation) return

    try {
      setDialogOpen(false)

      const payload = buildPayload({
        type: ORDER_KEY.DISTRIBUTION,
        activity_id: activeActivity?.id ?? 0,
        order_items: formatOrderItems(orders),
      })

      const response = await createDistribution(payload).unwrap()
      if (response) {
        const id = response.id

        dispatch(resetDraft({ type: ORDER_KEY.DISTRIBUTION, programId }))
        dispatch(
          resetOrderActivity({ type: ORDER_KEY.DISTRIBUTION, programId })
        )
        dispatch(clearOrderState({ programId }))
        dispatch(setOrderFilter({ purpose: 'sales' }))

        showSuccessAndNavigateToDetail(
          t('order.success_create_distribution_order'),
          'snackbar-success-create-distribution',
          id,
          ORDER_TYPE.DISTRIBUTION
        )
      }
    } catch (error) {
      setDialogOpen(false)
      showError(getErrorMessage(error, t))
    }
  }

  const handleCreateReturnOrder = async () => {
    if (isLoadingCreateReturn) return

    try {
      setDialogOpen(false)

      const payload = buildPayload({
        type: ORDER_KEY.RETURN,
        activity_id: activeActivity?.id ?? 0,
        order_items: formatOrderItems(orders),
      })

      const response = await createReturn(payload).unwrap()
      if (response) {
        const id = response.id

        dispatch(resetDraft({ type: ORDER_KEY.RETURN, programId }))
        dispatch(resetOrderActivity({ type: ORDER_KEY.RETURN, programId }))
        dispatch(clearOrderState({ programId }))
        dispatch(setOrderFilter({ purpose: 'sales' }))

        showSuccessAndNavigateToDetail(
          t('order.success_create_return_order'),
          'snackbar-success-create-return',
          id,
          ORDER_TYPE.RETURN
        )
      }
    } catch (error) {
      setDialogOpen(false)
      showError(getErrorMessage(error, t))
    }
  }

  const handleEditOrderItem = async () => {
    try {
      const payload = {
        id: orderId,
        order_items: datas.order_items,
      }

      const response = await editOrderItemStocks(payload)

      if (response?.error) {
        showFormattedError(response?.error)
        return
      }

      showSuccess(t('order.success_edit_order'), 'snackbar-success-edit-order')
      navigateToOrderDetail(orderId)
    } catch (error) {
      setDialogOpen(false)
      showError(getErrorMessage(error, t))
    }
  }

  return {
    t,
    date,
    comment,
    dialogOpen,
    isLoadingCreateOrder,
    isLoadingEditOrderItem,
    isLoadingAllocation,
    isLoadingCreateReturn,
    entities,
    orderDraft,
    activeActivity,
    message,
    handleProcessOrder,
    handleCreateOrder,
    handleEditOrderItem,
    handleCreateDistributionOrder,
    handleCreateReturnOrder,
    toogleCancelOrderDialog: () => setDialogOpen(!dialogOpen),
    isHierarchy,
  }
}
