import React, { memo } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import { Icons } from '@/assets/icons'
import { useLanguage } from '@/i18n/useLanguage'
import { EventReportItem } from '@/models/order/EventReport'
import AppStyles from '@/theme/AppStyles'
import { cn } from '@/theme/theme-config'
import { getTestID } from '@/utils/CommonUtils'
import { SHORT_DATE_FORMAT, SHORT_DATE_TIME_FORMAT } from '@/utils/Constants'
import { convertString } from '@/utils/DateFormatUtils'

interface TicketItemProps {
  item: EventReportItem
  onPress: () => void
}

export const TicketItem = memo(function TicketItem({
  item,
  onPress,
}: TicketItemProps) {
  const { t } = useLanguage()

  const labelText = `${item.status} at `
  const title = `LK-${item.id}`
  const arrivedDate = convertString(item.arrived_date ?? '', SHORT_DATE_FORMAT)
  const createdDate = convertString(
    item.created_at ?? '',
    SHORT_DATE_TIME_FORMAT
  )
  const doNumber = item.packing_slip_no ?? item.do_number

  const renderDONumber = () => {
    if (!item.do_number && !item.order_id) return null

    const isDoNumber = Boolean(item.do_number)
    const label = isDoNumber ? t('ticket.do_number') : t('ticket.order_number')
    const value = isDoNumber ? (doNumber ?? '-') : (item.order_id ?? '-')

    return (
      <Text className={cn(AppStyles.textMediumSmall, 'text-mediumGray')}>
        {label}: {value}
      </Text>
    )
  }

  return (
    <TouchableOpacity
      className='flex-row justify-between px-4 py-3 bg-white border-b border-b-whiteTwo'
      onPress={onPress}
      activeOpacity={0.7}
      {...getTestID(`ticket-item-${item.id}`)}>
      <View className='flex-1 gap-y-1 '>
        <Text
          className={cn(
            AppStyles.textMedium,
            'text-midnightBlue font-semibold'
          )}>
          {title}
        </Text>
        <Text className={AppStyles.textBold}>{item.name}</Text>

        {renderDONumber()}

        <Text className={AppStyles.textMediumSmall}>
          {t('ticket.arrival_date')}: {arrivedDate ?? '-'}
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
            {createdDate}
          </Text>
        </View>
      </View>
      <View className='items-end justify-between mt-1.5'>
        <Icons.IcChevronRightActive />
      </View>
    </TouchableOpacity>
  )
})
