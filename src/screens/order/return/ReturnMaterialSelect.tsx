import React from 'react'
import { useNavigation } from '@react-navigation/native'
import { useLanguage } from '@/i18n/useLanguage'
import { clearOrderState } from '@/services/features'
import { resetOrderActivity } from '@/services/features/order.slice'
import {
  useAppSelector,
  useAppDispatch,
  activityState,
  ordersState,
  workspaceState,
} from '@/services/store'
import { MATERIAL_LIST_TYPE, ORDER_KEY } from '@/utils/Constants'
import useProgramId from '@/utils/hooks/useProgramId'
import OrderMaterialList from '../component/OrderMaterialList'
import { useFetchMaterials } from '../hooks/useFetchMaterials'
import { useOrderMaterial } from '../hooks/useOrderMaterial'

export default function ReturnMaterialSelectScreen() {
  const { t } = useLanguage()

  const { activeActivity } = useAppSelector(activityState)
  const { orders } = useAppSelector(ordersState)

  const { activityMaterials, activityMaterialsHierarchy } = useFetchMaterials()
  const { selectedWorkspace } = useAppSelector(workspaceState)
  const isHierarchy = selectedWorkspace?.config.material.is_hierarchy_enabled
  const dataMaterials = isHierarchy
    ? activityMaterialsHierarchy
    : activityMaterials

  const programId = useProgramId()

  const dispatch = useAppDispatch()
  const navigation = useNavigation()

  const { vendor, handleDeleteAll, onNavigateToReview, onPressMaterial } =
    useOrderMaterial(
      orders,
      () => {
        dispatch(clearOrderState({ programId }))
        dispatch(resetOrderActivity({ type: ORDER_KEY.RETURN, programId }))
      },
      navigation,
      {
        reviewScreen: 'ReturnReview',
        detailScreen: 'ReturnMaterialDetail',
      }
    )

  return (
    <OrderMaterialList
      type={MATERIAL_LIST_TYPE.NORMAL}
      headerItems={[
        { label: t('label.activity'), value: activeActivity?.name },
        { label: t('label.customer'), value: vendor?.name },
      ]}
      materials={dataMaterials}
      orders={orders}
      onPressMaterial={onPressMaterial}
      onNavigateToReview={onNavigateToReview}
      onDeleteAll={handleDeleteAll}
    />
  )
}
