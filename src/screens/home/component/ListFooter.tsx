import React, { ComponentType } from 'react'
import { Text, View, TouchableOpacity } from 'react-native'
import { SvgProps } from 'react-native-svg'
import { Icons } from '@/assets/icons'
import AppStyles from '@/theme/AppStyles'
import colors from '@/theme/colors'
import { cn } from '@/theme/theme-config'
import { getTestID } from '@/utils/CommonUtils'

interface ListFooterProps {
  onPress?: () => void
  name?: string
  Icon: ComponentType<SvgProps>
  testID: string
}

export default function ListFooter(props: Readonly<ListFooterProps>) {
  const { onPress, name, Icon, testID } = props
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      className={cn(AppStyles.rowBetween, 'px-4 py-3 bg-iceBlueThree')}
      {...getTestID(testID)}>
      <View className={cn(AppStyles.rowCenter)}>
        <Icon height={24} width={24} fill={colors.marine} />
        <Text className={cn(AppStyles.textMedium, 'ml-2')}>{name}</Text>
      </View>
      <Icons.IcChevronRight height={16} width={16} />
    </TouchableOpacity>
  )
}
