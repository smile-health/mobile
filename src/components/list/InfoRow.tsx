import React from 'react'
import { View, Text } from 'react-native'
import AppStyles from '@/theme/AppStyles'
import { cn } from '@/theme/theme-config'

interface InfoRowProps {
  label: string
  value: string | number | null
  className?: string
  labelClassName?: string
  valueClassName?: string
}

export function InfoRow(props: Readonly<InfoRowProps>) {
  const { label, value, className, labelClassName, valueClassName } = props
  return (
    <View className={cn(AppStyles.rowCenterAlign, className)}>
      <Text className={cn(AppStyles.labelRegular, 'flex-1', labelClassName)}>
        {label}
      </Text>
      <Text className={cn(AppStyles.textMediumSmall, valueClassName)}>
        {value}
      </Text>
    </View>
  )
}
