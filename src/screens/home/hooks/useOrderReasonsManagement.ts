import { useGetOrderReasonsQuery } from '@/services/apis'
import { ORDER_REASON_TYPE, PAGINATE } from '@/utils/Constants'

export const useOrderReasonsManagement = () => {
  const {
    isLoading: isLoadingOrderReasonsRequest,
    refetch: refetchOrderReasonRequest,
  } = useGetOrderReasonsQuery({
    paginate: PAGINATE,
    order_type: ORDER_REASON_TYPE.REQUEST,
  })
  const {
    isLoading: isLoadingOrderReasonsRelocation,
    refetch: refetchOrderReasonRelocation,
  } = useGetOrderReasonsQuery({
    paginate: PAGINATE,
    order_type: ORDER_REASON_TYPE.RELOCATION,
  })
  const isLoadingOrderReasons =
    isLoadingOrderReasonsRequest || isLoadingOrderReasonsRelocation

  const refetchAllOrderReasons = () => {
    refetchOrderReasonRequest()
    refetchOrderReasonRelocation()
  }
  return {
    isLoadingOrderReasons,
    refetchAllOrderReasons,
  }
}
