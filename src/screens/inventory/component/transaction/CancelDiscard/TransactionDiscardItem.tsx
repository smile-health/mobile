import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import ActivityLabel from '@/components/ActivityLabel'
import { CheckBox } from '@/components/buttons/CheckBox'
import { InfoRow } from '@/components/list/InfoRow'
import { useLanguage } from '@/i18n/useLanguage'
import {
  TransactionDiscard,
  TransactionStockBatch,
} from '@/models/transaction/Transaction'
import { authState, useAppSelector } from '@/services/store'
import AppStyles from '@/theme/AppStyles'
import { cn } from '@/theme/theme-config'
import { getTestID, numberFormat } from '@/utils/CommonUtils'
import { DATE_TIME_FORMAT, SHORT_DATE_FORMAT } from '@/utils/Constants'
import { convertString } from '@/utils/DateFormatUtils'

interface Props {
  item: TransactionDiscard
  selected: boolean
  testID: string
  onPress: (item: TransactionDiscard) => void
}
function TransactionDiscardItem({
  item,
  selected,
  testID,
  onPress,
}: Readonly<Props>) {
  const {
    material,
    transaction_reason,
    activity,
    opening_qty,
    closing_qty,
    change_qty,
    stock: { batch, stock_quality },
    created_at,
  } = item
  const { user } = useAppSelector(authState)
  const { t } = useLanguage()

  const handlePressItem = () => onPress(item)

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={handlePressItem}
      className='p-2 bg-white border border-quillGrey rounded-sm mb-2'
      {...getTestID(testID)}>
      <View className='flex-row items-center mb-2'>
        <Text className={cn(AppStyles.textBold, 'flex-1')}>
          {material.name}
        </Text>
        <CheckBox checked={selected} onPress={handlePressItem} />
      </View>
      <InfoRow
        label={t('label.discards')}
        value={convertString(created_at, DATE_TIME_FORMAT)}
        labelClassName='text-main'
        valueClassName='font-mainRegular'
      />
      <View className='mt-1 mb-2 py-1 border-y border-quillGrey gap-y-1'>
        <InfoRow label={t('label.from')} value={user?.entity.name ?? ''} />
        <InfoRow label={t('label.activity')} value={activity?.name ?? ''} />
        <InfoRow label={t('label.reason')} value={transaction_reason.title} />
      </View>
      <View className='mt-1 mb-2 pb-1 border-b border-quillGrey gap-y-1'>
        <InfoRow label={t('label.opening_stock')} value={opening_qty} />
        <InfoRow label={t('label.closing_stock')} value={closing_qty} />
      </View>
      {batch ? (
        <DiscardBatchInfo
          batch={batch}
          activityName={activity.name}
          discardQty={change_qty}
          stockQualityName={stock_quality?.label ?? ''}
        />
      ) : (
        <View className='p-2 border border-quillGrey rounded-sm'>
          <InfoRow
            label={t('label.discarded_qty')}
            value={numberFormat(change_qty)}
            valueClassName='font-mainBold'
          />
        </View>
      )}
    </TouchableOpacity>
  )
}

interface BatchProps {
  batch: TransactionStockBatch
  activityName: string
  discardQty: number
  stockQualityName: string | null
}

const DiscardBatchInfo = ({
  batch,
  activityName,
  discardQty,
  stockQualityName,
}: Readonly<BatchProps>) => {
  const { code, expired_date, production_date, manufacture } = batch
  const { t } = useLanguage()
  return (
    <View
      className='p-2 rounded-sm border border-lightGreyMinimal'
      {...getTestID(`DiscardBatchItem-${code}`)}>
      <View className='flex-row items-center justify-between mb-2'>
        <Text className={AppStyles.textRegular}>{code}</Text>
        <ActivityLabel name={activityName} />
      </View>
      <InfoRow
        label={t('label.discarded_qty')}
        value={numberFormat(discardQty)}
        valueClassName='font-mainBold'
      />
      <View className='mt-1 mb-2 py-1 border-y border-quillGrey gap-y-1'>
        <InfoRow
          label={t('label.expired_date')}
          value={convertString(expired_date, SHORT_DATE_FORMAT)}
          valueClassName='uppercase'
        />
        <InfoRow
          label={t('label.production_date')}
          value={convertString(production_date, SHORT_DATE_FORMAT)}
          valueClassName='uppercase'
        />
        <InfoRow
          label={t('label.manufacturer')}
          value={manufacture?.name ?? ''}
        />
      </View>
      {stockQualityName && (
        <InfoRow label={t('label.material_status')} value={stockQualityName} />
      )}
    </View>
  )
}

export default React.memo(TransactionDiscardItem)
