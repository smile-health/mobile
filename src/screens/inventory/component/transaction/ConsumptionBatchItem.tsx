import React, { useCallback } from 'react'
import { useNavigation } from '@react-navigation/native'
import { Path, useFormContext } from 'react-hook-form'
import {
  BatchType,
  CreateTransactionForm,
} from '@/models/transaction/TransactionCreate'
import { trxState, useAppSelector } from '@/services/store'
import BaseTransactionBatchItem from './BaseTransactionBatchItem'
import PatientInfo from './PatientInfo/PatientInfo'
import { TRANSACTION_LABEL_KEYS } from '../../constant/transaction.constant'
import { extractPatientIds } from '../../helpers/ConsumptionHelpers'
import { getValidTransaction } from '../../helpers/TransactionHelpers'
import ChangeQtyInput from '../form/input/ChangeQtyInput'
import StockQualityDropdown from '../form/input/StockQualityDropdown'

interface ConsumptionBatchItemProps {
  onToggleDetail: () => void
  isSelected: boolean
  index: number
  batchType: BatchType
  isPatientNeeded: boolean
  testID: string
}

function ConsumptionBatchItem(
  props: Readonly<Readonly<ConsumptionBatchItemProps>>
) {
  const { batchType, index, isPatientNeeded, ...itemProps } = props
  const navigation = useNavigation()
  const { activity, transactions } = useAppSelector(trxState)
  const { watch } = useFormContext<CreateTransactionForm>()
  const consumptionItemFieldName: Path<CreateTransactionForm> = `${batchType}.${index}`

  const form = watch()
  const formItem = watch(consumptionItemFieldName)
  const activityName = formItem.activity?.name ?? activity.name

  const handleAddPatient = useCallback(() => {
    const otherMaterialTrx = transactions.filter(
      (t) => t.material_id !== formItem.material_id
    )
    const activeMaterialTrx = getValidTransaction([
      ...form.activeBatch,
      ...form.expiredBatch,
    ]).filter((t) => t.stock_id !== formItem.stock_id)

    const patientIds = extractPatientIds([
      ...otherMaterialTrx,
      ...activeMaterialTrx,
    ])

    navigation.navigate('AddPatientInfo', {
      path: consumptionItemFieldName,
      data: formItem,
      patientIds,
    })
  }, [
    consumptionItemFieldName,
    form.activeBatch,
    form.expiredBatch,
    formItem,
    navigation,
    transactions,
  ])

  return (
    <BaseTransactionBatchItem
      stock={formItem}
      activityName={activityName}
      disableCollapse={isPatientNeeded}
      {...itemProps}>
      {!isPatientNeeded && (
        <ChangeQtyInput
          type={TRANSACTION_LABEL_KEYS.CONSUMPTION}
          batchType={batchType}
          index={index}
        />
      )}
      {formItem.is_temperature_sensitive && (
        <StockQualityDropdown
          type={TRANSACTION_LABEL_KEYS.CONSUMPTION}
          batchType={batchType}
          index={index}
        />
      )}
      <PatientInfo
        fieldName={consumptionItemFieldName}
        onAddPatientInfo={handleAddPatient}
      />
    </BaseTransactionBatchItem>
  )
}

export default React.memo(ConsumptionBatchItem)
