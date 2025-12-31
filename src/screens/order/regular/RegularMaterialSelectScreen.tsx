import React, { useEffect } from 'react'
import { useNavigation } from '@react-navigation/native'
import { useLanguage } from '@/i18n/useLanguage'
import {
  resetOrderActivity,
  resetDraft,
  setDraft,
  resetOrderEntity,
} from '@/services/features/order.slice'
import {
  useAppSelector,
  useAppDispatch,
  orderState,
  activityState,
} from '@/services/store'
import { MATERIAL_LIST_TYPE, ORDER_KEY } from '@/utils/Constants'
import useProgramId from '@/utils/hooks/useProgramId'
import OrderMaterialList from '../component/OrderMaterialList'
import { loadExistingOrderDraft } from '../helpers/OrderHelpers'
import { useFetchMaterials } from '../hooks/useFetchMaterials'
import { useOrderMaterial } from '../hooks/useOrderMaterial'

export default function RegularMaterialSelectScreen() {
  const dispatch = useAppDispatch()
  const navigation = useNavigation()
  const { t } = useLanguage()

  const { drafts } = useAppSelector(orderState)
  const { activeActivity } = useAppSelector(activityState)
  const { activityMaterials } = useFetchMaterials()

  const programId = useProgramId()
  const orderDraft = drafts.regular?.[programId] || []

  const { vendor, handleDeleteAll, onNavigateToReview, onPressMaterial } =
    useOrderMaterial(
      orderDraft,
      () => {
        dispatch(resetDraft({ type: ORDER_KEY.REGULAR, programId }))
        dispatch(resetOrderActivity({ type: ORDER_KEY.REGULAR, programId }))
        dispatch(resetOrderEntity({ type: ORDER_KEY.REGULAR, programId }))
      },
      navigation,
      {
        reviewScreen: 'RegularReview',
        detailScreen: 'RegularMaterialDetail',
      }
    )

  useEffect(() => {
    const fetchAndSetDraft = async () => {
      const savedDraft = await loadExistingOrderDraft(programId)
      if (!savedDraft) return

      if (Array.isArray(savedDraft)) {
        for (const item of savedDraft) {
          dispatch(setDraft({ type: ORDER_KEY.REGULAR, item, programId }))
        }
      }
    }

    fetchAndSetDraft()
  }, [dispatch, programId])

  return (
    <OrderMaterialList
      type={MATERIAL_LIST_TYPE.NORMAL}
      headerItems={[
        { label: t('label.activity'), value: activeActivity?.name },
        { label: t('label.vendor'), value: vendor?.name },
      ]}
      materials={activityMaterials}
      orders={orderDraft}
      onPressMaterial={onPressMaterial}
      onNavigateToReview={onNavigateToReview}
      onDeleteAll={handleDeleteAll}
    />
  )
}
