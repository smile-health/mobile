import React from 'react'
import { useFormContext } from 'react-hook-form'
import {
  BatchType,
  BudgetSourceData,
  CreateTransactionForm,
  SectionItemFieldName,
} from '@/models/transaction/TransactionCreate'
import { trxState, useAppSelector } from '@/services/store'
import { TRANSACTION_TYPE } from '@/utils/Constants'
import BaseTransactionBatchItem from './BaseTransactionBatchItem'
import BudgetSourceInfo from './BudgetSourceInfo'
import { TRANSACTION_LABEL_KEYS } from '../../constant/transaction.constant'
import ChangeQtyInput from '../form/input/ChangeQtyInput'
import StockQualityDropdown from '../form/input/StockQualityDropdown'
import TransactionReasonDropdown from '../form/input/TransactionReasonDropdown'

interface AddStockBatchItemProps {
  onToggleDetail: () => void
  isSelected: boolean
  index: number
  batchType: BatchType
  testID: string
}

function AddStockBatchItem(props: Readonly<AddStockBatchItemProps>) {
  const { batchType, index, ...itemProps } = props
  const { activity } = useAppSelector(trxState)
  const { watch } = useFormContext<CreateTransactionForm>()
  const addStockItemFieldName: SectionItemFieldName = `${batchType}.${index}`

  const formItem = watch(addStockItemFieldName)
  const activityName = formItem.activity?.name || activity.name

  const budgetInfo: BudgetSourceData = {
    budget_source: formItem.budget_source,
    budget_source_id: formItem.budget_source_id,
    change_qty: formItem.change_qty,
    price: formItem.price,
    unit: formItem.unit,
    year: formItem.year,
  }

  return (
    <BaseTransactionBatchItem
      stock={formItem}
      activityName={activityName}
      {...itemProps}>
      <ChangeQtyInput
        type={TRANSACTION_LABEL_KEYS.ADD_STOCK}
        batchType={batchType}
        index={index}
      />
      {formItem.is_temperature_sensitive && (
        <StockQualityDropdown
          type={TRANSACTION_LABEL_KEYS.ADD_STOCK}
          batchType={batchType}
          index={index}
        />
      )}
      <TransactionReasonDropdown
        transactionTypeId={TRANSACTION_TYPE.ADD_STOCK}
        type={TRANSACTION_LABEL_KEYS.ADD_STOCK}
        batchType={batchType}
        index={index}
      />
      <BudgetSourceInfo
        transactionReason={formItem.transaction_reason}
        fieldName={addStockItemFieldName}
        {...budgetInfo}
      />
    </BaseTransactionBatchItem>
  )
}

export default React.memo(AddStockBatchItem)
