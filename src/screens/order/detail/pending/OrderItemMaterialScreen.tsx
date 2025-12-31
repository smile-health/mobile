import React, { useMemo } from 'react'
import { useNavigation } from '@react-navigation/native'
import { useToolbar } from '@/components/toolbar/hooks/useToolbar'
import { useLanguage } from '@/i18n/useLanguage'
import { getActivityMaterials } from '@/services/features'
import {
  resetDraft,
  resetOrderActivity,
  resetOrderItemDraft,
} from '@/services/features/order.slice'
import {
  useAppSelector,
  useAppDispatch,
  orderState,
  workspaceState,
} from '@/services/store'
import { MATERIAL_LIST_TYPE, ORDER_KEY } from '@/utils/Constants'
import useProgramId from '@/utils/hooks/useProgramId'
import OrderMaterialList from '../../component/OrderMaterialList'
import { useOrderMaterial } from '../../hooks/useOrderMaterial'

export default function OrderItemMaterialScreen() {
  const { orderItemDraft } = useAppSelector(orderState)
  const { detailOrder } = useAppSelector(orderState)
  const { drafts } = useAppSelector(orderState)
  const { selectedWorkspace } = useAppSelector(workspaceState)

  const isHierarchy = selectedWorkspace?.config.material.is_hierarchy_enabled
  const programId = useProgramId()
  const orderDraft = drafts.regular?.[programId] || []

  const orderItemDraftHierarchy = orderItemDraft.map((item) => {
    const match = orderDraft.find(
      (draft) => draft.material_id === item.material_id
    )
    return {
      ...item,
      children: match?.material_hierarchy || [],
    }
  })

  const ordersToUse = isHierarchy ? orderItemDraftHierarchy : orderItemDraft

  const {
    id: orderId,
    activity,
    order_items: orderItems,
    vendor,
    type: orderType,
  } = detailOrder
  const { name: activityName } = activity

  const activityMaterials = useAppSelector((state) =>
    getActivityMaterials(state, activity.id)
  )

  const filteredMaterials = useMemo(
    () =>
      activityMaterials.filter(
        (mat) => !orderItems.some((item) => item.material?.id === mat.id)
      ),
    [activityMaterials, orderItems]
  )

  const dispatch = useAppDispatch()
  const { t } = useLanguage()
  const navigation = useNavigation()

  const { handleDeleteAll, onNavigateToReview, onPressMaterial } =
    useOrderMaterial(
      orderItemDraft,
      () => {
        dispatch(resetDraft({ type: ORDER_KEY.REGULAR, programId }))
        dispatch(resetOrderActivity({ type: ORDER_KEY.REGULAR, programId }))
        dispatch(resetOrderItemDraft())
      },
      navigation,
      {
        reviewScreen: 'OrderItemReview',
        detailScreen: 'OrderItemMaterialDetail',
        params: { orderId, activityName, orderType },
      }
    )

  useToolbar({ title: `${t('button.add_item')}: ${orderId}` })

  return (
    <OrderMaterialList
      type={MATERIAL_LIST_TYPE.NORMAL}
      headerItems={[
        { label: t('label.activity'), value: activityName },
        { label: t('label.vendor'), value: vendor?.name },
      ]}
      materials={filteredMaterials}
      orders={ordersToUse}
      loadingTestId='loading-dialog-order-material'
      onPressMaterial={onPressMaterial}
      onNavigateToReview={onNavigateToReview}
      onDeleteAll={handleDeleteAll}
    />
  )
}
