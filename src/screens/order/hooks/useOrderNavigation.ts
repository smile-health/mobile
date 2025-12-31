import { useCallback } from 'react'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { OrderDetailResponse } from '@/models/order/OrderDetail'
import { OrderItemData } from '@/models/order/OrderDetailSection'
import { AppStackParamList } from '@/navigators'
import { setDetailOrder } from '@/services/features/order.slice'
import { useAppDispatch } from '@/services/store'
import { OrderNavigationHandlers } from '../types/order'

export const useOrderNavigation = (
  navigation: NativeStackNavigationProp<AppStackParamList, 'OrderDetail'>,
  orderDetailData?: OrderDetailResponse
): OrderNavigationHandlers => {
  const dispatch = useAppDispatch()

  const handleCancelOrder = useCallback(() => {
    if (orderDetailData?.id !== undefined) {
      navigation.navigate('CancelOrder', {
        orderId: orderDetailData.id,
        type: orderDetailData.type,
      })
    }
  }, [navigation, orderDetailData?.id, orderDetailData?.type])

  const handleValidateOrder = useCallback(() => {
    if (orderDetailData !== undefined) {
      navigation.navigate('ValidateOrder', {
        orderId: orderDetailData.id,
        data: orderDetailData,
      })
    }
  }, [orderDetailData, navigation])

  const handleEditOrder = useCallback(() => {
    if (orderDetailData !== undefined) {
      navigation.navigate('EditOrder', {
        orderId: orderDetailData.id,
        data: orderDetailData,
      })
    }
  }, [orderDetailData, navigation])

  const handleAddItem = useCallback(() => {
    if (orderDetailData != undefined) {
      dispatch(setDetailOrder(orderDetailData))
      navigation.navigate('OrderItemMaterial')
    }
  }, [dispatch, navigation, orderDetailData])

  const handleOrderDetailItem = useCallback(
    (data: OrderItemData) => {
      if (orderDetailData) {
        navigation.navigate('OrderItemDetail', {
          data,
          orderDetail: orderDetailData,
        })
      }
    },
    [navigation, orderDetailData]
  )

  const handleShipOrder = useCallback(() => {
    if (orderDetailData !== undefined) {
      navigation.navigate('ShipOrder', {
        data: orderDetailData,
      })
    }
  }, [navigation, orderDetailData])

  const handleConfirmOrder = useCallback(() => {
    if (orderDetailData !== undefined) {
      navigation.navigate('ConfirmOrder', {
        orderId: orderDetailData.id,
        data: orderDetailData,
      })
    }
  }, [navigation, orderDetailData])

  const handleReceiveOrder = useCallback(() => {
    if (orderDetailData !== undefined) {
      navigation.navigate('ReceiveOrder', {
        orderId: orderDetailData.id,
        data: orderDetailData,
      })
    }
  }, [orderDetailData, navigation])

  const handleAllocateOrder = useCallback(() => {
    if (orderDetailData !== undefined) {
      navigation.navigate('AllocatedOrder', {
        data: orderDetailData,
      })
    }
  }, [navigation, orderDetailData])

  return {
    handleCancelOrder,
    handleValidateOrder,
    handleEditOrder,
    handleAddItem,
    handleOrderDetailItem,
    handleShipOrder,
    handleConfirmOrder,
    handleReceiveOrder,
    handleAllocateOrder,
  }
}
