import { useEffect } from 'react'
import { setOrderActivity, setDraft } from '@/services/features/order.slice'
import { useAppDispatch } from '@/services/store'
import { ORDER_KEY } from '@/utils/Constants'
import useProgramId from '@/utils/hooks/useProgramId'
import {
  loadExistingRegularActivity,
  loadExistingOrderDraft,
  loadExistingDistributionActivity,
  loadExistingDistributionDraft,
} from '../helpers/OrderHelpers'
import { OrderType } from '../types/order'

export function useActivityDraft(draftType: OrderType) {
  const dispatch = useAppDispatch()

  const programId = useProgramId()

  useEffect(() => {
    if (!programId) return

    const loadActivityAndDraft = async () => {
      const [activity, draft] =
        draftType === ORDER_KEY.REGULAR
          ? [
              await loadExistingRegularActivity(programId),
              await loadExistingOrderDraft(programId),
            ]
          : [
              await loadExistingDistributionActivity(programId),
              await loadExistingDistributionDraft(programId),
            ]

      if (activity) {
        dispatch(
          setOrderActivity({
            type: draftType,
            programId,
            activity: activity,
          })
        )
      }

      if (draft && Array.isArray(draft)) {
        for (const item of draft) {
          dispatch(setDraft({ type: draftType, item, programId }))
        }
      }
    }

    loadActivityAndDraft()
  }, [dispatch, draftType, programId])
}
