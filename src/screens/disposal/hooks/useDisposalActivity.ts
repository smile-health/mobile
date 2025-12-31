import { useNavigation } from '@react-navigation/native'
import { Activity, ACTIVITY_TYPE } from '@/models'
import { getActivities, setActivity } from '@/services/features'
import { useAppDispatch, useAppSelector } from '@/services/store'
import { DISPOSAL_TYPE, DisposalType } from '../disposal-constant'

export default function useDisposalActivity(
  type: DisposalType = DISPOSAL_TYPE.SELF
) {
  const dispatch = useAppDispatch()
  const activities = useAppSelector((state) =>
    getActivities(state, ACTIVITY_TYPE.ACTIVE)
  )

  const navigation = useNavigation()

  const handleSelectActivity = async (item: Activity) => {
    const destination = {
      [DISPOSAL_TYPE.SELF]: 'DisposalMethodSelect',
      [DISPOSAL_TYPE.SHIPMENT]: 'ShipmentDisposalReceiver',
    } as const
    dispatch(setActivity(item))
    navigation.navigate(destination[type])
  }

  return {
    activities,
    handleSelectActivity,
  }
}
