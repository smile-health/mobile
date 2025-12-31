import React from 'react'
import { View, Text } from 'react-native'
import { Control, FieldValues, useController } from 'react-hook-form'
import Dropdown from '@/components/dropdown/Dropdown'
import { InputNumber } from '@/components/forms'
import { useLanguage } from '@/i18n/useLanguage'
import { ReasonChild } from '@/models/order/Reason'
import { BaseFormFields } from '@/screens/order/types/form'
import { getTestID } from '@/utils/CommonUtils'

// Komponen terpisah untuk menangani input quantity
// Ini memastikan bahwa useController dipanggil dengan benar
interface QuantityFieldProps<T extends FieldValues> {
  readonly control: Control<T>
  readonly name: string
  readonly label?: string
  readonly placeholder?: string
  readonly errors?: string
  readonly isMandatory?: boolean
  readonly testID?: string
}

function QuantityField<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  errors,
  isMandatory,
  testID,
}: QuantityFieldProps<T>) {
  const { field } = useController<any>({
    control,
    name: name as any,
  })

  return (
    <InputNumber
      name={name}
      control={control}
      label={label}
      placeholder={placeholder}
      errors={errors}
      isMandatory={isMandatory}
      value={field.value === undefined ? '' : String(field.value)}
      onChangeText={(text: string) => {
        field.onChange(Number(text))
      }}
      {...(testID && { testID })}
    />
  )
}

interface BaseFormProps<T extends BaseFormFields = BaseFormFields> {
  readonly control: Control<T>
  readonly errors: Record<string, string>
  readonly title?: string
  readonly quantityField?: {
    readonly name: string
    readonly label?: string
    readonly isMandatory?: boolean
    readonly testID?: string
  }
  readonly reasonField?: {
    readonly name: string
    readonly data: ReasonChild[]
    readonly isMandatory?: boolean
    readonly testID?: string
  }
  readonly detailReasonField?: {
    readonly name: string
    readonly data: ReasonChild[]
    readonly isMandatory?: boolean
    readonly testID?: string
  }
}

export const BaseForm = <T extends BaseFormFields = BaseFormFields>({
  control,
  errors,
  title,
  quantityField,
  reasonField,
  detailReasonField,
}: BaseFormProps<T>) => {
  const { t } = useLanguage()

  const getFieldError = (fieldName: string) => {
    return errors[fieldName] ?? ''
  }

  return (
    <View className='mt-2' {...getTestID(quantityField?.testID ?? 'base-form')}>
      {title && (
        <Text className='text-base font-semibold text-primary-dark mb-2'>
          {title}
        </Text>
      )}

      {quantityField && (
        <QuantityField
          control={control}
          name={quantityField.name}
          label={quantityField.label ?? t('label.quantity')}
          placeholder={quantityField.label ?? t('label.quantity')}
          errors={getFieldError(quantityField.name)}
          isMandatory={quantityField.isMandatory}
          testID={quantityField.testID}
        />
      )}

      {reasonField && (
        <Dropdown
          preset='bottom-border'
          data={reasonField.data}
          name={reasonField.name}
          control={control}
          label={t('label.reason')}
          placeholder={t('label.select_reason')}
          isMandatory={reasonField.isMandatory}
          errors={getFieldError(reasonField.name)}
          {...(reasonField.testID && { testID: reasonField.testID })}
        />
      )}

      {detailReasonField && (
        <Dropdown
          preset='bottom-border'
          name={detailReasonField.name}
          control={control}
          data={detailReasonField.data}
          label={t('label.detail_reason')}
          placeholder={t('label.select_detail_reason')}
          errors={getFieldError(detailReasonField.name)}
          isMandatory={detailReasonField.isMandatory}
          {...(detailReasonField.testID && {
            testID: detailReasonField.testID,
          })}
        />
      )}
    </View>
  )
}
