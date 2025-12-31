import React, { useMemo } from 'react'
import { View, StatusBar, ViewProps } from 'react-native'
import { vars } from 'nativewind'
import { settingState, useAppSelector } from '@/services/store'
import colors from '@/theme/colors'

export function Theme({ children }: ViewProps) {
  const { appTheme, programColor, programTextColor } =
    useAppSelector(settingState)

  const theme = useMemo(() => {
    return vars({
      '--color-app': appTheme.color,
      '--color-main': programColor ?? colors.deepBlue,
      '--color-mainText': programTextColor ?? colors.white,
    })
  }, [appTheme.color, programColor, programTextColor])

  return (
    <View style={theme} className='flex-1'>
      <StatusBar
        barStyle={appTheme.barStyle}
        backgroundColor={appTheme.color}
      />
      <View className='flex-1'>{children}</View>
    </View>
  )
}
