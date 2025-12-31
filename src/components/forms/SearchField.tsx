import React from 'react'
import { ColorValue, View } from 'react-native'
import { Icons } from '@/assets/icons'
import colors from '@/theme/colors'
import { getTestID } from '@/utils/CommonUtils'
import { TextField, TextFieldProps } from './TextField'

export interface SearchFieldProps extends TextFieldProps {
  iconColor?: ColorValue
  iconSize?: number
  testID: string
  onChangeText?: (text: string) => void
}
export function SearchField(props: Readonly<SearchFieldProps>) {
  const {
    iconColor = colors.marine,
    iconSize = 16,
    testID,
    onChangeText,
    ...rest
  } = props

  const searchIcon = () => {
    return (
      <View className='mr-2'>
        <Icons.IcSearchSolid
          height={iconSize}
          width={iconSize}
          fill={iconColor}
        />
      </View>
    )
  }

  return (
    <TextField
      preset='base'
      returnKeyType='search'
      LeftAccessory={searchIcon}
      onChangeText={onChangeText}
      {...getTestID(testID)}
      {...rest}
    />
  )
}
