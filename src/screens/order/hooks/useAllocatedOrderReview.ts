import { useCallback } from 'react'
import { useLanguage } from '@/i18n/useLanguage'
import { OrderData } from '@/models/order/AddOrderItem'
import { useAllocateOrderMutation } from '@/services/apis'
import { resetAllocatedDraft } from '@/services/features'
import { allocateState, useAppDispatch, useAppSelector } from '@/services/store'
import { formatErrorMessage, showError } from '@/utils/CommonUtils'
import { ORDER_TYPE } from '@/utils/Constants'
import { showSuccessAndNavigateToDetail } from '../helpers/OrderHelpers'

export const useAllocatedOrderReview = (data: OrderData, comment: string) => {
  const { t } = useLanguage()
  const { allocatedDraft } = useAppSelector(allocateState)
  const dispatch = useAppDispatch()
  const [allocateOrder, { isLoading: isLoadingAllocateOrder }] =
    useAllocateOrderMutation()

  const order_items = allocatedDraft.map((parentItem, parentIndex) => {
    const originalParent = data.order_items[parentIndex]
    const hasChildren = originalParent.children?.length > 0
    return {
      id: originalParent?.id,
      children: parentItem.children.map((childItem, childIndex) => {
        const originalChild = originalParent?.children?.[childIndex]
        return hasChildren
          ? {
              // material 93
              id: originalChild?.id,
              allocations: childItem.stock.map((stockItem) => {
                return {
                  stock_id: stockItem.stock_id,
                  allocated_qty: Number(stockItem.draft_allocated_qty),
                  ...(stockItem.draft_order_stock_status?.value != null && {
                    order_stock_status_id: Number(
                      stockItem.draft_order_stock_status.value
                    ),
                  }),
                }
              }),
            }
          : {
              // material 92
              allocated_qty: childItem.total_allocated_qty,
              material_id: childItem.material.id,
              order_item_kfa_id: childItem?.material.material_level_id,
              recommended_stock: parentItem.recommended_stock ?? 0,
              order_reason_id: originalParent?.reason?.id,
              allocations: childItem.stock.map((stockItem) => {
                return {
                  stock_id: stockItem.stock_id,
                  allocated_qty: Number(stockItem.draft_allocated_qty),
                }
              }),
            }
      }),
    }
  })

  const handleProcessOrder = useCallback(async () => {
    if (isLoadingAllocateOrder) return
    try {
      const payload = {
        id: data.id,
        order_items,
        comment,
      }
      const response = await allocateOrder(payload)
      if (response.error) {
        showError(formatErrorMessage(response.error))
        return
      }
      showSuccessAndNavigateToDetail(
        t('order.success_allocate_order'),
        'snackbar-success-allocate-order',
        data.id,
        ORDER_TYPE.DISTRIBUTION
      )
      dispatch(resetAllocatedDraft())
    } catch (error) {
      showError(formatErrorMessage(error))
    }
  }, [
    allocateOrder,
    comment,
    data.id,
    dispatch,
    isLoadingAllocateOrder,
    order_items,
    t,
  ])

  return {
    allocatedDraft,
    isLoadingAllocateOrder,
    handleProcessOrder,
  }
}
