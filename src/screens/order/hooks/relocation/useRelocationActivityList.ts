import { useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import { Activity, ACTIVITY_TYPE } from '@/models'
import { getActivities } from '@/services/features'
import { setActivity } from '@/services/features/relocation.slice'
import {
  relocationState,
  useAppDispatch,
  useAppSelector,
  workspaceState,
} from '@/services/store'

function useRelocationActivityList() {
  const navigation = useNavigation()

  const dispatch = useAppDispatch()
  const activities = useAppSelector((state) =>
    getActivities(state, ACTIVITY_TYPE.ACTIVE)
  )
  const { selectedWorkspace } = useAppSelector(workspaceState)
  const { activity, relocations } = useAppSelector(relocationState)
  const [isOpenModalExist, setIsOpenModalExist] = useState(false)
  const hasDataRelocation = relocations.length > 0

  const closeModalExist = () => {
    setIsOpenModalExist(false)
  }

  const handleSelectActivity = async (item: Activity) => {
    if (!selectedWorkspace?.id) return
    if (
      activity?.id !== item.id &&
      item.entity_activity_id !== activity.entity_activity_id &&
      hasDataRelocation
    ) {
      setIsOpenModalExist(true)
      return
    }

    dispatch(setActivity(item))
    navigation.navigate('RelocationVendorSelect')
  }

  return {
    activityRelocation: hasDataRelocation ? activity : undefined,
    activities,
    isOpenModalExist,
    handleSelectActivity,
    closeModalExist,
  }
}

export default useRelocationActivityList
