import React from 'react'
import { View, Text } from 'react-native'
import { IntegrationType } from '@/models/order/OrderDetail'
import AppStyles from '@/theme/AppStyles'
import { cn } from '@/theme/theme-config'

type Props = {
  containerClassName?: string
  type: IntegrationType
}

const BadgeIntegrationOrder = ({ containerClassName, type }: Props) => {
  return (
    <View
      className={cn(
        'justify-center items-center bg-purple02 border border-purple07 px-2 rounded-xl',
        containerClassName
      )}>
      <Text className={cn(AppStyles.labelRegular, 'text-purple07 uppercase')}>
        {type}
      </Text>
    </View>
  )
}

export default BadgeIntegrationOrder
