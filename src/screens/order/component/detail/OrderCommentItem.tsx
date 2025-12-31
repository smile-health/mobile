import React from 'react'
import { Text, View } from 'react-native'
import { useLanguage } from '@/i18n/useLanguage'
import { CommentData } from '@/models/order/OrderDetailSection'
import AppStyles from '@/theme/AppStyles'
import { cn } from '@/theme/theme-config'
import { getTestID } from '@/utils/CommonUtils'
import { orderStatusNames, SHORT_DATE_TIME_FORMAT } from '@/utils/Constants'
import { convertString } from '@/utils/DateFormatUtils'

interface OrderCommentItemProps {
  data: CommentData
}

export function OrderCommentItem({ data }: Readonly<OrderCommentItemProps>) {
  const { t } = useLanguage()
  const { order_status, created_at, user, comment } = data
  const name = [user?.firstname, user?.lastname].join(' ').trim()
  return (
    <View className='px-4 py-2 bg-white '>
      <View
        className={AppStyles.card}
        {...getTestID(`comment-item-${data.id}`)}>
        <View className='flex-row items-start justify-between mb-2 gap-x-2'>
          <View>
            <Text className={cn(AppStyles.textBoldSmall)}>{name}</Text>
            <Text className={cn(AppStyles.textRegularSmall, 'text-mediumGray')}>
              {t('order.status_at_posting')} {t(orderStatusNames[order_status])}
            </Text>
          </View>
          <Text
            className={cn(
              AppStyles.textMediumSmall,
              'text-mediumGray uppercase'
            )}>
            {convertString(created_at, SHORT_DATE_TIME_FORMAT)}
          </Text>
        </View>
        <Text className={cn(AppStyles.textRegular, 'text-midnightBlue')}>
          {typeof comment === 'object' ? JSON.stringify(comment) : comment}
        </Text>
      </View>
    </View>
  )
}
