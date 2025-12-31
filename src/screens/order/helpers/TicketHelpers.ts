import { useMemo, useState, useEffect } from 'react'
import { t } from 'i18next'
import { TicketMaterial } from '@/models/order/Ticket'
import { numberFormat } from '@/utils/CommonUtils'
import { TICKET_STATUS } from '@/utils/Constants'
import { formatDuration } from '@/utils/DateFormatUtils'

export const getQuantity = (item: TicketMaterial): number => {
  const { is_managed_in_batch, batches, qty } = item

  if (!is_managed_in_batch || !batches?.length) {
    return qty ?? 0
  }

  return batches.reduce((sum, { qty = 0 }) => sum + qty, 0)
}

export const getFormattedQuantity = (item: TicketMaterial): string => {
  return numberFormat(getQuantity(item))
}

export const getFormQuantity = (qty: number | undefined): number => {
  return qty ?? 0
}

export const getFormattedFormQuantity = (qty: number | undefined): string => {
  return numberFormat(qty ?? 0)
}

export const getRadioOptions = () => [
  { label: t('common.yes'), value: 1 },
  { label: t('common.no'), value: 0 },
]

export const useCalculateTotalLeadTime = (
  createdAt?: string,
  updatedAt?: string,
  statusId?: number
): string => {
  const [currentTime, setCurrentTime] = useState(Date.now())

  useEffect(() => {
    if (
      statusId !== TICKET_STATUS.COMPLETED &&
      statusId !== TICKET_STATUS.CANCELED
    ) {
      const interval = setInterval(() => {
        setCurrentTime(Date.now())
      }, 1000)

      return () => clearInterval(interval)
    }

    return () => {}
  }, [statusId])

  return useMemo(() => {
    if (!createdAt) return '00:00:00'

    const createdTime = new Date(createdAt).getTime()
    if (Number.isNaN(createdTime)) return '00:00:00'

    let endTime: number

    if (
      statusId === TICKET_STATUS.COMPLETED ||
      statusId === TICKET_STATUS.CANCELED
    ) {
      if (!updatedAt) return '00:00:00'
      endTime = new Date(updatedAt).getTime()
      if (Number.isNaN(endTime)) return '00:00:00'
    } else {
      endTime = currentTime
    }

    const diffInSeconds = Math.trunc((endTime - createdTime) / 1000)

    if (diffInSeconds < 0) return '00:00:00'

    return formatDuration(diffInSeconds)
  }, [createdAt, updatedAt, statusId, currentTime])
}
