import React, { useMemo } from 'react'
import {
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
} from 'react-native'
import { cn } from '@/theme/theme-config'
import { getTestID } from '@/utils/CommonUtils'

interface TabItemProps extends TouchableOpacityProps {
  isActive: boolean
  text: string
  count?: number
  showCount?: boolean
  containerClassName?: string
  textClassName?: string
  indicatorClassName?: string
}

export function TabItem({
  isActive,
  text,
  count = 0,
  showCount = true,
  containerClassName,
  textClassName,
  indicatorClassName,
  testID,
  ...rest
}: Readonly<TabItemProps>) {
  const className = useMemo(
    () => ({
      container: cn(
        'px-4 py-3 items-center justify-center',
        containerClassName
      ),
      text: cn('text-center', textClassName),
      indicator: cn(
        'h-1 bg-main absolute bottom-0 left-0 right-0',
        indicatorClassName
      ),
    }),
    [containerClassName, indicatorClassName, textClassName]
  )

  return (
    <TouchableOpacity
      activeOpacity={0.6}
      className={className.container}
      {...getTestID(testID)}
      {...rest}>
      <Text className={className.text}>
        {text}
        {showCount ? ` (${count})` : ''}
      </Text>
      {isActive && <View className={className.indicator} />}
    </TouchableOpacity>
  )
}
