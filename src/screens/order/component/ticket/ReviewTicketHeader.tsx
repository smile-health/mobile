import React from 'react'
import { View, Text } from 'react-native'
import { TFunction } from 'i18next'
import Banner from '@/components/banner/Banner'
import { TicketMaterial } from '@/models/order/Ticket'
import { TicketFormData } from '@/services/features'
import AppStyles from '@/theme/AppStyles'
import { cn } from '@/theme/theme-config'

interface ReviewTicketHeaderProps {
  ticketFormData: TicketFormData | undefined
  ticketMaterials: TicketMaterial[]
  t: TFunction
}

const ReviewTicketHeader: React.FC<ReviewTicketHeaderProps> = ({
  ticketFormData,
  ticketMaterials,
  t,
}) => {
  const orderOrDoNumber =
    ticketFormData?.isSubmitted === 1
      ? 'ticket.order_number'
      : 'ticket.do_number'
  return (
    <View>
      <View className='m-4'>
        <Banner
          testID='banner-order-allocate'
          title={t('ticket.review_banner')}
          titleClassName={AppStyles.textRegularMedium}
          containerClassName='m-0'
        />
        <Text className={cn(AppStyles.textBold, 'my-4')}>
          {t('ticket.review_ticket')}
        </Text>
        <View className=' flex-row justify-between'>
          <Text className={cn(AppStyles.textBoldSmall, 'text-mediumGray mb-1')}>
            {t(orderOrDoNumber)}
          </Text>
          <Text className={cn(AppStyles.textBoldSmall)}>
            {ticketFormData?.doNumber}
          </Text>
        </View>
        <View className='mt-1 flex-row justify-between'>
          <Text className={cn(AppStyles.textRegularSmall, 'text-mediumGray')}>
            {t('ticket.arrival_date')}
          </Text>
          <Text className={cn(AppStyles.textBoldSmall, 'mb-1')}>
            {ticketFormData?.arrivalDate}
          </Text>
        </View>
      </View>
      <View className='bg-lightBlueGray w-full h-2' />
      <View className={cn(AppStyles.rowBetween, 'mx-4 mt-4 mb-1')}>
        <Text className={AppStyles.textBold}>Item</Text>
        <Text className={cn(AppStyles.textBoldSmall, 'text-mediumGray')}>
          {t('ticket.total_items', {
            totalItems: ticketMaterials.length.toString(),
          })}
        </Text>
      </View>
    </View>
  )
}
export default ReviewTicketHeader
