import React from 'react'
import { Path, useFormContext } from 'react-hook-form'
import {
  BatchType,
  CreateTransactionForm,
} from '@/models/transaction/TransactionCreate'
import { trxState, useAppSelector } from '@/services/store'
import { TRANSACTION_TYPE } from '@/utils/Constants'
import BaseTransactionBatchItem from './BaseTransactionBatchItem'
import { TRANSACTION_LABEL_KEYS } from '../../constant/transaction.constant'
import ChangeQtyInput from '../form/input/ChangeQtyInput'
import StockQualityDropdown from '../form/input/StockQualityDropdown'
import TransactionReasonDropdown from '../form/input/TransactionReasonDropdown'

interface DiscardBatchItemProps {
  onToggleDetail: () => void
  isSelected: boolean
  index: number
  batchType: BatchType
  testID: string
}

function DiscardBatchItem(props: Readonly<DiscardBatchItemProps>) {
  const { batchType, index, ...itemProps } = props
  const { activity } = useAppSelector(trxState)
  const { watch } = useFormContext<CreateTransactionForm>()
  const discardItemFieldName: Path<CreateTransactionForm> = `${batchType}.${index}`

  const formItem = watch(discardItemFieldName)
  const activityName = formItem.activity?.name || activity.name

  return (
    <BaseTransactionBatchItem
      stock={formItem}
      activityName={activityName}
      {...itemProps}>
      <ChangeQtyInput
        type={TRANSACTION_LABEL_KEYS.DISCARDS}
        batchType={batchType}
        index={index}
      />
      {formItem.is_temperature_sensitive && (
        <StockQualityDropdown
          type={TRANSACTION_LABEL_KEYS.DISCARDS}
          batchType={batchType}
          index={index}
        />
      )}
      <TransactionReasonDropdown
        transactionTypeId={TRANSACTION_TYPE.DISCARDS}
        type={TRANSACTION_LABEL_KEYS.REDUCE_STOCK}
        batchType={batchType}
        index={index}
      />
    </BaseTransactionBatchItem>
  )
}

export default React.memo(DiscardBatchItem)
