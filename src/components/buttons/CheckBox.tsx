import React, { useMemo } from 'react'

import { Icons } from '@/assets/icons'
import colors from '@/theme/colors'
import { cn } from '@/theme/theme-config'
import { getTestID } from '@/utils/CommonUtils'
import { Button, ButtonProps } from './Button'

interface CheckBoxProps extends Omit<ButtonProps, 'LeftIcon'> {
  checked: boolean
}

export function CheckBox({
  checked,
  containerClassName,
  testID,
  ...rest
}: Readonly<CheckBoxProps>) {
  const checkboxIcon = useMemo(
    () => (checked ? Icons.IcChecked : Icons.IcCheckBox),
    [checked]
  )
  const container = cn('items-start justify-start gap-x-2', containerClassName)
  return (
    <Button
      LeftIcon={checkboxIcon}
      leftIconColor={colors.dodgerBlue}
      containerClassName={container}
      {...getTestID(testID)}
      {...rest}
    />
  )
}
