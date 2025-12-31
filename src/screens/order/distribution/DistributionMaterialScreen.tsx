import React, { useMemo } from 'react'
import { useNavigation } from '@react-navigation/native'
import { ConfirmationDialog } from '@/components/dialog/ConfirmationDialog'
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
import { getTestID } from '@/utils/CommonUtils'
import { MATERIAL_LIST_TYPE, ORDER_KEY } from '@/utils/Constants'
import useProgramId from '@/utils/hooks/useProgramId'
import OrderMaterialList from '../component/OrderMaterialList'
import { getMissingCompanionMaterials } from '../helpers/OrderHelpers'
import { useFetchMaterials } from '../hooks/useFetchMaterials'
import { useOrderMaterial } from '../hooks/useOrderMaterial'

export default function DistributionMaterialScreen() {
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

  const {
    vendor,
    handleDeleteAll,
    onNavigateToReview,
    onPressMaterial,
    dialogVisible,
    toggleDialog,
  } = useOrderMaterial(
    orders,
    () => {
      dispatch(clearOrderState({ programId }))
      dispatch(resetOrderActivity({ type: ORDER_KEY.DISTRIBUTION, programId }))
    },
    navigation,
    {
      reviewScreen: 'DistributionReview',
      detailScreen: 'DistributionMaterialDetail',
    }
  )

  const { uniqueMissingCompanions, message } = useMemo(() => {
    return getMissingCompanionMaterials(orders, t)
  }, [orders, t])

  const toogleConfirmationDialog = () => toggleDialog()

  const handleSubmit = () => {
    if (uniqueMissingCompanions.length > 0) {
      toggleDialog()
    } else {
      toggleDialog()
      onNavigateToReview()
    }
  }

  return (
    <>
      <OrderMaterialList
        type={MATERIAL_LIST_TYPE.NORMAL}
        headerItems={[
          { label: t('label.activity'), value: activeActivity?.name },
          { label: t('label.customer'), value: vendor?.name },
        ]}
        materials={dataMaterials}
        orders={orders}
        onPressMaterial={onPressMaterial}
        onNavigateToReview={handleSubmit}
        onDeleteAll={handleDeleteAll}
      />
      <ConfirmationDialog
        modalVisible={dialogVisible}
        dismissDialog={toogleConfirmationDialog}
        onCancel={toogleConfirmationDialog}
        onConfirm={onNavigateToReview}
        title={t('dialog.order_without_companion_materials_title')}
        message={message}
        cancelText={t('button.cancel')}
        cancelProps={{
          textClassName: 'text-main px-2',
          containerClassName: 'rounded-md border border-main px-3 py-2',
          ...getTestID('btn-cancel-distribution'),
        }}
        confirmProps={{
          textClassName: 'text-white',
          containerClassName: 'rounded-md border bg-main px-3 py-2',
          ...getTestID('btn-continue-distribution'),
        }}
        confirmText={t('button.continue_to_order')}
      />
    </>
  )
}
