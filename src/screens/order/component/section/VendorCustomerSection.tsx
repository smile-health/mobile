import React from 'react'
import { View, Text } from 'react-native'
import { TFunction } from 'i18next'
import { Icons } from '@/assets/icons'
import AppStyles from '@/theme/AppStyles'
import { cn } from '@/theme/theme-config'

type VendorCustomerSectionProps = {
  vendor: {
    name: string
    address: string
  }
  customer: {
    name: string
    address: string
  }
  t: TFunction
  containerClassName?: string
}

const VendorCustomerSection = ({
  vendor,
  customer,
  t,
  containerClassName,
}: VendorCustomerSectionProps) => {
  return (
    <View className={cn('flex-row items-start', containerClassName)}>
      <View className='flex-1 gap-y-1'>
        <Text className={AppStyles.textMediumMedium}>{t('label.vendor')}</Text>
        <Text className={AppStyles.textBold}>{vendor?.name}</Text>
        <Text className={cn(AppStyles.textRegularMedium, 'text-mediumGray')}>
          {vendor?.address}
        </Text>
      </View>

      <View className='justify-center px-2'>
        <Icons.IcArrowRight />
      </View>

      <View className='flex-1 gap-y-1'>
        <Text className={cn(AppStyles.textMediumMedium, 'text-right')}>
          {t('label.customer')}
        </Text>
        <Text className={cn(AppStyles.textBold, 'text-right')}>
          {customer?.name}
        </Text>
        <Text
          className={cn(
            AppStyles.textRegularMedium,
            'text-right text-mediumGray'
          )}>
          {customer?.address}
        </Text>
      </View>
    </View>
  )
}

export default VendorCustomerSection
