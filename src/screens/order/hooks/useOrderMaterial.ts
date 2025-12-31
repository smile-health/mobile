import { useState } from 'react'
import { setOrderMaterial } from '@/services/features'
import { useAppDispatch, useAppSelector, vendorState } from '@/services/store'

type OrderResetAction = () => any

export function useOrderMaterial(
  orderItems: any[],
  resetOrderAction: OrderResetAction,
  navigation: any,
  navigationOptions: {
    reviewScreen: string
    detailScreen: string
    params?: Record<string, any>
  }
) {
  const [dialogVisible, setDialogVisible] = useState(false)
  const { vendor } = useAppSelector(vendorState)
  const dispatch = useAppDispatch()

  const toggleDialog = () => {
    setDialogVisible(!dialogVisible)
  }

  const handleDeleteAll = () => {
    resetOrderAction()
    setDialogVisible(false)
  }

  const onNavigateToReview = () => {
    navigation.navigate(
      navigationOptions.reviewScreen,
      navigationOptions.params
    )
    setDialogVisible(false)
  }

  const onPressMaterial = (selectedMaterial: any) => {
    const selectedOrder = orderItems.find(
      (item) => item?.material_id === selectedMaterial.id
    )
    const enrichedMaterial = {
      ...selectedMaterial,
      recommended_stock: selectedOrder?.recommended_stock ?? 0,
      ordered_qty: selectedOrder?.ordered_qty ?? '',
      reason_id: selectedOrder?.reason_id ?? '',
    }

    dispatch(setOrderMaterial(enrichedMaterial))

    navigation.navigate(navigationOptions.detailScreen, {
      ...navigationOptions.params,
      data: enrichedMaterial,
    })
  }

  return {
    dialogVisible,
    setDialogVisible,
    vendor,
    toggleDialog,
    handleDeleteAll,
    onNavigateToReview,
    onPressMaterial,
  }
}
