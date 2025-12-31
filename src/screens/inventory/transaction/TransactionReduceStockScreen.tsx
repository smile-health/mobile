import React from 'react'
import { View } from 'react-native'
import { FormProvider } from 'react-hook-form'
import { InfoRow } from '@/components/list/InfoRow'
import { useLanguage } from '@/i18n/useLanguage'
import { AppStackScreenProps } from '@/navigators'
import { getTestID } from '@/utils/CommonUtils'
import { TRANSACTION_TYPE } from '@/utils/Constants'
import NextMaterialButton from '../component/button/NextMaterialButton'
import SaveTransactionButton from '../component/button/SaveTransactionButton'
import ChangeQtyInput from '../component/form/input/ChangeQtyInput'
import StockQualityDropdown from '../component/form/input/StockQualityDropdown'
import TransactionReasonDropdown from '../component/form/input/TransactionReasonDropdown'
import TransactionContainer from '../component/transaction/TransactionContainer'
import {
  BATCH_TYPE,
  TRANSACTION_LABEL_KEYS,
} from '../constant/transaction.constant'
import useReduceStockTransactionForm from '../hooks/transactionCreate/useReduceStockTransactionForm'

interface Props extends AppStackScreenProps<'TransactionReduceStock'> {}
function TransactionReduceStockScreen({ route }: Props) {
  const { stock: stockMaterial } = route.params
  const { t } = useLanguage()

  const {
    methods,
    handleSubmit,
    isDisableNextButton,
    isNextMaterialExist,
    navigateToNextMaterial,
  } = useReduceStockTransactionForm(stockMaterial)

  const formReduce = methods.watch(`${BATCH_TYPE.ACTIVE}.0`)

  return (
    <FormProvider {...methods}>
      <TransactionContainer type={TRANSACTION_LABEL_KEYS.REDUCE_STOCK}>
        <View className='bg-white flex-1 p-4'>
          <View
            className='border border-quillGrey rounded p-3'
            {...getTestID('reduce-stock-form')}>
            <View>
              <InfoRow
                value={formReduce.allocated_qty}
                label={t('label.allocated_stock')}
              />
              <InfoRow
                value={formReduce.available_qty}
                label={t('label.available_stock')}
              />
            </View>
            <ChangeQtyInput
              type={TRANSACTION_LABEL_KEYS.REDUCE_STOCK}
              batchType={BATCH_TYPE.ACTIVE}
              index={0}
            />
            {formReduce.is_temperature_sensitive && (
              <StockQualityDropdown
                type={TRANSACTION_LABEL_KEYS.REDUCE_STOCK}
                batchType={BATCH_TYPE.ACTIVE}
                index={0}
              />
            )}
            <TransactionReasonDropdown
              type={TRANSACTION_LABEL_KEYS.REDUCE_STOCK}
              batchType={BATCH_TYPE.ACTIVE}
              index={0}
              transactionTypeId={TRANSACTION_TYPE.REDUCE_STOCK}
            />
          </View>
        </View>
        <View className='flex-row px-4 py-5 border-whiteTwo border-t gap-x-2'>
          {isNextMaterialExist && (
            <NextMaterialButton
              onPress={navigateToNextMaterial}
              disabled={isDisableNextButton}
            />
          )}
          <SaveTransactionButton onSubmit={handleSubmit} />
        </View>
      </TransactionContainer>
    </FormProvider>
  )
}

export default TransactionReduceStockScreen
