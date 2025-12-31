import React, { useCallback } from 'react'
import { getNumericValue, numberFormat } from '@/utils/CommonUtils'
import { TextField, TextFieldProps } from './TextField'

export interface InputNumberProps
  extends Omit<TextFieldProps, 'keyboardType'> {}

const DEFAULT_MAX_LENGTH = 11
export function InputNumber(props: Readonly<InputNumberProps>) {
  const { value, onChangeText, ...rest } = props

  const handleChangeText = useCallback(
    (value: string) => {
      const numericValue = getNumericValue(value)
      if (onChangeText) {
        onChangeText(numericValue)
      }
    },
    [onChangeText]
  )

  return (
    <TextField
      keyboardType='number-pad'
      onChangeText={handleChangeText}
      value={value ? numberFormat(Number(value)) : ''}
      returnKeyType='done'
      maxLength={DEFAULT_MAX_LENGTH}
      {...rest}
    />
  )
}
