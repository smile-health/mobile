import { useMemo } from 'react'
import { getActivities } from '@/services/features'
import { useAppSelector, orderState } from '@/services/store'
import useProgramId from '@/utils/hooks/useProgramId'
import { useActivityDraft } from './useActivityDraft'
import { useActivityNavigation } from './useActivityNavigation'
import { OrderType } from '../types/order'

export default function useOrderActivity(draftType: OrderType) {
  const activities = useAppSelector((state) =>
    getActivities(state, 'activities')
  )

  const { activities: orderActivities } = useAppSelector(orderState)
  const programId = useProgramId()

  const orderActivity = useMemo(() => {
    return orderActivities[draftType]?.[programId]
  }, [orderActivities, draftType, programId])

  useActivityDraft(draftType)

  const { handleSelectActivity, closeModalExistOrder, isOpenModalExistOrder } =
    useActivityNavigation(draftType)

  return {
    activities,
    orderActivity,
    handleSelectActivity,
    closeModalExistOrder,
    isOpenModalExistOrder,
  }
}
