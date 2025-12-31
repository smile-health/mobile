import { EventReportHistory } from '@/models/order/EventReportDetail'
import { Reason } from '@/models/order/Reason'

function findReasonByValue(
  reasonOptions: Reason[],
  value: string
): Reason | undefined {
  return reasonOptions.find((r) => r.value === value)
}

export function findReasonLabel(
  reasonValue: string,
  reasonOptions: Reason[]
): string {
  return findReasonByValue(reasonOptions, reasonValue)?.label ?? reasonValue
}

export function findDetailReasonLabel(
  reasonValue: string,
  detailReasonValue: string,
  reasonOptions: Reason[]
): string {
  const parent = findReasonByValue(reasonOptions, reasonValue)

  return (
    parent?.children?.find((c) => c.value === detailReasonValue)?.label ??
    detailReasonValue
  )
}

export const findStatusLabelTicket = (
  history: EventReportHistory[],
  statusId: number
) => {
  return history.find((h) => h.status_id === statusId)?.status_label ?? ''
}
