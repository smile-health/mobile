import { useNavigation } from '@react-navigation/native'
import { Activity, ACTIVITY_TYPE } from '@/models'
import { getActivities, getAppNotifMaterial } from '@/services/features'
import { setStockActivity } from '@/services/features/stock.slice'
import {
  useAppDispatch,
  useAppSelector,
  workspaceState,
} from '@/services/store'

export default function useInventoryActivityList() {
  const dispatch = useAppDispatch()
  const { selectedWorkspace } = useAppSelector(workspaceState)
  const activities = useAppSelector((state) =>
    getActivities(state, ACTIVITY_TYPE.ACTIVE)
  )
  const appNotifMaterial = useAppSelector(getAppNotifMaterial)

  const isHierarchy = !!selectedWorkspace?.config.material.is_hierarchy_enabled
  const navigation = useNavigation()

  const handleSelectActivity = async (item: Activity) => {
    dispatch(setStockActivity(item))
    const alert = appNotifMaterial?.activities.find((ac) => ac.id === item.id)
    navigation.navigate('StockMaterialSelect', {
      alerts: isHierarchy ? alert?.parent_materials : alert?.materials,
    })
  }

  return {
    activityMaterialAlert: appNotifMaterial?.activities,
    activities,
    handleSelectActivity,
  }
}
