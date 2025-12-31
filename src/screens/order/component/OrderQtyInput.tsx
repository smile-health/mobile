import React from 'react'
import { TFunction } from 'i18next'
import { useWatch, UseFormReturn, FieldErrors } from 'react-hook-form'
import { InputNumber } from '@/components/forms'
import { getTestID } from '@/utils/CommonUtils'

interface Props {
  stockId: number
  methods: UseFormReturn<any>
  errors: FieldErrors
  t: TFunction
  maxQty?: number
}

const OrderQtyInput = ({ stockId, methods, errors, t, maxQty }: Props) => {
  const fieldName = `quantityByStock.${stockId}.quantity` as const
  const qty = useWatch({ control: methods.control, name: fieldName }) || ''
  const error = errors?.quantityByStock?.[stockId]?.message
  const maxErr = +qty > (maxQty ?? 0) ? t('transaction.validation.max_qty') : ''

  React.useEffect(() => {
    const currentValue = methods.getValues(fieldName)
    if (currentValue === undefined) {
      methods.setValue(fieldName, '', { shouldValidate: true })
    }
  }, [methods, fieldName])

  return (
    <InputNumber
      isMandatory
      name={fieldName}
      control={methods.control}
      value={qty}
      label={t('label.order_count')}
      placeholder={t('label.order_count')}
      errors={error || maxErr}
      onChangeText={(value) => {
        const numericValue = value ? Number(value) : ''
        methods.setValue(fieldName, numericValue, {
          shouldValidate: true,
          shouldDirty: true,
          shouldTouch: true,
        })
        if (!value) {
          methods.setValue(fieldName, '', { shouldValidate: true })
          methods.clearErrors(fieldName)
        }
      }}
      containerClassName='flex-none'
      {...getTestID(`textfield-order-count-${stockId}`)}
    />
  )
}

export default OrderQtyInput
