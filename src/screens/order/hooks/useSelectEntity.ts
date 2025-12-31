import { useCallback, useMemo } from 'react'
import { BaseEntity } from '@/models'
import { EntityType } from '@/models/app-data/Cva'
import { getEntityActivity, setSelectedVendor } from '@/services/features'
import { setOrderEntity } from '@/services/features/order.slice'
import { useAppDispatch, useAppSelector, activityState } from '@/services/store'
import useProgramId from '@/utils/hooks/useProgramId'
import { OrderType } from '../types/order'

interface UseSelectEntityProps {
  entityType: EntityType
  navigateTo: string
  setOrderKey?: OrderType
}

export function useSelectEntity({
  entityType,
  navigateTo,
  setOrderKey,
}: UseSelectEntityProps) {
  const dispatch = useAppDispatch()
  const { activeActivity } = useAppSelector(activityState)
  const selectEntityActivity = useAppSelector(getEntityActivity)

  const programId = useProgramId()

  const entities = useMemo(() => {
    if (!activeActivity) return []
    return selectEntityActivity({
      type: entityType,
      activityId: activeActivity.id,
    }).filter((v) => v.name)
  }, [activeActivity, selectEntityActivity, entityType])

  const handleSelectEntity = useCallback(
    (item: BaseEntity, navigation: any) => {
      dispatch(setSelectedVendor(item))
      if (setOrderKey) {
        dispatch(
          setOrderEntity({ type: setOrderKey, entities: item, programId })
        )
      }
      navigation.navigate(navigateTo)
    },
    [dispatch, navigateTo, programId, setOrderKey]
  )

  return { activeActivity, entities, handleSelectEntity }
}
