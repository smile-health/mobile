import React from 'react'
import { View, Text, ViewProps } from 'react-native'
import AppStyles from '@/theme/AppStyles'
import { cn } from '@/theme/theme-config'

export interface FieldValueProps extends ViewProps {
  label: string
  value?: string | number | null
  defaultValue?: string | number
  containerClassName?: string
  labelClassName?: string
  valueClassName?: string
}

export function FieldValue(props: Readonly<FieldValueProps>) {
  const {
    label,
    value,
    defaultValue = '-',
    containerClassName,
    labelClassName,
    valueClassName,
    ...rest
  } = props

  const className = {
    container: cn(containerClassName),
    label: cn(AppStyles.textRegular, 'text-warmGrey mb-0.5', labelClassName),
    value: cn(AppStyles.textMedium, valueClassName),
  }

  return (
    <View className={className.container} {...rest}>
      <Text className={className.label}>{label}</Text>
      <Text className={className.value}>{value ?? defaultValue}</Text>
    </View>
  )
}
