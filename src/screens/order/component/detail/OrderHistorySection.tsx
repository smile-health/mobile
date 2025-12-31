import React from 'react'
import { View, Text } from 'react-native'
import { TFunction } from 'i18next'
import { FieldValue } from '@/components/list/FieldValue'
import { OrderDetailResponse } from '@/models/order/OrderDetail'
import AppStyles from '@/theme/AppStyles'
import { cn } from '@/theme/theme-config'

interface OrderHistorySectionProps {
  order: OrderDetailResponse
  timestamps: {
    createdAt: string
    confirmedAt: string | null
    allocatedAt: string | null
    shippedAt: string | null
    fulfilledAt: string | null
    cancelledAt: string | null
  }
  t: TFunction
}

export const OrderHistorySection = ({
  order,
  timestamps,
  t,
}: OrderHistorySectionProps) => {
  const statusList = [
    { key: 'cancelled_at', label: t('order.status.cancelled') },
    { key: 'fulfilled_at', label: t('order.status.fulfilled') },
    { key: 'shipped_at', label: t('order.status.shipped') },
    { key: 'allocated_at', label: t('order.status.allocated') },
    { key: 'confirmed_at', label: t('order.status.confirmed') },
    { key: 'created_at', label: t('order.status.pending') },
    { key: 'created_at', label: t('label.created_at') },
  ]

  return (
    <View className='border-t border-t-whiteTwo pt-3.5 mt-3.5 gap-y-2'>
      <Text className={cn(AppStyles.textBoldMedium, 'text-mediumGray')}>
        {t('label.order_status_history')}
      </Text>
      {statusList.map(({ key, label }) =>
        order[key] ? (
          <FieldValue
            key={label}
            label={label}
            value={timestamps[key.replace('_at', 'At')]}
            className={AppStyles.rowBetween}
            labelClassName={cn(
              AppStyles.textRegularSmall,
              'w-1/3 text-mediumGray'
            )}
            valueClassName={cn(AppStyles.textRegularSmall, 'w-2/3 text-right')}
          />
        ) : null
      )}
    </View>
  )
}
