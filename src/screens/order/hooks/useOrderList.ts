import { OrderWithEntityParams } from '@/models'
import { useGetOrderListWithEntityQuery } from '@/services/apis/order.api'

export const useOrderList = (params: OrderWithEntityParams) => {
  const { data, isLoading, isFetching, refetch } =
    useGetOrderListWithEntityQuery(params)

  return {
    orders_number: data?.data ?? [],
    isLoading,
    isFetching,
    refetch,
  }
}
