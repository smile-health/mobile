import React, { useCallback } from 'react'
import { View, Text } from 'react-native'
import { ParseKeys, TFunction } from 'i18next'
import ActivityLabel from '@/components/ActivityLabel'
import { InfoRow } from '@/components/list/InfoRow'
import { SelfDisposalStock } from '@/models/disposal/CreateSelfDisposal'
import AppStyles from '@/theme/AppStyles'
import { cn } from '@/theme/theme-config'
import { numberFormat } from '@/utils/CommonUtils'
import { SHORT_DATE_FORMAT } from '@/utils/Constants'
import { convertString } from '@/utils/DateFormatUtils'
import DisposalQtyInfo from './DisposalQtyInfo'

interface Props {
  stock: SelfDisposalStock
  qty: number
  t: TFunction
  label: Record<string, ParseKeys>
}

const ReviewDisposalStockItem: React.FC<Props> = ({ stock, qty, t, label }) => {
  const { batch = null, discard, activity, received } = stock

  const renderQtyItem = useCallback(
    (item, qtyType) => (
      <DisposalQtyInfo
        t={t}
        item={item}
        key={`${qtyType}-${item.disposal_stock_id}`}
      />
    ),
    [t]
  )

  return (
    <View className='mt-2 p-2 border border-lightGreyMinimal'>
      <View className='flex-row justify-between items-center mb-1'>
        <Text className={cn(AppStyles.textRegular, 'text-midnightBlue')}>
          {batch?.code}
        </Text>
        <ActivityLabel name={activity.name} />
      </View>
      <InfoRow label={t(label.qty)} value={numberFormat(qty)} />

      {batch != null && (
        <View className='mt-2 pt-1 border-t border-t-lightGreyMinimal'>
          <InfoRow
            label={t('label.expired_date')}
            value={convertString(batch?.expired_date, SHORT_DATE_FORMAT)}
          />
          <InfoRow
            label={t('label.manufacturer')}
            value={batch?.manufacture?.name || '-'}
          />
        </View>
      )}

      {discard?.length > 0 && (
        <View className='mt-2 pt-1 border-t border-t-lightGreyMinimal'>
          <Text className={cn(AppStyles.labelBold, 'text-warmGrey')}>
            {t(label.stockDiscard)}
          </Text>
          {discard.map((qtyItem) => renderQtyItem(qtyItem, 'discard'))}
        </View>
      )}

      {/* Display Received Section */}
      {received?.length > 0 && (
        <View className='mt-2 pt-1 border-t border-t-lightGreyMinimal'>
          <Text className={cn(AppStyles.labelBold, 'text-warmGrey')}>
            {t(label.stockReceived)}
          </Text>
          {received.map((qtyItem) => renderQtyItem(qtyItem, 'received'))}
        </View>
      )}
    </View>
  )
}

export default React.memo(ReviewDisposalStockItem)
