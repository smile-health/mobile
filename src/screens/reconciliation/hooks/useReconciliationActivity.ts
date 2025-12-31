import { useNavigation } from '@react-navigation/native'
import { Activity, ACTIVITY_TYPE } from '@/models'
import { getActivities } from '@/services/features'
import { setActivity } from '@/services/features/reconciliation.slice'
import { useAppDispatch, useAppSelector } from '@/services/store'

export default function useReconciliationActivity() {
  const dispatch = useAppDispatch()
  const activities = useAppSelector((state) =>
    getActivities(state, ACTIVITY_TYPE.ACTIVE)
  )

  const navigation = useNavigation()

  const handleSelectActivity = async (item: Activity) => {
    dispatch(setActivity(item))
    navigation.navigate('ReconciliationMaterial')
  }

  return {
    activities,
    handleSelectActivity,
  }
}
