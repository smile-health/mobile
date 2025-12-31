import { useCallback } from 'react'
import { resetFilter } from '@/services/features/order.slice'

export const useRefreshHandler = (
  refetchOrderList: () => Promise<any>,
  refetchOrderStatus: () => Promise<any>,
  refetch: () => Promise<any>,
  orderNotif: any,
  dispatch: any
) => {
  const onRefresh = useCallback(async () => {
    await Promise.all([refetchOrderList(), refetchOrderStatus()])
  }, [refetchOrderList, refetchOrderStatus])

  const focusEffectCallback = useCallback(() => {
    dispatch(resetFilter())
    const refreshData = async () => {
      await Promise.all([refetchOrderList(), refetchOrderStatus()])
      if (orderNotif) {
        await refetch()
      }
    }
    refreshData()
  }, [dispatch, refetchOrderList, refetchOrderStatus, refetch, orderNotif])

  return { onRefresh, focusEffectCallback }
}
