import React from 'react'
import { Text, View } from 'react-native'
import { Icons } from '@/assets/icons'
import AppStyles from '@/theme/AppStyles'
import colors from '@/theme/colors'
import { cn } from '@/theme/theme-config'
import { getTestID } from '@/utils/CommonUtils'

interface BannerProps {
  containerClassName?: string
  titleClassName?: string
  testID: string
  title: string
}

export default function Banner(props: Readonly<BannerProps>) {
  const { containerClassName, titleClassName, testID, title } = props
  return (
    <View
      className={cn(
        'flex-row bg-lightestBlue p-2 mb-4 rounded-sm border-bluePrimary border gap-2',
        containerClassName
      )}
      {...getTestID(testID)}>
      <Icons.IcInfo height={16} width={16} fill={colors.marine} />
      <Text className={cn(AppStyles.textRegularSmall, titleClassName)}>
        {title}
      </Text>
    </View>
  )
}
