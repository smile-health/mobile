import React, { useMemo } from 'react'
import { View, Text, Pressable } from 'react-native'
import { Control, useController } from 'react-hook-form'
import AppStyles from '@/theme/AppStyles'
import { cn } from '@/theme/theme-config'
import { getTestID } from '@/utils/CommonUtils'

export interface RadioButtonProps<T> {
  label?: string
  items: T[]
  name: string
  control: Control<any>
  labelField: keyof T
  valueField: keyof T
  horizontal?: boolean
  labelClassName?: string
  containerClassName?: string
  radioContainerClassName?: string
  onChange?: (item: T) => void
  errors?: string
  errorTestID?: string
  isMandatory?: boolean
}

export function RadioButtonGroup<T>(props: Readonly<RadioButtonProps<T>>) {
  const {
    label,
    items,
    name,
    control,
    labelField,
    valueField,
    horizontal = false,
    labelClassName,
    containerClassName,
    radioContainerClassName,
    onChange,
    errors,
    errorTestID,
    isMandatory = false,
  } = props

  const { field } = useController({
    control,
    name,
  })

  const className = useMemo(
    () => ({
      label: cn(labelBaseClassName, labelClassName),
      radioContainer: cn(
        radioContainerBaseClassName,
        !!horizontal && horizontalClassName,
        radioContainerClassName
      ),
    }),
    [horizontal, labelClassName, radioContainerClassName]
  )

  const handleOnChange = (item: T) => {
    if (onChange) {
      onChange(item)
    }
    field.onChange(item[valueField])
  }

  return (
    <View className={containerClassName}>
      {!!label && (
        <Text className={className.label}>
          {label}
          {isMandatory && <Text className='text-warmPink'> *</Text>}
        </Text>
      )}
      <View className={className.radioContainer}>
        {items.map((item) => {
          const isChecked = item[valueField] === field.value
          return (
            <Pressable
              key={String(item[valueField])}
              className={itemContainerClassName}
              onPress={() => handleOnChange(item)}>
              <View
                className={cn(
                  circleClassName,
                  !!isChecked && checkedOuterCircleClassName
                )}>
                {!!isChecked && <View className={checkedCircleClassName} />}
              </View>
              <Text className={labelRadioClassName}>
                {String(item[labelField])}
              </Text>
            </Pressable>
          )
        })}
      </View>
      {!!errors && (
        <Text
          className={cn(AppStyles.textRegularSmall, 'text-warmPink')}
          {...getTestID(errorTestID)}>
          {errors}
        </Text>
      )}
    </View>
  )
}

const circleClassName =
  'h-3.5 w-3.5 rounded-[10px] border border-whiteTwo items-center justify-center'

const checkedCircleClassName = 'h-2 w-2 rounded bg-main'

const checkedOuterCircleClassName = 'border-main'

const itemContainerClassName = 'flex-row items-center self-start mt-3'

const horizontalClassName = 'flex-row items-center'

const labelBaseClassName = cn(AppStyles.textRegular, 'mr-2')

const radioContainerBaseClassName = 'gap-x-10'

const labelRadioClassName = cn(AppStyles.textRegular, 'ml-2')
