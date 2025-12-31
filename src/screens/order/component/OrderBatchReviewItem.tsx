import React, { memo, useMemo } from 'react'
import { FlatList, Text, View } from 'react-native'
import ActivityLabel from '@/components/ActivityLabel'
import { InfoRow } from '@/components/list/InfoRow'
import Separator from '@/components/separator/Separator'
import { useLanguage } from '@/i18n/useLanguage'
import AppStyles from '@/theme/AppStyles'
import { cn } from '@/theme/theme-config'
import { numberFormat } from '@/utils/CommonUtils'
import { materialStatuses, SHORT_DATE_FORMAT } from '@/utils/Constants'
import { convertString } from '@/utils/DateFormatUtils'
import {
  OrderBatchReviewItemProps,
  RenderBatchDetailsProps,
  RenderBatchItemProps,
  RenderNonBatchDetailsProps,
  StockData,
} from '../types/order'

const MaterialBatchListHeader: React.FC<{}> = memo(() => {
  const { t } = useLanguage()
  return (
    <View className='mb-1'>
      <Separator className='my-2' />
      <Text className={AppStyles.labelBold}>{t('section.material_batch')}</Text>
    </View>
  )
})
MaterialBatchListHeader.displayName = 'MaterialBatchListHeader'

export const RenderBatchItem: React.FC<RenderBatchItemProps> = memo(
  ({ item }) => {
    const { t } = useLanguage()

    const statusName = useMemo(
      () =>
        materialStatuses.find((ms) => ms.value === item.stock_quality_id)
          ?.label,
      [item.stock_quality_id]
    )

    return (
      <View className='border-quillGrey border p-2 my-1 rounded-sm'>
        <View className='flex-row items-center gap-x-2 mb-3'>
          <Text className={cn(AppStyles.textRegular, 'flex-1')}>
            {item?.batch?.code}
          </Text>
          <ActivityLabel name={String(item?.activity_name)} />
        </View>
        <InfoRow
          label={t('label.order_qty')}
          value={numberFormat(item.allocated)}
          valueClassName={AppStyles.textBoldSmall}
        />
        <Separator className='my-2' />
        <InfoRow
          label={t('label.expired_date')}
          value={convertString(item?.batch?.expired_date, SHORT_DATE_FORMAT)}
          valueClassName='uppercase'
        />
        <InfoRow
          label={t('label.manufacturer')}
          value={item?.batch?.manufacture?.name ?? ''}
          valueClassName='uppercase'
        />
        {statusName && (
          <InfoRow
            label={t('label.status')}
            value={statusName}
            valueClassName='uppercase'
          />
        )}
      </View>
    )
  }
)
RenderBatchItem.displayName = 'RenderBatchItem'

export const RenderBatchDetails: React.FC<RenderBatchDetailsProps> = memo(
  ({ data }) => {
    return (
      <FlatList
        showsVerticalScrollIndicator={false}
        data={data ?? []}
        keyExtractor={(item, index) => `${item.stock_id}-${index}`}
        ListHeaderComponent={<MaterialBatchListHeader />}
        renderItem={({ item }) => <RenderBatchItem item={item} />}
      />
    )
  }
)
RenderBatchDetails.displayName = 'RenderBatchDetails'

export const RenderItemNonBatch = memo(({ item }: { item: StockData }) => {
  const { t } = useLanguage()

  return (
    <View className='border-quillGrey border p-2 my-2 rounded-sm'>
      <View className='flex-row items-center gap-x-2 mb-3'>
        <Text className={cn(AppStyles.textRegular, 'flex-1')}>
          {item?.batch?.code}
        </Text>
        <ActivityLabel name={String(item.activity_name)} />
      </View>
      <InfoRow
        label={t('label.order_qty')}
        value={numberFormat(item?.allocated)}
        valueClassName={AppStyles.textBoldSmall}
      />
    </View>
  )
})
RenderItemNonBatch.displayName = 'RenderItemNonBatch'

export const RenderNonBatchDetails: React.FC<RenderNonBatchDetailsProps> = memo(
  ({ data }) => {
    if (!data) return null

    return (
      <FlatList
        data={data}
        renderItem={({ item }) => <RenderItemNonBatch item={item} />}
        keyExtractor={(item, index) => `${item.stock_id}-${index}`}
      />
    )
  }
)
RenderNonBatchDetails.displayName = 'RenderNonBatchDetails'

export const OrderBatchReviewItem: React.FC<OrderBatchReviewItemProps> = ({
  containerClassName,
  item,
}) => {
  const { t } = useLanguage()
  const isBatch = item.is_managed_in_batch

  return (
    <View
      className={cn(
        'mx-4 border-quillGrey border p-2 mb-2 rounded-sm',
        containerClassName
      )}>
      <Text className={cn(AppStyles.textBold, 'mb-1')}>
        {item.material_name}
      </Text>
      <InfoRow
        label={t('label.order_qty')}
        value={numberFormat(item?.ordered_qty || item?.totalAllocatedQty)}
        valueClassName={AppStyles.textBoldSmall}
      />
      {isBatch ? (
        <RenderBatchDetails data={item.data} />
      ) : (
        <RenderNonBatchDetails data={item.data} />
      )}
    </View>
  )
}
