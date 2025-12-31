import React from 'react'
import { View } from 'react-native'
import { useFormContext } from 'react-hook-form'
import ActivityLabel from '@/components/ActivityLabel'
import { InfoRow } from '@/components/list/InfoRow'
import { useLanguage } from '@/i18n/useLanguage'
import { CreateTransactionForm } from '@/models/transaction/TransactionCreate'
import { getTestID } from '@/utils/CommonUtils'
import {
  BATCH_TYPE,
  TRANSACTION_LABEL_KEYS,
} from '../../constant/transaction.constant'
import ChangeQtyInput from '../form/input/ChangeQtyInput'
import StockQualityDropdown from '../form/input/StockQualityDropdown'

interface ConsumptionNonBatchItemProps {
  index: number
  testID: string
}

function ConsumptionNonBatchItem({
  index,
  testID,
}: Readonly<ConsumptionNonBatchItemProps>) {
  const { t } = useLanguage()

  const { watch } = useFormContext<CreateTransactionForm>()
  const {
    qty,
    allocated_qty,
    available_qty,
    is_temperature_sensitive,
    activity,
  } = watch(`${BATCH_TYPE.ACTIVE}.${index}`)

  return (
    <View
      className='border border-quillGrey rounded p-3 mx-4 mb-2'
      {...getTestID(testID)}>
      <ActivityLabel name={activity?.name ?? ''} className='self-end mb-2' />
      <InfoRow value={available_qty} label={t('label.available_stock')} />
      <View className='border-b border-quillGrey mt-1 mb-2' />
      <InfoRow value={allocated_qty} label={t('label.allocated_stock')} />
      <InfoRow value={qty} label={t('label.stock_on_hand')} />
      <ChangeQtyInput
        type={TRANSACTION_LABEL_KEYS.CONSUMPTION}
        batchType={BATCH_TYPE.ACTIVE}
        index={index}
      />
      {is_temperature_sensitive && (
        <StockQualityDropdown
          type={TRANSACTION_LABEL_KEYS.CONSUMPTION}
          batchType={BATCH_TYPE.ACTIVE}
          index={index}
        />
      )}
    </View>
  )
}

export default React.memo(ConsumptionNonBatchItem)
