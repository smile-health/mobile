import React from 'react'
import { View, Text } from 'react-native'
import { TFunction } from 'i18next'
import { EventReportDetailItem } from '@/models/order/EventReportDetail'
import AppStyles from '@/theme/AppStyles'
import { cn } from '@/theme/theme-config'
import { convertString } from '@/utils/DateFormatUtils'

interface TicketDetailItemProps {
  item: EventReportDetailItem
  t: TFunction
}

const TicketDetailItem: React.FC<TicketDetailItemProps> = ({ item, t }) => {
  return (
    <View className='p-4 mx-4 my-2 border border-whiteTwo rounded-sm bg-white'>
      <Text className={cn(AppStyles.textBoldSmall, 'mb-2 text-darkGray')}>
        {item.material_name}
      </Text>

      <View className='flex-row justify-between mb-2 border-b border-gray-200 pb-2'>
        <Text className={cn(AppStyles.textRegularSmall, 'text-mediumGray')}>
          {t('label.quantity')}
        </Text>
        <Text className='text-darkGray'>{item.qty}</Text>
      </View>

      <View className='mb-2'>
        <Text className={cn(AppStyles.textBoldSmall, 'mb-2 text-mediumGray')}>
          {t('ticket.material_batch')}
        </Text>
        <View className='bg-lightBlueGray p-3 rounded-sm'>
          <View className='flex-row justify-between mb-2'>
            <Text className={cn(AppStyles.textRegularSmall, 'text-mediumGray')}>
              {t('common.batch')}
            </Text>
            <Text className='text-darkGray'>{item.batch_code}</Text>
          </View>
          <View className='flex-row justify-between mb-2'>
            <Text className={cn(AppStyles.textRegularSmall, 'text-mediumGray')}>
              {t('label.expired_date')}
            </Text>
            <Text className='text-darkGray'>
              {convertString(item.expired_date, 'DD MMM YYYY')}
            </Text>
          </View>
          <View className='flex-row justify-between mb-2'>
            <Text className={cn(AppStyles.textRegularSmall, 'text-mediumGray')}>
              {t('label.reason')}
            </Text>
            <Text className='text-darkGray'>{item.reason}</Text>
          </View>
          <View className='flex-row justify-between'>
            <Text className={cn(AppStyles.textRegularSmall, 'text-mediumGray')}>
              {t('order.detail')}
            </Text>
            <Text className='text-darkGray'>{item.child_reason}</Text>
          </View>
        </View>
      </View>
    </View>
  )
}

TicketDetailItem.displayName = 'TicketDetailItem'

export default React.memo(TicketDetailItem)
