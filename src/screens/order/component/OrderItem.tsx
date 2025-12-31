import React, { memo, useMemo } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import { Icons } from '@/assets/icons'
import { useLanguage } from '@/i18n/useLanguage'
import { OrderResponse } from '@/models'
import AppStyles from '@/theme/AppStyles'
import { cn } from '@/theme/theme-config'
import { getTestID } from '@/utils/CommonUtils'
import {
  ORDER_STATUS,
  SHORT_DATE_TIME_FORMAT,
  orderStatusNames,
  orderTypeNames,
} from '@/utils/Constants'
import { convertString } from '@/utils/DateFormatUtils'
import BadgeIntegrationOrder from './detail/BadgeIntegrationOrder'

interface OrderItemProps {
  item: OrderResponse
  purpose: 'sales' | 'purchase'
  onPress: () => void
}

export const OrderItem = memo(function OrderItem({
  item,
  purpose,
  onPress,
}: OrderItemProps) {
  const { t } = useLanguage()

  const orderStatusDateKey: Record<number, keyof OrderResponse> = {
    1: 'created_at',
    2: 'confirmed_at',
    3: 'allocated_at',
    4: 'shipped_at',
    5: 'fulfilled_at',
    6: 'cancelled_at',
    8: 'created_at',
  }

  const labelText = `${item.status === ORDER_STATUS.DRAFT ? t('order.status.draft') : t(orderStatusNames[item.status] || '')} ${t('label.at')} `
  const orderDateKey = orderStatusDateKey[item.status] as string

  const labelDate = convertString(
    item[orderDateKey] || '',
    SHORT_DATE_TIME_FORMAT
  )

  const entity = useMemo(() => {
    return purpose === 'sales' ? item.customer?.name : item.vendor?.name
  }, [item.customer?.name, item.vendor?.name, purpose])

  const orderIdType = useMemo(() => {
    const type = orderTypeNames[item.type] || 'order.type.request'
    return `${item.id} (${t(type)})`
  }, [item.id, item.type, t])

  const badgeIntegrationType = item?.metadata?.client_key

  return (
    <TouchableOpacity
      className='flex-row justify-between px-4 py-3 bg-white border-b border-b-whiteTwo'
      onPress={onPress}
      activeOpacity={0.7}
      {...getTestID(`order-item-${item.id}`)}>
      <View className='flex-1 gap-y-1 '>
        <View className={AppStyles.rowCenterAlign}>
          <Text
            className={cn(
              AppStyles.textMedium,
              'text-midnightBlue font-semibold'
            )}>
            {orderIdType}
          </Text>
          {badgeIntegrationType && (
            <BadgeIntegrationOrder
              type={badgeIntegrationType}
              containerClassName='ml-2'
            />
          )}
        </View>
        <Text className={AppStyles.textBold}>{entity}</Text>
        <Text className={AppStyles.textMediumSmall}>
          {t('label.activity')}: {item.activity?.name || '-'}
        </Text>
        <View className={AppStyles.rowCenterAlign}>
          <Text className={cn(AppStyles.textRegularSmall, 'text-mediumGray ')}>
            {labelText}
          </Text>
          <Text
            className={cn(
              AppStyles.textRegularSmall,
              'text-mediumGray uppercase'
            )}>
            {labelDate}
          </Text>
        </View>
      </View>
      <View className=' items-end justify-between mt-1.5'>
        <Icons.IcChevronRightActive />
        <View className='flex flex-row items-center'>
          <Text className={cn(AppStyles.textRegularSmall, 'text-mediumGray')}>
            {t('order.total_items')}:{' '}
          </Text>
          <Text className={cn(AppStyles.textBold)}>
            {item.total_order_item}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  )
})
