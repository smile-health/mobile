import React from 'react'
import { View } from 'react-native'
import { InfoRow } from '@/components/list/InfoRow'
import { useLanguage } from '@/i18n/useLanguage'
import { numberFormat } from '@/utils/CommonUtils'
import { ORDER_STATUS } from '@/utils/Constants'

interface Props {
  orderStatus: number
  orderedQty?: number
  confirmedQty?: number
  allocatedQty: number | null
  shippedQty: number | null
  receivedQty: number | null
}

function OrderItemQuantityInfo({
  orderStatus,
  orderedQty,
  confirmedQty,
  allocatedQty,
  shippedQty,
  receivedQty,
}: Readonly<Props>) {
  const { t } = useLanguage()
  const isCancelled = orderStatus === ORDER_STATUS.CANCELLED
  const isFulfilled = orderStatus === ORDER_STATUS.FULFILLED

  return (
    <View className='gap-y-1'>
      {isFulfilled && (
        <InfoRow
          label={t('label.fulfilled_qty')}
          value={numberFormat(receivedQty)}
          valueClassName='font-mainBold'
        />
      )}
      {isCancelled && (
        <InfoRow
          label={t('label.cancelled_qty')}
          value={numberFormat(allocatedQty ?? confirmedQty ?? orderedQty ?? 0)}
          valueClassName='font-mainBold'
        />
      )}
      {!!shippedQty && (
        <InfoRow
          label={t('label.shipped_qty')}
          value={numberFormat(allocatedQty)}
        />
      )}
      {!!allocatedQty && (
        <InfoRow
          label={t('label.allocated_qty')}
          value={numberFormat(allocatedQty)}
        />
      )}
      {!!confirmedQty && (
        <InfoRow
          label={t('label.confirmed_qty')}
          value={numberFormat(confirmedQty)}
        />
      )}
      {!!orderedQty && (
        <InfoRow
          label={t('label.ordered_qty')}
          value={numberFormat(orderedQty)}
        />
      )}
    </View>
  )
}

export default React.memo(OrderItemQuantityInfo)
