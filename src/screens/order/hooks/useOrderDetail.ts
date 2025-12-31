import { useMemo } from 'react'
import { useGetOrderDetailQuery } from '@/services/apis'
import { useAppSelector, orderState, workspaceState } from '@/services/store'
import { ORDER_INTEGRATION, ORDER_STATUS, ORDER_TYPE } from '@/utils/Constants'
import { useOrderFooterActions } from './useOrderFooterActions'
import { useOrderNavigation } from './useOrderNavigation'
import { useOrderSections } from './useOrderSections'
import { useOrderStatus } from './useOrderStatus'
import { useOrderType } from './useOrderType'
import { UseOrderDetailProps } from '../types/order'

export const useOrderDetail = ({ id, t, navigation }: UseOrderDetailProps) => {
  const { filter } = useAppSelector(orderState)
  const {
    data: orderDetailData,
    isLoading,
    refetch,
    isFetching,
  } = useGetOrderDetailQuery({ id })

  const { isVendor, isCustomer } = useOrderType(filter)
  const { statusName, statusStyle } = useOrderStatus(orderDetailData?.status, t)
  const SECTION_DATA = useOrderSections(orderDetailData)
  const navigationHandlers = useOrderNavigation(navigation, orderDetailData)

  const { selectedWorkspace } = useAppSelector(workspaceState)

  const isRequestOrder = orderDetailData?.type === ORDER_TYPE.REQUEST
  const isOrderSIHA =
    orderDetailData?.metadata?.client_key ===
    ORDER_INTEGRATION.SIHA.toLowerCase()
  const isOrderSITB =
    orderDetailData?.metadata?.client_key ===
    ORDER_INTEGRATION.SITB.toLowerCase()
  const isOrderSiHATB = isOrderSIHA || isOrderSITB
  const isConfirmRestricted =
    selectedWorkspace?.config?.order?.is_confirm_restricted ?? false
  const isRequestOrderConfirmRestricted =
    isRequestOrder && isConfirmRestricted && isOrderSiHATB

  const isMaterialHierarchy =
    selectedWorkspace?.config?.material.is_hierarchy_enabled

  const preview =
    navigation.getState().routes.find((route) => route.name === 'OrderDetail')
      ?.params?.preview || false

  const FooterActionButtons = useOrderFooterActions({
    status: orderDetailData?.status,
    isVendor,
    isCustomer,
    orderId: orderDetailData?.id,
    activityName: orderDetailData?.activity?.name,
    t,
    orderType: orderDetailData?.type,
    onValidate: navigationHandlers.handleValidateOrder,
    onEdit: navigationHandlers.handleEditOrder,
    onCancel: navigationHandlers.handleCancelOrder,
    onShip: navigationHandlers.handleShipOrder,
    onConfirm: navigationHandlers.handleConfirmOrder,
    onReceive: navigationHandlers.handleReceiveOrder,
    onAllocate: navigationHandlers.handleAllocateOrder,
    preview,
    isRequestOrderConfirmRestricted,
  })

  const shouldShowAddItemButton = useMemo(
    () =>
      isCustomer &&
      orderDetailData?.status === ORDER_STATUS.PENDING &&
      (orderDetailData?.order_items?.length ?? 0) > 0,
    [isCustomer, orderDetailData]
  )

  return {
    isVendor,
    isCustomer,
    shouldShowAddItemButton,
    statusName,
    statusStyle,
    SECTION_DATA,
    ...navigationHandlers,
    orderDetailData,
    refetchOrderDetail: refetch,
    FooterActionButtons,
    shouldShowLoading: isLoading || isFetching,
    isMaterialHierarchy,
    isConfirmRestricted,
    isRequestOrderConfirmRestricted,
  }
}
