import React, { useCallback } from 'react'
import { Text, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { InfoRow } from '@/components/list/InfoRow'
import {
  SelfDisposal,
  SelfDisposalStock,
} from '@/models/disposal/CreateSelfDisposal'
import AppStyles from '@/theme/AppStyles'
import { cn } from '@/theme/theme-config'
import { numberFormat } from '@/utils/CommonUtils'
import { calculateTotalQty } from '@/utils/helpers/material/commonHelper'
import ReviewDisposalStockItem from './ReviewDisposalStockItem'
import { disposalItemLabel, DisposalType } from '../disposal-constant'

interface Props {
  item: SelfDisposal
  type: DisposalType
}

const ReviewItemDisposal: React.FC<Props> = ({ item, type }) => {
  const { t } = useTranslation()
  const label = disposalItemLabel[type]

  const getTotalStockDisposalQty = useCallback(
    (stock: SelfDisposalStock): number => {
      const discardTotal = calculateTotalQty(stock.discard, 'disposal_qty')
      const receivedTotal = calculateTotalQty(stock.received, 'disposal_qty')
      return discardTotal + receivedTotal
    },
    []
  )

  const getTotalMaterialDisposalQty = useCallback((): number => {
    return item.disposal.reduce(
      (sum, stock) => sum + getTotalStockDisposalQty(stock),
      0
    )
  }, [getTotalStockDisposalQty, item.disposal])

  const renderReviewItemStock = useCallback(
    (stock, index) => {
      return (
        <ReviewDisposalStockItem
          key={String(stock.stock_id)}
          stock={stock}
          label={label}
          t={t}
          qty={getTotalStockDisposalQty(item.disposal[index])}
        />
      )
    },
    [getTotalStockDisposalQty, item.disposal, label, t]
  )

  return (
    <View className='mb-4 bg-white p-2 border border-lightGreyMinimal mx-4 rounded-sm'>
      <Text className={cn(AppStyles.labelBold, 'mb-1')}>
        {t('label.trademark_material')}
      </Text>
      <View className='mb-2 pb-2 border-b border-lightGreyMinimal'>
        <Text className={cn(AppStyles.textBold)}>{item.material?.name}</Text>
        <InfoRow
          label={t(label.qty)}
          value={numberFormat(getTotalMaterialDisposalQty())}
        />
      </View>

      {item.material.is_managed_in_batch && (
        <Text className={cn(AppStyles.labelBold)}>
          {t('disposal.material_batch')}
        </Text>
      )}
      {Object.values(item?.disposal)?.map((stock, index) =>
        renderReviewItemStock(stock, index)
      )}
    </View>
  )
}

export default ReviewItemDisposal
