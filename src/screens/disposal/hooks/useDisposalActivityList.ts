import { useNavigation } from '@react-navigation/native'
import { Activity } from '@/models'
import { getActivities } from '@/services/features'
import { setStockActivity } from '@/services/features/stock.slice'
import { useAppDispatch, useAppSelector } from '@/services/store'

export default function useDisposalActivityList() {
  const dispatch = useAppDispatch()

  const activities = useAppSelector((state) =>
    getActivities(state, 'activities')
  )

  const navigation = useNavigation()

  const handleSelectActivity = async (item: Activity) => {
    dispatch(setStockActivity(item))
    navigation.navigate('DisposalSubstanceMaterialSelect')
  }

  return {
    activities,
    handleSelectActivity,
  }
}
