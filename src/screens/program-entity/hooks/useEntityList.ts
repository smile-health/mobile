import { useCallback } from 'react'
import { BaseEntity, EntityType } from '@/models'
import { getEntities } from '@/services/features'
import { useAppSelector } from '@/services/store'
import { navigate } from '@/utils/NavigationUtils'

export default function useEntityList(entityType: EntityType) {
  const data = useAppSelector((state) => getEntities(state, entityType))

  const handlePressEntity = useCallback(
    (data: BaseEntity) => {
      navigate('ProgramEntityDetail', { type: entityType, data })
    },
    [entityType]
  )
  return { data, handlePressEntity }
}
