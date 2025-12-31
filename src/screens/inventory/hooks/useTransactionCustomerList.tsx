import { useMemo, useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import { BaseEntity, ENTITY_TYPE } from '@/models'
import { getEntityActivity } from '@/services/features'
import { setCustomer } from '@/services/features/transaction.slice'
import {
  trxState,
  useAppDispatch,
  useAppSelector,
  workspaceState,
} from '@/services/store'

function useTransactionCustomerList() {
  const dispatch = useAppDispatch()
  const { draftTrxTypeId, activity, customer } = useAppSelector(trxState)
  const selectEntityActivity = useAppSelector(getEntityActivity)
  const customers = useMemo(
    () =>
      selectEntityActivity({
        type: ENTITY_TYPE.CUSTOMER_CONSUMPTION,
        activityId: activity.id,
      }),
    [selectEntityActivity, activity.id]
  )
  const { selectedWorkspace } = useAppSelector(workspaceState)

  const [isOpenModalExistTrx, setIsOpenModalExistTrx] = useState(false)

  const navigation = useNavigation()

  const closeModalExistTrx = () => {
    setIsOpenModalExistTrx(false)
  }

  const handleSelectCustomer = async (item: BaseEntity) => {
    if (!selectedWorkspace?.id) return
    if (customer?.id !== item.id && draftTrxTypeId) {
      setIsOpenModalExistTrx(true)
      return
    }
    dispatch(setCustomer(item))
    navigation.navigate('TransactionMaterialSelect')
  }

  return {
    activity,
    customerConsumption: draftTrxTypeId ? customer : undefined,
    customers,
    isOpenModalExistTrx,
    handleSelectCustomer,
    closeModalExistTrx,
  }
}

export default useTransactionCustomerList
