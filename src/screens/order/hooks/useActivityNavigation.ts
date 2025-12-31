import { useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import { Activity } from '@/models/'
import { setActiveActivity } from '@/services/features/activity.slice'
import {
  useAppDispatch,
  useAppSelector,
  orderState,
  workspaceState,
} from '@/services/store'
import { ORDER_KEY } from '@/utils/Constants'
import { OrderType } from '../types/order'

export function useActivityNavigation(draftType: OrderType) {
  const dispatch = useAppDispatch()
  const navigation = useNavigation()

  const { activities: orderActivities } = useAppSelector(orderState)
  const { selectedWorkspace } = useAppSelector(workspaceState)

  const activity = orderActivities[draftType]

  const isEmptyObject = (obj: object) => Object.keys(obj).length === 0

  const [isOpenModalExistOrder, setIsOpenModalExistOrder] = useState(false)

  const closeModalExistOrder = () => setIsOpenModalExistOrder(false)

  const hasDraftFromDifferentActivity = (item: Activity): boolean => {
    const programId = selectedWorkspace?.id
    const currentActivity = activity?.[Number(programId)]

    return (
      !!currentActivity &&
      !isEmptyObject(currentActivity) &&
      currentActivity.id !== item.id
    )
  }

  const handleSelectActivity = async (item: Activity) => {
    if (!selectedWorkspace?.id) return

    if (hasDraftFromDifferentActivity(item)) {
      setIsOpenModalExistOrder(true)
      return
    }

    dispatch(setActiveActivity(item))

    switch (draftType) {
      case ORDER_KEY.REGULAR: {
        navigation.navigate('RegularVendorSelect')
        break
      }
      case ORDER_KEY.DISTRIBUTION: {
        navigation.navigate('DistributionCustomerSelect')
        break
      }
      case ORDER_KEY.RETURN: {
        navigation.navigate('ReturnCustomerSelect')
        break
      }
    }
  }

  return {
    handleSelectActivity,
    closeModalExistOrder,
    isOpenModalExistOrder,
  }
}
