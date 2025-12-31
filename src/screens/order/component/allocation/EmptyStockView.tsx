import React, { memo } from 'react'
import { View, Text } from 'react-native'
import { TFunction } from 'i18next'
import AppStyles from '@/theme/AppStyles'
import { cn } from '@/theme/theme-config'

export const EmptyStockView = memo(({ t }: { t: TFunction }) => (
  <View className='bg-white p-2 mt-4 justify-center items-center border border-lightGreyMinimal rounded-xs'>
    <Text className={cn(AppStyles.labelRegular, 'text-mediumGray')}>
      {t('label.empty_stock')}
    </Text>
  </View>
))

EmptyStockView.displayName = 'EmptyStockView'
