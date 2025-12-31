import React, { useCallback } from 'react'
import { useFormContext } from 'react-hook-form'
import Dropdown from '@/components/dropdown/Dropdown'
import { useLanguage } from '@/i18n/useLanguage'
import { IOptions } from '@/models/Common'
import {
  BatchType,
  CreateTransactionForm,
  SectionItemFieldName,
} from '@/models/transaction/TransactionCreate'
import { TransactionLabelType } from '@/screens/inventory/constant/transaction.constant'
import { getTestID } from '@/utils/CommonUtils'
import { materialStatuses } from '@/utils/Constants'

interface StockQualityDropdownProps {
  batchType: BatchType
  index: number
  type: TransactionLabelType
}
function StockQualityDropdown({
  type,
  batchType,
  index,
}: Readonly<StockQualityDropdownProps>) {
  const { t } = useLanguage()

  const {
    control,
    setValue,
    formState: { errors },
  } = useFormContext<CreateTransactionForm>()

  const fieldName: SectionItemFieldName = `${batchType}.${index}`

  const handleChangeStatus = useCallback(
    (value: IOptions) => {
      setValue(`${fieldName}.stock_quality`, value, {
        shouldValidate: true,
      })
    },
    [fieldName, setValue]
  )
  return (
    <Dropdown
      data={materialStatuses}
      preset='bottom-border'
      name={`${fieldName}.stock_quality_id`}
      control={control}
      label={t('label.material_status')}
      placeholder={t('label.material_status')}
      onChangeValue={handleChangeStatus}
      isMandatory
      errors={errors[batchType]?.[0]?.stock_quality_id?.message}
      {...getTestID(`dropdown-stock-quality-${type}`)}
    />
  )
}

export default React.memo(StockQualityDropdown)
