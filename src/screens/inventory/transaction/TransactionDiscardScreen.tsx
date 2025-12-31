import React from 'react'
import { View } from 'react-native'
import { FormProvider } from 'react-hook-form'
import { InfoRow } from '@/components/list/InfoRow'
import { useLanguage } from '@/i18n/useLanguage'
import { AppStackScreenProps } from '@/navigators'
import { getTestID } from '@/utils/CommonUtils'
import { TRANSACTION_TYPE } from '@/utils/Constants'
import SaveTransactionButton from '../component/button/SaveTransactionButton'
import ChangeQtyInput from '../component/form/input/ChangeQtyInput'
import StockQualityDropdown from '../component/form/input/StockQualityDropdown'
import TransactionReasonDropdown from '../component/form/input/TransactionReasonDropdown'
import TransactionContainer from '../component/transaction/TransactionContainer'
import {
  BATCH_TYPE,
  TRANSACTION_LABEL_KEYS,
} from '../constant/transaction.constant'
import useDiscardTransactionForm from '../hooks/transactionCreate/useDiscardTransactionForm'

interface Props extends AppStackScreenProps<'TransactionDiscard'> {}
function TransactionDiscardScreen({ route }: Props) {
  const { stock: stockMaterial } = route.params
  const { t } = useLanguage()

  const { methods, handleSubmit } = useDiscardTransactionForm(stockMaterial)

  const formDiscard = methods.watch(`${BATCH_TYPE.ACTIVE}.0`)

  return (
    <FormProvider {...methods}>
      <TransactionContainer type={TRANSACTION_LABEL_KEYS.DISCARDS}>
        <View className='bg-white flex-1 p-4'>
          <View
            className='border border-quillGrey rounded p-3'
            {...getTestID('discard-form')}>
            <InfoRow
              value={formDiscard.allocated_qty}
              label={t('label.allocated_stock')}
            />
            <InfoRow
              value={formDiscard.available_qty}
              label={t('label.available_stock')}
            />
            <ChangeQtyInput
              type={TRANSACTION_LABEL_KEYS.DISCARDS}
              batchType={BATCH_TYPE.ACTIVE}
              index={0}
            />
            {formDiscard.is_temperature_sensitive && (
              <StockQualityDropdown
                type={TRANSACTION_LABEL_KEYS.DISCARDS}
                batchType={BATCH_TYPE.ACTIVE}
                index={0}
              />
            )}
            <TransactionReasonDropdown
              type={TRANSACTION_LABEL_KEYS.DISCARDS}
              batchType={BATCH_TYPE.ACTIVE}
              index={0}
              transactionTypeId={TRANSACTION_TYPE.DISCARDS}
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

export default TransactionDiscardScreen
