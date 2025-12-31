import React from 'react'
import { Text, View } from 'react-native'
import AppStyles from '@/theme/AppStyles'
import { cn } from '@/theme/theme-config'
import { numberFormat } from '@/utils/CommonUtils'

interface MinMaxBoxProps {
  label: string
  value: number
  icon: React.ReactNode
  containerClassName?: string
}

export const MinMaxBox: React.FC<MinMaxBoxProps> = ({
  label,
  value,
  icon,
  containerClassName,
}) => {
  return (
    <View
      className={cn(
        containerClassName,
        'flex-1 border border-lightGreyMinimal p-2 rounded-sm'
      )}>
      <View className={AppStyles.rowBetween}>
        <Text
          className={cn(
            AppStyles.textRegularSmall,
            'text-xss text-mediumGray'
          )}>
          {label}
        </Text>
        {icon}
      </View>
      <Text className={AppStyles.textBold}>{numberFormat(value)}</Text>
    </View>
  )
}
