import React from 'react'
import { View, Text } from 'react-native'
import { Icons } from '@/assets/icons'
import Separator from '@/components/separator/Separator'
import { useLanguage } from '@/i18n/useLanguage'
import AppStyles from '@/theme/AppStyles'
import { cn } from '@/theme/theme-config'

interface StockRangeProps {
  min?: string
  max?: string
  containerClassName?: string
}

const StockRange = ({ min, max, containerClassName }: StockRangeProps) => {
  const { t } = useLanguage()

  return (
    <View className={cn(AppStyles.rowCenterAlign, containerClassName)}>
      <View className={cn(AppStyles.rowCenterAlign, 'mr-2')}>
        <Icons.IcMin />
        <Text
          className={cn(AppStyles.textRegularSmall, 'text-mediumGray ml-1')}>
          {t('label.min')}:{' '}
          <Text className={cn(AppStyles.textRegularSmall, 'text-midnightBlue')}>
            {min}
          </Text>
        </Text>
      </View>
      <Separator />
      <View className={cn(AppStyles.rowCenterAlign, 'ml-2')}>
        <Icons.IcMax />
        <Text
          className={cn(AppStyles.textRegularSmall, 'text-mediumGray ml-1')}>
          {t('label.max')}:{' '}
          <Text className={cn(AppStyles.textRegularSmall, 'text-midnightBlue')}>
            {max}
          </Text>
        </Text>
      </View>
    </View>
  )
}

export default StockRange
