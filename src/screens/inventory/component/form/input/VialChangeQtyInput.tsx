import React, { useCallback } from 'react'
import { ParseKeys } from 'i18next'
import { Path, useFormContext } from 'react-hook-form'
import { InputNumber } from '@/components/forms'
import { useLanguage } from '@/i18n/useLanguage'
import {
  BatchType,
  CreateTransactionForm,
  SectionItemFieldName,
} from '@/models/transaction/TransactionCreate'
import { TransactionLabelType } from '@/screens/inventory/constant/transaction.constant'
import { getTestID } from '@/utils/CommonUtils'

interface Props {
  batchType: BatchType
  index: number
  type: TransactionLabelType
}
function VialChangeQtyInput({ batchType, index, type }: Readonly<Props>) {
  const { t } = useLanguage()
  const {
    watch,
    control,
    setValue,
    trigger,
    clearErrors,
    formState: { errors },
  } = useFormContext<CreateTransactionForm>()

  const fieldName: SectionItemFieldName = `${batchType}.${index}`
  const { close_vial_qty, open_vial_qty, max_open_vial_qty } = watch(fieldName)
  const isEnableOpenVial = max_open_vial_qty > 0

  const getErrorMessage = (field: string) => {
    return errors[batchType]?.[index]?.[field]?.message
  }

  const handleChangeStock = useCallback(
    (field: string) => (value: string) => {
      const inputName = `${fieldName}.${field}` as Path<CreateTransactionForm>

      setValue(inputName, Number(value), {
        shouldValidate: value !== '',
      })

      if (value === '') {
        clearErrors(inputName)
      }
      trigger([
        `${fieldName}.transaction_reason_id`,
        `${fieldName}.stock_quality_id`,
        `${fieldName}.open_vial_qty`,
      ])
    },
    [fieldName, trigger, setValue, clearErrors]
  )

  return (
    <React.Fragment>
      <InputNumber
        name={`${fieldName}.open_vial_qty`}
        control={control}
        label={t(`transaction.open_vial_field.${type}` as ParseKeys)}
        placeholder={t(`transaction.open_vial_field.${type}` as ParseKeys)}
        onChangeText={handleChangeStock('open_vial_qty')}
        value={String(open_vial_qty)}
        errors={getErrorMessage('open_vial_qty')}
        editable={isEnableOpenVial}
        {...getTestID(`textfield-${type}-open-vial-qty`)}
      />
      <InputNumber
        name={`${fieldName}.close_vial_qty`}
        control={control}
        label={t(`transaction.close_vial_field.${type}` as ParseKeys)}
        placeholder={t(`transaction.close_vial_field.${type}` as ParseKeys)}
        onChangeText={handleChangeStock('close_vial_qty')}
        value={String(close_vial_qty)}
        errors={getErrorMessage('close_vial_qty')}
        {...getTestID(`textfield-${type}-close-vial-qty`)}
      />
    </React.Fragment>
  )
}

export default React.memo(VialChangeQtyInput)
