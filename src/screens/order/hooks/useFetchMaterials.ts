import { getActivityMaterials } from '@/services/features'
import { activityState, useAppSelector } from '@/services/store'

export const useFetchMaterials = () => {
  const { activeActivity } = useAppSelector(activityState)
  const activityMaterials = useAppSelector((state) =>
    getActivityMaterials(state, activeActivity?.id)
  )

  const activityMaterialsHierarchy = activityMaterials.flatMap(
    (material) => material.material_hierarchy || []
  )

  return { activityMaterials, activityMaterialsHierarchy }
}
