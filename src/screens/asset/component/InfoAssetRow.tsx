import React from 'react'
import { View, Text } from 'react-native'
import AppStyles from '@/theme/AppStyles'
import { cn } from '@/theme/theme-config'

interface Props {
  label: string
  subLabel?: string
  value?: string | number | null
  labelClassName?: string
  valueClassName?: string
}

export function InfoAssetRow(props: Readonly<Props>) {
  const { label, subLabel, value, labelClassName, valueClassName } = props
  return (
    <View className={cn(AppStyles.rowBetween, 'items-start')}>
      <View>
        <Text className={cn(AppStyles.labelRegular, 'w-40', labelClassName)}>
          {label}
        </Text>
        {Boolean(subLabel) && (
          <Text className={cn(AppStyles.labelRegular, 'w-40', labelClassName)}>
            {subLabel}
          </Text>
        )}
      </View>
      <Text
        className={cn(
          AppStyles.textMediumSmall,
          'text-right text-midnightBlue flex-1',
          valueClassName
        )}>
        {value}
      </Text>
    </View>
  )
}
