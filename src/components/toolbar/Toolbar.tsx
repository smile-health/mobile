import React from 'react'
import { View, Text, ColorValue, StatusBar } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Icons } from '@/assets/icons'
import { authState, settingState, useAppSelector } from '@/services/store'
import AppStyles from '@/theme/AppStyles'
import colors from '@/theme/colors'
import { cn } from '@/theme/theme-config'
import { getTestID } from '@/utils/CommonUtils'
import { ImageButton } from '../buttons'

export interface ToolbarProps {
  title?: string
  subtitle?: string
  backgroundClassName?: string
  titleClassName?: string
  subtitleClassName?: string
  titleContainerClassName?: string
  showBackButton?: boolean
  statusBarColor?: ColorValue
  actions?: React.ReactNode
  withDefaultSubtitle?: boolean
  backIconColor?: string
}

export function Toolbar(props: Readonly<ToolbarProps>) {
  const { user } = useAppSelector(authState)
  const {
    title,
    withDefaultSubtitle = false,
    subtitle: customSubtitle,
    backgroundClassName,
    titleClassName,
    subtitleClassName,
    titleContainerClassName,
    statusBarColor,
    showBackButton = true,
    actions,
    backIconColor,
  } = props
  const navigation = useNavigation()
  const { programColor } = useAppSelector(settingState)

  const subtitle = withDefaultSubtitle ? user?.entity.name : customSubtitle

  const className = {
    container: cn(
      AppStyles.rowCenter,
      'justify-start px-4',
      subtitle ? 'py-1.5' : 'py-3.5'
    ),
    title: cn(
      subtitle ? AppStyles.textMediumLarge : AppStyles.textBoldLarge,
      'text-mainText',
      titleClassName
    ),
    subtitle: cn(
      AppStyles.textRegularSmall,
      'text-mainText',
      subtitleClassName
    ),
    titleContainer: cn('flex-1 flex-col', titleContainerClassName),
  }

  return (
    <SafeAreaView
      edges={['top']}
      className={cn('bg-main', backgroundClassName)}>
      <StatusBar
        barStyle='light-content'
        backgroundColor={statusBarColor ?? programColor ?? colors.deepBlue}
      />
      <View className={className.container}>
        {showBackButton && (
          <ImageButton
            size={24}
            Icon={Icons.IcBack}
            color={backIconColor ?? colors.mainText()}
            onPress={navigation.goBack}
            className='mr-4'
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            {...getTestID('toolbar-back-button')}
          />
        )}
        <View className={className.titleContainer}>
          <Text className={className.title} numberOfLines={1}>
            {title}
          </Text>
          {!!subtitle && <Text className={className.subtitle}>{subtitle}</Text>}
        </View>
        {actions}
      </View>
    </SafeAreaView>
  )
}
