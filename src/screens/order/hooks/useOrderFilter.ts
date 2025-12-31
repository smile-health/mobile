import { authState, orderState, useAppSelector } from '@/services/store'
import useProgramId from '@/utils/hooks/useProgramId'

export const useOrderFilter = (page: number) => {
  const { filter } = useAppSelector(orderState)
  const { user } = useAppSelector(authState)
  const programId = useProgramId()

  const isCustomer = filter.purpose === 'purchase'
  const entityId = user?.programs?.find(
    (item) => item.id === programId
  )?.entity_id

  const entityIdAsString = entityId === undefined ? null : String(entityId)

  const queryParamsListOrder = {
    ...filter,
    paginate: 10,
    page,
  }

  const queryParamsStatusCountOrder = {
    type: filter.type,
    purpose: filter.purpose,
    order_id: filter.order_number,
    activity_id: filter.activity_id,
    vendor_id: filter.vendor_id,
    customer_id: filter.customer_id,
    from_date: filter.from_date,
    to_date: filter.to_date,
  }

  return {
    filter,
    queryParamsListOrder,
    queryParamsStatusCountOrder,
    isCustomer,
    entityId,
    entityIdAsString,
  }
}
