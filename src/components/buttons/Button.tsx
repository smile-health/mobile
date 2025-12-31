import React, { ComponentType, useMemo } from 'react'
import { ColorValue } from 'react-native'
import { NumberProp, SvgProps } from 'react-native-svg'
import colors from '@/theme/colors'
import {
  BaseButton,
  BaseButtonAccessoryProps,
  BaseButtonProps,
} from './BaseButton'

export interface ButtonProps
  extends Omit<BaseButtonProps, 'LeftAccessory' | 'RightAccessory'> {
  LeftIcon?: ComponentType<SvgProps>
  RightIcon?: ComponentType<SvgProps>
  leftIconColor?: ColorValue
  rightIconColor?: ColorValue
  leftIconDisabledColor?: ColorValue
  rightIconDisabledColor?: ColorValue
  leftIconSize?: NumberProp
  rightIconSize?: NumberProp
}

export function Button(props: Readonly<ButtonProps>) {
  const {
    LeftIcon,
    RightIcon,
    leftIconColor,
    rightIconColor,
    leftIconDisabledColor = colors.warmGrey,
    rightIconDisabledColor = colors.warmGrey,
    leftIconSize = 16,
    rightIconSize = 16,
    preset,
    ...rest
  } = props

  const leftAccessory = useMemo(() => {
    if (!LeftIcon) return
    return function LeftButtonIcon({ disabled }: BaseButtonAccessoryProps) {
      const mainColor =
        preset === 'filled' && !leftIconColor
          ? colors.mainText()
          : leftIconColor
      const iconColor = disabled ? leftIconDisabledColor : mainColor
      return (
        <LeftIcon
          height={leftIconSize}
          width={leftIconSize}
          {...(!!leftIconColor && {
            fill: iconColor,
            color: iconColor,
          })}
        />
      )
    }
  }, [LeftIcon, leftIconColor, leftIconDisabledColor, leftIconSize, preset])

  const rightAccessory = useMemo(() => {
    if (!RightIcon) return
    return function RightButtonIcon({ disabled }: BaseButtonAccessoryProps) {
      const mainColor =
        preset === 'filled' && !rightIconColor
          ? colors.mainText()
          : rightIconColor
      const iconColor = disabled ? rightIconDisabledColor : mainColor
      return (
        <RightIcon
          height={rightIconSize}
          width={rightIconSize}
          {...(!!rightIconColor && {
            fill: iconColor,
            color: iconColor,
          })}
        />
      )
    }
  }, [RightIcon, preset, rightIconColor, rightIconDisabledColor, rightIconSize])

  return (
    <BaseButton
      preset={preset}
      LeftAccessory={leftAccessory}
      RightAccessory={rightAccessory}
      {...rest}
    />
  )
}
