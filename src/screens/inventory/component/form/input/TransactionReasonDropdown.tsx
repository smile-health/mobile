import React, { useCallback, useMemo } from 'react'
import { ParseKeys } from 'i18next'
import { useFormContext } from 'react-hook-form'
import Dropdown from '@/components/dropdown/Dropdown'
import { TextField } from '@/components/forms'
import { useLanguage } from '@/i18n/useLanguage'
import {
  BatchType,
  CreateTransactionForm,
  SectionItemFieldName,
  TrxReasonOption,
} from '@/models/transaction/TransactionCreate'
import { TransactionLabelType } from '@/screens/inventory/constant/transaction.constant'
import { updatePartialValues } from '@/screens/inventory/helpers/TransactionHelpers'
import { getTrxReasons } from '@/services/features'
import { useAppSelector } from '@/services/store'
import { getTestID } from '@/utils/CommonUtils'
import { TRANSACTION_TYPE } from '@/utils/Constants'

interface TrxReasonDropdownProps {
  batchType: BatchType
  index: number
  transactionTypeId: number
  type: TransactionLabelType
}

function TransactionReasonDropdown({
  transactionTypeId,
  batchType,
  index,
  type,
}: Readonly<TrxReasonDropdownProps>) {
  const { t } = useLanguage()
  const isReturnHF = transactionTypeId === TRANSACTION_TYPE.RETURN
  const transactionReasons = useAppSelector((state) =>
    getTrxReasons(
      state,
      isReturnHF ? TRANSACTION_TYPE.DISCARDS : transactionTypeId
    )
  )

  const {
    watch,
    trigger,
    control,
    setValue,
    formState: { errors },
  } = useFormContext<CreateTransactionForm>()

  const fieldName: SectionItemFieldName = `${batchType}.${index}`
  const { transaction_reason } = watch(fieldName)

  const isOther = !!transaction_reason?.is_other

  const label: ParseKeys = useMemo(() => {
    return isReturnHF ? 'label.discard_reason' : 'label.reason'
  }, [isReturnHF])

  const handleChangeReason = useCallback(
    (value: TrxReasonOption) => {
      setValue(`${fieldName}.transaction_reason`, value)
      trigger([
        `${fieldName}.other_reason`,
        `${fieldName}.year`,
        `${fieldName}.price`,
        `${fieldName}.budget_source_id`,
      ])
      updatePartialValues(fieldName, setValue, {
        budget_source_id: null,
        budget_source: null,
        year: null,
        price: null,
      })
    },
    [fieldName, trigger, setValue]
  )

  return (
    <React.Fragment>
      <Dropdown
        data={transactionReasons}
        preset='bottom-border'
        name={`${fieldName}.transaction_reason_id`}
        control={control}
        label={t(label)}
        placeholder={t(label)}
        isMandatory
        onChangeValue={handleChangeReason}
        errors={errors[batchType]?.[index]?.transaction_reason_id?.message}
        {...getTestID(`dropdown-transaction-reason-${type}`)}
      />
      {isOther && (
        <TextField
          name={`${fieldName}.other_reason`}
          control={control}
          label={t('label.other_reason')}
          placeholder={t('label.other_reason')}
          isMandatory
          errors={errors[batchType]?.[index]?.other_reason?.message}
          {...getTestID(`textfield-other-reason-${type}`)}
        />
      )}
    </React.Fragment>
  )
}

export default React.memo(TransactionReasonDropdown)
