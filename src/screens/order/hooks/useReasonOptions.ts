import { reasonOrderState, useAppSelector } from '@/services/store'
import { ORDER_REASON_TYPE } from '@/utils/Constants'

export function useReasonOptions() {
  const { reasonOptions } = useAppSelector(reasonOrderState)

  const reasonRegularOptions = reasonOptions[ORDER_REASON_TYPE.REQUEST]
  const reasonRelocationOptions = reasonOptions[ORDER_REASON_TYPE.RELOCATION]

  return {
    reasonRegularOptions,
    reasonRelocationOptions,
  }
}
