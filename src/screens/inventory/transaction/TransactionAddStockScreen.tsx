import React, { useEffect } from 'react'
import { View } from 'react-native'
import { FormProvider } from 'react-hook-form'
import { InfoRow } from '@/components/list/InfoRow'
import { useLanguage } from '@/i18n/useLanguage'
import {
  BudgetSourceData,
  SectionItemFieldName,
} from '@/models/transaction/TransactionCreate'
import { AppStackScreenProps } from '@/navigators'
import { getTestID } from '@/utils/CommonUtils'
import { TRANSACTION_TYPE } from '@/utils/Constants'
import SaveTransactionButton from '../component/button/SaveTransactionButton'
import ChangeQtyInput from '../component/form/input/ChangeQtyInput'
import StockQualityDropdown from '../component/form/input/StockQualityDropdown'
import TransactionReasonDropdown from '../component/form/input/TransactionReasonDropdown'
import BudgetSourceInfo from '../component/transaction/BudgetSourceInfo'
import TransactionContainer from '../component/transaction/TransactionContainer'
import {
  BATCH_TYPE,
  TRANSACTION_LABEL_KEYS,
} from '../constant/transaction.constant'
import { updatePartialValues } from '../helpers/TransactionHelpers'
import useAddStockTransactionForm from '../hooks/transactionCreate/useAddStockTransactionForm'

interface Props extends AppStackScreenProps<'TransactionAddStock'> {}
function TransactionAddStockScreen({ route }: Props) {
  const { stock: stockMaterial, formUpdate } = route.params
  const { t } = useLanguage()

  const { methods, handleSubmit } = useAddStockTransactionForm(stockMaterial)
  const addStockFieldName: SectionItemFieldName = `${BATCH_TYPE.ACTIVE}.0`

  const {
    change_qty,
    budget_source,
    budget_source_id,
    year,
    price,
    unit,
    ...formAdd
  } = methods.watch(addStockFieldName)

  const budgetInfo: BudgetSourceData = {
    change_qty,
    unit,
    budget_source_id,
    budget_source,
    year,
    price,
  }

  useEffect(() => {
    if (formUpdate) {
      updatePartialValues(
        addStockFieldName,
        methods.setValue,
        formUpdate.values
      )
    }
  }, [addStockFieldName, formUpdate, methods.setValue])

  return (
    <FormProvider {...methods}>
      <TransactionContainer type={TRANSACTION_LABEL_KEYS.ADD_STOCK}>
        <View className='bg-white flex-1 p-4'>
          <View
            className='border border-quillGrey rounded p-3'
            {...getTestID('add-stock-form')}>
            <InfoRow
              label={t('label.allocated_stock')}
              value={formAdd.allocated_qty}
            />
            <InfoRow
              label={t('label.available_stock')}
              value={formAdd.available_qty}
            />
            <ChangeQtyInput
              type={TRANSACTION_LABEL_KEYS.ADD_STOCK}
              batchType={BATCH_TYPE.ACTIVE}
              index={0}
            />
            {formAdd.is_temperature_sensitive && (
              <StockQualityDropdown
                type={TRANSACTION_LABEL_KEYS.ADD_STOCK}
                batchType={BATCH_TYPE.ACTIVE}
                index={0}
              />
            )}
            <TransactionReasonDropdown
              transactionTypeId={TRANSACTION_TYPE.ADD_STOCK}
              type={TRANSACTION_LABEL_KEYS.ADD_STOCK}
              batchType={BATCH_TYPE.ACTIVE}
              index={0}
            />
            <BudgetSourceInfo
              transactionReason={formAdd.transaction_reason}
              fieldName={addStockFieldName}
              {...budgetInfo}
            />
          </View>
        </View>
        <View className='flex-row px-4 py-5 border-quillGrey border-t'>
          <SaveTransactionButton onSubmit={handleSubmit} />
        </View>
      </TransactionContainer>
    </FormProvider>
  )
}

export default TransactionAddStockScreen
