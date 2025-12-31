import { useMemo } from 'react'
import { TFunction } from 'i18next'
import { IDisposalShipmentDetail } from '@/models/disposal/DisposalShipmentList'

export default function useShipmentStatusHistory(
  data: IDisposalShipmentDetail,
  t: TFunction
) {
  return useMemo(() => {
    return [
      {
        label: t('disposal.status.cancelled'),
        user: data.user_cancelled_by,
        date: data.cancelled_at,
      },
      {
        label: t('disposal.status.received'),
        user: data.user_fulfilled_by,
        date: data.fulfilled_at,
      },
      {
        label: t('disposal.status.shipped'),
        user: data.user_shipped_by,
        date: data.shipped_at,
      },
      {
        label: t('label.created_at'),
        user: data.user_created_by,
        date: data.created_at,
      },
    ].filter((d) => d.user && d.date)
  }, [t, data])
}
