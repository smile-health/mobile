import { useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import { Activity, ACTIVITY_TYPE } from '@/models'
import { getActivities } from '@/services/features'
import { setActivity } from '@/services/features/transaction.slice'
import {
  homeState,
  trxState,
  useAppDispatch,
  useAppSelector,
  workspaceState,
} from '@/services/store'
import { TRANSACTION_TYPE } from '@/utils/Constants'

function useTransactionActivityList() {
  const dispatch = useAppDispatch()
  const activities = useAppSelector((state) =>
    getActivities(state, ACTIVITY_TYPE.ACTIVE)
  )
  const { activeMenu } = useAppSelector(homeState)
  const { selectedWorkspace } = useAppSelector(workspaceState)
  const { draftTrxTypeId, activity } = useAppSelector(trxState)
  const [isOpenModalExistTrx, setIsOpenModalExistTrx] = useState(false)

  const navigation = useNavigation()
  const needCustomer = [
    TRANSACTION_TYPE.CONSUMPTION,
    TRANSACTION_TYPE.RETURN,
  ].includes(activeMenu?.transactionType ?? 0)

  const closeModalExistTrx = () => {
    setIsOpenModalExistTrx(false)
  }

  const handleSelectActivity = async (item: Activity) => {
    if (!selectedWorkspace?.id) return
    if (
      activity?.id !== item.id &&
      item.entity_activity_id !== activity.entity_activity_id &&
      draftTrxTypeId
    ) {
      setIsOpenModalExistTrx(true)
      return
    }
    dispatch(setActivity(item))
    navigation.navigate(
      needCustomer ? 'TransactionCustomerSelect' : 'TransactionMaterialSelect'
    )
  }

  return {
    activityTrx: draftTrxTypeId ? activity : undefined,
    activities,
    isOpenModalExistTrx,
    handleSelectActivity,
    closeModalExistTrx,
  }
}

export default useTransactionActivityList
