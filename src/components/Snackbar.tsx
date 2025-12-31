import React, { forwardRef, useImperativeHandle, useState } from 'react'
import { View, Text } from 'react-native'
import Animated, { FadeInUp, FadeOutDown } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import AppStyles from '@/theme/AppStyles'
import { cn } from '@/theme/theme-config'
import { getTestID } from '@/utils/CommonUtils'

type SnackbarType = keyof typeof SnackbarTypeStyle

export type ShowSnackbarPropType = {
  message: string
  type: SnackbarType
  testID?: string
}
export type SnackbarAction = {
  show: ({ message, type }: ShowSnackbarPropType) => void
}

interface Props {
  message?: string
  type?: SnackbarType
  isVisible: boolean
  testID?: string
}

const baseBottomPosition = 8

const snackbarBaseStyle = 'flex absolute right-2 left-2 rounded px-4 py-[14px]'

const SnackbarTypeStyle = {
  success: cn(snackbarBaseStyle, 'bg-greenPrimary'),
  error: cn(snackbarBaseStyle, 'bg-warmPink'),
}

const getSnackbarBottomStyle = (insetsBottom: number) => {
  return { bottom: insetsBottom + baseBottomPosition }
}

export const Snackbar = forwardRef<SnackbarAction>(function Snackbar(_, ref) {
  const [data, setData] = useState<Props>({} as Props)
  const { bottom } = useSafeAreaInsets()

  useImperativeHandle(ref, () => {
    return {
      show({ message, type, testID }) {
        const timeout = type === 'success' ? 2000 : 4000
        setData({ message, type, isVisible: true, testID })

        setTimeout(() => {
          setData({ isVisible: false })
        }, timeout)
      },
    }
  }, [])

  if (!data?.isVisible) {
    return <View />
  }

  return (
    <Animated.View
      entering={FadeInUp}
      exiting={FadeOutDown}
      style={getSnackbarBottomStyle(bottom)}
      className={cn(SnackbarTypeStyle[data.type || 'error'], 'z-[9999]')}>
      <Text
        className={cn(AppStyles.textMediumLarge, 'text-white')}
        {...getTestID(data.testID)}>
        {data.message}
      </Text>
    </Animated.View>
  )
})
