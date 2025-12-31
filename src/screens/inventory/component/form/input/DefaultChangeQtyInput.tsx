import React, { useCallback, useMemo } from 'react'
import { ParseKeys } from 'i18next'
import { Path, useFormContext } from 'react-hook-form'
import { InputNumber } from '@/components/forms'
import { useLanguage } from '@/i18n/useLanguage'
import {
  BatchType,
  CreateTransactionForm,
  SectionItemFieldName,
} from '@/models/transaction/TransactionCreate'
import {
  TRANSACTION_LABEL_KEYS,
  TransactionLabelType,
} from '@/screens/inventory/constant/transaction.constant'
import { getTestID, numberFormat } from '@/utils/CommonUtils'

interface Props {
  batchType: BatchType
  index: number
  type: TransactionLabelType
}
function DefaultChangeQtyInput({ batchType, index, type }: Readonly<Props>) {
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
  const qtyFieldName: Path<CreateTransactionForm> = `${fieldName}.change_qty`
  const { change_qty, qty } = watch(fieldName)

  const isAddStock = type === TRANSACTION_LABEL_KEYS.ADD_STOCK

  const qtyHelperMessage = useMemo(() => {
    if (change_qty === 0) return ''
    const finalQty = isAddStock ? qty + change_qty : qty - change_qty

    return t('transaction.helpers.stock_amount', {
      qty: numberFormat(finalQty),
    })
  }, [change_qty, isAddStock, qty, t])

  const getErrorMessage = (field: string) => {
    return errors[batchType]?.[index]?.[field]?.message
  }

  const handleChangeStock = useCallback(
    (value: string) => {
      setValue(qtyFieldName, Number(value), {
        shouldValidate: value !== '',
      })

      if (value === '') {
        clearErrors(qtyFieldName)
      }
      trigger([
        `${fieldName}.transaction_reason_id`,
        `${fieldName}.stock_quality_id`,
        `${fieldName}.year`,
        `${fieldName}.price`,
        `${fieldName}.budget_source_id`,
      ])
    },
    [setValue, qtyFieldName, trigger, fieldName, clearErrors]
  )

  return (
    <InputNumber
      name={qtyFieldName}
      control={control}
      label={t(`transaction.field.${type}` as ParseKeys)}
      placeholder={t(`transaction.field.${type}` as ParseKeys)}
      onChangeText={handleChangeStock}
      value={String(change_qty)}
      helper={qtyHelperMessage}
      errors={getErrorMessage('change_qty')}
      {...getTestID(`textfield-${type}-qty`)}
    />
  )
}

export default React.memo(DefaultChangeQtyInput)
