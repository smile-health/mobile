import React from 'react'
import { View, Text } from 'react-native'
import AppStyles from '@/theme/AppStyles'
import { cn } from '@/theme/theme-config'

type WarningBoxProps = {
  title: string
  subTitle: string
  icon: React.ReactNode
  containerClassName?: string
  titleClassName?: string
  subTitleClassName?: string
}

const WarningBox: React.FC<WarningBoxProps> = ({
  title,
  subTitle,
  icon,
  containerClassName,
  titleClassName,
  subTitleClassName,
}) => {
  return (
    <View className={cn('bg-white py-2', containerClassName)}>
      <View className='border border-vividOrange bg-softIvory rounded-sm p-2 w-full'>
        <View className={AppStyles.rowCenterAlign}>
          {icon}
          <Text
            className={cn(
              AppStyles.textBoldSmall,
              titleClassName,
              'text-vividOrange ml-1'
            )}>
            {title}
          </Text>
        </View>
        <Text
          className={cn(AppStyles.textRegularSmall, subTitleClassName, 'mt-1')}>
          {subTitle}
        </Text>
      </View>
    </View>
  )
}

export default WarningBox
