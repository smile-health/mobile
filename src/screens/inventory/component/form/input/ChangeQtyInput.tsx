import React from 'react'
import { useFormContext } from 'react-hook-form'
import {
  BatchType,
  CreateTransactionForm,
  SectionItemFieldName,
} from '@/models/transaction/TransactionCreate'
import { TransactionLabelType } from '@/screens/inventory/constant/transaction.constant'
import DefaultChangeQtyInput from './DefaultChangeQtyInput'
import VialChangeQtyInput from './VialChangeQtyInput'

interface ChangeQtyInputProps {
  batchType: BatchType
  index: number
  type: TransactionLabelType
}
function ChangeQtyInput(props: Readonly<ChangeQtyInputProps>) {
  const { batchType, index } = props

  const { watch } = useFormContext<CreateTransactionForm>()

  const fieldName: SectionItemFieldName = `${batchType}.${index}`
  const { is_open_vial } = watch(fieldName)

  if (is_open_vial) {
    return <VialChangeQtyInput {...props} />
  }

  return <DefaultChangeQtyInput {...props} />
}

export default React.memo(ChangeQtyInput)
