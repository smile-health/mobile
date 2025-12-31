import React from 'react'
import { Text, View } from 'react-native'
import { TFunction } from 'i18next'
import { Icons } from '@/assets/icons'
import AppStyles from '@/theme/AppStyles'
import { cn } from '@/theme/theme-config'

interface Props {
  t: TFunction
  className?: string
}

export default function StockTakingMandatoryLabel({
  t,
  className,
}: Readonly<Props>) {
  return (
    <View className={cn('flex-row items-center flex-1 gap-x-1', className)}>
      <Icons.IcStar />
      <Text className={cn(AppStyles.textBold, 'text-[10px]')}>
        {t('stock_taking.mandatory')}
      </Text>
    </View>
  )
}
