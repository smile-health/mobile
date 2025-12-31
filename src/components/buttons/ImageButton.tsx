import React, { ComponentType } from 'react'
import { ColorValue } from 'react-native'
import { SvgProps } from 'react-native-svg'
import { BaseButton, BaseButtonProps } from './BaseButton'

export interface ImageButtonProps extends Omit<BaseButtonProps, 'text'> {
  Icon: ComponentType<SvgProps>
  color?: ColorValue
  size?: number
}

export function ImageButton(props: Readonly<ImageButtonProps>) {
  const { Icon, size = 32, color, ...rest } = props
  return (
    <BaseButton {...rest}>
      <Icon height={size} width={size} {...(!!color && { fill: color })} />
    </BaseButton>
  )
}
