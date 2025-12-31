import React, { memo } from 'react'
import { Text, View } from 'react-native'
import { ParseKeys } from 'i18next'
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated'
import { useLanguage } from '@/i18n/useLanguage'
import AppStyles from '@/theme/AppStyles'
import { cn } from '@/theme/theme-config'
import { getTestID } from '@/utils/CommonUtils'
import CircularLoadingIndicator from './CircularLoadingIndicator'
import Portal from './portals/Portal'

interface LoadingDialogProps {
  modalVisible: boolean
  testID: string
  title?: ParseKeys
  message?: string
  backdropClassName?: string
  containerClassName?: string
  titleClassName?: string
  messageClassName?: string
}

const LoadingDialog = (props: LoadingDialogProps) => {
  const {
    modalVisible,
    testID,
    title = 'please_wait',
    message,
    backdropClassName,
    containerClassName,
    titleClassName,
    messageClassName,
  } = props

  const className = {
    backdrop: cn(
      'absolute top-0 right-0 bottom-0 left-0 bg-blackTransparent',
      backdropClassName
    ),
    container: cn(
      'flex-col items-center bg-white rounded-lg py-4 px-9',
      containerClassName
    ),
    title: cn('mt-3', AppStyles.textMediumMedium, titleClassName),
    message: cn('mt-1', AppStyles.textMediumMedium, messageClassName),
  }

  const { t } = useLanguage()

  return modalVisible ? (
    <Portal name={testID}>
      <Animated.View
        className={className.backdrop}
        entering={FadeIn.duration(100)}
        exiting={FadeOut.duration(100)}>
        <View className='flex-1 items-center justify-center'>
          <View className={className.container} {...getTestID(testID)}>
            <CircularLoadingIndicator />
            <Text className={className.title}>{t(title)}</Text>
            {message && <Text className={className.message}>{message}</Text>}
          </View>
        </View>
      </Animated.View>
    </Portal>
  ) : null
}

export default memo(LoadingDialog)
