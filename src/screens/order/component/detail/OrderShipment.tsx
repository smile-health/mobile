import React, { FC } from 'react'
import { Text, View } from 'react-native'
import { useLanguage } from '@/i18n/useLanguage'
import { ShipmentData } from '@/models/order/OrderDetailSection'
import AppStyles from '@/theme/AppStyles'
import { cn } from '@/theme/theme-config'
import {
  SHORT_DATE_FORMAT,
  ORDER_STATUS,
  orderStatusNames,
} from '@/utils/Constants'
import { convertString } from '@/utils/DateFormatUtils'

interface OrderShipmentProps {
  data: ShipmentData
}

const ShipmentDetailRow: FC<{ label: string; value?: string }> = ({
  label,
  value,
}) => (
  <View className={cn(AppStyles.rowBetween, 'mt-2')}>
    <Text className={cn(AppStyles.textRegularSmall, 'text-mediumGray')}>
      {label}
    </Text>
    <Text className={AppStyles.textBoldSmall}>{value || '-'}</Text>
  </View>
)

export const OrderShipment: FC<OrderShipmentProps> = ({
  data: { id, status, shippedAt, fulfilledAt },
}) => {
  const { t } = useLanguage()

  return (
    <View className='bg-white p-4 pt-0'>
      <View className='w-full h-[1px] bg-lightGreyMinimal' />
      <ShipmentDetailRow label={t('label.shipment_id')} value={`${id}-1`} />
      <ShipmentDetailRow
        label={t('label.status')}
        value={t(orderStatusNames[status] || '')}
      />
      <ShipmentDetailRow
        label={t('label.actual_delivery_date')}
        value={convertString(shippedAt, SHORT_DATE_FORMAT)}
      />
      {status === ORDER_STATUS.FULFILLED && (
        <ShipmentDetailRow
          label={t('label.actual_receipt_date')}
          value={convertString(fulfilledAt, SHORT_DATE_FORMAT)}
        />
      )}
    </View>
  )
}
