import { useMemo } from 'react'
import { TFunction } from 'i18next'
import AppStyles from '@/theme/AppStyles'
import { cn } from '@/theme/theme-config'
import { getStatusColor } from '@/utils/CommonUtils'
import { ORDER_STATUS, orderStatusNames } from '@/utils/Constants'
import { OrderStatusResult } from '../types/order'

export type STATUS = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS]

export const useOrderStatus = (
  status: STATUS | undefined,
  t: TFunction
): OrderStatusResult => {
  const statusName = useMemo(() => {
    if (status === undefined) return ''
    if (status === ORDER_STATUS.DRAFT) return t('order.status.draft')
    return t(orderStatusNames[status] || '')
  }, [status, t])

  const statusStyle = useMemo(() => {
    const { background, text } = getStatusColor(status)
    return {
      background: cn(
        'flex-row flex justify-between items-center px-4 py-2',
        background
      ),
      text: cn(AppStyles.textRegularSmall, text),
    }
  }, [status])

  return { statusName, statusStyle }
}
