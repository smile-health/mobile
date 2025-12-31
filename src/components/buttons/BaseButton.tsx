import React, { ComponentType, useMemo } from 'react'
import {
  ActivityIndicator,
  ColorValue,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
} from 'react-native'
import AppStyles from '@/theme/AppStyles'
import colors from '@/theme/colors'
import { cn } from '@/theme/theme-config'
import { getTestID } from '@/utils/CommonUtils'

export interface BaseButtonAccessoryProps {
  accessoryClassName?: string
  disabled?: boolean
}
export interface BaseButtonProps extends TouchableOpacityProps {
  preset?: keyof typeof buttonPresets
  text?: string
  disabled?: boolean
  isLoading?: boolean
  loadingColor?: ColorValue
  containerClassName?: string
  textClassName?: string
  disabledContainerClassName?: string
  disabledTextClassName?: string
  RightAccessory?: ComponentType<BaseButtonAccessoryProps>
  LeftAccessory?: ComponentType<BaseButtonAccessoryProps>
  children?: React.ReactNode
}

export function BaseButton(props: Readonly<BaseButtonProps>) {
  const {
    text,
    preset = 'default',
    disabled,
    isLoading,
    loadingColor = colors.warmGrey,
    containerClassName,
    textClassName,
    disabledContainerClassName,
    disabledTextClassName,
    RightAccessory,
    LeftAccessory,
    children,
    testID,
    ...rest
  } = props

  const content = text ?? children

  const className = useMemo(
    () => ({
      container: cn(
        buttonPresets[preset].container,
        containerClassName,
        !!disabled && disabledClassName[preset].container,
        !!disabled && !!disabledContainerClassName && disabledContainerClassName
      ),
      text: cn(
        buttonPresets[preset].text,
        textClassName,
        !!disabled && disabledClassName[preset].text,
        !!disabled && !!disabledTextClassName && disabledTextClassName
      ),
    }),
    [
      preset,
      containerClassName,
      textClassName,
      disabledContainerClassName,
      disabledTextClassName,
      disabled,
    ]
  )
  return (
    <TouchableOpacity
      className={className.container}
      activeOpacity={0.8}
      disabled={disabled || isLoading}
      {...getTestID(testID)}
      {...rest}>
      {isLoading ? (
        <ActivityIndicator size='small' color={loadingColor} />
      ) : (
        <>
          {!!LeftAccessory && (
            <LeftAccessory
              accessoryClassName={leftAccessoryClassName}
              disabled={disabled}
            />
          )}
          {typeof content === 'string' ? (
            <Text className={className.text}>{content}</Text>
          ) : (
            <View className={className.text}>{content}</View>
          )}
          {!!RightAccessory && (
            <RightAccessory
              accessoryClassName={rightAccessoryClassName}
              disabled={disabled}
            />
          )}
        </>
      )}
    </TouchableOpacity>
  )
}

const baseContainerClassName = cn(AppStyles.rowCenter, 'rounded  px-5 py-3.5')

const disabledClassName = {
  default: {
    container: '',
    text: 'text-warmGrey',
  },
  outlined: {
    container: 'border border-whiteTwo bg-whiteThree',
    text: 'text-warmGrey',
  },
  'outlined-primary': {
    container: 'border border-whiteTwo bg-whiteThree',
    text: 'text-warmGrey',
  },
  filled: {
    container: 'bg-lightSkyBlue rounded',
    text: 'text-white',
  },
}

const leftAccessoryClassName = 'mr-1'
const rightAccessoryClassName = 'ml-1'

const buttonPresets = {
  default: {
    container: cn(baseContainerClassName, 'p-0 rounded-none'),
    text: cn(AppStyles.textMedium, 'mt-[-2px]'),
  },
  outlined: {
    container: cn(baseContainerClassName, 'border border-warmGrey bg-white'),
    text: cn(AppStyles.textMedium, 'mt-[-2px]'),
  },
  'outlined-primary': {
    container: cn(baseContainerClassName, 'border border-main bg-white'),
    text: cn(AppStyles.textMedium, 'mt-[-2px] text-main'),
  },
  filled: {
    container: cn(baseContainerClassName, 'bg-main'),
    text: cn(AppStyles.textMedium, 'mt-[-2px] text-mainText'),
  },
}
