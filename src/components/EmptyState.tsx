import React, { ComponentType } from 'react'
import { View, Text } from 'react-native'
import { SvgProps } from 'react-native-svg'
import AppStyles from '@/theme/AppStyles'
import { cn } from '@/theme/theme-config'
import { getTestID } from '@/utils/CommonUtils'

interface EmptyStateProps {
  Icon: ComponentType<SvgProps>
  title: string
  subtitle: string
  testID: string
}

export default function EmptyState(props: Readonly<EmptyStateProps>) {
  const { Icon, title, subtitle, testID } = props

  return (
    <View
      className='flex-1 justify-center items-center px-16'
      {...getTestID(testID)}>
      <View className='justify-center items-center mb-6'>
        <Icon />
        <Text className={cn(AppStyles.textBold, 'mt-4 text-center')}>
          {title}
        </Text>
        <Text className={cn(AppStyles.labelRegular, 'mt-1 text-center')}>
          {subtitle}
        </Text>
      </View>
    </View>
  )
}
